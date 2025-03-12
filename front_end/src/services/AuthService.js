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
                    // Store with timestamp to check expiration
                    const userData = {
                        ...data,
                        loginTime: new Date().getTime()
                    };
                    localStorage.setItem("user", JSON.stringify(userData));
                    console.log("User logged in and token stored:", userData);
                }
                return data;
            });
    }

    // Đăng xuất
    logout() {
        localStorage.removeItem("user");
        console.log("User logged out, token removed");
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
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return null;
            
            const user = JSON.parse(userStr);
            return user;
        } catch (error) {
            console.error("Error parsing user from localStorage:", error);
            // If there's an error parsing, clear the corrupt data
            localStorage.removeItem("user");
            return null;
        }
    }

    // Kiểm tra người dùng đã đăng nhập chưa và token còn hạn sử dụng
    isLoggedIn() {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // Check if token exists
        if (!user.accessToken) return false;
        
        // Optional: Check for token expiration based on login time
        // Assuming a token lasts for 24 hours (86400000 milliseconds)
        const TOKEN_EXPIRY = 86400000; // 24 hours
        const now = new Date().getTime();
        const loginTime = user.loginTime || 0;
        
        if (now - loginTime > TOKEN_EXPIRY) {
            console.log("Token expired, logging out");
            this.logout();
            return false;
        }
        
        return true;
    }

    // Lấy token
    getToken() {
        try {
            const user = this.getCurrentUser();
            if (!user) return null;
            
            // Ensure token is a string and not undefined/null
            const token = user.accessToken;
            if (!token) {
                console.error("Token not found in user object:", user);
                return null;
            }
            
            return token;
        } catch (error) {
            console.error("Error getting token:", error);
            return null;
        }
    }

    // Kiểm tra user có role cụ thể không
    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user || !user.roles) return false;
        return user.roles.includes(role);
    }

    // Xử lý response
    handleResponse(response) {
        return response.text().then((text) => {
            let data;
            try {
                data = text && JSON.parse(text);
            } catch (e) {
                console.error("Error parsing response:", e);
                return Promise.reject("Invalid JSON response");
            }
            
            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            return data;
        });
    }

    // Lưu thông tin người dùng vào localStorage
    setUser(user) {
        if (!user) {
            console.error("Attempted to set null/undefined user");
            return;
        }
        
        // Add timestamp for expiration checking
        const userData = {
            ...user,
            loginTime: new Date().getTime()
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("User data updated in localStorage");
    }
}

export default new AuthService();