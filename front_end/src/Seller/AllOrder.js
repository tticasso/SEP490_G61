import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Eye, CheckCircle, X, Loader } from 'lucide-react';
import Sidebar from './Sidebar';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

// Order Detail Modal Component
const OrderDetailModal = ({ orderId, onClose }) => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await ApiService.get(`/order/find/${orderId}`);
        console.log('Order details:', response);
        setOrderData(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Không thể tải thông tin chi tiết đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price).replace('₫', 'đ');
  };

  // Translate status 
  const translateStatus = (statusId) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'processing': 'Đang xử lý',
      'shipped': 'Đang vận chuyển',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[statusId] || statusId;
  };

  // Get status class for coloring
  const getStatusClass = (statusId) => {
    const statusClassMap = {
      'pending': 'bg-yellow-500',
      'processing': 'bg-blue-500',
      'shipped': 'bg-purple-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500'
    };
    return statusClassMap[statusId] || 'bg-gray-500';
  };

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">Chi Tiết Đơn Hàng</h3>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin mr-2" />
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && orderData && (
          <div className="space-y-6">
            {/* Thông tin đơn hàng */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 text-lg border-b pb-2">Thông Tin Đơn Hàng</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã đơn hàng:</p>
                  <p className="font-medium">{orderData.order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái:</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusClass(orderData.order.status_id)}`}>
                    {translateStatus(orderData.order.status_id)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt hàng:</p>
                  <p className="font-medium">{formatDate(orderData.order.created_at)}</p>
                </div>
                {orderData.order.order_delivered_at && (
                  <div>
                    <p className="text-sm text-gray-600">Ngày giao hàng:</p>
                    <p className="font-medium">{formatDate(orderData.order.order_delivered_at)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Phương thức thanh toán:</p>
                  <p className="font-medium">{orderData.order.payment_method || 'Không có thông tin'}</p>
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 text-lg border-b pb-2">Thông Tin Khách Hàng</h4>
              {orderData.order.customer_id ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Họ và tên:</p>
                    <p className="font-medium">
                      {orderData.order.customer_id.firstName} {orderData.order.customer_id.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email:</p>
                    <p className="font-medium">{orderData.order.customer_id.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại:</p>
                    <p className="font-medium">{orderData.order.customer_id.phone || 'Không có thông tin'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Không có thông tin khách hàng</p>
              )}
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 text-lg border-b pb-2">Địa Chỉ Giao Hàng</h4>
              {orderData.order.user_address_id ? (
                <div>
                  <p className="mb-1">{orderData.order.user_address_id.street}, {orderData.order.user_address_id.ward}</p>
                  <p className="mb-1">{orderData.order.user_address_id.district}, {orderData.order.user_address_id.city}</p>
                  <p>Người nhận: {orderData.order.user_address_id.recipient_name} - {orderData.order.user_address_id.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500">Không có thông tin địa chỉ giao hàng</p>
              )}
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 text-lg border-b pb-2">Sản Phẩm</h4>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orderData.orderDetails.map((detail) => (
                    <tr key={detail._id}>
                      <td className="px-3 py-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 flex-shrink-0 mr-3 bg-gray-200 rounded">
                            {detail.product_id?.thumbnail && (
                              <img 
                                src={detail.product_id.thumbnail} 
                                alt={detail.product_id.name} 
                                className="w-10 h-10 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = "/api/placeholder/50/50";
                                }} 
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{detail.product_id?.name || 'Sản phẩm không còn tồn tại'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        {formatPrice(detail.price)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {detail.quantity}
                      </td>
                      <td className="px-3 py-3 text-right font-medium">
                        {formatPrice(detail.price * detail.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Thông tin thanh toán */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 text-lg border-b pb-2">Thông Tin Thanh Toán</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền hàng:</span>
                  <span>{formatPrice(orderData.order.original_price || 0)}</span>
                </div>

                {orderData.order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="text-red-500">- {formatPrice(orderData.order.discount_amount)}</span>
                  </div>
                )}

                {orderData.order.coupon_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giảm giá:</span>
                    <span className="text-red-500">- {formatPrice(orderData.order.coupon_amount)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t font-medium text-lg">
                  <span>Tổng thanh toán:</span>
                  <span className="text-pink-600">{formatPrice(orderData.order.total_price)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const AllOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Get seller shop ID from API
  const getShopId = async () => {
    try {
      // Using the same approach as in ProductList.js
      const shop = await ApiService.get('/shops/my-shop');
      
      if (!shop || !shop._id) {
        console.log("Shop data returned:", shop);
        // Try alternative approach - get from user directly
        const user = AuthService.getCurrentUser();
        console.log("Current user data:", user);
        
        if (user && (user.shop_id || user.shopId)) {
          return user.shop_id || user.shopId;
        }
        
        // If we still don't have a shop ID but have a user ID, 
        // we might be able to use that with a different API endpoint
        if (user && user._id) {
          return user._id; // Some APIs allow using user ID to fetch associated shop orders
        }
        
        throw new Error("Không tìm thấy thông tin shop");
      }
      
      return shop._id;
    } catch (error) {
      console.error("Error fetching shop:", error);
      setError("Không tìm thấy thông tin shop. Vui lòng đăng nhập lại.");
      return null;
    }
  };

  // Fetch orders related to the seller's shop
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const shopId = await getShopId();
        
        if (!shopId) {
          // Error already set in getShopId
          setLoading(false);
          return;
        }
        
        // Try different API endpoints if needed
        let response;
        try {
          // First attempt with the original path
          response = await ApiService.get(`/order/shop/${shopId}`);
        } catch (endpointError) {
          console.log(`First endpoint failed, trying alternative: ${endpointError}`);
          try {
            // Try alternative endpoint format
            response = await ApiService.get(`/order/shop/${shopId}`);
          } catch (altEndpointError) {
            console.log(`Alternative endpoint failed: ${altEndpointError}`);
            
            // Last attempt - try with 'my-orders' endpoint that might not need shop ID
            response = await ApiService.get('/orders/my-orders');
          }
        }
        
        // If we reach here, one of the endpoints worked
        console.log("Orders fetched successfully:", response);
        
        // If no orders or empty response, set empty array
        if (!response || response.length === 0) {
          setOrders([]);
          setTotalOrders(0);
          setTotalPages(1);
          setLoading(false);
          return;
        }

        // The API returns { order, orderDetails } objects
        const shopOrders = response.map(item => {
          // Format dates and calculate total for this shop's products
          const formattedDate = new Date(item.order.created_at).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });

          // Calculate total for this seller's products in the order
          const sellerTotal = item.orderDetails.reduce((sum, detail) => {
            return sum + (detail.price * detail.quantity);
          }, 0);

          return {
            id: item.order.id,
            orderId: item.order._id, // MongoDB ObjectId
            status: translateStatus(item.order.status_id),
            discount: item.order.discount_id ? "Có" : "Không",
            orderTime: formattedDate,
            total: formatPrice(sellerTotal),
            statusClass: getStatusClass(item.order.status_id),
            customerName: item.order.customer_id ? 
              `${item.order.customer_id.firstName} ${item.order.customer_id.lastName}` : 
              "Không có thông tin",
            isConfirmed: item.order.is_confirmed || false, // Add confirmation status
            rawData: item // Keep raw data for detailed view
          };
        });

        setOrders(shopOrders);
        setTotalOrders(shopOrders.length);
        setTotalPages(Math.ceil(shopOrders.length / itemsPerPage));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Helper function to translate status
  const translateStatus = (statusId) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'processing': 'Đang xử lý',
      'shipped': 'Đang vận chuyển',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[statusId] || statusId;
  };

  // Helper function to determine status class for styling
  const getStatusClass = (statusId) => {
    const statusClassMap = {
      'pending': 'bg-yellow-500',
      'processing': 'bg-blue-500',
      'shipped': 'bg-purple-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500'
    };
    return statusClassMap[statusId] || 'bg-gray-500';
  };

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price).replace('₫', 'đ');
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    // Ensure all these properties exist before trying to use toLowerCase()
    const orderId = order.id ? order.id.toString().toLowerCase() : '';
    const customerName = order.customerName ? order.customerName.toLowerCase() : '';
    const status = order.status ? order.status.toLowerCase() : '';
    
    return orderId.includes(searchTerm.toLowerCase()) ||
           customerName.includes(searchTerm.toLowerCase()) ||
           status.includes(searchTerm.toLowerCase());
  });

  // Get current orders based on pagination
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  
  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle view order details
  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
  };

  // Handle order confirmation using the correct API endpoint
  const handleConfirmOrder = async (orderId) => {
    try {
      console.log(`Xác nhận đơn hàng: ${orderId}`);
      
      // Sử dụng đúng endpoint và status_id hợp lệ
      // Từ lỗi và code trước đó, ta thấy 'confirmed' không hợp lệ
      // Giá trị hợp lệ phải là: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
      const response = await ApiService.put(`/order/status/${orderId}`, {
        status_id: 'processing', // Sử dụng trạng thái hợp lệ
        shop_id: await getShopId()
      });
      
      console.log("Xác nhận đơn hàng thành công:", response);
      
      // Cập nhật state để hiển thị trạng thái đã xác nhận
      setOrders(orders.map(order => {
        if (order.orderId === orderId) {
          return {
            ...order,
            isConfirmed: true,
            status: translateStatus('processing'), // Translate để hiển thị tiếng Việt
            statusClass: getStatusClass('processing')
          };
        }
        return order;
      }));
      
      // Hiển thị thông báo thành công
      alert(`Đã xác nhận đơn hàng thành công`);
    } catch (error) {
      console.error("Lỗi khi xác nhận đơn hàng:", error);
      alert(`Lỗi khi xác nhận đơn hàng: ${error.message || "Đã xảy ra lỗi"}`);
    }
  };

  // Handle update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ApiService.put(`/orders/status/${orderId}`, {
        status_id: newStatus
      });
      
      // Update local state to reflect the change
      setOrders(orders.map(order => {
        if (order.orderId === orderId) {
          return {
            ...order,
            status: translateStatus(newStatus),
            statusClass: getStatusClass(newStatus)
          };
        }
        return order;
      }));
      
      // Show success message
      alert(`Đã cập nhật trạng thái đơn hàng thành ${translateStatus(newStatus)}`);
    } catch (error) {
      alert(`Lỗi khi cập nhật trạng thái: ${error}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Header và công cụ tìm kiếm */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Đơn hàng của Shop</h1>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="border rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && orders.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">Không có đơn hàng nào cho shop của bạn.</p>
            </div>
          )}

          {/* Bảng dữ liệu đơn hàng */}
          {!loading && orders.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-white border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      MÃ ĐƠN HÀNG
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      KHÁCH HÀNG
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      TRẠNG THÁI
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      GIẢM GIÁ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      THỜI GIAN ĐẶT HÀNG
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      TỔNG ĐƠN HÀNG
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      THAO TÁC
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${order.statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.discount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex justify-center space-x-2">
                          {/* View order details button */}
                          <button 
                            className="text-pink-600 hover:text-pink-900"
                            onClick={() => handleViewOrder(order.orderId)}
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {/* Confirm order button - only show if status is pending */}
                          {order.status === 'Chờ xác nhận' && (
                            <button 
                              className="text-green-600 hover:text-green-900"
                              onClick={() => handleConfirmOrder(order.orderId)}
                              title="Xác nhận đơn hàng"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Phân trang */}
              <div className="px-6 py-3 flex justify-between items-center border-t border-gray-200">
                <div className="flex items-center">
                  <button 
                    className={`mr-2 p-1 rounded-full border w-8 h-8 flex items-center justify-center ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`mr-2 p-1 rounded-full w-8 h-8 flex items-center justify-center ${currentPage === page ? 'bg-pink-500 text-white' : 'border hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    className={`p-1 rounded-full border w-8 h-8 flex items-center justify-center ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ArrowLeft size={16} className="rotate-180" />
                  </button>
                </div>
                
                <div className="flex items-center text-sm">
                  <span>Trang {currentPage} của {totalPages}</span>
                  <span className="mx-4">-</span>
                  <span>Hiển thị</span>
                  <select 
                    className="mx-2 border rounded p-1" 
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span>/</span>
                  <span className="ml-2">{totalOrders} Đơn hàng</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Order detail modal */}
      {selectedOrderId && (
        <OrderDetailModal 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  );
};

export default AllOrders;