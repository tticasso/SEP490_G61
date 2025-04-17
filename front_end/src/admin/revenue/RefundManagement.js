import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, Eye, CheckCircle } from 'lucide-react';
import RevenueService from './services/RevenueService';
import PaymentDetailsPopup from './PaymentDetailsPopup';

const RefundManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal states
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchRefundOrders();
  }, [page, limit]);

  const fetchRefundOrders = async () => {
    setLoading(true);
    try {
      // Gọi API để lấy danh sách đơn hàng cần hoàn tiền
      const response = await RevenueService.getOrdersNeedingRefund();
      
      setOrders(response || []);
      setTotalItems(response.length || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching refund orders:', err);
      setError('Không thể tải danh sách đơn hàng cần hoàn tiền. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRefunded = async (orderId) => {
    if (!window.confirm('Xác nhận đã hoàn tiền cho đơn hàng này?')) {
      return;
    }
    
    setProcessing(true);
    try {
      await RevenueService.markOrderRefunded(orderId);
      setSuccess('Đã đánh dấu đơn hàng đã hoàn tiền thành công');
      
      // Refresh list
      fetchRefundOrders();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error marking order as refunded:', err);
      setError('Không thể đánh dấu đơn hàng đã hoàn tiền. Vui lòng thử lại sau.');
    } finally {
      setProcessing(false);
    }
  };

  const viewPaymentDetails = (order) => {
    setSelectedOrder(order);
    setShowPaymentDetails(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / limit);
  const indexOfLastItem = page * limit;
  const indexOfFirstItem = indexOfLastItem - limit;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">QUẢN LÝ HOÀN TIỀN</h1>
        <button 
          onClick={fetchRefundOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <RefreshCw size={18} className="mr-2" />
          Làm mới
        </button>
      </div>

      {/* Statistics summary */}
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-lg">
        <div className="flex items-start">
          <AlertTriangle size={24} className="text-orange-600 mr-3" />
          <div>
            <h2 className="text-lg font-medium text-orange-800">Đơn hàng cần hoàn tiền</h2>
            <p className="text-orange-700 mt-1">
              Đây là danh sách các đơn hàng đã bị hủy sau khi khách hàng đã thanh toán. 
              Bạn cần hoàn tiền cho khách hàng theo thông tin thanh toán.
            </p>
          </div>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <CheckCircle size={20} className="mr-2" />
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <p>Không có đơn hàng nào cần hoàn tiền</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phương thức thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày hủy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-orange-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <AlertTriangle size={16} className="text-orange-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {order.id || order._id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.customer_id?.firstName} {order.customer_id?.lastName || 'Không có tên'}
                      <div className="text-xs text-gray-500">
                        {order.customer_id?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.payment_id?.name || 'Không có thông tin'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600">
                      {formatCurrency(order.total_price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.updated_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => viewPaymentDetails(order)}
                          title="Xem chi tiết thanh toán"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleMarkAsRefunded(order._id)}
                          disabled={processing}
                          title="Đánh dấu đã hoàn tiền"
                        >
                          <CheckCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className={`p-2 border border-gray-300 rounded-md mr-2 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNumber = page <= 3 ? i + 1 : page - 3 + i + 1;
                if (pageNumber <= totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        page === pageNumber ? 'bg-pink-500 text-white' : 'border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

              <button
                className={`p-2 border border-gray-300 rounded-md ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center text-sm text-gray-700">
              <span>Hiển thị</span>
              <select
                className="mx-2 border border-gray-300 rounded p-1"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span>trên {totalItems}</span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Popup */}
      {showPaymentDetails && selectedOrder && (
        <PaymentDetailsPopup
          paymentDetails={selectedOrder.payment_details}
          orderStatusId={selectedOrder.status_id}
          need_pay_back={selectedOrder.need_pay_back}
          onClose={() => {
            setShowPaymentDetails(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default RefundManagement;