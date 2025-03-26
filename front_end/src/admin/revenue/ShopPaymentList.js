import React, { useState, useEffect } from 'react';
import { Eye, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RevenueService from './services/RevenueService';

const ShopPaymentList = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('total_amount');
  const [sortOrder, setSortOrder] = useState('desc');
  const [paymentStatus, setPaymentStatus] = useState('all');

  useEffect(() => {
    fetchShopPayments();
  }, [page, limit, sortBy, sortOrder, paymentStatus]);

  const fetchShopPayments = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
        payment_status: paymentStatus
      };
      
      if (searchTerm) params.shop_name = searchTerm;
      if (minAmount) params.min_amount = minAmount;
      if (maxAmount) params.max_amount = maxAmount;
      
      const response = await RevenueService.getShopPaymentSummary(params);
      
      setShops(response.shops || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems || 0);
      setTotalAmount(response.totalAmountSum || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching shop payments:', err);
      setError('Không thể tải danh sách thanh toán cửa hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1); // Reset page when searching
    fetchShopPayments();
  };

  const handleViewShopPayment = (shopId) => {
    navigate(`/admin/revenue/shop-payment/${shopId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">THANH TOÁN CHO CỬA HÀNG</h1>
        <button 
          onClick={fetchShopPayments}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <RefreshCw size={18} className="mr-2" />
          Làm mới
        </button>
      </div>

      {/* Summary card */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Tổng quan</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500 text-sm">Tổng số tiền cần thanh toán</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Tổng số cửa hàng</p>
            <p className="text-2xl font-bold">{totalItems}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Tìm theo tên cửa hàng"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền từ</label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Từ"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền đến</label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Đến"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="total_amount">Số tiền</option>
              <option value="shop_name">Tên cửa hàng</option>
              <option value="last_transaction_date">Ngày giao dịch gần nhất</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
        </div>
        <button 
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Áp dụng
        </button>
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Không có dữ liệu thanh toán cửa hàng
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cửa hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền cần thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giao dịch gần nhất
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shops.map((shop) => (
                  <tr key={shop.shop_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{shop.shop_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{shop.shop_email}</div>
                      <div className="text-sm text-gray-500">{shop.shop_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {shop.orders_count}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(shop.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(shop.last_transaction_date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewShopPayment(shop.shop_id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && shops.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className={`p-2 border border-gray-300 rounded-md mr-2 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNumber = page <= 3 ? i + 1 : page - 3 + i + 1;
                if (pageNumber <= totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        page === pageNumber ? 'bg-pink-500 text-white' : 'border border-gray-300 text-gray-700'
                      }`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}

              <button
                className={`p-2 border border-gray-300 rounded-md ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center text-sm text-gray-700">
              <span>Hiển thị</span>
              <select
                className="mx-2 border border-gray-300 rounded p-1"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span>trên {totalItems}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPaymentList;