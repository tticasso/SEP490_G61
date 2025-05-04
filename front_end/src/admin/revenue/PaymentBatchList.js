import React, { useState, useEffect } from 'react';
import { Eye, Plus, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RevenueService from './services/RevenueService';
import CreatePaymentBatchModal from './CreatePaymentBatchModal';

const PaymentBatchList = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [stats, setStats] = useState({
    unpaidAmount: 0,
    unpaidOrders: 0
  });
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchPaymentBatches();
    fetchUnpaidStats();
  }, [page, limit, status]);

  const fetchPaymentBatches = async () => {
    setLoading(true);
    try {
      const response = await RevenueService.getAllPaymentBatches(page, limit, status);
      
      setBatches(response.batches || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment batches:', err);
      setError('Không thể tải danh sách đợt thanh toán. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidStats = async () => {
    try {
      // Đây là API giả định để lấy thống kê về các đơn hàng chưa thanh toán
      // Trong thực tế, bạn cần thay thế bằng API thực tế trong RevenueService
      const response = await RevenueService.getSystemRevenueOverview();
      setStats({
        unpaidAmount: response?.summary?.unpaid_to_shops || 0,
        unpaidOrders: response?.summary?.unpaid_orders_count || 0
      });
    } catch (err) {
      console.error('Error fetching unpaid stats:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    fetchPaymentBatches(); // Refresh list after creating a batch
    fetchUnpaidStats(); // Refresh unpaid statistics
  };

  const handleViewBatchDetail = (batchId) => {
    navigate(`/admin/revenue/payment-batch/${batchId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getBatchStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatchStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'failed':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ĐỢT THANH TOÁN CHO CỬA HÀNG</h1>
        <div className="flex space-x-4">
          <button 
            onClick={fetchPaymentBatches}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
          >
            <RefreshCw size={18} className="mr-2" />
            Làm mới
          </button>
          {/* <button 
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Tạo đợt thanh toán
          </button> */}
        </div>
      </div>

      {/* Dashboard summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <DollarSign size={24} className="text-orange-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Chờ thanh toán</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.unpaidAmount)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <CheckCircle size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Đơn hàng chờ thanh toán</p>
            <p className="text-2xl font-bold">{stats.unpaidOrders || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <Calendar size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Đợt thanh toán đã tạo</p>
            <p className="text-2xl font-bold">{totalItems}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
        <div className="flex space-x-4">
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => fetchPaymentBatches()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>

      {/* Payment Batches Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
            <p>Không có đợt thanh toán nào</p>
            <button 
              onClick={handleOpenCreateModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tạo đợt thanh toán mới
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đợt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khoảng thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số cửa hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoa hồng (10%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thanh toán shop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.map((batch) => (
                  <tr key={batch._id || batch.batch_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{batch.batch_id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(batch.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(batch.start_date)} - {formatDate(batch.end_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {batch.total_shops}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(batch.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-red-600">
                        {formatCurrency(batch.total_amount * 0.1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(batch.total_amount * 0.9)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getBatchStatusClass(batch.status)}`}>
                        {getBatchStatusText(batch.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewBatchDetail(batch.batch_id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && batches.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className={`p-2 border border-gray-300 rounded-md mr-2 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
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
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

              <button
                className={`p-2 border border-gray-300 rounded-md ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
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

      {/* Create Payment Batch Modal */}
      {showCreateModal && (
        <CreatePaymentBatchModal onClose={handleCloseCreateModal} />
      )}
    </div>
  );
};

export default PaymentBatchList;