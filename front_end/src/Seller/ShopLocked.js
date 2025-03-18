// src/components/ShopLocked.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ShopLocked = ({ status = "locked", countdownSeconds = 5 }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(countdownSeconds);
  
  useEffect(() => {
    // Redirect after countdown
    const timer = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);
  
  // Thông báo dựa trên trạng thái cửa hàng
  const getStatusMessage = () => {
    switch(status) {
      case "pending":
        return "Cửa hàng của bạn đang chờ được duyệt từ Admin. Vui lòng kiểm tra email hoặc thử lại sau.";
      case "rejected":
        return "Đăng ký cửa hàng của bạn đã bị từ chối. Vui lòng liên hệ Admin để biết thêm chi tiết.";
      case "inactive":
      case "locked":
      default:
        return "Cửa hàng của bạn đã bị khóa. Vui lòng liên hệ Admin để được hỗ trợ.";
    }
  };
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m1-4a3 3 0 100-6 3 3 0 000 6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21H7a2 2 0 01-2-2V8a2 2 0 012-2h10a2 2 0 012 2v11a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Trạng thái cửa hàng
        </h2>
        
        <p className="text-gray-600 mb-6">
          {getStatusMessage()}
        </p>
        
        <div className="text-sm text-gray-500">
          Tự động chuyển hướng sau <span className="font-bold">{countdown}</span> giây...
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopLocked;