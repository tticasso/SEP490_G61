import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

// Hàm tính tổng giá trị đơn hàng
const calculateTotalOrderValue = (orders) => {
  let total = 0;
  if (!Array.isArray(orders) || orders.length === 0) return total;

  for (const orderItem of orders) {
    try {
      let orderValue = 0;
      
      // Xử lý trường hợp order có cấu trúc khác nhau
      if (orderItem.order) {
        // Trường hợp đơn hàng có định dạng {order: {...}, orderDetails: [...]}
        if (typeof orderItem.order.total_price === 'number') {
          orderValue = orderItem.order.total_price;
        } else if (typeof orderItem.order.total_price === 'string') {
          orderValue = parseFloat(orderItem.order.total_price);
        }
      } else if (orderItem.total_price) {
        // Trường hợp đơn hàng trực tiếp
        if (typeof orderItem.total_price === 'number') {
          orderValue = orderItem.total_price;
        } else if (typeof orderItem.total_price === 'string') {
          orderValue = parseFloat(orderItem.total_price);
        }
      } else if (orderItem.total) {
        // Trường hợp đơn hàng đã chuyển đổi
        if (typeof orderItem.total === 'number') {
          orderValue = orderItem.total;
        } else if (typeof orderItem.total === 'string') {
          orderValue = parseFloat(orderItem.total);
        }
      } else {
        // Xử lý trường hợp khi orderDetails có sẵn
        if (orderItem.orderDetails && Array.isArray(orderItem.orderDetails)) {
          for (const detail of orderItem.orderDetails) {
            const price = Number(detail.price || 0);
            const quantity = Number(detail.quantity || 1);
            orderValue += price * quantity;
          }
        } else {
          // Kiểm tra xem có giá trị nào khác không
          const possibleKeys = ['price', 'amount', 'value'];
          for (const key of possibleKeys) {
            if (orderItem[key]) {
              if (typeof orderItem[key] === 'number') {
                orderValue = orderItem[key];
              } else if (typeof orderItem[key] === 'string') {
                orderValue = parseFloat(orderItem[key]);
              }
              break;
            }
          }
        }
      }
      
      // Đảm bảo orderValue là một số
      if (isNaN(orderValue)) {
        orderValue = 0;
      }
      
      total += orderValue;
    } catch (error) {
      console.error("Lỗi khi tính tổng giá trị đơn hàng:", error, orderItem);
    }
  }
  
  return total;
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    newFollowers: 0,
    dailyRevenue: 0,
    orderRevenue: 0,
    pendingOrders: 0,
    successfulOrders: 0,
    followers: [],
    newOrders: [],
    periodLabel: 'hôm nay'
  });
  const [currentDate] = useState(new Date());
  
  // Thêm state để lưu trữ khoảng thời gian được chọn
  const [selectedPeriod, setSelectedPeriod] = useState('day'); // Mặc định là ngày hôm nay
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  });

  // Hàm để lọc đơn hàng theo khoảng thời gian đã chọn
  const filterOrdersByPeriod = (orders, period, customStartDate, customEndDate) => {
    if (!Array.isArray(orders) || period === 'all') return orders;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(orderItem => {
      try {
        let orderDate = new Date(
          orderItem.order?.created_at || 
          orderItem.created_at || 
          orderItem.date || 
          orderItem.transaction_date ||
          new Date()
        );
        
        // Đảm bảo orderDate là đối tượng Date hợp lệ
        if (!(orderDate instanceof Date) || isNaN(orderDate)) {
          return false;
        }
        
        orderDate.setHours(0, 0, 0, 0);
        
        if (period === 'custom') {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          
          return orderDate >= start && orderDate <= end;
        } else if (period === 'day') {
          return orderDate.getTime() === today.getTime();
        } else if (period === 'week') {
          const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - dayOfWeek);
          startOfWeek.setHours(0, 0, 0, 0);
          return orderDate >= startOfWeek;
        } else if (period === 'month') {
          return orderDate.getMonth() === today.getMonth() && 
                 orderDate.getFullYear() === today.getFullYear();
        }
        
        return true;
      } catch (error) {
        console.error("Lỗi khi lọc đơn hàng theo thời gian:", error);
        return false;
      }
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser) {
        navigate('/login');
        return;
      }

      // Lấy thông tin shop từ endpoint chính xác
      let shop = null;
      let shopId = null;

      try {
        shop = await ApiService.get('/shops/my-shop');
        shopId = shop._id || shop.id;
        
        if (!shopId) {
          throw new Error('Không tìm thấy ID của shop');
        }
      } catch (shopError) {
        console.error("Error fetching user's shop:", shopError);
        
        // Thử lấy shop ID từ user
        const user = AuthService.getCurrentUser();
        if (user && (user.shop_id || user.shopId)) {
          shopId = user.shop_id || user.shopId;
        } else {
          setError("Không thể lấy thông tin cửa hàng. Vui lòng thử lại sau.");
          setLoading(false);
          return;
        }
      }

      console.log("Found shop ID:", shopId);

      // Xác định endpoint API dựa trên khoảng thời gian đã chọn
      let revenueEndpoint;
      if (selectedPeriod === 'custom') {
        const startFormatted = startDate.toISOString().split('T')[0];
        const endFormatted = endDate.toISOString().split('T')[0];
        revenueEndpoint = `/revenue/shop/${shopId}/stats?start_date=${startFormatted}&end_date=${endFormatted}`;
      } else if (selectedPeriod === 'all') {
        revenueEndpoint = `/revenue/shop/${shopId}/stats`;
      } else {
        revenueEndpoint = `/revenue/shop/${shopId}/stats?period=${selectedPeriod}`;
      }
      
      // Gọi API lấy thống kê doanh thu
      let revenueStats = { summary: { total_revenue: 0, total_earnings: 0, orders_count: 0 } };
      let revenueApiSuccess = false;
      
      try {
        console.log("Calling revenue API:", revenueEndpoint);
        revenueStats = await ApiService.get(revenueEndpoint);
        console.log(`Revenue API response for ${selectedPeriod}:`, revenueStats);
        
        if (revenueStats && revenueStats.summary) {
          revenueApiSuccess = true;
        }
      } catch (revenueError) {
        console.error("Error fetching shop revenue stats:", revenueError);
        revenueApiSuccess = false;
      }

      // Fetch tất cả đơn hàng của shop
      let allOrders = [];
      try {
        allOrders = await ApiService.get(`/order/shop/${shopId}`);
        console.log("All orders fetched:", allOrders);
      } catch (ordersError) {
        console.error("Error fetching shop orders:", ordersError);
        // Thử endpoint thay thế
        try {
          allOrders = await ApiService.get(`/orders/my-orders`);
          console.log("Alternative endpoint orders:", allOrders);
        } catch (altOrdersError) {
          console.error("Alternative endpoint failed too:", altOrdersError);
          allOrders = [];
        }
      }
      
      // Lọc đơn hàng theo khoảng thời gian đã chọn
      const filteredOrders = filterOrdersByPeriod(allOrders, selectedPeriod, startDate, endDate);
      console.log(`Filtered orders for ${selectedPeriod}:`, filteredOrders.length);
      
      // Xử lý đơn hàng
      let pendingOrders = [];
      let successfulOrders = [];
      let processedOrders = [];
      
      if (filteredOrders && Array.isArray(filteredOrders)) {
        // Xử lý trường hợp đơn hàng trả về là mảng các object có order và orderDetails
        if (filteredOrders.length > 0 && filteredOrders[0].order) {
          pendingOrders = filteredOrders.filter(item => {
            const status = item.order.order_status || item.order.status_id;
            return status === 'pending';
          });
          
          successfulOrders = filteredOrders.filter(item => {
            const status = item.order.order_status || item.order.status_id;
            return status === 'delivered';
          });
          
          // Chuyển đổi dữ liệu để phù hợp với giao diện hiển thị
          processedOrders = filteredOrders.map(item => ({
            id: item.order.id || item.order._id,
            date: new Date(item.order.created_at),
            total: Number(item.order.total_price || 0),
            status: item.order.order_status || item.order.status_id,
            raw: item // Giữ lại dữ liệu gốc để debugging
          }));
          
          pendingOrders = processedOrders.filter(order => order.status === 'pending');
        } else {
          // Trường hợp filteredOrders là mảng đơn giản của các đơn hàng
          pendingOrders = filteredOrders.filter(order => order.status_id === 'pending' || order.order_status === 'pending');
          successfulOrders = filteredOrders.filter(order => order.status_id === 'delivered' || order.order_status === 'delivered');
          
          processedOrders = filteredOrders.map(order => ({
            id: order.id || order._id,
            date: new Date(order.created_at),
            total: Number(order.total_price || 0),
            status: order.status_id || order.order_status,
            raw: order // Giữ lại dữ liệu gốc để debugging
          }));
        }
      }

      // Fetch followers
      let followers = [];
      try {
        followers = await ApiService.get(`/shop-follow/followers/${shopId}`);
      } catch (followersError) {
        console.error("Error fetching followers:", followersError);
        try {
          // Thử endpoint thay thế
          followers = await ApiService.get(`/followers/${shopId}`);
        } catch (altFollowersError) {
          console.error("Error fetching followers with alternate endpoint:", altFollowersError);
          followers = [];
        }
      }

      // Đếm người theo dõi mới
      let todayFollowers = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Array.isArray(followers)) {
        // Nếu không có thông tin ngày trong dữ liệu followers
        if (followers.length > 0 && !followers[0].created_at && !followers[0].createdAt && !followers[0].date) {
          todayFollowers = followers.length;
        } else {
          // Trường hợp có thông tin ngày, kiểm tra từng follower
          for (const follower of followers) {
            try {
              const dateField = follower.created_at || follower.createdAt || follower.date;
              
              if (dateField) {
                const followerDate = new Date(dateField);
                
                if (!isNaN(followerDate.getTime())) {
                  followerDate.setHours(0, 0, 0, 0);
                  const diffTime = Math.abs(today - followerDate);
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  
                  if (diffDays === 0) {
                    todayFollowers++;
                  }
                }
              } else {
                todayFollowers++;
              }
            } catch (error) {
              console.error("Lỗi khi xử lý ngày follower:", error);
            }
          }
        }
      }
      
      // Chuyển đổi dữ liệu followers để hiển thị
      const formattedFollowers = Array.isArray(followers) ? followers.map(follower => {
        // Nếu dữ liệu người dùng nằm trong user_id
        if (follower.user_id) {
          return {
            id: follower._id || follower.id,
            name: `${follower.user_id.firstName || ''} ${follower.user_id.lastName || ''}`.trim() || 'Người dùng',
            email: follower.user_id.email,
            avatar: follower.user_id.avatar,
            date: follower.created_at || follower.createdAt || follower.date || new Date()
          };
        } 
        // Nếu dữ liệu người dùng nằm trực tiếp trong đối tượng follower
        else {
          return {
            id: follower._id || follower.id,
            name: `${follower.firstName || ''} ${follower.lastName || ''}`.trim() || follower.name || 'Người dùng',
            email: follower.email,
            avatar: follower.avatar,
            date: follower.created_at || follower.createdAt || follower.date || new Date()
          };
        }
      }) : [];

      // === TÍNH TOÁN DOANH THU (ĐÃ SỬA) ===
      let periodRevenueValue = 0; // Đổi tên từ dailyRevenueValue thành periodRevenueValue
      let orderRevenueValue = 0;

      // Sử dụng dữ liệu từ API nếu có và không phải là tất cả 0
      if (revenueApiSuccess && revenueStats && revenueStats.summary &&
          (revenueStats.summary.total_revenue > 0 || revenueStats.summary.total_earnings > 0)) {
        console.log(`Sử dụng dữ liệu API cho ${selectedPeriod}:`, revenueStats.summary);
        
        // Kiểm tra cả trường hợp số và chuỗi
        if (typeof revenueStats.summary.total_revenue === 'number') {
          orderRevenueValue = revenueStats.summary.total_revenue;
        } else if (typeof revenueStats.summary.total_revenue === 'string') {
          orderRevenueValue = parseFloat(revenueStats.summary.total_revenue);
        }
        
        if (typeof revenueStats.summary.total_earnings === 'number') {
          periodRevenueValue = revenueStats.summary.total_earnings;
        } else if (typeof revenueStats.summary.total_earnings === 'string') {
          periodRevenueValue = parseFloat(revenueStats.summary.total_earnings);
        }
        
        // Đảm bảo giá trị là số hợp lệ
        if (isNaN(orderRevenueValue)) orderRevenueValue = 0;
        if (isNaN(periodRevenueValue)) periodRevenueValue = 0;
      } else {
        console.log(`Tính toán doanh thu từ đơn hàng cho ${selectedPeriod}`);
        
        // Tính tổng doanh thu từ đơn hàng đã lọc
        orderRevenueValue = calculateTotalOrderValue(filteredOrders);
        console.log(`Calculated order revenue for ${selectedPeriod}:`, orderRevenueValue);
        
        // Tính doanh thu từ đơn hàng đã thanh toán trong khoảng thời gian
        const paidOrders = filteredOrders.filter(orderItem => {
          try {
            const isPaid = orderItem.order?.status_id === 'delivered' || 
                          orderItem.order?.payment_status === 'paid' ||
                          orderItem.status_id === 'delivered' ||
                          orderItem.payment_status === 'paid' ||
                          orderItem.order?.order_status === 'delivered';
            return isPaid;
          } catch (error) {
            return false;
          }
        });
        
        periodRevenueValue = calculateTotalOrderValue(paidOrders) * 0.9; // Trừ 10% hoa hồng
        console.log(`Calculated period revenue after commission:`, periodRevenueValue);
      }

      // Đảm bảo chúng ta có số đơn hàng đúng
      const totalOrdersCount = revenueApiSuccess && revenueStats.summary?.orders_count ? 
        revenueStats.summary.orders_count : filteredOrders.length;
      
      // Xác định nhãn thời gian dựa trên khoảng thời gian đã chọn
      let periodLabel = 'hôm nay';
      if (selectedPeriod === 'week') periodLabel = 'tuần này';
      else if (selectedPeriod === 'month') periodLabel = 'tháng này';
      else if (selectedPeriod === 'all') periodLabel = 'tất cả thời gian';
      else if (selectedPeriod === 'custom') {
        const startFormatted = startDate.toLocaleDateString('vi-VN');
        const endFormatted = endDate.toLocaleDateString('vi-VN');
        periodLabel = `từ ${startFormatted} đến ${endFormatted}`;
      }

      // Update dashboard data với các giá trị mới tính
      setDashboardData({
        totalOrders: totalOrdersCount,
        newFollowers: todayFollowers,
        dailyRevenue: periodRevenueValue, // Giữ tên cũ để không phải thay đổi phần render
        orderRevenue: orderRevenueValue,
        pendingOrders: pendingOrders.length,
        successfulOrders: successfulOrders.length,
        followers: formattedFollowers.slice(0, 5), // Get 5 most recent followers
        newOrders: pendingOrders.slice(0, 5), // Get 5 most recent pending orders
        periodLabel
      });
      
      console.log("Dashboard data set:", {
        totalOrders: totalOrdersCount,
        orderRevenue: orderRevenueValue,
        periodRevenue: periodRevenueValue,
        pendingOrders: pendingOrders.length,
        successfulOrders: successfulOrders.length,
        periodLabel
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.toString());
    } finally {
      setLoading(false);
    }
  };

  // Effect hook chạy khi component được mount hoặc khi selectedPeriod thay đổi
  useEffect(() => {
    fetchDashboardData();
  }, [navigate, selectedPeriod, useCustomDate]);

  // Xử lý khi người dùng thay đổi khoảng thời gian
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setSelectedPeriod(newPeriod);
    setUseCustomDate(newPeriod === 'custom');
  };

  // Xử lý khi người dùng áp dụng khoảng thời gian tùy chỉnh
  const handleApplyCustomDate = () => {
    fetchDashboardData();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  // Format date as "Month dd, yyyy HH:MM AM/PM"
  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return date.toLocaleDateString('vi-VN', options);
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
  
  // Format date and time as dd/MM/yyyy HH:mm
  const formatDatetime = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
      return '';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

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

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 p-6">
          {/* Header với bộ chọn thời gian */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Bảng điều khiển</h2>
            
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
              
              <div className="text-gray-500">{formatDate(currentDate)}</div>
            </div>
          </div>

          {/* Hiển thị khoảng thời gian đã chọn */}
          <div className="mb-4">
            <div className="text-sm text-gray-500">
              Đang xem dữ liệu <span className="font-medium">{dashboardData.periodLabel}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              { 
                value: dashboardData.totalOrders.toString(), 
                label: 'Tổng số đơn hàng', 
                subtext: `Số đơn hàng ${dashboardData.periodLabel}` 
              },
              { 
                value: dashboardData.newFollowers.toString(), 
                label: 'Số người theo dõi mới', 
                subtext: 'Số lượng người dùng đã theo dõi của hàng trong ngày' 
              },
              { 
                value: formatCurrency(dashboardData.dailyRevenue), 
                label: 'Thu nhập từ đơn hàng đã hoàn thành', 
                subtext: `Số tiền shop nhận được ${dashboardData.periodLabel} sau khi trừ phí hoa hồng` 
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.subtext}</div>
              </div>
            ))}
          </div>

          {/* Second Row Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                value: formatCurrency(dashboardData.orderRevenue), 
                label: 'Tổng doanh thu đơn hàng', 
                subtext: `Tổng giá trị đơn hàng ${dashboardData.periodLabel} trước khi trừ phí hoa hồng` 
              },
              { 
                value: dashboardData.pendingOrders.toString(), 
                label: 'Số đơn hàng mới cần duyệt', 
                subtext: 'Số đơn hàng chờ được xác nhận' 
              },
              { 
                value: dashboardData.successfulOrders.toString(), 
                label: 'Số đơn hàng thành công', 
                subtext: 'Tổng số đơn hàng đã được giao đến khách hàng' 
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.subtext}</div>
              </div>
            ))}
          </div>

          {/* Bottom Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Người theo dõi mới</h3>
                <a href="#" className="text-blue-500 text-sm" onClick={(e) => {
                  e.preventDefault();
                  navigate('/registed-user'); // Đường dẫn đến trang RegisteredUser
                }}>Xem tất cả</a>
              </div>
              {/* Followers list */}
              {dashboardData.followers.length > 0 ? (
                <div className="divide-y">
                  {dashboardData.followers.map((follower, index) => (
                    <div key={index} className="py-2 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0">
                        {follower.avatar && <img src={follower.avatar} alt="Avatar" className="w-full h-full rounded-full" />}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{follower.name}</div>
                        {follower.email && <div className="text-sm text-gray-500">{follower.email}</div>}
                        <div className="text-xs text-gray-500">
                          {follower.date ? formatShortDate(new Date(follower.date)) : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-6">Không có người theo dõi mới</div>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Đơn hàng mới cần xác nhận</h3>
                <a href="#" className="text-blue-500 text-sm" onClick={(e) => {
                  e.preventDefault();
                  navigate('/all-order'); // Đường dẫn đến trang AllOrder
                }}>Xem tất cả</a>
              </div>
              {/* New orders list */}
              {dashboardData.newOrders.length > 0 ? (
                <div className="divide-y">
                  {dashboardData.newOrders.map((order, index) => (
                    <div key={index} className="py-2">
                      <div className="font-medium">Đơn hàng #{order.id}</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {order.date ? formatDatetime(new Date(order.date)) : ''}
                        </span>
                        <span className="font-medium text-green-600">{formatCurrency(order.total || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-6">Không có đơn hàng mới</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;