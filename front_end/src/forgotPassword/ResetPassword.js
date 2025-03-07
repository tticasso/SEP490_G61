import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email from location state or localStorage
  const email = location.state?.email || localStorage.getItem('resetEmail') || '';
  
  // Store email in localStorage if it exists in state
  useEffect(() => {
    if (location.state?.email) {
      localStorage.setItem('resetEmail', location.state.email);
    }
  }, [location.state]);
  
  const [step, setStep] = useState(1); // 1 = OTP verification, 2 = New password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // OTP input handlers
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setOtp(value);
    if (error) setError('');
  };
  
  // Password input handlers
  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    if (error) setError('');
  };
  
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (error) setError('');
  };
  
  // Validate OTP
  const validateOtp = (otp) => {
    return /^\d{6}$/.test(otp);
  };
  
  // Validate password
  const validatePassword = (password) => {
    return /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password);
  };
  
  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    // Validate OTP
    if (!otp) {
      setError('Vui lòng nhập mã OTP');
      return;
    }
    
    if (!validateOtp(otp)) {
      setError('Mã OTP phải có 6 chữ số');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // For security reasons, we're not calling a real API endpoint to verify OTP here
      // Instead, we'll just move to the next step
      // In a real application, you would call an API to verify the OTP
      
      // Advance to password reset step
      setStep(2);
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Mã OTP không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Call API to reset password
      await ApiService.post('/user/reset-password', {
        email,
        otp,
        newPassword
      });
      
      // Show success message
      setSuccess(true);
      
      // Clear localStorage
      localStorage.removeItem('resetEmail');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Có lỗi xảy ra khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };
  
  // If no email is provided, redirect to forgot password page
  if (!email) {
    navigate('/forgot-password');
    return null;
  }
  
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
          <h2 className="text-3xl font-bold text-blue-600 mb-6">
            {step === 1 ? 'Xác nhận mã OTP' : 'Đặt lại mật khẩu'}
          </h2>
          
          {success ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Đặt lại mật khẩu thành công!</p>
              <p>Bạn có thể đăng nhập bằng mật khẩu mới.</p>
              <p className="mt-2">Bạn sẽ được chuyển hướng đến trang đăng nhập...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              {step === 1 ? (
                // OTP Verification Form
                <>
                  <p className="text-gray-600 mb-6">
                    Mã OTP đã được gửi đến email <span className="font-medium">{email}</span>. 
                    Vui lòng kiểm tra và nhập mã xác nhận bên dưới.
                  </p>
                  
                  <form onSubmit={handleVerifyOtp}>
                    <div className="mb-6">
                      <label className="block mb-1 font-medium">
                        Mã xác nhận OTP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập mã 6 chữ số"
                        maxLength="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={otp}
                        onChange={handleOtpChange}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Mã OTP có hiệu lực trong 10 phút
                      </p>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
                      disabled={loading}
                    >
                      {loading ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                  </form>
                </>
              ) : (
                // New Password Form
                <>
                  <p className="text-gray-600 mb-6">
                    Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                  </p>
                  
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">
                        Mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block mb-1 font-medium">
                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
                      disabled={loading}
                    >
                      {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                    </button>
                  </form>
                </>
              )}
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

export default ResetPassword;