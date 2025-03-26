// src/services/RevenueService.js
import ApiService from '../../../services/ApiService';

class RevenueService {
  // Platform revenue statistics
  getSystemRevenueOverview(period = 'all') {
    return ApiService.get(`/revenue/system/overview?period=${period}`);
  }
  
  // Keep the getPlatformRevenue method for backward compatibility
  getPlatformRevenue(period = 'month') {
    return ApiService.get(`/revenue/platform/stats?period=${period}`);
  }
  
  // Shop payment summary with filters
  getShopPaymentSummary(params = {}) {
    return ApiService.get('/revenue/shops/payment-summary', { params });
  }
  
  // Get shop revenue statistics
  getShopRevenueStats(shopId, period = 'month') {
    return ApiService.get(`/revenue/shop/${shopId}/stats?period=${period}`);
  }
  
  // Get shop unpaid revenue
  getShopUnpaidRevenue(shopId) {
    return ApiService.get(`/revenue/shop/${shopId}/unpaid`);
  }
  
  // Payment batch operations
  getAllPaymentBatches(page = 1, limit = 10, status) {
    let url = `/revenue/batches?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return ApiService.get(url);
  }
  
  getPaymentBatchDetails(batchId) {
    return ApiService.get(`/revenue/batch/${batchId}`);
  }
  
  createPaymentBatch() {
    return ApiService.post('/revenue/batch/create');
  }
  
  processPaymentBatch(batchId, transactionId) {
    return ApiService.post(`/revenue/batch/${batchId}/process`, {
      transaction_id: transactionId
    });
  }
}

export default new RevenueService();