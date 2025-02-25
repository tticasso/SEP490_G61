import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:9999/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone, email, password }),
      });

      if (response.ok) {
        // Xử lý đăng ký thành công (ví dụ: hiển thị thông báo, chuyển hướng)
        console.log("Đăng ký thành công");
        navigate("/login"); // Chuyển hướng đến trang đăng nhập
      } else {
        const errorData = await response.json();
        console.error("Lỗi đăng ký:", errorData.message);
        // Xử lý lỗi (ví dụ: hiển thị thông báo lỗi)
      }
    } catch (error) {
      console.error("Lỗi:", error);
      // Xử lý lỗi (ví dụ: hiển thị thông báo lỗi)
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1">
                <span className="font-medium">
                  Họ và tên <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                placeholder="Nhập số điện thoại"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1">
                <span className="font-medium">
                  Email <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="email"
                placeholder="Nhập email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Nhập mật khẩu"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
            >
              Đăng ký
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