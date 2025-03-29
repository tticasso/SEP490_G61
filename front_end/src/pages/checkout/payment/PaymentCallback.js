import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiService from '../../../services/ApiService';

const PaymentCallback = () => {
    const [status, setStatus] = useState('checking');
    const [message, setMessage] = useState('Đang kiểm tra thông tin thanh toán...');
    const [orderId, setOrderId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const processPaymentResult = async () => {
            try {
                // Lấy thông tin từ localStorage
                const savedOrderId = localStorage.getItem('currentOrderId');
                const transactionCode = localStorage.getItem('payosTransactionCode');
                
                if (!savedOrderId || !transactionCode) {
                    setStatus('error');
                    setMessage('Không tìm thấy thông tin đơn hàng');
                    return;
                }
                
                setOrderId(savedOrderId);
                
                // Kiểm tra trạng thái thanh toán
                const statusResponse = await ApiService.get(`/payos/check-status/${transactionCode}`);
                
                if (statusResponse && statusResponse.success && statusResponse.data) {
                    const paymentStatus = statusResponse.data.payment.status;
                    
                    if (paymentStatus === 'PAID') {
                        setStatus('success');
                        setMessage('Thanh toán thành công!');
                        
                        // Chuyển hướng sau 2 giây
                        setTimeout(() => {
                            // Xóa thông tin thanh toán
                            localStorage.removeItem('currentOrderId');
                            localStorage.removeItem('payosTransactionCode');
                            
                            // Chuyển đến trang xác nhận đơn hàng
                            navigate(`/order-confirmation?orderId=${savedOrderId}`);
                        }, 2000);
                    } else if (paymentStatus === 'PENDING') {
                        setStatus('pending');
                        setMessage('Đơn hàng đang chờ xử lý thanh toán. Vui lòng kiểm tra tài khoản ngân hàng của bạn.');
                        
                        // Chuyển hướng sau 3 giây
                        setTimeout(() => {
                            navigate(`/order-confirmation?orderId=${savedOrderId}`);
                        }, 3000);
                    } else {
                        setStatus('failed');
                        setMessage('Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.');
                    }
                } else {
                    setStatus('error');
                    setMessage('Không thể kiểm tra thông tin thanh toán. Vui lòng liên hệ bộ phận hỗ trợ.');
                }
            } catch (error) {
                console.error('Lỗi khi xử lý kết quả thanh toán:', error);
                setStatus('error');
                setMessage('Đã xảy ra lỗi khi xử lý kết quả thanh toán.');
            }
        };

        processPaymentResult();
    }, [navigate]);

    // Các style và hiển thị theo trạng thái
    const getStatusColor = () => {
        switch (status) {
            case 'success': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'failed': return 'text-red-600';
            case 'error': return 'text-red-600';
            default: return 'text-blue-600';
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'success': return '✓';
            case 'pending': return '⏳';
            case 'failed': return '✗';
            case 'error': return '⚠';
            default: return '🔄';
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 m-4 bg-white rounded-lg shadow-lg">
                <div className={`text-6xl text-center mb-4 ${getStatusColor()}`}>
                    {getIcon()}
                </div>
                <h1 className="text-2xl font-bold text-center mb-4">
                    Kết quả thanh toán
                </h1>
                <p className={`text-center mb-6 ${getStatusColor()}`}>
                    {message}
                </p>
                
                {status === 'failed' && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
                        >
                            Quay lại thanh toán
                        </button>
                        
                        {orderId && (
                            <button
                                onClick={() => navigate(`/order-confirmation?orderId=${orderId}`)}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                            >
                                Xem đơn hàng
                            </button>
                        )}
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                            Về trang chủ
                        </button>
                    </div>
                )}
                
                {(status === 'checking' || status === 'success' || status === 'pending') && (
                    <div className="flex justify-center mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;