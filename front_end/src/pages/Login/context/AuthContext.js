// src/pages/Login/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../../../services/AuthService';
import ShopService from '../../../services/ShopService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [shopStatus, setShopStatus] = useState(null);
    
    // Khởi tạo thông tin người dùng từ localStorage
    useEffect(() => {
        const initializeUser = async () => {
            try {
                setLoading(true);
                
                // Kiểm tra xem người dùng đã đăng nhập chưa
                const isAuthenticated = AuthService.isLoggedIn();
                setIsLoggedIn(isAuthenticated);
                
                if (isAuthenticated) {
                    const user = AuthService.getCurrentUser();
                    setCurrentUser(user);
                    setUserRoles(user.roles || []);
                    
                    // Kiểm tra trạng thái cửa hàng nếu là người bán
                    if (user.roles && (user.roles.includes('ROLE_SELLER') || user.roles.includes('SELLER'))) {
                        const shopStatusData = await ShopService.canAccessSellerDashboard();
                        setShopStatus(shopStatusData);
                    }
                }
            } catch (error) {
                console.error("Error initializing auth context:", error);
            } finally {
                setLoading(false);
            }
        };
        
        initializeUser();
        
        // Lắng nghe sự kiện storage để cập nhật khi có thay đổi đăng nhập
        const handleStorageChange = () => {
            initializeUser();
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    
    // Đăng nhập
    const login = async (email, password) => {
        try {
            const data = await AuthService.login(email, password);
            
            if (data.accessToken) {
                setIsLoggedIn(true);
                setCurrentUser(data);
                setUserRoles(data.roles || []);
                
                // Nếu là người bán, kiểm tra trạng thái cửa hàng
                if (data.roles && (data.roles.includes('ROLE_SELLER') || data.roles.includes('SELLER'))) {
                    const shopStatusData = await ShopService.canAccessSellerDashboard();
                    setShopStatus(shopStatusData);
                }
            }
            
            return data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };
    
    // Đăng nhập với Google
    const handleGoogleAuthLogin = (userData) => {
        try {
            if (userData && userData.accessToken) {
                AuthService.setUser(userData);
                setIsLoggedIn(true);
                setCurrentUser(userData);
                setUserRoles(userData.roles || []);
                
                // Kiểm tra trạng thái cửa hàng nếu là người bán
                if (userData.roles && (userData.roles.includes('ROLE_SELLER') || userData.roles.includes('SELLER'))) {
                    ShopService.canAccessSellerDashboard()
                        .then(shopStatusData => setShopStatus(shopStatusData));
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error("Google auth login error:", error);
            return false;
        }
    };
    
    // Đăng xuất
    const logout = () => {
        AuthService.logout();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUserRoles([]);
        setShopStatus(null);
    };
    
    // Làm mới thông tin người dùng từ API
    const refreshUserData = async () => {
        try {
            const updatedUser = await AuthService.refreshUserInfo();
            
            if (updatedUser) {
                setCurrentUser(updatedUser);
                setUserRoles(updatedUser.roles || []);
                
                // Kiểm tra lại trạng thái cửa hàng nếu là người bán
                if (updatedUser.roles && (updatedUser.roles.includes('ROLE_SELLER') || updatedUser.roles.includes('SELLER'))) {
                    const shopStatusData = await ShopService.canAccessSellerDashboard();
                    setShopStatus(shopStatusData);
                }
            }
            
            return updatedUser;
        } catch (error) {
            console.error("Error refreshing user data:", error);
            return null;
        }
    };
    
    // Kiểm tra xem người dùng có quyền seller và cửa hàng có hoạt động không
    const canAccessSellerDashboard = () => {
        if (!isLoggedIn || !shopStatus) return false;
        return shopStatus.canAccess === true;
    };
    
    // Lấy lý do không thể truy cập seller dashboard
    const getSellerDashboardAccessReason = () => {
        if (!shopStatus) return "unknown";
        return shopStatus.reason || "unknown";
    };
    
    // Giá trị context
    const value = {
        currentUser,
        userRoles,
        isLoggedIn,
        loading,
        login,
        logout,
        handleGoogleAuthLogin,
        refreshUserData,
        canAccessSellerDashboard,
        getSellerDashboardAccessReason,
        shopStatus
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;