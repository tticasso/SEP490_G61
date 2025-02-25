import React from 'react';

const LoginPage = () => {
  // Function to handle Google authentication redirect
  const handleGoogleRedirect = () => {
    window.location.href = 'http://localhost:9999/auth/google';
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
      
      {/* Right side with login form */}
      <div className="w-7/12 flex items-center justify-center">
        <div className="w-full max-w-md px-8">
          <h2 className="text-3xl font-bold text-blue-600 mb-8">Đăng nhập tài khoản</h2>
          
          <form className="space-y-6">
            <div>
              <label className="block mb-1">
                <span className="font-medium">Email <span className="text-red-500">*</span></span>
              </label>
              <input 
                type="email" 
                placeholder="abcxyz@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block mb-1">
                <span className="font-medium">Password <span className="text-red-500">*</span></span>
              </label>
              <input 
                type="password" 
                placeholder="********"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              type="button"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
            >
              Đăng nhập
            </button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button 
                onClick={handleGoogleRedirect}
                className="flex items-center justify-center px-6 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-5 w-5">
                    <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                    <path fill="#34A853" d="M168.9 350.2L212.7 470 340.9 136.1 168.9 350.2z"/>
                    <path fill="#FBBC05" d="M168.9 350.2L212.7 470 340.9 136.1 168.9 350.2z"/>
                    <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <a href="#" className="text-blue-600 hover:underline text-sm">
              Bạn quên mật khẩu? Click vào đây
            </a>
            <div className="mt-1">
              <a href="/register" className="text-red-500 hover:underline text-sm">
                Đăng kí tài khoản
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;