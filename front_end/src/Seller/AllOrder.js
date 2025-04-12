import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Eye, CheckCircle, X, Loader, AlertTriangle, Edit } from 'lucide-react';
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

  const effectiveStatus = orderData?.order?.order_status || orderData?.order?.status_id;

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
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusClass(effectiveStatus)}`}>
                    {translateStatus(effectiveStatus)}
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

// Reject Order Confirmation Modal
const RejectOrderModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">Xác nhận từ chối đơn hàng</h3>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">Bạn có chắc chắn muốn từ chối đơn hàng này không? Hành động này không thể hoàn tác.</p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={() => onConfirm()}
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Order Status Modal Component
const EditOrderStatusModal = ({ orderId, currentStatus, onClose, onUpdate, getShopId, translateStatus, ApiService }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Options for order status - only allow valid transitions
  const getStatusOptions = (current) => {
    switch(current) {
      case 'processing':
        return [
          { id: 'processing', name: 'Đang xử lý' },
          { id: 'shipped', name: 'Đang vận chuyển' }
        ];
      case 'shipped':
        return [
          { id: 'shipped', name: 'Đang vận chuyển' },
          { id: 'delivered', name: 'Đã giao hàng' }
        ];
      case 'delivered':
        return [
          { id: 'delivered', name: 'Đã giao hàng' }
        ];
      default:
        return [
          { id: current, name: translateStatus(current) }
        ];
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get shop ID
      const shopId = await getShopId();
      
      // Call the API to update order status
      const response = await ApiService.put(`/order/status/${orderId}`, {
        order_status: selectedStatus,
        shop_id: shopId
      });
      
      console.log("Cập nhật trạng thái đơn hàng thành công:", response);
      
      // Show success message
      alert(`Đã cập nhật trạng thái đơn hàng thành công`);
      
      // Close the modal and refresh
      onUpdate();
      onClose();
      
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      setError(`Lỗi khi cập nhật trạng thái: ${error.message || "Đã xảy ra lỗi"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">Cập nhật trạng thái đơn hàng</h3>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Trạng thái đơn hàng
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={loading}
          >
            {getStatusOptions(currentStatus).map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Vui lòng chọn trạng thái mới cho đơn hàng
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 flex items-center"
            onClick={handleUpdateStatus}
            disabled={loading || selectedStatus === currentStatus}
          >
            {loading && <Loader size={16} className="animate-spin mr-2" />}
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const AllOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [editStatusOrder, setEditStatusOrder] = useState(null);

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

  // Refresh orders function
  const refreshOrders = async () => {
    try {
      setLoading(true);
      const shopId = await getShopId();
      
      if (!shopId) {
        setLoading(false);
        return;
      }
      
      let response;
      try {
        response = await ApiService.get(`/order/shop/${shopId}`);
      } catch (endpointError) {
        console.log(`First endpoint failed, trying alternative: ${endpointError}`);
        try {
          response = await ApiService.get(`/order/shop/${shopId}`);
        } catch (altEndpointError) {
          console.log(`Alternative endpoint failed: ${altEndpointError}`);
          response = await ApiService.get('/orders/my-orders');
        }
      }
      
      console.log("Orders refreshed:", response);
      
      if (!response || response.length === 0) {
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const shopOrders = response.map(item => {
        const formattedDate = new Date(item.order.created_at).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        const sellerTotal = item.orderDetails.reduce((sum, detail) => {
          return sum + (detail.price * detail.quantity);
        }, 0);
        
        // IMPORTANT: Check both status fields to determine the true status
        const effectiveStatus = item.order.order_status || item.order.status_id;
        
        return {
          id: item.order.id,
          orderId: item.order._id,
          status: translateStatus(effectiveStatus),
          statusId: effectiveStatus,
          discount: item.order.discount_id ? "Có" : "Không",
          orderTime: formattedDate,
          total: formatPrice(sellerTotal),
          statusClass: getStatusClass(effectiveStatus),
          customerName: item.order.customer_id ? 
            `${item.order.customer_id.firstName} ${item.order.customer_id.lastName}` : 
            "Không có thông tin",
          isConfirmed: item.order.is_confirmed || effectiveStatus !== 'pending',
          rawData: item
        };
      });

      setOrders(shopOrders);
      setTotalOrders(shopOrders.length);
      setTotalPages(Math.ceil(shopOrders.length / itemsPerPage));
      
    } catch (error) {
      console.error("Error refreshing orders:", error);
      setError("Không thể tải lại danh sách đơn hàng.");
    } finally {
      setLoading(false);
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
          
          // IMPORTANT: Check both status fields to determine the true status
          const effectiveStatus = item.order.order_status || item.order.status_id;

          return {
            id: item.order.id,
            orderId: item.order._id, // MongoDB ObjectId
            status: translateStatus(effectiveStatus),
            statusId: effectiveStatus, // Use effective status
            discount: item.order.discount_id ? "Có" : "Không",
            orderTime: formattedDate,
            total: formatPrice(sellerTotal),
            statusClass: getStatusClass(effectiveStatus),
            customerName: item.order.customer_id ? 
              `${item.order.customer_id.firstName} ${item.order.customer_id.lastName}` : 
              "Không có thông tin",
            isConfirmed: item.order.is_confirmed || effectiveStatus !== 'pending',
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

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter(order => {
    // Ensure all these properties exist before trying to use toLowerCase()
    const orderId = order.id ? order.id.toString().toLowerCase() : '';
    const customerName = order.customerName ? order.customerName.toLowerCase() : '';
    const status = order.status ? order.status.toLowerCase() : '';
    const statusId = order.statusId ? order.statusId.toLowerCase() : '';
    
    // Filter by search term
    const matchesSearch = orderId.includes(searchTerm.toLowerCase()) ||
                         customerName.includes(searchTerm.toLowerCase()) ||
                         status.includes(searchTerm.toLowerCase());
    
    // Filter by status if a status filter is selected
    const matchesStatus = !statusFilter || statusId === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get current orders based on pagination
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  
  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle view order details
  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
  };

  // Handle order confirmation using the correct API endpoint
  const handleConfirmOrder = async (orderId) => {
    try {
      console.log(`Xác nhận đơn hàng: ${orderId}`);
      
      // Get shop ID
      const shopId = await getShopId();
      
      // FIXED: Use correct field name 'order_status' instead of 'status_id'
      const response = await ApiService.put(`/order/status/${orderId}`, {
        order_status: 'processing', // Changed from status_id to order_status
        shop_id: shopId
      });
      
      console.log("Xác nhận đơn hàng thành công:", response);
      
      // Show success message
      alert(`Đã xác nhận đơn hàng thành công`);
      
      // Refresh orders to get the updated data from the server
      await refreshOrders();
      
    } catch (error) {
      console.error("Lỗi khi xác nhận đơn hàng:", error);
      alert(`Lỗi khi xác nhận đơn hàng: ${error.message || "Đã xảy ra lỗi"}`);
    }
  };

  // Handle reject order
  const handleRejectOrder = (orderId) => {
    setRejectOrderId(orderId);
  };

  // Handle confirm reject order
  const handleConfirmReject = async () => {
    try {
      console.log(`Từ chối đơn hàng: ${rejectOrderId}`);
      
      // Use the dedicated seller rejection endpoint
      const response = await ApiService.put(`/order/reject/${rejectOrderId}`);
      
      console.log("Từ chối đơn hàng thành công:", response);
      
      // Show success message
      alert(`Đã từ chối đơn hàng thành công`);
      
      // Close the modal
      setRejectOrderId(null);
      
      // Refresh orders to get the updated status from the server
      await refreshOrders();
      
    } catch (error) {
      console.error("Lỗi khi từ chối đơn hàng:", error);
      alert(`Lỗi khi từ chối đơn hàng: ${error.message || "Đã xảy ra lỗi"}`);
    }
  };

  // Handle edit order status
  const handleEditOrderStatus = (order) => {
    setEditStatusOrder({
      id: order.orderId,
      status: order.statusId
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Header và công cụ tìm kiếm */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
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
            
            {/* Status Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="font-medium text-gray-700">Lọc theo trạng thái:</div>
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`px-3 py-1 rounded-full text-sm ${statusFilter === '' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  onClick={() => handleStatusFilterChange('')}
                >
                  Tất cả
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  onClick={() => handleStatusFilterChange('pending')}
                >
                  Chờ xác nhận
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'processing' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  onClick={() => handleStatusFilterChange('processing')}
                >
                  Đang xử lý
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'shipped' 
                    ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  onClick={() => handleStatusFilterChange('shipped')}
                >
                  Đang vận chuyển
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'delivered' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  onClick={() => handleStatusFilterChange('delivered')}
                >
                  Đã giao hàng
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'cancelled' 
                    ? 'bg-red-100 text-red-800 border border-red-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  onClick={() => handleStatusFilterChange('cancelled')}
                >
                  Đã hủy
                </button>
              </div>
              
              {/* Only show clear filters button if there are active filters */}
              {(statusFilter || searchTerm) && (
                <button 
                  className="px-3 py-1 rounded-full text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 ml-auto"
                  onClick={clearFilters}
                >
                  Xóa bộ lọc
                </button>
              )}
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
                          
                          {/* Conditional action buttons based on status */}
                          {order.statusId === 'pending' && (
                            <>
                              <button 
                                className="text-green-600 hover:text-green-900"
                                onClick={() => handleConfirmOrder(order.orderId)}
                                title="Xác nhận đơn hàng"
                              >
                                <CheckCircle size={18} />
                              </button>
                              
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleRejectOrder(order.orderId)}
                                title="Từ chối đơn hàng"
                              >
                                <AlertTriangle size={18} />
                              </button>
                            </>
                          )}
                          
                          {/* Edit status button - only for confirmed orders that are not cancelled or delivered */}
                          {(order.statusId === 'processing' || order.statusId === 'shipped') && (
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleEditOrderStatus(order)}
                              title="Cập nhật trạng thái"
                            >
                              <Edit size={18} />
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
                  <span className="ml-2 text-gray-500">
                    {statusFilter && `(đang lọc: ${translateStatus(statusFilter)})`}
                  </span>
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

      {/* Reject order confirmation modal */}
      {rejectOrderId && (
        <RejectOrderModal
          onClose={() => setRejectOrderId(null)}
          onConfirm={handleConfirmReject}
        />
      )}
      
      {/* Edit order status modal */}
      {editStatusOrder && (
        <EditOrderStatusModal
          orderId={editStatusOrder.id}
          currentStatus={editStatusOrder.status}
          onClose={() => setEditStatusOrder(null)}
          onUpdate={refreshOrders}
          getShopId={getShopId}
          translateStatus={translateStatus}
          ApiService={ApiService}
        />
      )}
    </div>
  );
};

export default AllOrders;