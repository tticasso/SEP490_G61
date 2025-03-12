// src/services/ApiService.js

import AuthService from './AuthService';

const API_URL = "http://localhost:9999/api";

class ApiService {
  // Phương thức GET
  async get(endpoint, secure = true) {
    const headers = this.getHeaders(secure);
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Phương thức POST
  async post(endpoint, data, secure = true) {
    const headers = this.getHeaders(secure);
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Phương thức PUT
  async put(endpoint, data, secure = true) {
    const headers = this.getHeaders(secure);
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Phương thức DELETE
  async delete(endpoint, secure = true) {
    const headers = this.getHeaders(secure);
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Lấy headers, bao gồm token nếu là API bảo mật
  getHeaders(secure) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (secure) {
      const token = AuthService.getToken();
      if (token) {
        headers['x-access-token'] = token;
      }
    }

    return headers;
  }

  // Phương thức PATCH
async patch(endpoint, data, secure = true) {
  const headers = this.getHeaders(secure);
  try {
      const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(data)
      });
      return this.handleResponse(response);
  } catch (error) {
      return this.handleError(error);
  }
}

  // Xử lý response
  async handleResponse(response) {
    const text = await response.text();
    const data = text && JSON.parse(text);
    
    if (!response.ok) {
      // Nếu lỗi 401 Unauthorized, đăng xuất người dùng
      if (response.status === 401) {
        AuthService.logout();
        window.location.href = '/login';
      }
      
      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }
    
    return data;
  }

  // Xử lý lỗi mạng
  handleError(error) {
    console.error('API call error:', error);
    return Promise.reject(error.message || 'Lỗi kết nối đến server');
  }
}

export default new ApiService();