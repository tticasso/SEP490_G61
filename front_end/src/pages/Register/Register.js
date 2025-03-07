import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from '../../services/AuthService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra nếu người dùng đã đăng nhập thì chuyển hướng
  useEffect(() => {
    if (AuthService.isLoggedIn()) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await AuthService.register(
        formData.firstName,
        formData.lastName,
        formData.phone,
        formData.email,
        formData.password
      );

      // Đăng ký thành công
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      setError(error || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left side with title */}
      <div className="w-5/12 bg-blue-600 flex items-center p-16">
        <h1 className="text-white text-6xl font-bold leading-tight">
          The Real
          <br />
          Options On
          <br />
          Customers
        </h1>
      </div>

      {/* Right side with registration form */}
      <div className="w-7/12 flex items-center justify-center">
        <div className="w-full max-w-md px-8">
          <h2 className="text-3xl font-bold text-blue-600 mb-8">
            Đăng ký tài khoản
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1">
                <span className="font-medium">
                  Họ <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Nhập họ"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1">
                <span className="font-medium">
                  Tên <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Nhập tên"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1">
                <span className="font-medium">
                  Số điện thoại <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Nhập số điện thoại"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Định dạng: 0912345678 hoặc 84912345678</p>
            </div>

            <div>
              <label className="block mb-1">
                <span className="font-medium">
                  Email <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Nhập email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1">
                <span className="font-medium">
                  Mật khẩu <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="mt-1">
              <a href="/login" className="text-red-500 hover:underline text-sm">
                Bạn đã có tài khoản? Đăng nhập ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;