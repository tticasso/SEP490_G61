import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import defaultProductImage from '../../assets/dongho.png';

const OrderConfirmation = () => {
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy thông tin người dùng
  const currentUser = AuthService.getCurrentUser();
  const userId = currentUser?._id || currentUser?.id || "";

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        
        // Lấy orderId từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        if (!orderId) {
          throw new Error("Không tìm thấy ID đơn hàng");
        }
        
        // Gọi API để lấy thông tin đơn hàng
        const orderData = await ApiService.get(`/order/find/${orderId}`);
        
        if (!orderData || !orderData.order) {
          throw new Error("Không thể tải thông tin đơn hàng");
        }
        
        setOrder(orderData.order);
        setOrderDetails(orderData.orderDetails || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin đơn hàng");
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'đ');
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
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

  if (!order) {
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

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-600">
          Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là <span className="font-semibold">{order._id}</span>
        </p>
        <p className="text-gray-600 mt-1">
          Chúng tôi đã gửi thông tin xác nhận đến email của bạn.
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Thông tin đơn hàng</h2>
        
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
              {order.status_id === 'pending' ? 'Chờ xử lý' :
               order.status_id === 'processing' ? 'Đang xử lý' :
               order.status_id === 'shipped' ? 'Đang giao hàng' :
               order.status_id === 'delivered' ? 'Đã giao hàng' :
               order.status_id === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold mb-4">Chi tiết sản phẩm</h3>
          
          <div className="space-y-4">
            {orderDetails.length > 0 ? orderDetails.map((detail) => (
              <div key={detail._id} className="flex items-center border-b border-gray-100 pb-4">
                <img
                  src={detail.product_id?.thumbnail || defaultProductImage}
                  alt={detail.product_id?.name || "Sản phẩm"}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
                <div className="flex-grow">
                  <p className="font-medium">{detail.product_id?.name || "Sản phẩm"}</p>
                  <p className="text-sm text-gray-600">
                    Số lượng: {detail.quantity} x {formatPrice(detail.price || (detail.product_id?.price || 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice((detail.price || (detail.product_id?.price || 0)) * detail.quantity)}
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
            <span>{formatPrice(order.original_price || order.total_price)}</span>
          </div>
          
          {order.discount_amount > 0 && (
            <div className="flex justify-between mb-2">
              <span>Giảm giá:</span>
              <span>-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          
          {order.coupon_amount > 0 && (
            <div className="flex justify-between mb-2">
              <span>Mã giảm giá:</span>
              <span>-{formatPrice(order.coupon_amount)}</span>
            </div>
          )}
          
          <div className="flex justify-between mb-2">
            <span>Phí vận chuyển:</span>
            <span>{order.shipping_id?.price ? formatPrice(order.shipping_id.price) : "Miễn phí"}</span>
          </div>
          
          <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
            <span>Tổng cộng:</span>
            <span>{formatPrice(order.total_price)}</span>
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
                  {order.user_address_id.name || currentUser?.firstName + ' ' + currentUser?.lastName || 'Khách hàng'}
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