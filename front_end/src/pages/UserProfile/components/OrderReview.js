import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Star, Check, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../../services/ApiService';
import AuthService from '../../../services/AuthService';
import ReviewPopup from './ReviewPopup';

const OrderReview = () => {
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shopData, setShopData] = useState({});
  const [reviewedProducts, setReviewedProducts] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  // Lấy thông tin người dùng
  const currentUser = AuthService.getCurrentUser();
  const userId = currentUser?._id || currentUser?.id || "";

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);

        if (!id) {
          throw new Error("Mã đơn hàng không hợp lệ");
        }

        const orderData = await ApiService.get(`/order/find/${id}`);
        
        if (!orderData || !orderData.order) {
          throw new Error("Không thể tải thông tin đơn hàng");
        }

        // Kiểm tra quyền truy cập
        if (orderData.order.customer_id._id !== userId) {
          throw new Error("Bạn không có quyền xem đơn hàng này");
        }

        // Kiểm tra trạng thái đơn hàng
        if (orderData.order.order_status !== 'delivered') {
          throw new Error("Chỉ có thể đánh giá đơn hàng đã giao thành công");
        }

        setOrder(orderData.order);
        
        // Lấy chi tiết đơn hàng
        const details = orderData.orderDetails || [];
        setOrderDetails(details);
        
        // Lấy thông tin shop
        await fetchShopDetails(details);

        // Kiểm tra sản phẩm nào đã được đánh giá
        await checkReviewedProducts(details);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin đơn hàng");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, userId]);

  // Lấy thông tin shop cho các sản phẩm
  const fetchShopDetails = async (details) => {
    const newShopData = {};
    
    await Promise.all(details.map(async (item) => {
      if (item.product_id && item.product_id.shop_id) {
        const shopId = typeof item.product_id.shop_id === 'object' 
          ? item.product_id.shop_id._id 
          : item.product_id.shop_id;
        
        if (!newShopData[shopId]) {
          try {
            const shopInfo = await ApiService.get(`/shops/public/${shopId}`, false);
            if (shopInfo) {
              newShopData[shopId] = shopInfo;
            }
          } catch (error) {
            console.error(`Không thể lấy thông tin shop ${shopId}:`, error);
          }
        }
      }
    }));
    
    setShopData(newShopData);
  };

  // Kiểm tra sản phẩm nào đã được đánh giá
  const checkReviewedProducts = async (details) => {
    try {
      // Lấy danh sách ID sản phẩm
      const productIds = details.map(item => {
        return typeof item.product_id === 'object' 
          ? item.product_id._id 
          : item.product_id;
      }).filter(id => id);

      // Lấy danh sách đánh giá của người dùng
      const reviewed = [];
      
      for (const productId of productIds) {
        try {
          // Kiểm tra đánh giá theo sản phẩm
          const reviews = await ApiService.get(`/product-review/product/${productId}`);
          
          // Nếu người dùng đã đánh giá sản phẩm này
          if (reviews && reviews.length > 0) {
            const userReview = reviews.find(review => 
              review.user_id && 
              (review.user_id._id === userId || review.user_id === userId)
            );
            
            if (userReview) {
              reviewed.push(productId);
            }
          }
        } catch (err) {
          console.log(`Không tìm thấy đánh giá cho sản phẩm ${productId}`);
        }
      }
      
      setReviewedProducts(reviewed);
    } catch (error) {
      console.error("Error checking reviewed products:", error);
    }
  };

  // Mở popup đánh giá
  const openReviewPopup = (product) => {
    setSelectedProduct(product);
  };

  // Đóng popup đánh giá
  const closeReviewPopup = () => {
    setSelectedProduct(null);
  };

  // Xử lý khi đã đánh giá sản phẩm
  const handleReviewSubmitted = (productId) => {
    // Thêm sản phẩm vào danh sách đã đánh giá
    setReviewedProducts([...reviewedProducts, productId]);
  };

  // Kiểm tra sản phẩm đã được đánh giá chưa
  const isProductReviewed = (productId) => {
    const id = typeof productId === 'object' ? productId._id : productId;
    return reviewedProducts.includes(id);
  };

  // Lấy thông tin người bán của sản phẩm
  const getSellerIdForProduct = (product) => {
    if (!product || !product.shop_id) return null;
    
    const shopId = typeof product.shop_id === 'object' 
      ? product.shop_id._id 
      : product.shop_id;
    
    const shop = shopData[shopId];
    return shop && shop.user_id ? shop.user_id : null;
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'đ');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
        <p className="mt-4 text-gray-700">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        <div className="text-red-500 text-center mb-4">❌ {error}</div>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/user-profile/orders')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        <div className="text-center mb-4">Không tìm thấy thông tin đơn hàng</div>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/user-profile/orders')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/user-profile/orders')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Đánh giá sản phẩm - Đơn hàng {order.id}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <ShoppingBag size={24} className="mr-2 text-purple-600" />
            <h2 className="text-xl font-semibold">Sản phẩm đã mua</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Đánh giá sản phẩm giúp người mua khác có thêm thông tin và cải thiện chất lượng sản phẩm
          </p>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="p-4">
          {orderDetails.length > 0 ? (
            <div className="space-y-4">
              {orderDetails.map((item) => {
                const product = item.product_id;
                const isReviewed = isProductReviewed(product);
                const sellerId = getSellerIdForProduct(product);
                
                return (
                  <div key={item._id} className="border rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={product?.thumbnail || product?.image || '/placeholder-product.png'}
                          alt={product?.name || "Sản phẩm"}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="font-medium text-gray-800">{product?.name || "Sản phẩm"}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Số lượng: {item.quantity} | Đơn giá: {formatPrice(item.price || 0)}
                        </p>
                      </div>
                      <div className="ml-4">
                        {isReviewed ? (
                          <div className="flex items-center text-green-600">
                            <Check size={16} className="mr-1" />
                            <span className="text-sm font-medium">Đã đánh giá</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => openReviewPopup(product)}
                            className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                            disabled={!sellerId}
                          >
                            Đánh giá ngay
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {isReviewed && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-2">Bạn đã đánh giá sản phẩm này</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                fill="#FFD700"
                                stroke="#FFD700"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          Cảm ơn bạn đã đánh giá! Nhận xét của bạn sẽ giúp những người mua khác hiểu hơn về sản phẩm.
                        </p>
                      </div>
                    )}
                    
                    {!sellerId && !isReviewed && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-md flex items-start">
                        <AlertCircle size={16} className="text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-700">
                          Không thể đánh giá sản phẩm này do thiếu thông tin người bán. Vui lòng liên hệ hỗ trợ.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">Không có thông tin sản phẩm</p>
          )}
        </div>

        {/* Nút quay lại */}
        <div className="p-4 border-t">
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/user-profile/orders')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </div>
      </div>

      {/* Popup đánh giá */}
      {selectedProduct && (
        <ReviewPopup
          product={selectedProduct}
          onClose={closeReviewPopup}
          orderId={order.id}
          sellerId={getSellerIdForProduct(selectedProduct)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default OrderReview;