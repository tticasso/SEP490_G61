import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const ShopRevenueDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState({
    summary: {
      total_revenue: 0,
      total_commission: 0,
      total_earnings: 0,
      paid_amount: 0,
      unpaid_amount: 0,
      orders_count: 0
    },
    daily_breakdown: [],
    monthly_breakdown: [],
    order_details: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  });
  const [ordersList, setOrdersList] = useState([]);
  const [unpaidRevenue, setUnpaidRevenue] = useState({
    total_unpaid: 0,
    unpaid_records: []
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Helper function to translate status - same as in AllOrder.js
  const translateStatus = (statusId) => {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'processing': 'Đang xử lý',
      'shipped': 'Đang vận chuyển',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[statusId] || statusId;
  };

  // Helper function to determine status class for styling - same as in AllOrder.js
  const getStatusClass = (statusId) => {
    const statusClassMap = {
      'pending': 'bg-yellow-500',
      'processing': 'bg-blue-500',
      'shipped': 'bg-purple-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500'
    };
    return statusClassMap[statusId] || 'bg-gray-500';
  };

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser) {
        navigate('/login');
        return;
      }

      // Get shop information
      let shop = null;
      let shopId = null;

      try {
        shop = await ApiService.get('/shops/my-shop');
        shopId = shop._id || shop.id;
        
        if (!shopId) {
          throw new Error('Shop ID not found');
        }
      } catch (shopError) {
        console.error("Error fetching user's shop:", shopError);
        
        // Try to get shop ID from user
        const user = AuthService.getCurrentUser();
        if (user && (user.shop_id || user.shopId)) {
          shopId = user.shop_id || user.shopId;
        } else {
          setError("Could not retrieve shop information. Please try again later.");
          setLoading(false);
          return;
        }
      }

      console.log("Found shop ID:", shopId);

      // Determine API endpoint based on selected period
      let revenueEndpoint;
      if (useCustomDate) {
        const startFormatted = startDate.toISOString().split('T')[0];
        const endFormatted = endDate.toISOString().split('T')[0];
        revenueEndpoint = `/revenue/shop/${shopId}/stats?start_date=${startFormatted}&end_date=${endFormatted}&daily=true&monthly=true`;
      } else {
        revenueEndpoint = `/revenue/shop/${shopId}/stats?period=${selectedPeriod}&daily=true&monthly=true`;
      }
      
      // Get revenue statistics
      const revenueStats = await ApiService.get(revenueEndpoint);
      console.log("Revenue stats:", revenueStats);

      // Get unpaid revenue
      const unpaidRevenueData = await ApiService.get(`/revenue/shop/${shopId}/unpaid`);
      console.log("Unpaid revenue:", unpaidRevenueData);
      setUnpaidRevenue(unpaidRevenueData);

      // Get orders for this shop
      let orders = [];
      try {
        orders = await ApiService.get(`/order/shop/${shopId}`);
      } catch (ordersError) {
        console.error("Error fetching shop orders:", ordersError);
        try {
          // Try alternative endpoint
          orders = await ApiService.get(`/orders/my-orders`);
        } catch (altOrdersError) {
          console.error("Alternative endpoint failed too:", altOrdersError);
          orders = [];
        }
      }

  // Process orders to extract revenue information
      const processedOrders = Array.isArray(orders) ? orders.map(order => {
        // Handle different order structures
        const orderData = order.order || order;
        const orderDetails = order.orderDetails || [];
        
        // Use the same approach as in AllOrder.js to get the effective status
        const effectiveStatus = orderData.order_status || orderData.status_id;
        
        // Calculate total only if the order is delivered
        const orderTotal = effectiveStatus === 'delivered' ? 
          Number(orderData.total_price || orderData.totalPrice || orderData.total || 0) : 0;
        
        return {
          id: orderData.id || orderData._id,
          date: new Date(orderData.created_at || orderData.createdAt || orderData.date),
          total: Number(orderData.total_price || orderData.totalPrice || orderData.total || 0), // Keep original total for display
          revenueTotal: orderTotal, // For revenue calculations only count delivered orders
          status: effectiveStatus,
          statusText: translateStatus(effectiveStatus),
          statusClass: getStatusClass(effectiveStatus),
          commission: orderTotal * 0.1, // 10% commission
          shopEarning: orderTotal * 0.9, // 90% for shop
          isPaid: orderData.is_paid || false,
          products: orderDetails.length > 0 ? orderDetails.length : 1,
          countInRevenue: effectiveStatus === 'delivered'
        };
      }) : [];

      // Sort orders by date (newest first)
      processedOrders.sort((a, b) => b.date - a.date);
      setOrdersList(processedOrders);

      // Set data in state
      setRevenueData({
        summary: revenueStats.summary || {
          total_revenue: 0,
          total_commission: 0,
          total_earnings: 0,
          paid_amount: 0,
          unpaid_amount: 0,
          orders_count: 0
        },
        daily_breakdown: revenueStats.daily_breakdown || [],
        monthly_breakdown: revenueStats.monthly_breakdown || [],
        order_details: processedOrders
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setError(error.toString());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [navigate, selectedPeriod, useCustomDate]);

  // Handle period change
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setSelectedPeriod(newPeriod);
    setUseCustomDate(newPeriod === 'custom');
  };

  // Apply custom date range
  const handleApplyCustomDate = () => {
    fetchRevenueData();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  // Calculate revenue summary - only include delivered orders
  const calculateRevenueSummary = () => {
    const revenueOrders = ordersList.filter(order => order.status === 'delivered');
    
    return {
      totalRevenue: revenueOrders.reduce((sum, order) => sum + order.revenueTotal, 0),
      totalCommission: revenueOrders.reduce((sum, order) => sum + order.commission, 0),
      totalEarnings: revenueOrders.reduce((sum, order) => sum + order.shopEarning, 0),
      ordersCount: revenueOrders.length
    };
  };

  // Format date as dd/MM/yyyy
  const formatShortDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      return '';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Prepare data for revenue trend chart based on the ordersList
  const prepareChartData = () => {
    if (!ordersList || ordersList.length === 0) {
      return [];
    }

    // Filter only delivered orders for revenue calculations
    const revenueOrders = ordersList.filter(order => order.status === 'delivered');

    // If we're viewing by day or week, use daily data
    if (selectedPeriod === 'day' || selectedPeriod === 'week') {
      // Group orders by day
      const dailyData = {};
      
      revenueOrders.forEach(order => {
        const dateStr = formatShortDate(order.date);
        if (!dailyData[dateStr]) {
          dailyData[dateStr] = {
            date: dateStr,
            totalRevenue: 0,
            platformCommission: 0,
            shopEarnings: 0
          };
        }
        
        dailyData[dateStr].totalRevenue += order.revenueTotal;
        dailyData[dateStr].platformCommission += order.commission;
        dailyData[dateStr].shopEarnings += order.shopEarning;
      });

      // Convert to array and sort by date
      return Object.values(dailyData)
        .sort((a, b) => {
          const [aDay, aMonth, aYear] = a.date.split('/');
          const [bDay, bMonth, bYear] = b.date.split('/');
          return new Date(aYear, aMonth - 1, aDay) - new Date(bYear, bMonth - 1, bDay);
        })
        .map(item => ({
          name: item.date,
          'Tổng doanh thu': item.totalRevenue,
          'Hoa hồng nền tảng': item.platformCommission,
          'Thu nhập Shop': item.shopEarnings
        }));
    } else {
      // Group orders by month
      const monthlyData = {};
      
      revenueOrders.forEach(order => {
        const month = order.date.getMonth() + 1;
        const year = order.date.getFullYear();
        const monthKey = `${month}/${year}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            totalRevenue: 0,
            platformCommission: 0,
            shopEarnings: 0
          };
        }
        
        monthlyData[monthKey].totalRevenue += order.revenueTotal;
        monthlyData[monthKey].platformCommission += order.commission;
        monthlyData[monthKey].shopEarnings += order.shopEarning;
      });

      // Convert to array and sort by month
      return Object.values(monthlyData)
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split('/');
          const [bMonth, bYear] = b.month.split('/');
          return new Date(aYear, aMonth - 1, 1) - new Date(bYear, bMonth - 1, 1);
        })
        .map(item => ({
          name: item.month,
          'Tổng doanh thu': item.totalRevenue,
          'Hoa hồng nền tảng': item.platformCommission,
          'Thu nhập Shop': item.shopEarnings
        }));
    }
  };

  // No longer needed since we removed the pie chart
  
  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <Sidebar onNavigate={(path) => navigate(path)} />
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-xl text-gray-600">Đang tải dữ liệu...</div>
          </div>
        </div>
      </div>
    );
  }

  // If there was an error fetching data
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <Sidebar onNavigate={(path) => navigate(path)} />
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-xl text-red-600">Đã xảy ra lỗi: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 p-6">
          {/* Header with period selector */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">THỐNG KÊ DOANH THU HỆ THỐNG</h1>
            
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg shadow py-1 px-2">
                <select 
                  className="border-none focus:ring-0 text-sm" 
                  value={selectedPeriod}
                  onChange={handlePeriodChange}
                >
                  <option value="day">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="year">Năm nay</option>
                  <option value="all">Tất cả thời gian</option>
                  <option value="custom">Tùy chỉnh...</option>
                </select>
              </div>
              
              {useCustomDate && (
                <div className="flex items-center gap-2 bg-white rounded-lg shadow py-1 px-2">
                  <span className="text-sm text-gray-500">Từ</span>
                  <input 
                    type="date" 
                    className="text-sm border-none focus:ring-0" 
                    value={startDate.toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                  />
                  <span className="text-sm text-gray-500">đến</span>
                  <input 
                    type="date" 
                    className="text-sm border-none focus:ring-0" 
                    value={endDate.toISOString().split('T')[0]} 
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                  />
                  <button 
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                    onClick={handleApplyCustomDate}
                  >
                    Áp dụng
                  </button>
                </div>
              )}
              
              <button 
                className="bg-blue-500 text-white p-2 rounded-full"
                onClick={fetchRevenueData}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Xu hướng doanh thu</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={prepareChartData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Thời gian: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Tổng doanh thu" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line type="monotone" dataKey="Hoa hồng nền tảng" stroke="#00C49F" strokeWidth={2} />
                  <Line type="monotone" dataKey="Thu nhập Shop" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Chi tiết đơn hàng</h2>
              <span className="text-sm text-gray-500">
                Tổng: {ordersList.length} đơn hàng
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="w-full h-10 border-b border-gray-200 bg-gray-50">
                    <th className="text-left pl-4 pr-2">Mã đơn</th>
                    <th className="text-left px-2">Ngày</th>
                    <th className="text-right px-2">Tổng tiền</th>
                    <th className="text-right px-2">Hoa hồng</th>
                    <th className="text-right px-2">Thu nhập</th>
                    <th className="text-center px-4">Trạng thái</th>
                    {/* <th className="text-center px-2">Tính vào doanh thu</th> */}
                  </tr>
                </thead>
                <tbody>
                  {ordersList.slice(0, 10).map((order, index) => (
                    <tr key={order.id} className="border-b border-gray-200">
                      <td className="pl-4 pr-2 py-2 text-sm">{order.id.substring(0, 8)}...</td>
                      <td className="px-2 py-2 text-sm">{formatShortDate(order.date)}</td>
                      <td className="px-2 py-2 text-sm text-right">{formatCurrency(order.total)}</td>
                      <td className="px-2 py-2 text-sm text-right">{formatCurrency(order.commission)}</td>
                      <td className="px-2 py-2 text-sm text-right">{formatCurrency(order.shopEarning)}</td>
                      <td className="px-4 py-2 text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${order.statusClass}`}>
                          {order.statusText}
                        </span>
                      </td>
                      {/* <td className="px-2 py-2 text-sm text-center">
                        {order.countInRevenue ? 
                          <span className="text-green-500 font-medium">Có</span> : 
                          <span className="text-red-500 font-medium">Không</span>}
                      </td> */}
                    </tr>
                  ))}
                  {ordersList.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-gray-500">
                        Không có dữ liệu đơn hàng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {ordersList.length > 10 && (
              <div className="mt-4 text-right">
                <a href="#" className="text-blue-500 text-sm flex items-center justify-end" onClick={(e) => e.preventDefault()}>
                  Xem tất cả đơn hàng
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopRevenueDashboard;