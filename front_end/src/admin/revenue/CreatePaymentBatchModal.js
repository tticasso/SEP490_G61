import React, { useState } from 'react';
import { X } from 'lucide-react';
import RevenueService from './services/RevenueService';

const CreatePaymentBatchModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
    }
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
          <p className="text-gray-700 mb-4">
            Tạo một đợt thanh toán mới sẽ gom tất cả các giao dịch chưa thanh toán trong 3 ngày qua thành một đợt.
          </p>
          
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
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              onClick={handleCreateBatch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Tạo đợt thanh toán'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePaymentBatchModal;