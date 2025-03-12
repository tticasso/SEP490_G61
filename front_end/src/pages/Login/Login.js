import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthService from "../../services/AuthService";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Kiểm tra nếu người dùng đã đăng nhập thì chuyển hướng
    useEffect(() => {
        if (AuthService.isLoggedIn()) {
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        const googleAuthData = searchParams.get('googleAuth');
        if (googleAuthData) {
            handleGoogleAuthRedirect(googleAuthData);
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await AuthService.login(formData.email, formData.password);
            navigate("/"); // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
        } catch (error) {
            setError(error || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Function to handle Google authentication redirect
    const handleGoogleRedirect = () => {
        window.location.href = "http://localhost:9999/api/auth/google";
    };

    const handleGoogleAuthRedirect = (userDataEncoded) => {
        try {
            // Giải mã dữ liệu người dùng
            const userData = JSON.parse(decodeURIComponent(userDataEncoded));
            console.log("Received user data from Google:", userData);

            // Lưu thông tin người dùng vào localStorage
            AuthService.setUser(userData);

            // Chuyển hướng về trang chủ
            navigate('/');
        } catch (error) {
            console.error("Error decoding user data:", error);
            setError("Lỗi xử lý đăng nhập Google");
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

            {/* Right side with login form */}
            <div className="w-7/12 flex items-center justify-center">
                <div className="w-full max-w-md px-8">
                    <h2 className="text-3xl font-bold text-blue-600 mb-8">Đăng nhập tài khoản</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block mb-1">
                                <span className="font-medium">Email <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="abcxyz@gmail.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1">
                                <span className="font-medium">Password <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="********"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Đăng nhập"}
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
                                type="button"
                                onClick={handleGoogleRedirect}
                                className="flex items-center justify-center px-6 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
                            >
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-5 w-5">
                                        <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                        <path fill="#34A853" d="M168.9 350.2L212.7 470 340.9 136.1 168.9 350.2z" />
                                        <path fill="#FBBC05" d="M168.9 350.2L212.7 470 340.9 136.1 168.9 350.2z" />
                                        <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <a href="/forgot-password" className="text-blue-600 hover:underline text-sm">
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