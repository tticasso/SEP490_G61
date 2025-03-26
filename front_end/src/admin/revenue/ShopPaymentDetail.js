// src/admin/revenue/ShopPaymentDetail.js
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Download, Calendar, DollarSign } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import RevenueService from './services/RevenueService';

const ShopPaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shopData, setShopData] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [unpaidRevenue, setUnpaidRevenue] = useState(null);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchShopData();
  }, [id, period]);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      // Fetch shop revenue statistics
      const stats = await RevenueService.getShopRevenueStats(id, period);
      setRevenueStats(stats);
      
      // Fetch unpaid revenue details
      const unpaid = await RevenueService.getShopUnpaidRevenue(id);
      setUnpaidRevenue(unpaid);
      setShopData(unpaid); // Shop info is included in this response
      
      setError(null);
    } catch (err) {
      console.error('Error fetching shop payment data:', err);
      setError('Không thể tải dữ liệu thanh toán cửa hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/revenue/shop-payments');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 flex items-center text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Quay lại</span>
        </button>
        <h1 className="text-2xl font-bold">CHI TIẾT THANH TOÁN CỬA HÀNG</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : shopData ? (
        <>
          {/* Shop Info Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4">{shopData.shop_name}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">ID Cửa hàng</p>
                    <p className="font-medium">{shopData.shop_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="font-medium">{shopData.shop_name}</p>
                  </div>
                </div>
              </div>
              <div>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="day">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="year">Năm nay</option>
                </select>
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          {revenueStats && (
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <DollarSign size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Tổng doanh thu</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueStats.summary.total_revenue || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Doanh thu cửa hàng</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueStats.summary.total_earnings || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <Calendar size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Số đơn hàng</p>
                    <p className="text-2xl font-bold">{revenueStats.summary.orders_count || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unpaid Revenue Records */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Doanh thu chưa thanh toán</h2>
              <div className="flex space-x-2">
                <span className="text-gray-500">Tổng cộng: {formatCurrency(unpaidRevenue.total_unpaid || 0)}</span>
                <button className="text-blue-600 flex items-center">
                  <Download size={18} className="mr-1" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>

            {unpaidRevenue.unpaid_records && unpaidRevenue.unpaid_records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã đơn hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày giao dịch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hoa hồng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doanh thu cửa hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unpaidRevenue.unpaid_records.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.order_id && typeof record.order_id === 'object' ? record.order_id.id : record.order_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(record.transaction_date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(record.total_amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(record.commission_amount)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(record.shop_earning)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Chưa thanh toán
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                Không có doanh thu chưa thanh toán
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-10 text-gray-500">
          Không tìm thấy thông tin cửa hàng
        </div>
      )}
    </div>
  );
};

export default ShopPaymentDetail;