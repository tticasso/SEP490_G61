import React, { useState, useEffect } from 'react';
import { ChevronLeft, Truck, CreditCard, User, MapPin, Package, ShoppingBag } from 'lucide-react';
import ApiService from '../../services/ApiService';
import ShopOwner from '../../assets/ShopOwner.png'; // Fallback image

const OrderDetail = ({ orderId, onBack }) => {
  const [orderData, setOrderData] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  
  // State for enhanced data
  const [customerData, setCustomerData] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [productImages, setProductImages] = useState({});

  // Fetch order data
  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  // Extract customer ID more robustly from orderData
  useEffect(() => {
    if (orderData && orderData.customer_id) {
      console.log("Customer ID from order:", orderData.customer_id);
      fetchCustomerData(orderData.customer_id);
    }
  }, [orderData]);

  // New effect to fetch address data when user_address_id is available
  useEffect(() => {
    if (orderData && orderData.user_address_id) {
      console.log("Address ID from order:", orderData.user_address_id);
      fetchAddressData(orderData.user_address_id);
    }
  }, [orderData]);

  // Separate useEffect for loading product details
  useEffect(() => {
    if (orderDetails && orderDetails.length > 0) {
      fetchProductDetails(orderDetails);
    }
  }, [orderDetails]); // Only re-run when orderDetails changes

  // Trong OrderDetail.js của admin
// Thêm console.log để kiểm tra cấu trúc dữ liệu được trả về

const fetchOrderData = async () => {
  try {
    setLoading(true);
    const response = await ApiService.get(`/order/find/${orderId}`);
    
    // Debug logs
    console.log("===== ORDER DATA STRUCTURE =====");
    console.log("Full order data:", response);
    console.log("Customer ID:", response.order.customer_id);
    
    // Kiểm tra xem customer_id có phải là object hay chỉ là ID
    if (response.order.customer_id) {
      console.log("Customer data type:", typeof response.order.customer_id);
      if (typeof response.order.customer_id === 'object') {
        console.log("Customer firstName:", response.order.customer_id.firstName);
        console.log("Customer lastName:", response.order.customer_id.lastName);
      }
    }
    
    setOrderData(response.order);
    setOrderDetails(response.orderDetails || []);
    setCurrentStatus(response.order.status_id);
    
  } catch (error) {
    console.error("Error fetching order data:", error);
    setError('Lỗi khi tải dữ liệu đơn hàng: ' + error);
  } finally {
    setLoading(false);
  }
};
  
  // Fetch customer data
  const fetchCustomerData = async (customerId) => {
    try {
      // Make sure we have a valid ID string, not an object
      const userId = typeof customerId === 'object' ? customerId._id : customerId;
      
      // Log the type and value for debugging
      console.log("Customer ID type:", typeof userId);
      console.log("Customer ID value:", userId);
      
      if (!userId) {
        console.error("Invalid customer ID:", customerId);
        return;
      }
      
      // The correct endpoint based on user.routes.js is /user/:id
      const response = await ApiService.get(`/user/${userId}`);
      console.log("Customer data response:", response);
      setCustomerData(response);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  // New function to fetch address data
  const fetchAddressData = async (addressId) => {
    try {
      const id = typeof addressId === 'object' ? addressId._id : addressId;
      
      console.log("Fetching address with ID:", id);
      
      if (!id) {
        console.error("Invalid address ID:", addressId);
        return;
      }
      
      const response = await ApiService.get(`/address/find/${id}`);
      console.log("Address data response:", response);
      setAddressData(response);
    } catch (error) {
      console.error("Error fetching address data:", error);
    }
  };
  
  // Fetch product details including images
  const fetchProductDetails = async (orderDetails) => {
    try {
      const productIds = orderDetails.map(item => {
        // Handle different structures of product_id
        if (typeof item.product_id === 'object' && item.product_id !== null) {
          return item.product_id._id;
        }
        return item.product_id;
      }).filter(id => id); // Filter out any undefined or null IDs
      
      console.log("Fetching details for product IDs:", productIds);
      
      if (productIds.length === 0) {
        console.warn("No valid product IDs found in order details");
        return;
      }
      
      const productDetailsPromises = productIds.map(productId => 
        ApiService.get(`/product/${productId}`)
      );
      
      const productDetailsResults = await Promise.allSettled(productDetailsPromises);
      
      const productImagesMap = {};
      
      productDetailsResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const productData = result.value;
          console.log(`Product ${productIds[index]} details:`, productData);
          productImagesMap[productIds[index]] = productData.thumbnail;
        } else {
          console.error(`Failed to fetch product ${productIds[index]}:`, result.reason);
        }
      });
      
      console.log("Product images map:", productImagesMap);
      setProductImages(productImagesMap);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  // Handle status update
  const handleStatusUpdate = (e) => {
    setCurrentStatus(e.target.value);
  };

  // Handle update button click using ApiService with PUT method
  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      
      // Make sure we're sending the correct status_id format
      const payload = { status_id: currentStatus };
      
      console.log("Sending update request:", payload);
      console.log("Update URL:", `/order/status/${orderId}`);
      
      // Use PUT method instead of PATCH
      const response = await ApiService.put(`/order/status/${orderId}`, payload);
      console.log("Update response:", response);
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // Give a small delay before refreshing data
      setTimeout(() => {
        fetchOrderData(); // Refresh data
      }, 500);
      
    } catch (error) {
      console.error("Update error details:", error);
      setUpdateError(`Lỗi khi cập nhật trạng thái: ${error.message || error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        setIsUpdating(true);
        
        // Use PUT method instead of PATCH for cancelling order as well
        const response = await ApiService.put(`/order/cancel/${orderId}`, {});
        console.log("Cancel order response:", response);
        
        fetchOrderData(); // Refresh data
      } catch (error) {
        console.error("Cancel order error:", error);
        setUpdateError('Lỗi khi hủy đơn hàng: ' + error.message || error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Convert backend status to Vietnamese
  const getStatusText = (status) => {
    switch(status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đã xác nhận';
      case 'shipped':
        return 'Đang vận chuyển';
      case 'delivered':
        return 'Giao hàng thành công';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Get status class for badge
  const getStatusClass = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'Địa chỉ không có sẵn';
    
    const parts = [];
    if (address.address_line1) parts.push(address.address_line1);
    if (address.address_line2) parts.push(address.address_line2);
    if (address.city) parts.push(address.city);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!orderData) {
    return <div className="text-red-500 p-4">Không tìm thấy thông tin đơn hàng</div>;
  }

  // Tính toán tổng tiền sản phẩm
  const subtotal = orderDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Phí vận chuyển
  const shippingCost = orderData.shipping_id?.price || 0;
  
  // Giảm giá (nếu có)
  const discountAmount = orderData.discount_amount || 0;
  const couponAmount = orderData.coupon_amount || 0;
  
  // Tổng thanh toán - sử dụng giá trị từ API hoặc tính toán nếu cần
  const total = orderData.total_price || (subtotal + shippingCost - discountAmount - couponAmount);

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <button
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            onClick={onBack}
          >
            <ChevronLeft size={18} className="mr-1" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng #{orderData.id}</h1>
          <span className={`ml-3 px-3 py-1 text-xs font-medium rounded ${getStatusClass(orderData.status_id)}`}>
            {getStatusText(orderData.status_id)}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Status update controls for non-cancelled orders */}
          {orderData.status_id !== 'cancelled' && (
            <>
              <select
                className="border border-gray-300 rounded-md px-4 py-2"
                value={currentStatus}
                onChange={handleStatusUpdate}
                disabled={isUpdating}
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="processing">Đã xác nhận</option>
                <option value="shipped">Đang vận chuyển</option>
                <option value="delivered">Giao hàng thành công</option>
              </select>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleUpdate}
                disabled={isUpdating || currentStatus === orderData.status_id}
              >
                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
              
              {/* Cancel order button (only for pending/processing) */}
              {(orderData.status_id === 'pending' || orderData.status_id === 'processing') && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={handleCancelOrder}
                  disabled={isUpdating}
                >
                  Hủy đơn
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status messages */}
      {updateSuccess && (
        <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Cập nhật trạng thái thành công!
        </div>
      )}
      
      {updateError && (
        <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {updateError}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div>
            Thời gian đặt hàng: {formatDate(orderData.created_at)}
          </div>
          {orderData.order_delivered_at && (
            <div>
              Thời gian giao hàng: {formatDate(orderData.order_delivered_at)}
            </div>
          )}
        </div>

        {/* Order timeline */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Trạng thái đơn hàng</h2>
          <div className="bg-white rounded-md border border-gray-200 p-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderData.status_id !== 'cancelled' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>1</div>
              <div className={`flex-1 h-1 ${orderData.status_id === 'pending' || orderData.status_id === 'processing' || orderData.status_id === 'shipped' || orderData.status_id === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderData.status_id === 'processing' || orderData.status_id === 'shipped' || orderData.status_id === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>2</div>
              <div className={`flex-1 h-1 ${orderData.status_id === 'shipped' || orderData.status_id === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderData.status_id === 'shipped' || orderData.status_id === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>3</div>
              <div className={`flex-1 h-1 ${orderData.status_id === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${orderData.status_id === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>4</div>
            </div>
            
            <div className="flex justify-between mt-2 text-sm">
              <div className="text-center">
                <p>Chờ xác nhận</p>
              </div>
              <div className="text-center">
                <p>Đã xác nhận</p>
              </div>
              <div className="text-center">
                <p>Đang vận chuyển</p>
              </div>
              <div className="text-center">
                <p>Giao hàng Thành công</p>
              </div>
            </div>
            
            {orderData.status_id === 'cancelled' && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-center">
                Đơn hàng đã bị hủy
              </div>
            )}
          </div>
        </div>

        {/* Products section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ShoppingBag size={20} className="mr-2" />
            Sản phẩm
          </h2>
          <div className="bg-white rounded-md border border-gray-200">
            {orderDetails.map((item) => (
              <div key={item._id} className="p-4 flex items-start border-b border-gray-200">
                <img
                  src={productImages[typeof item.product_id === 'object' ? item.product_id._id : item.product_id] || item.product_id?.image || ShopOwner}
                  className="w-24 h-24 object-cover rounded-md mr-4"
                  alt={item.product_id?.name || 'Sản phẩm'}
                />
                <div className="flex-grow">
                  <h3 className="text-md font-medium text-gray-800 mb-1">{item.product_id?.name || 'Sản phẩm không tên'}</h3>
                  <div className="text-gray-600 mb-2">{formatPrice(item.price)} × {item.quantity}</div>
                  {/* Hiển thị mô tả sản phẩm */}
                  {item.product_id?.detail && (
                    <p className="text-sm text-gray-500">{item.product_id.detail}</p>
                  )}
                </div>
                <div className="text-lg font-semibold text-gray-800">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left column */}
          <div>
            {/* Order summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Package size={20} className="mr-2" />
                Chi tiết đơn hàng
              </h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tổng giá sản phẩm</span>
                  <span className="font-medium">{formatPrice(orderData.original_price || subtotal)}</span>
                </div>

                {/* Display both discount and coupon if available */}
                {discountAmount > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="font-medium">
                      {formatPrice(discountAmount)}
                      {orderData.discount_id && (
                        <span className="text-sm ml-1 text-gray-500">
                          ({orderData.discount_id.code})
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {couponAmount > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Mã giảm giá</span>
                    <span className="font-medium">
                      {formatPrice(couponAmount)}
                      {orderData.coupon_id && (
                        <span className="text-sm ml-1 text-gray-500">
                          ({orderData.coupon_id.code})
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Hiển thị chi tiết giảm giá nếu có */}
                {orderData.discount_id && (
                  <div className="py-2 border-b border-gray-100">
                    <div className="text-gray-600 text-sm">
                      <div><span className="font-medium">Tên:</span> {orderData.discount_id.name}</div>
                      <div><span className="font-medium">Mã:</span> {orderData.discount_id.code}</div>
                      {orderData.discount_id.description && (
                        <div><span className="font-medium">Mô tả:</span> {orderData.discount_id.description}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Hiển thị chi tiết coupon nếu có */}
                {orderData.coupon_id && (
                  <div className="py-2 border-b border-gray-100">
                    <div className="text-gray-600 text-sm">
                      <div><span className="font-medium">Tên coupon:</span> {orderData.coupon_id.name}</div>
                      <div><span className="font-medium">Mã coupon:</span> {orderData.coupon_id.code}</div>
                      {orderData.coupon_id.description && (
                        <div><span className="font-medium">Mô tả:</span> {orderData.coupon_id.description}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between py-3 mt-1">
                  <span className="text-gray-800 font-semibold">Tổng thanh toán</span>
                  <span className="font-bold text-red-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Truck size={20} className="mr-2" />
                Vận chuyển
              </h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="flex items-start mb-4">
                  <div className="bg-red-100 p-2 rounded-md mr-3">
                    <Truck size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{orderData.shipping_id?.name || 'Giao hàng tiêu chuẩn'}</h3>
                    <p className="text-gray-600 text-sm">Dự kiến 1-3 ngày</p>
                  </div>
                  <div className="ml-auto font-semibold">{formatPrice(shippingCost)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Payment method */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard size={20} className="mr-2" />
                Thanh toán
              </h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="flex items-start mb-4">
                  <div className="bg-gray-100 p-2 rounded-md mr-3">
                    <CreditCard size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{orderData.payment_id?.name || 'Phương thức thanh toán'}</h3>
                    <p className="flex items-center text-sm">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${orderData.order_payment_id ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      <span className={orderData.order_payment_id ? 'text-green-500' : 'text-yellow-500'}>
                        {orderData.order_payment_id ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </p>
                    {orderData.order_payment_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Mã thanh toán: {orderData.order_payment_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User size={20} className="mr-2" />
                Khách hàng
              </h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="flex items-start mb-4">
                  <div className="mr-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {(customerData?.firstName || orderData.customer_id?.firstName || 'A').charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {customerData?.firstName || orderData.customer_id?.firstName || ''} {customerData?.lastName || orderData.customer_id?.lastName || ''}
                    </h3>
                    <p className="text-gray-500 text-sm">ID: {orderData.customer_id?._id?.substring(0, 8) || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-gray-600">{customerData?.email || orderData.customer_id?.email || 'Email không có sẵn'}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span className="text-gray-600">{customerData?.phone || orderData.customer_id?.phone || 'Số điện thoại không có sẵn'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin size={20} className="mr-2" />
                Địa chỉ nhận hàng
              </h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <p className="text-gray-700">
                  {addressData ? formatAddress(addressData) : (
                    orderData.user_address_id ? `Đang tải địa chỉ...` : 'Địa chỉ giao hàng không có sẵn'
                  )}
                </p>
                {addressData && addressData.phone && (
                  <p className="text-gray-500 text-sm mt-2">
                    Số điện thoại: {addressData.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;