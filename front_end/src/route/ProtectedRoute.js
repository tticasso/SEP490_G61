// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const isLoggedIn = AuthService.isLoggedIn();
  
  // Kiểm tra người dùng đã đăng nhập chưa
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Nếu không yêu cầu role cụ thể hoặc chỉ yêu cầu đăng nhập
  if (requiredRoles.length === 0) {
    return children;
  }
  
  // Kiểm tra người dùng có role phù hợp không
  const hasRequiredRole = requiredRoles.some(role => 
    AuthService.hasRole(role)
  );
  
  if (!hasRequiredRole) {
    // Chuyển hướng đến trang chủ hoặc trang forbidden
    return <Navigate to="/" replace />;
  }
  
  // Nếu đã đăng nhập và có quyền phù hợp
  return children;
};

export default ProtectedRoute;