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

                    // If roles is missing or empty, set a default MEMBER role
                    if (!data.roles || data.roles.length === 0) {
                        data.roles = ["MEMBER"];
                    }

                    // Ensure each role is properly formatted
                    const formattedRoles = data.roles.map(role => {
                        // If the role is an object with a name property
                        if (typeof role === 'object' && role.name) {
                            return `ROLE_${role.name}`;
                        }
                        // If the role is already a string that starts with ROLE_
                        else if (typeof role === 'string' && role.startsWith('ROLE_')) {
                            return role;
                        }
                        // If the role is just a string (like "MEMBER")
                        else if (typeof role === 'string') {
                            return `${role}`;
                        }
                        // Default
                        return "MEMBER";
                    });

                    // Store with timestamp and formatted roles
                    const userData = {
                        ...data,
                        roles: formattedRoles,
                        loginTime: new Date().getTime()
                    };

                    localStorage.setItem("user", JSON.stringify(userData));

                    // Dispatch a storage event to notify other components
                    window.dispatchEvent(new Event('storage'));
                }
                return data;
            });
    }

    // Đăng xuất
    logout() {
        localStorage.removeItem("user");

        // Dispatch a storage event to notify other components
        window.dispatchEvent(new Event('storage'));
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
            if (!userStr) {
                return null;
            }

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

        if (!user) {
            return false;
        }

        // Check if token exists - handle both accessToken and token fields
        const token = user.accessToken || user.token;
        if (!token) {
            return false;
        }

        // Optional: Check for token expiration based on login time
        // Assuming a token lasts for 24 hours (86400000 milliseconds)
        const TOKEN_EXPIRY = 86400000; // 24 hours
        const now = new Date().getTime();
        const loginTime = user.loginTime || 0;

        if (now - loginTime > TOKEN_EXPIRY) {
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
            const token = user.accessToken || user.token;
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


        // Process roles
        let roles = [];
        if (user.roles && Array.isArray(user.roles)) {
            roles = user.roles.map(role => {
                // If role is already a string that starts with ROLE_
                if (typeof role === 'string' && role.startsWith('ROLE_')) {
                    // Check for undefined
                    if (role === 'ROLE_undefined') {
                        return 'MEMBER';
                    }
                    return role;
                }
                // If role is an object with a name property
                else if (typeof role === 'object' && role.name) {
                    return `ROLE_${role.name}`;
                }
                // If role is just a string
                else if (typeof role === 'string') {
                    return `ROLE_${role}`;
                }
                // Default
                return "MEMBER";
            });
        } else {
            // Default role if none provided
            roles = ["MEMBER"];
        }

        // Ensure all critical fields exist
        const userData = {
            ...user,
            // Ensure consistent field naming
            id: user.id || (user._id ? user._id.toString() : null),
            email: user.email,
            accessToken: user.accessToken || user.token,
            roles: roles,
            loginTime: new Date().getTime()
        };


        localStorage.setItem("user", JSON.stringify(userData));

        // Dispatch a storage event to notify other components
        window.dispatchEvent(new Event('storage'));
    }
}

export default new AuthService();