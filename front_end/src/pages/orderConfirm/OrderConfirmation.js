import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, Home, AlertCircle, XCircle, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import defaultProductImage from '../../assets/dongho.png';

const OrderConfirmation = () => {
  const [orders, setOrders] = useState([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variantDetails, setVariantDetails] = useState({});
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Get user information
  const currentUser = AuthService.getCurrentUser();
  const userId = currentUser?._id || currentUser?.id || "";

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        setLoading(true);

        // Get orderId or orderIds from URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        const orderIds = urlParams.get('orderIds');
        const paymentErrorParam = urlParams.get('paymentError');

        // Check if we have orderIds parameter (comma-separated list)
        if (orderIds) {
          const idsArray = orderIds.split(',').filter(id => id.trim());
          if (idsArray.length === 0) {
            throw new Error("No valid order IDs found");
          }

          // Fetch all orders in parallel
          const orderPromises = idsArray.map(id => ApiService.get(`/order/find/${id}`));
          const ordersResults = await Promise.all(orderPromises);
          
          // Filter out any failed requests
          const validOrders = ordersResults
            .filter(result => result && result.order)
            .map(result => ({
              order: result.order,
              orderDetails: result.orderDetails || []
            }));
          
          if (validOrders.length === 0) {
            throw new Error("Failed to load order information");
          }

          setOrders(validOrders);
          
          // Calculate total amount for all orders
          const total = validOrders.reduce((sum, orderData) => {
            const orderTotal = calculateOrderTotal(orderData);
            return sum + orderTotal;
          }, 0);
          
          setTotalAmount(total);
          
          // Check payment status if applicable
          if (validOrders.some(orderData => isOnlinePayment(orderData.order))) {
            // Check for transaction code in localStorage
            const transactionCode = localStorage.getItem('paymentTransactionCode');
            if (transactionCode) {
              await checkPaymentStatus(idsArray[0], transactionCode);
            }
          }

          // Load variant details if needed
          for (const orderData of validOrders) {
            const needsVariantLoad = (orderData.orderDetails || []).some(detail =>
              detail.variant_id &&
              (typeof detail.variant_id !== 'object' ||
                !detail.variant_id.attributes && !detail.variant_id.name)
            );

            if (needsVariantLoad) {
              await loadVariantDetails(orderData.orderDetails, orderData.order);
            }
          }
        } 
        // Handle single orderId parameter (backward compatibility)
        else if (orderId) {
          const orderData = await ApiService.get(`/order/find/${orderId}`);

          if (!orderData || !orderData.order) {
            throw new Error("Unable to load order information");
          }

          setOrders([{
            order: orderData.order,
            orderDetails: orderData.orderDetails || []
          }]);
          
          setTotalAmount(calculateOrderTotal({
            order: orderData.order, 
            orderDetails: orderData.orderDetails || []
          }));

          // Check payment status if applicable
          if (isOnlinePayment(orderData.order)) {
            const transactionCode = localStorage.getItem('paymentTransactionCode');
            if (transactionCode) {
              await checkPaymentStatus(orderId, transactionCode);
            }
          }

          // Load variant details if needed
          const needsVariantLoad = (orderData.orderDetails || []).some(detail =>
            detail.variant_id &&
            (typeof detail.variant_id !== 'object' ||
              !detail.variant_id.attributes && !detail.variant_id.name)
          );

          if (needsVariantLoad) {
            await loadVariantDetails(orderData.orderDetails, orderData.order);
          }
        } 
        // Check localStorage as fallback
        else {
          const storedOrderId = localStorage.getItem('currentOrderId');
          const storedOrderIds = localStorage.getItem('currentOrderIds');
          
          if (storedOrderIds) {
            try {
              const idsArray = JSON.parse(storedOrderIds);
              localStorage.removeItem('currentOrderIds');
              window.location.href = `/order-confirmation?orderIds=${idsArray.join(',')}`;
              return;
            } catch (e) {
              console.error("Error parsing stored order IDs:", e);
            }
          } else if (storedOrderId) {
            localStorage.removeItem('currentOrderId');
            window.location.href = `/order-confirmation?orderId=${storedOrderId}`;
            return;
          } else {
            throw new Error("Order ID not found");
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "An error occurred loading order information");
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, []);

  // Check if the order uses online payment
  const isOnlinePayment = (order) => {
    if (!order) return false;

    return order.payment_method === "payos" ||
      (typeof order.payment_id === 'object' &&
        order.payment_id?.name?.toLowerCase().includes('vnpay'));
  };

  // Function to check payment status
  const checkPaymentStatus = async (orderId, transactionCode) => {
    try {
      setCheckingPayment(true);
      console.log(`Checking payment status for transaction: ${transactionCode}`);

      // Call PayOS API to check payment status
      const response = await ApiService.get(`/payos/check-payment-status/${transactionCode}`);

      if (response && response.success) {
        console.log("Payment status response:", response);
        setPaymentStatus(response.data.payment);

        // Xóa thông tin thanh toán từ localStorage sau khi đã kiểm tra
        localStorage.removeItem('paymentTransactionCode');

        // Nếu thanh toán thành công và trạng thái thanh toán vẫn là pending, reload lại trang sau 2s
        if (response.data.payment.status === "PAID" && response.data.order.status_id === "pending") {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        console.warn("Payment status check failed or returned unexpected format:", response);
        setPaymentError("Không thể kiểm tra trạng thái thanh toán");
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
      setPaymentError("Lỗi khi kiểm tra trạng thái thanh toán: " + (err.message || "Không xác định"));
    } finally {
      setCheckingPayment(false);
    }
  };

  // Main function to load variant details only for items that need it
  const loadVariantDetails = async (details, orderObj) => {
    try {
      setLoadingVariants(true);
      console.log(`Checking if variant details needed for ${details.length} items`);

      // Create a copy of the current variant details
      const detailsMap = { ...variantDetails };

      // Process each order detail item
      for (const detail of details) {
        // Skip if there's no variant_id or if variant_id is already a fully populated object
        if (!detail.variant_id ||
          (typeof detail.variant_id === 'object' &&
            detail.variant_id !== null &&
            (detail.variant_id.attributes || detail.variant_id.name))) {
          console.log(`Item ${detail._id} already has complete variant info or no variant, skipping`);
          continue;
        }

        // We need to fetch the variant info from the API
        // Extract product ID and variant ID
        const productId = typeof detail.product_id === 'object'
          ? (detail.product_id._id || detail.product_id.id)
          : detail.product_id;

        const variantId = typeof detail.variant_id === 'object'
          ? (detail.variant_id._id || detail.variant_id.id)
          : detail.variant_id;

        if (!productId || !variantId) {
          console.log(`Missing productId or variantId for ${detail._id}, skipping`);
          continue;
        }

        console.log(`Fetching variants for product ${productId}, looking for variant ${variantId}`);

        try {
          // First try direct variant fetch - may be faster and more reliable
          try {
            const directVariant = await ApiService.get(`/product-variant/${variantId}`, false);
            if (directVariant && directVariant._id) {
              console.log(`Direct fetch of variant ${variantId} successful:`, directVariant);
              detailsMap[detail._id] = directVariant;
              continue; // Skip to next iteration if successful
            }
          } catch (directFetchError) {
            console.log(`Direct fetch of variant ${variantId} failed:`, directFetchError);
            // Fall through to try the product variants approach
          }

          // Fetch all variants for this product
          const variants = await ApiService.get(`/product-variant/product/${productId}`, false);

          if (!Array.isArray(variants)) {
            console.log(`API returned non-array response for variants of product ${productId}:`, variants);
            continue;
          }

          console.log(`Found ${variants.length} variants for product ${productId}`);

          // Find the specific variant we need
          const variant = variants.find(v => v._id === variantId);

          if (variant) {
            console.log(`Found matching variant for ${detail._id}:`, variant);
            detailsMap[detail._id] = variant;
          } else {
            console.log(`No matching variant found for ID ${variantId} in product ${productId}`);
          }
        } catch (error) {
          console.error(`Error fetching variants for product ${productId}:`, error);
        }
      }

      console.log("Final variant details:", detailsMap);
      setVariantDetails(detailsMap);
    } catch (error) {
      console.error('Error in loadVariantDetails:', error);
    } finally {
      setLoadingVariants(false);
    }
  };

  // Function to find the correct price for an item
  const getItemPrice = (detail) => {
    // Priority 1: Use price directly from order detail if available
    if (detail.price !== undefined && detail.price > 0) {
      return detail.price;
    }

    // Priority 2: Use price from populated variant_id
    if (detail.variant_id && typeof detail.variant_id === 'object' && detail.variant_id.price !== undefined) {
      return detail.variant_id.price;
    }

    // Priority 3: Check our separately loaded variant details
    if (variantDetails[detail._id]?.price !== undefined) {
      return variantDetails[detail._id].price;
    }

    // Priority 4: Use product price as fallback
    if (typeof detail.product_id === 'object') {
      return detail.product_id.discounted_price || detail.product_id.price || 0;
    }

    return 0;
  };

  // Calculate correct subtotal for order
  const calculateOrderSubtotal = (orderData) => {
    const details = orderData.orderDetails || [];
    const order = orderData.order;
    
    if (!details || details.length === 0) return 0;

    // If order.original_price is available from server and seems reasonable, use it
    if (order && order.original_price !== undefined && order.original_price > 0) {
      // Verify by calculating manually
      const manualTotal = details.reduce((sum, detail) => {
        const price = getItemPrice(detail);
        return sum + (price * detail.quantity);
      }, 0);

      // Only use original_price if it's close to our manual calculation
      // This helps catch cases where original_price might be incorrect
      if (Math.abs(order.original_price - manualTotal) < manualTotal * 0.5) {
        console.log(`Using server-provided original_price: ${order.original_price}`);
        return order.original_price;
      } else {
        console.warn(`Original price from server (${order.original_price}) differs significantly from calculated price (${manualTotal}). Using calculated price.`);
        return manualTotal;
      }
    }

    // Calculate from order details
    const total = details.reduce((sum, detail) => {
      const price = getItemPrice(detail);
      const itemTotal = price * detail.quantity;
      console.log(`Item ${detail._id}: ${price} x ${detail.quantity} = ${itemTotal}`);
      return sum + itemTotal;
    }, 0);

    console.log(`Calculated subtotal from order details: ${total}`);
    return total;
  };

  // Calculate full order total including shipping and discount
  const calculateOrderTotal = (orderData) => {
    const order = orderData.order;
    
    // Calculate subtotal
    const subtotal = calculateOrderSubtotal(orderData);
    
    // Get discount and shipping cost
    const totalDiscount = (order.discount_amount || 0) + (order.coupon_amount || 0);
    const shippingCost = order.shipping_id?.price || 0;
    
    // Calculate total
    return Math.max(0, subtotal - totalDiscount) + shippingCost;
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0đ";

    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'đ');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Render variant information
  const renderVariantInfo = (detail) => {
    // First check if we have populated variant info in the detail itself
    if (detail.variant_id && typeof detail.variant_id === 'object' &&
      (detail.variant_id.name || detail.variant_id.attributes)) {

      const variantInfo = detail.variant_id;

      // Render variant name if available
      const variantName = variantInfo.name ? (
        <div className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs inline-block mb-1">
          {variantInfo.name}
        </div>
      ) : null;

      // Get variant attributes based on structure
      const attributes = variantInfo.attributes instanceof Map
        ? Object.fromEntries(variantInfo.attributes)
        : variantInfo.attributes;

      // If no attributes or empty object
      if (!attributes || Object.keys(attributes).length === 0) {
        return variantName; // Just return the name if available
      }

      // Create attribute elements
      const attributeElements = (
        <div className="text-xs text-gray-600 flex flex-wrap gap-1">
          {Object.entries(attributes).map(([key, value]) => (
            <span key={key} className="bg-gray-100 px-1 py-0.5 rounded">
              <span className="capitalize">{key}</span>: <strong>{value}</strong>
            </span>
          ))}
        </div>
      );

      // Return both name and attributes
      return (
        <div className="mt-1 space-y-1">
          {variantName}
          {attributeElements}
        </div>
      );
    }

    // Fallback - use data from variantDetails state if it's been loaded
    let variantInfo = variantDetails[detail._id];

    if (!variantInfo) {
      // No variant info available
      return (
        <div className="text-xs text-gray-600 mt-1">
          {detail.variant_id ? "Biến thể: ID " + (typeof detail.variant_id === 'object' ? detail.variant_id._id : detail.variant_id) : null}
        </div>
      );
    }

    // Render variant name if available
    const variantName = variantInfo.name ? (
      <div className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs inline-block mb-1">
        {variantInfo.name}
      </div>
    ) : null;

    // Get variant attributes based on structure
    const attributes = variantInfo.attributes instanceof Map
      ? Object.fromEntries(variantInfo.attributes)
      : variantInfo.attributes;

    // If no attributes or empty object
    if (!attributes || Object.keys(attributes).length === 0) {
      return variantName; // Just return the name if available
    }

    // Create attribute elements
    const attributeElements = (
      <div className="text-xs text-gray-600 flex flex-wrap gap-1">
        {Object.entries(attributes).map(([key, value]) => (
          <span key={key} className="bg-gray-100 px-1 py-0.5 rounded">
            <span className="capitalize">{key}</span>: <strong>{value}</strong>
          </span>
        ))}
      </div>
    );

    // Return both name and attributes
    return (
      <div className="mt-1 space-y-1">
        {variantName}
        {attributeElements}
      </div>
    );
  };

  // Get variant image or product image
  const getItemImage = (detail) => {
    // Priority 1: Get from populated variant_id
    if (detail.variant_id && typeof detail.variant_id === 'object' &&
      detail.variant_id.images && detail.variant_id.images.length > 0) {
      return detail.variant_id.images[0];
    }

    // Priority 2: Get from our separately loaded variant details
    if (variantDetails[detail._id]?.images && variantDetails[detail._id].images.length > 0) {
      return variantDetails[detail._id].images[0];
    }

    // Fallback to product image
    if (detail.product_id && typeof detail.product_id === 'object') {
      return detail.product_id.thumbnail || detail.product_id.image;
    }

    return defaultProductImage;
  };

  // Get shop information from order
  const getShopInfo = (order) => {
    if (!order) return { name: 'Cửa hàng', id: 'unknown' };
    
    if (order.shop_id) {
      if (typeof order.shop_id === 'object') {
        return {
          name: order.shop_id.name || 'Cửa hàng',
          id: order.shop_id._id || 'unknown'
        };
      }
      return { name: 'Cửa hàng', id: order.shop_id };
    }
    
    return { name: 'Cửa hàng', id: 'unknown' };
  };

  const goToNextOrder = () => {
    if (currentOrderIndex < orders.length - 1) {
      setCurrentOrderIndex(currentOrderIndex + 1);
    }
  };

  const goToPreviousOrder = () => {
    if (currentOrderIndex > 0) {
      setCurrentOrderIndex(currentOrderIndex - 1);
    }
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
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        <div className="text-center mb-4">Không tìm thấy thông tin đơn hàng</div>
        <div className="flex justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Get current order data
  const currentOrderData = orders[currentOrderIndex];
  const order = currentOrderData.order;
  const orderDetails = currentOrderData.orderDetails || [];
  
  // Always use calculated subtotal to ensure accuracy
  const subtotal = calculateOrderSubtotal(currentOrderData);
  // Calculate total discount
  const totalDiscount = (order.discount_amount || 0) + (order.coupon_amount || 0);
  // Calculate shipping cost
  const shippingCost = order.shipping_id?.price || 0;
  // Calculate total for current order
  const displayTotal = Math.max(0, subtotal - totalDiscount) + shippingCost;
  
  // Get shop info
  const shopInfo = getShopInfo(order);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
        
        {orders.length > 1 ? (
          <p className="text-gray-600">
            Cảm ơn bạn đã đặt hàng. Chúng tôi đã tạo {orders.length} đơn hàng cho bạn.
          </p>
        ) : (
          <p className="text-gray-600">
            Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là <span className="font-semibold">{order._id}</span>
          </p>
        )}

        {/* Thêm ghi chú nếu là đơn hàng thanh toán online chưa thanh toán */}
        {isOnlinePayment(order) && order.status_id === 'pending' && (
          <p className="text-yellow-600 mt-2 bg-yellow-50 p-2 rounded">
            <AlertCircle size={16} className="inline mr-1" />
            Lưu ý: Đơn hàng của bạn đang chờ thanh toán. Vui lòng hoàn tất thanh toán để đơn hàng được xử lý.
          </p>
        )}

        {/* Thông báo nếu đã thanh toán thành công */}
        {isOnlinePayment(order) && order.status_id === 'paid' && (
          <p className="text-green-600 mt-2 bg-green-50 p-2 rounded">
            <CheckCircle size={16} className="inline mr-1" />
            Thanh toán đã hoàn tất. Đơn hàng của bạn đang được xử lý.
          </p>
        )}
      </div>
      
      {/* Order Navigation - Show only if multiple orders */}
      {orders.length > 1 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={goToPreviousOrder}
              disabled={currentOrderIndex === 0}
              className={`flex items-center ${currentOrderIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:text-purple-800'}`}
            >
              <ChevronLeft size={20} className="mr-1" />
              Đơn hàng trước
            </button>
            
            <div className="text-center">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                Đơn hàng {currentOrderIndex + 1} / {orders.length}
              </span>
            </div>
            
            <button 
              onClick={goToNextOrder}
              disabled={currentOrderIndex === orders.length - 1}
              className={`flex items-center ${currentOrderIndex === orders.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:text-purple-800'}`}
            >
              Đơn hàng tiếp
              <ChevronRight size={20} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Thông tin đơn hàng</h2>
          
          {/* Shop information */}
          <div className="flex items-center text-sm">
            <Store size={16} className="mr-1 text-purple-600" />
            <span className="font-medium">{shopInfo.name}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">Mã đơn hàng:</p>
            <p className="font-semibold">{order._id}</p>
          </div>
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">Ngày đặt hàng:</p>
            <p className="font-semibold">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-600">Trạng thái:</p>
            <p className="font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block">
              {order.order_status === 'pending' ? 'Chờ xử lý' :
                order.order_status === 'processing' ? 'Đang xử lý' :
                  order.order_status === 'shipped' ? 'Đang giao hàng' :
                    order.order_status === 'delivered' ? 'Đã giao hàng' :
                      order.order_status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold mb-4">Chi tiết sản phẩm</h3>

          <div className="space-y-4">
            {orderDetails.length > 0 ? orderDetails.map((detail) => (
              <div key={detail._id} className="flex items-center border-b border-gray-100 pb-4">
                <img
                  src={getItemImage(detail)}
                  alt={detail.product_id?.name || "Sản phẩm"}
                  className="w-16 h-16 object-cover rounded mr-4"
                  onError={(e) => { e.target.src = defaultProductImage }}
                />
                <div className="flex-grow">
                  <p className="font-medium">{detail.product_id?.name || "Sản phẩm"}</p>

                  {/* Variant info */}
                  {loadingVariants ? (
                    <div className="text-xs text-gray-600 mt-1">Đang tải thông tin biến thể...</div>
                  ) : (
                    renderVariantInfo(detail)
                  )}

                  <p className="text-sm text-gray-600 mt-1">
                    Số lượng: {detail.quantity} x {formatPrice(getItemPrice(detail))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(getItemPrice(detail) * detail.quantity)}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-gray-600">Không có thông tin chi tiết sản phẩm</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between mb-2">
            <span>Tạm tính:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between mb-2">
              <span>Giảm giá:</span>
              <span>-{formatPrice(totalDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between mb-2">
            <span>Phí vận chuyển:</span>
            <span>{shippingCost > 0 ? formatPrice(shippingCost) : "Miễn phí"}</span>
          </div>

          <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
            <span>Tổng cộng:</span>
            <span>{formatPrice(displayTotal)}</span>
          </div>
        </div>
      </div>

      {/* Shipping and Payment Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-4">
            <div className="flex items-center mb-3">
              <Home size={20} className="mr-2 text-purple-600" />
              <h3 className="font-semibold">Địa chỉ giao hàng</h3>
            </div>

            {order.user_address_id ? (
              <div className="ml-7">
                <p className="font-medium">
                  {order.user_address_id.name ||
                    (currentUser?.firstName && currentUser?.lastName ?
                      `${currentUser.firstName} ${currentUser.lastName}` :
                      'Khách hàng')}
                </p>
                <p className="text-gray-600">{order.user_address_id.phone}</p>
                <p className="text-gray-600">
                  {order.user_address_id.address_line1}
                  {order.user_address_id.address_line2 && `, ${order.user_address_id.address_line2}`}
                  {order.user_address_id.city && `, ${order.user_address_id.city}`}
                  {order.user_address_id.country && `, ${order.user_address_id.country}`}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 ml-7">Không có thông tin địa chỉ</p>
            )}
          </div>

          <div className="md:w-1/2 md:pl-4 md:border-l border-gray-200">
            <div className="flex items-center mb-3">
              <Truck size={20} className="mr-2 text-purple-600" />
              <h3 className="font-semibold">Phương thức giao hàng & thanh toán</h3>
            </div>

            <div className="ml-7">
              <p className="text-gray-600 mb-3">
                <span className="font-medium">Phương thức giao hàng: </span>
                {order.shipping_id?.name || "Giao hàng tiêu chuẩn"}
              </p>

              <p className="text-gray-600">
                <span className="font-medium">Phương thức thanh toán: </span>
                {order.payment_id?.name || "Thanh toán khi nhận hàng"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Total for all orders - Show only if multiple orders */}
      {orders.length > 1 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Tổng thanh toán cho tất cả đơn hàng</h2>
          <div className="flex justify-between font-bold text-lg text-purple-700">
            <span>Tổng cộng ({orders.length} đơn hàng):</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <button
          onClick={() => window.location.href = '/'}
          className="flex-1 bg-white text-purple-600 border border-purple-600 hover:bg-purple-50 py-3 rounded-lg font-medium"
        >
          Tiếp tục mua sắm
        </button>

        <button
          onClick={() => window.location.href = `/user-profile/orders?id=${order._id}`}
          className="flex-1 bg-purple-600 text-white hover:bg-purple-700 py-3 rounded-lg font-medium"
        >
          Xem chi tiết đơn hàng
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;