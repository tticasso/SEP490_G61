import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, RefreshCw, Clock, DollarSign, Package, XCircle, Truck, CheckCircle } from 'lucide-react';
import ApiService from '../../services/ApiService';
import OrderDetail from './OrderDetail';
import PaymentDetailsPopup from './PaymentDetailsPopup';

const OrderManagement = () => {
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    ordersByStatus: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    },
    totalRevenue: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);

  // Filter states
  const [filter, setFilter] = useState({
    all: true,
    pending: false,
    processing: false,
    shipped: false,
    delivered: false,
    cancelled: false
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortOption, setSortOption] = useState('newest');

  // Fetch orders and statistics data
  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, [currentPage, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let endpoint = '/order/list';

      const response = await ApiService.get(endpoint);
      console.log("====== ORDER LIST DEBUG ======");
      console.log("Orders response:", response);

      // Kiểm tra thông tin khách hàng trong đơn hàng đầu tiên (nếu có)
      if (response && response.length > 0) {
        console.log("First order:", response[0]);
        console.log("Customer data in first order:", response[0].customer_id);

        // Xem xét cấu trúc của tất cả các đơn hàng để tìm vấn đề
        const customerDataTypes = response.map(order => ({
          orderId: order.id,
          customerIdType: typeof order.customer_id,
          hasFirstName: order.customer_id ? Boolean(order.customer_id.firstName) : false
        }));
        console.log("Customer data analysis:", customerDataTypes);
      }

      setOrders(response);
      setTotalItems(response.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError('Lỗi khi tải dữ liệu đơn hàng: ' + error);
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await ApiService.get('/order/statistics');
      console.log("Statistics response:", response);
      setStatistics(response);
    } catch (error) {
      console.error('Lỗi khi tải thống kê đơn hàng:', error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort
  const handleSort = (e) => {
    setSortOption(e.target.value);
  };

  // Filtered orders with search and sort functionality
  const getFilteredOrders = () => {
    let result = [...orders];

    // Apply filter
    if (filter.pending) {
      result = result.filter(order => order.order_status === 'pending');
    } else if (filter.processing) {
      result = result.filter(order => order.order_status === 'processing');
    } else if (filter.shipped) {
      result = result.filter(order => order.order_status === 'shipped');
    } else if (filter.delivered) {
      result = result.filter(order => order.order_status === 'delivered');
    } else if (filter.cancelled) {
      result = result.filter(order => order.order_status === 'cancelled');
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(order =>
        (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer_id &&
          ((order.customer_id.firstName && order.customer_id.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.customer_id.lastName && order.customer_id.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.customer_id.email && order.customer_id.email.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        ) ||
        (order.total_price && order.total_price.toString().includes(searchTerm))
      );
    }

    // Apply sort
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'highest':
        result.sort((a, b) => b.total_price - a.total_price);
        break;
      case 'lowest':
        result.sort((a, b) => a.total_price - b.total_price);
        break;
      default:
        break;
    }

    return result;
  };

  const filteredOrders = getFilteredOrders();

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // Handle pagination
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Handle view order detail
  const handleViewOrderDetail = (order) => {
    // Chuyển đổi payment_details từ Object sang định dạng đúng nếu cần
    if (order.payment_details && typeof order.payment_details === 'object') {
      // Xử lý dữ liệu payment_details nếu cần
      console.log("Payment details available:", order.payment_details);
    }

    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  // Handle back from order detail
  const handleBackFromDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
    // Reload orders in case of updates
    fetchOrders();
    fetchStatistics();
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        // Updated to use PUT instead of PATCH to match the backend route
        await ApiService.put(`/order/cancel/${orderId}`, {});
        // Refresh orders after cancellation
        fetchOrders();
        fetchStatistics();
      } catch (error) {
        console.error("Cancel order error:", error);
        setError('Lỗi khi hủy đơn hàng: ' + error);
      }
    }
  };

  // Get status class for display
  const getStatusClass = (orderStatus) => {
    switch (orderStatus) {
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'processing':
        return 'bg-green-500 text-white';
      case 'shipped':
        return 'bg-blue-500 text-white';
      case 'delivered':
        return 'bg-purple-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Hàm mới để lấy màu trạng thái thanh toán
  const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Hàm kiểm tra phương thức thanh toán VNPay
  const isOnlinePayment = (order) => {
    if (!order || !order.payment_id || !order.payment_id.name) {
      return false;
    }

    const paymentMethod = order.payment_id.name.toLowerCase();
    // Kiểm tra các phương thức thanh toán online
    return paymentMethod.includes('qr') ||
      paymentMethod.includes('mã qr') ||
      paymentMethod.includes('payos') ||
      paymentMethod.includes('momo') ||
      paymentMethod.includes('online');
  };

  // Convert status to Vietnamese
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'CHỜ XÁC NHẬN';
      case 'processing':
        return 'ĐÃ XÁC NHẬN';
      case 'shipped':
        return 'ĐANG VẬN CHUYỂN';
      case 'delivered':
        return 'GIAO HÀNG THÀNH CÔNG';
      case 'cancelled':
        return 'HỦY ĐƠN';
      default:
        return status.toUpperCase();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Dashboard statistics
  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 px-6">
      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <Package size={24} className="text-blue-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
          <p className="text-2xl font-bold">{statistics.totalOrders || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="bg-green-100 p-3 rounded-full mr-4">
          <DollarSign size={24} className="text-green-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Doanh thu</p>
          <p className="text-2xl font-bold">{formatPrice(statistics.totalRevenue || 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="bg-yellow-100 p-3 rounded-full mr-4">
          <Clock size={24} className="text-yellow-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Chờ xác nhận</p>
          <p className="text-2xl font-bold">{statistics.ordersByStatus?.pending || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="bg-purple-100 p-3 rounded-full mr-4">
          <CheckCircle size={24} className="text-purple-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Đã xử lý</p>
          <p className="text-2xl font-bold">
            {(statistics.ordersByStatus?.processing || 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
          <Truck size={24} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Đang vận chuyển</p>
          <p className="text-2xl font-bold">{statistics.ordersByStatus?.shipped || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex items-center">
        <div className="bg-red-100 p-3 rounded-full mr-4">
          <XCircle size={24} className="text-red-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Đã hủy</p>
          <p className="text-2xl font-bold">{statistics.ordersByStatus?.cancelled || 0}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex-1 bg-gray-50">
      {showOrderDetail ? (
        <OrderDetail orderId={selectedOrder._id} onBack={handleBackFromDetail} />
      ) : (
        <>
          {/* Dashboard Statistics */}
          {renderDashboard()}

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap space-x-4 md:space-x-6 text-gray-600">
              <button
                className={`mb-2 ${filter.all ? 'text-blue-600 font-medium' : ''}`}
                onClick={() => setFilter({ all: true, pending: false, processing: false, shipped: false, delivered: false, cancelled: false })}
              >
                Tất cả ({statistics.totalOrders || 0})
              </button>
              <button
                className={`mb-2 ${filter.pending ? 'text-blue-600 font-medium' : ''}`}
                onClick={() => setFilter({ all: false, pending: true, processing: false, shipped: false, delivered: false, cancelled: false })}
              >
                Chờ xác nhận ({statistics.ordersByStatus?.pending || 0})
              </button>
              <button
                className={`mb-2 ${filter.processing ? 'text-blue-600 font-medium' : ''}`}
                onClick={() => setFilter({ all: false, pending: false, processing: true, shipped: false, delivered: false, cancelled: false })}
              >
                Đã xác nhận ({statistics.ordersByStatus?.processing || 0})
              </button>
              <button
                className={`mb-2 ${filter.shipped ? 'text-blue-600 font-medium' : ''}`}
                onClick={() => setFilter({ all: false, pending: false, processing: false, shipped: true, delivered: false, cancelled: false })}
              >
                Đang vận chuyển ({statistics.ordersByStatus?.shipped || 0})
              </button>
              <button
                className={`mb-2 ${filter.delivered ? 'text-blue-600 font-medium' : ''}`}
                onClick={() => setFilter({ all: false, pending: false, processing: false, shipped: false, delivered: true, cancelled: false })}
              >
                Giao Hàng Thành Công ({statistics.ordersByStatus?.delivered || 0})
              </button>
              <button
                className={`mb-2 ${filter.cancelled ? 'text-blue-600 font-medium' : ''}`}
                onClick={() => setFilter({ all: false, pending: false, processing: false, shipped: false, delivered: false, cancelled: true })}
              >
                Hủy đơn ({statistics.ordersByStatus?.cancelled || 0})
              </button>
            </div>
          </div>

          {/* Function bar */}
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center px-6 py-4 space-y-2 md:space-y-0">
            <div className="flex items-center">
              <button
                className="flex items-center text-gray-700 mr-4"
                onClick={fetchOrders}
              >
                <RefreshCw size={18} className="mr-2" />
                <span>Làm mới</span>
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white w-full"
                  value={sortOption}
                  onChange={handleSort}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="highest">Giá cao nhất</option>
                  <option value="lowest">Giá thấp nhất</option>
                </select>
              </div>
              <div className="w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn hàng hoặc thông tin khách hàng..."
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          {/* Orders table */}
          <div className="px-6 pb-6">
            <div className="bg-white rounded-md shadow-sm">
              <div className="overflow-x-auto" style={{ width: '100%' }}>
                <table className="min-w-full divide-y divide-gray-200" >
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" >
                        Mã đơn hàng
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" >
                        Khách hàng
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" >
                        Phương thức vận chuyển
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" >
                        Phương thức thanh toán
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" >
                        Trạng thái đơn hàng
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" >
                        Trạng thái thanh toán
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" >
                        Chi tiết thanh toán
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" >
                        Thời gian đặt hàng
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" >
                        Tổng tiền
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap" >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {order.id || order._id}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {order.customer_id?.firstName} {order.customer_id?.lastName || 'Không có tên'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {order.shipping_id?.name || 'Không có thông tin'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {order.payment_id?.name || 'Không có thông tin'}
                          {order.payment_method && (
                            <span className="text-xs block text-gray-500">({order.payment_method})</span>
                          )}
                        </td>
                        {/* Trạng thái đơn hàng */}
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 truncate text-xs font-medium rounded ${getStatusClass(order.order_status)}`}>
                            {getStatusText(order.order_status)}
                          </span>
                        </td>
                        {/* Trạng thái thanh toán */}
                        <td className="py-4 px-4">
                          {isOnlinePayment(order) ? (
                            <span className={`px-3 py-1 truncate text-xs font-medium rounded ${getPaymentStatusClass(order.status_id)}`}>
                              {order.status_id === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Không áp dụng</span>
                          )}
                        </td>
                        {/* Chi tiết thanh toán */}
                        <td className="py-4 px-4">
                          {isOnlinePayment(order) ? (
                            order.payment_details && Object.keys(order.payment_details).length > 0 ? (
                              <button
                                onClick={() => {
                                  setSelectedPaymentDetails(order.payment_details);
                                  setSelectedOrder(order); // Lưu thông tin đơn hàng để lấy status_id
                                  setShowPaymentDetails(true);
                                }}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200"
                              >
                                Xem chi tiết
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">Không có dữ liệu</span>
                            )
                          ) : (
                            <span className="text-gray-400 text-xs">Không áp dụng</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700 font-medium">
                          {formatPrice(order.total_price)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-3">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleViewOrderDetail(order)}
                              title="Xem chi tiết"
                            >
                              <Eye size={18} />
                            </button>

                            {order.order_status === 'pending' && (
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleCancelOrder(order._id)}
                                title="Hủy đơn hàng"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="px-4 py-3 bg-white border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-2 md:mb-0">
                    <button
                      className={`p-2 border border-gray-300 rounded-md mr-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => goToPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const pageNumber = currentPage <= 3
                        ? index + 1
                        : currentPage - 3 + index + 1;

                      if (pageNumber <= totalPages) {
                        return (
                          <button
                            key={pageNumber}
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentPage === pageNumber
                              ? 'bg-pink-500 text-white'
                              : 'text-gray-700'
                              }`}
                            onClick={() => goToPage(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      return null;
                    })}

                    <button
                      className={`p-2 border border-gray-300 rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <span>Trang {currentPage} của {totalPages}</span>
                    <span className="mx-4">-</span>
                    <span>Hiển thị</span>
                    <select
                      className="mx-2 border border-gray-300 rounded p-1"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                    <span>/</span>
                    <span className="ml-2">{totalItems}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {/* Chi tiết thanh toán popup */}
      {showPaymentDetails && (
        <PaymentDetailsPopup
          paymentDetails={selectedPaymentDetails}
          orderStatusId={selectedOrder.status_id}
          onClose={() => {
            setShowPaymentDetails(false);
            setSelectedPaymentDetails(null);
          }}
        />
      )}
    </div>
  );
};

export default OrderManagement;