// src/services/ShopService.js
import ApiService from '../../../services/ApiService';

class ShopService {
  // Get all shops (admin only)
  getAllShops() {
    return ApiService.get('/shops/list');
  }

  // Get shop by ID (admin only)
  getShopById(id) {
    return ApiService.get(`/shops/find/${id}`);
  }

  // Update shop status (approve shop)
  updateShopStatus(id, status) {
    return ApiService.put(`/shops/edit/${id}`, { status });
  }

  // Toggle shop account active status (lock/unlock)
  toggleShopActiveStatus(id, isActive) {
    // If we're unlocking a shop (changing is_active from 0 to 1)
    // Use the special unlock endpoint instead of the standard edit
    if (isActive === 1) {
      return ApiService.put(`/shops/unlock/${id}`, { is_active: isActive });
    } else {
      // For locking a shop, use the regular edit endpoint
      return ApiService.put(`/shops/edit/${id}`, { is_active: isActive });
    }
  }

  // Delete shop (admin only)
  deleteShop(id) {
    return ApiService.delete(`/shops/delete/${id}`);
  }

  // Get shop statistics (admin or seller)
  getShopStatistics() {
    return ApiService.get('/shops/statistics');
  }

  // Get province information
  getProvinceById(provinceId) {
    return fetch(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`)
      .then(response => response.json())
      .catch(error => {
        console.error('Error fetching province:', error);
        return null;
      });
  }

  // Get district information
  getDistrictById(districtId) {
    return fetch(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`)
      .then(response => response.json())
      .catch(error => {
        console.error('Error fetching district:', error);
        return null;
      });
  }

  // Get all provinces
  getAllProvinces() {
    return fetch(`https://esgoo.net/api-tinhthanh/1/0.htm`)
      .then(response => response.json())
      .catch(error => {
        console.error('Error fetching provinces:', error);
        return [];
      });
  }

  // Get user information
  getUserById(userId) {
    return ApiService.get(`/user/${userId}`);
  }
}

export default new ShopService();