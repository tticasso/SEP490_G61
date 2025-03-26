// src/admin/revenue/PaymentBatchDetail.js
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import RevenueService from './services/RevenueService';

const PaymentBatchDetail = () => {
  const { id } = useParams(); // batch_id from URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [batchData, setBatchData] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  const fetchBatchDetails = async () => {
    setLoading(true);
    try {
      const data = await RevenueService.getPaymentBatchDetails(id);
      setBatchData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching batch details:', err);
      setError('Không thể tải thông tin đợt thanh toán. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/revenue/payment-batches');
  };

  const handleProcessBatch = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError('Vui lòng nhập mã giao dịch');
      return;
    }
    
    setProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      await RevenueService.processPaymentBatch(id, transactionId);
      setSuccess('Đợt thanh toán đã được xử lý thành công');
      setShowProcessModal(false);
      
      // Refresh data after processing
      fetchBatchDetails();
    } catch (err) {
      console.error('Error processing batch:', err);
      setError('Không thể xử lý đợt thanh toán. ' + (err.message || 'Vui lòng thử lại sau.'));
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 flex items-center text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Quay lại</span>
        </button>
        <h1 className="text-2xl font-bold">CHI TIẾT ĐỢT THANH TOÁN</h1>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : !batchData ? (
        <div className="text-center py-10 text-gray-500">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <p>Không tìm thấy thông tin đợt thanh toán</p>
        </div>
      ) : (
        <>
          {/* Batch Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">Thông tin đợt thanh toán</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Mã đợt</p>
                    <p className="font-medium">{batchData.batch.batch_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Trạng thái</p>
                    <div className="mt-1">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getBatchStatusClass(batchData.batch.status)}`}>
                        {getBatchStatusText(batchData.batch.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Ngày tạo</p>
                    <p className="font-medium">{formatDate(batchData.batch.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Khoảng thời gian</p>
                    <p className="font-medium">
                      {formatDate(batchData.batch.start_date)} - {formatDate(batchData.batch.end_date)}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4">Tổng quan</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Tổng số tiền</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(batchData.batch.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Số cửa hàng</p>
                    <p className="text-2xl font-bold">{batchData.batch.total_shops}</p>
                  </div>
                </div>
                
                {batchData.batch.status === 'pending' && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowProcessModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <CheckCircle size={18} className="mr-2" />
                      Xử lý đợt thanh toán
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shops List */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Danh sách cửa hàng</h2>
              <button className="text-blue-600 flex items-center">
                <Download size={18} className="mr-1" />
                <span>Xuất Excel</span>
              </button>
            </div>

            {batchData.shop_payments && batchData.shop_payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cửa hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số đơn hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batchData.shop_payments.map((paymentData) => (
                      <tr key={paymentData.shop._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{paymentData.shop.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {paymentData.shop.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {paymentData.records.length}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(paymentData.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                Không có dữ liệu cửa hàng trong đợt thanh toán này
              </div>
            )}
          </div>
        </>
      )}

      {/* Process Payment Batch Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Xử lý đợt thanh toán</h2>
              <button onClick={() => setShowProcessModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleProcessBatch}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã giao dịch thanh toán <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Nhập mã giao dịch"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Mã giao dịch từ hệ thống thanh toán (ví dụ: ngân hàng, ví điện tử)
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                  disabled={processing}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={processing}
                >
                  {processing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentBatchDetail;