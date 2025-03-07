// src/services/AuthService.js

const API_URL = "http://localhost:9999/api";

class AuthService {
  // Đăng nhập
  login(email, password) {
    return fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then(this.handleResponse)
      .then((data) => {
        if (data.accessToken) {
          localStorage.setItem("user", JSON.stringify(data));
        }
        return data;
      });
  }

  // Đăng xuất
  logout() {
    localStorage.removeItem("user");
  }

  // Đăng ký
  register(firstName, lastName, phone, email, password) {
    return fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        phone,
        email,
        password,
      }),
    }).then(this.handleResponse);
  }

  // Quên mật khẩu - gửi OTP
  forgotPassword(email) {
    return fetch(`${API_URL}/user/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }).then(this.handleResponse);
  }

  // Đặt lại mật khẩu với OTP
  resetPassword(email, otp, newPassword) {
    return fetch(`${API_URL}/user/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, newPassword }),
    }).then(this.handleResponse);
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  }

  // Kiểm tra người dùng đã đăng nhập chưa
  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  // Lấy token
  getToken() {
    const user = this.getCurrentUser();
    return user?.accessToken;
  }

  // Kiểm tra user có role cụ thể không
  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.roles.includes(role);
  }

  // Xử lý response
  handleResponse(response) {
    return response.text().then((text) => {
      const data = text && JSON.parse(text);
      if (!response.ok) {
        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
      }
      return data;
    });
  }
}

export default new AuthService();