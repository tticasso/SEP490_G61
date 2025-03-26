import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight, ExternalLink } from 'lucide-react';
import RevenueService from './services/RevenueService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const RevenueDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // Use the new system overview endpoint
      const data = await RevenueService.getSystemRevenueOverview(period);
      setRevenueData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError('Không thể tải dữ liệu doanh thu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">THỐNG KÊ DOANH THU HỆ THỐNG</h1>
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <select 
              className="bg-white border border-gray-300 rounded-md px-3 py-2 mr-3"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
              <option value="last30">30 ngày qua</option>
            </select>
            <button 
              onClick={fetchRevenueData} 
              className="p-2 bg-white border border-gray-300 rounded-md"
            >
              <RefreshCw size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : revenueData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Tổng doanh thu</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {formatCurrency(revenueData.summary.total_revenue || 0)}
              </p>
              <div className="mt-2 text-sm">
                <span className="text-gray-500">Số đơn hàng: </span>
                <span className="font-medium">{revenueData.summary.orders_count || 0}</span>
              </div>
              <div className="mt-1 text-sm">
                <span className="text-gray-500">Giá trị đơn hàng trung bình: </span>
                <span className="font-medium">{formatCurrency(parseFloat(revenueData.summary.avg_order_value) || 0)}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Doanh thu nền tảng</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(revenueData.summary.total_commission || 0)}
              </p>
              <div className="mt-2 text-sm">
                <span className="text-gray-500">Tỷ lệ hoa hồng: </span>
                <span className="font-medium">{revenueData.summary.platform_revenue_percentage || '0%'}</span>
              </div>
              <div className="mt-1 text-sm">
                <span className="text-gray-500">Số tiền bán hàng: </span>
                <span className="font-medium">{formatCurrency(revenueData.summary.total_shop_earnings || 0)}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Thanh toán cho cửa hàng</h3>
              </div>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-blue-600 mr-2">
                  {formatCurrency(revenueData.summary.paid_to_shops || 0)}
                </p>
                <p className="text-sm text-gray-500">đã thanh toán</p>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-gray-500">Chưa thanh toán: </span>
                <span className="font-medium text-red-600">{formatCurrency(revenueData.summary.unpaid_to_shops || 0)}</span>
              </div>
              <div className="mt-2">
                <a href="/admin/revenue/shop-payments" className="text-blue-600 text-sm flex items-center">
                  Xem chi tiết thanh toán
                  <ArrowRight size={14} className="ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Xu hướng doanh thu</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData.revenue_trend}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year_month" />
                  <YAxis tickFormatter={(value) => value.toLocaleString('vi-VN')} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), '']}
                    labelFormatter={(value) => `Tháng ${value}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total_revenue" 
                    name="Tổng doanh thu" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_commission" 
                    name="Hoa hồng nền tảng" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two column layout for category revenue and top shops */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Revenue by Shop Category */}
            {revenueData.revenue_by_shop_category && revenueData.revenue_by_shop_category.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Doanh thu theo loại cửa hàng</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData.revenue_by_shop_category}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis tickFormatter={(value) => value.toLocaleString('vi-VN')} />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), '']}
                      />
                      <Legend />
                      <Bar dataKey="total_revenue" name="Doanh thu" fill="#8884d8" />
                      <Bar dataKey="total_commission" name="Hoa hồng" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Top Shops */}
            {revenueData.top_shops && revenueData.top_shops.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Cửa hàng hàng đầu</h2>
                  <a href="/admin/revenue/shop-payments" className="text-blue-600 text-sm flex items-center">
                    Xem tất cả
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cửa hàng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Đơn hàng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doanh thu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hoa hồng
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueData.top_shops.map((shop, index) => (
                        <tr key={shop.shop_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{shop.shop_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{shop.orders_count}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(shop.total_revenue)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(shop.total_commission)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-12">Không có dữ liệu doanh thu</div>
      )}
    </div>
  );
};

export default RevenueDashboard;