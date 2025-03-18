// src/components/ShopStatusCheck.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopService from '../services/ShopService';
import { useAuth } from '../pages/Login/context/AuthContext';

/**
 * Component kiểm tra trạng thái cửa hàng và hiển thị thông tin phù hợp
 * Có thể sử dụng ở component Shop Registration hoặc các trang liên quan đến cửa hàng
 */
const ShopStatusCheck = () => {
  const { isLoggedIn, userRoles } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shopData, setShopData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkShopStatus = async () => {
      if (!isLoggedIn) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const shopStatus = await ShopService.checkShopStatus();
        setShopData(shopStatus);
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái cửa hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    checkShopStatus();
  }, [isLoggedIn, navigate]);

  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Nếu chưa đăng ký cửa hàng
  if (!shopData || shopData.notFound) {
    return null; // Cho phép người dùng đăng ký cửa hàng mới
  }

  // Đã đăng ký cửa hàng, kiểm tra trạng thái
  const { isActive, status } = shopData;

  // Nếu cửa hàng bị khóa
  if (!isActive) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-lg font-semibold text-red-700">Cửa hàng đã bị khóa</h2>
        </div>
        <p className="mt-2 text-sm text-red-600">
          Cửa hàng của bạn đã bị khóa. Vui lòng liên hệ với admin để được hỗ trợ.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  // Nếu cửa hàng đang chờ duyệt
  if (status === "pending") {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-yellow-700">Cửa hàng đang chờ duyệt</h2>
        </div>
        <p className="mt-2 text-sm text-yellow-600">
          Đơn đăng ký cửa hàng của bạn đang chờ phê duyệt từ admin. Vui lòng kiểm tra email hoặc thử lại sau.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  // Nếu cửa hàng bị từ chối
  if (status === "rejected") {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-orange-700">Đăng ký đã bị từ chối</h2>
        </div>
        <p className="mt-2 text-sm text-orange-600">
          Đơn đăng ký cửa hàng của bạn đã bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  // Nếu cửa hàng đang hoạt động bình thường
  if (status === "active") {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-green-700">Cửa hàng đang hoạt động</h2>
        </div>
        <p className="mt-2 text-sm text-green-600">
          Cửa hàng của bạn đang hoạt động bình thường. Bạn có thể truy cập dashboard để quản lý.
        </p>
        <button 
          onClick={() => navigate('/seller-dashboard')}
          className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          Đến Dashboard
        </button>
      </div>
    );
  }

  return null;
};

export default ShopStatusCheck;