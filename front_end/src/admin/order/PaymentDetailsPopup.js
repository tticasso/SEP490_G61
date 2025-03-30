import React from 'react';
import { X } from 'lucide-react';

const PaymentDetailsPopup = ({ paymentDetails, onClose, orderStatusId }) => {
  if (!paymentDetails) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Kiểm tra trạng thái thanh toán từ status_id của đơn hàng
  const isPaymentPaid = (statusId) => {
    return statusId === 'paid';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Chi tiết thanh toán</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="text-lg font-semibold text-blue-800 mb-2">Thông tin thanh toán</div>
            <p className="text-blue-600">{paymentDetails.description || 'Không có mô tả'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border p-3 rounded-md">
              <p className="text-sm text-gray-600">Mã giao dịch</p>
              <p className="font-medium">{paymentDetails.orderCode || paymentDetails.order_payment_id || '-'}</p>
            </div>
            <div className="border p-3 rounded-md">
              <p className="text-sm text-gray-600">Số tiền</p>
              <p className="font-medium text-green-600">{formatPrice(paymentDetails.amount)}</p>
            </div>
            <div className="border p-3 rounded-md">
              <p className="text-sm text-gray-600">Thời gian giao dịch</p>
              <p className="font-medium">{formatDate(paymentDetails.transactionTime)}</p>
            </div>
            <div className="border p-3 rounded-md">
              <p className="text-sm text-gray-600">Người thanh toán</p>
              <p className="font-medium">{paymentDetails.payerName || paymentDetails.accountName || '-'}</p>
            </div>
            {paymentDetails.accountNumber && (
              <div className="border p-3 rounded-md">
                <p className="text-sm text-gray-600">Số tài khoản</p>
                <p className="font-medium">{paymentDetails.accountNumber}</p>
              </div>
            )}
            
            <div className="border p-3 rounded-md">
              <p className="text-sm text-gray-600">Mã ngân hàng (BIN)</p>
              <p className="font-medium">{paymentDetails.bin || "MB Bank"}</p>
            </div>
     
            <div className="border p-3 rounded-md">
              <p className="text-sm text-gray-600">Loại tiền tệ</p>
              <p className="font-medium">{paymentDetails.currency || 'VND'}</p>
            </div>
            <div className="border p-3 rounded-md">
              <p className="text-sm text-gray-600">Mã tham chiếu</p>
              <p className="font-medium">{paymentDetails.paymentReference || '-'}</p>
            </div>
            <div className="border p-3 rounded-md">
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p className={`font-medium ${isPaymentPaid(orderStatusId) ? 'text-green-600' : 'text-yellow-600'}`}>
                {isPaymentPaid(orderStatusId) ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </p>
            </div>
            <div className="border p-3 rounded-md">
              <p className="text-sm text-gray-600">Payment Link ID</p>
              <p className="font-medium text-xs truncate">{paymentDetails.paymentLinkId || '-'}</p>
            </div>
          </div>

          {paymentDetails.qrCode && (
            <div className="mt-4 border p-3 rounded-md">
              <p className="text-sm text-gray-600 mb-2">Mã QR thanh toán</p>
              <div className="flex justify-center">
                <img src={paymentDetails.qrCode} alt="Mã QR thanh toán" className="max-w-full h-auto max-h-60" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPopup;