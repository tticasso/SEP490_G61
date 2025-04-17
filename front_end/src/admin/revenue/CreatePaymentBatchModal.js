import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import RevenueService from './services/RevenueService';

const CreatePaymentBatchModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [unpaidStats, setUnpaidStats] = useState({
    unpaidAmount: 0,
    unpaidOrders: 0,
    shopCount: 0,
    lastBatchDate: null
  });
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    fetchUnpaidStats();
  }, []);

  const fetchUnpaidStats = async () => {
    try {
      // Giả định API để lấy thống kê về các đơn hàng chưa thanh toán
      const response = await RevenueService.getSystemRevenueOverview();
      
      setUnpaidStats({
        unpaidAmount: response?.summary?.unpaid_to_shops || 0,
        unpaidOrders: response?.summary?.unpaid_orders_count || 0,
        shopCount: response?.summary?.shop_count_with_unpaid_orders || 0,
        lastBatchDate: new Date(response?.last_batch_date || null)
      });
    } catch (err) {
      console.error('Error fetching unpaid stats:', err);
      setError('Không thể tải thông tin thanh toán chưa xử lý. Vui lòng thử lại sau.');
    }
  };

  const handleCreateBatch = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await RevenueService.createPaymentBatch();
      setSuccess(`Đã tạo đợt thanh toán mới với ID ${response.batch.batch_id}. Số bản ghi: ${response.records_count}`);
      
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error creating payment batch:', err);
      setError('Không thể tạo đợt thanh toán. ' + (err.message || 'Vui lòng thử lại sau.'));
    } finally {
      setLoading(false);
      setIsConfirming(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
      return 'Chưa có đợt nào';
    }
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Tạo đợt thanh toán mới</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          {!isConfirming ? (
            <>
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <p className="text-gray-700 mb-3">
                  Tạo một đợt thanh toán mới sẽ gom tất cả các giao dịch <strong>đã giao hàng thành công</strong> và chưa thanh toán thành một đợt.
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền chờ thanh toán:</span>
                    <span className="font-semibold">{formatCurrency(unpaidStats.unpaidAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số đơn hàng:</span>
                    <span className="font-semibold">{unpaidStats.unpaidOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số cửa hàng:</span>
                    <span className="font-semibold">{unpaidStats.shopCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đợt gần nhất:</span>
                    <span className="font-semibold">{formatDate(unpaidStats.lastBatchDate)}</span>
                  </div>
                </div>

                <div className="mt-3 text-sm text-blue-600">
                  <div className="flex items-start">
                    <AlertCircle size={16} className="mr-1 mt-0.5" />
                    <div>
                      Lưu ý: Chỉ các đơn hàng đã giao thành công (trạng thái "delivered") mới được tính vào đợt thanh toán.
                    </div>
                  </div>
                </div>
              </div>
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
                  <Check size={18} className="mr-2" />
                  {success}
                </div>
              )}
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                  <AlertCircle size={18} className="mr-2" />
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (unpaidStats.unpaidOrders > 0) {
                      setIsConfirming(true);
                    } else {
                      setError('Không có đơn hàng chờ thanh toán để tạo đợt mới.');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loading || unpaidStats.unpaidOrders === 0}
                >
                  {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="font-medium text-yellow-800 mb-2">Xác nhận tạo đợt thanh toán</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  Bạn sắp tạo một đợt thanh toán cho:
                </p>
                <ul className="text-sm list-disc pl-5 text-yellow-700 mb-2">
                  <li><strong>{unpaidStats.unpaidOrders}</strong> đơn hàng đã giao thành công</li>
                  <li><strong>{formatCurrency(unpaidStats.unpaidAmount)}</strong> sẽ được thanh toán cho <strong>{unpaidStats.shopCount}</strong> cửa hàng</li>
                </ul>
                <p className="text-sm text-yellow-700">
                  Hoa hồng 10% ({formatCurrency(unpaidStats.unpaidAmount * 0.1)}) sẽ được giữ lại. Thực thanh toán: {formatCurrency(unpaidStats.unpaidAmount * 0.9)}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                  disabled={loading}
                >
                  Quay lại
                </button>
                <button
                  onClick={handleCreateBatch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận tạo đợt thanh toán'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePaymentBatchModal;