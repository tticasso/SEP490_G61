import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setError('Vui lòng nhập email của bạn');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call API to send OTP to email
      await ApiService.post('/user/forgot-password', { email });
      
      // Show success message
      setSuccess(true);
      
      // Redirect to reset password page after 3 seconds
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 3000);
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left side with title */}
      <div className="w-5/12 bg-blue-600 flex items-center p-16">
        <h1 className="text-white text-6xl font-bold leading-tight">
          The Real<br />
          Options On<br />
          Customers
        </h1>
      </div>
      
      {/* Right side with form */}
      <div className="w-7/12 flex items-center justify-center">
        <div className="w-full max-w-md px-8">
          <h2 className="text-3xl font-bold text-blue-600 mb-6">Quên mật khẩu</h2>
          
          {success ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Đã gửi OTP thành công!</p>
              <p>Vui lòng kiểm tra email của bạn để lấy mã OTP.</p>
              <p className="mt-2">Bạn sẽ được chuyển hướng đến trang đặt lại mật khẩu...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Vui lòng nhập địa chỉ email bạn đã sử dụng để đăng ký tài khoản. 
                Chúng tôi sẽ gửi mã OTP để xác nhận việc đặt lại mật khẩu của bạn.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block mb-1 font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Gửi mã xác nhận"}
                </button>
              </form>
            </>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 hover:underline">
              Quay lại trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;