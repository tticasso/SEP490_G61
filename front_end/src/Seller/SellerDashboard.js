import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

// Hàm tính tổng giá trị đơn hàng
const calculateTotalOrderValue = (orders) => {
  let total = 0;
  if (!Array.isArray(orders) || orders.length === 0) return total;

  console.log("Calculating total value for orders:", JSON.stringify(orders));

  for (const orderItem of orders) {
    try {
      let orderValue = 0;
      
      // Log để kiểm tra từng đơn hàng
      console.log("Processing order item:", JSON.stringify(orderItem));
      
      // Xử lý trường hợp order có cấu trúc khác nhau
      if (orderItem.order) {
        // Trường hợp đơn hàng có định dạng {order: {...}, orderDetails: [...]}
        orderValue = Number(orderItem.order.total_price || 0);
        console.log(`Order value from order.total_price: ${orderValue}`);
      } else if (orderItem.total_price) {
        // Trường hợp đơn hàng trực tiếp
        orderValue = Number(orderItem.total_price || 0);
        console.log(`Order value from total_price: ${orderValue}`);
      } else if (orderItem.total) {
        // Trường hợp đơn hàng đã chuyển đổi
        orderValue = Number(orderItem.total || 0);
        console.log(`Order value from total: ${orderValue}`);
      } else {
        // Kiểm tra xem có giá trị nào khác không
        const possibleKeys = ['price', 'amount', 'value'];
        for (const key of possibleKeys) {
          if (orderItem[key]) {
            orderValue = Number(orderItem[key]);
            console.log(`Order value from ${key}: ${orderValue}`);
            break;
          }
        }
      }
      
      // Đảm bảo orderValue là một số
      if (isNaN(orderValue)) {
        console.log("Order value is NaN, setting to 0");
        orderValue = 0;
      }
      
      console.log(`Adding order value to total: ${orderValue}`);
      total += orderValue;
      console.log(`Current total: ${total}`);
    } catch (error) {
      console.error("Lỗi khi tính tổng giá trị đơn hàng:", error);
    }
  }
  
  console.log(`Final total: ${total}`);
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
    newOrders: []
  });
  const [currentDate] = useState(new Date());

  useEffect(() => {
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
          console.log("Shop data:", shop);
          
          if (!shopId) {
            throw new Error('Không tìm thấy ID của shop');
          }
        } catch (shopError) {
          console.error("Error fetching user's shop:", shopError);
          setError("Không thể lấy thông tin cửa hàng. Vui lòng thử lại sau.");
          setLoading(false);
          return;
        }

        // Fetch shop revenue statistics
        let revenueStats = { summary: { total_revenue: 0, orders_count: 0 } };
        try {
          // Giữ nguyên endpoint này hoặc thay thế với endpoint thống kê từ order nếu cần
          revenueStats = await ApiService.get(`/revenue/shop/${shopId}/stats?period=day`);
          console.log("Revenue stats:", revenueStats);
        } catch (revenueError) {
          console.error("Error fetching shop revenue stats:", revenueError);
        }

        // Fetch tất cả đơn hàng của shop - sử dụng đúng endpoint
        let allOrders = [];
        try {
          // Sử dụng endpoint đúng như trong AllOrder.js
          allOrders = await ApiService.get(`/order/shop/${shopId}`);
          console.log("Orders data:", allOrders);
        } catch (ordersError) {
          console.error("Error fetching shop orders:", ordersError);
          allOrders = []; // Đảm bảo là mảng rỗng nếu có lỗi
        }
        
        // Đảm bảo allOrders có cấu trúc phù hợp
        let pendingOrders = [];
        let successfulOrders = [];
        
        if (allOrders && Array.isArray(allOrders)) {
          // Xử lý trường hợp đơn hàng trả về là mảng các object có order và orderDetails
          if (allOrders.length > 0 && allOrders[0].order) {
            pendingOrders = allOrders.filter(item => item.order.status_id === 'pending');
            successfulOrders = allOrders.filter(item => item.order.status_id === 'delivered');
            
            // Chuyển đổi dữ liệu để phù hợp với giao diện hiển thị
            pendingOrders = pendingOrders.map(item => ({
              id: item.order.id || item.order._id,
              date: new Date(item.order.created_at),
              total: item.order.total_price || 0
            }));
            
            console.log("Pending orders:", pendingOrders);
          } else {
            // Trường hợp allOrders là mảng đơn giản của các đơn hàng
            pendingOrders = allOrders.filter(order => order.status_id === 'pending');
            successfulOrders = allOrders.filter(order => order.status_id === 'delivered');
          }
        }

        // Fetch followers
        let followers = [];
        try {
          // Sử dụng endpoint chính xác
          followers = await ApiService.get(`/shop-follow/followers/${shopId}`);
          console.log("Followers data:", followers);
        } catch (followersError) {
          console.error("Error fetching followers:", followersError);
          try {
            // Thử endpoint thay thế
            followers = await ApiService.get(`/followers/${shopId}`);
            console.log("Followers data (alternate endpoint):", followers);
          } catch (altFollowersError) {
            console.error("Error fetching followers with alternate endpoint:", altFollowersError);
            followers = [];
          }
        }

        // Ghi log chi tiết followers để phân tích
        console.log("Chi tiết followers:", JSON.stringify(followers));

        // Đếm người theo dõi mới ĐÚNG CÁCH
        let todayFollowers = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (Array.isArray(followers)) {
          // Mặc định coi follower từ API là follower mới nếu không có thông tin ngày
          if (followers.length > 0 && !followers[0].created_at && !followers[0].createdAt && !followers[0].date) {
            console.log("Không tìm thấy thông tin ngày trong dữ liệu followers, coi tất cả là mới");
            todayFollowers = followers.length;
          } else {
            // Trường hợp có thông tin ngày, kiểm tra từng follower
            for (const follower of followers) {
              try {
                // Log toàn bộ thông tin follower để debug
                console.log("Kiểm tra follower:", JSON.stringify(follower));
                
                // Kiểm tra các trường ngày có thể có
                const dateField = follower.created_at || follower.createdAt || follower.date;
                
                if (dateField) {
                  const followerDate = new Date(dateField);
                  console.log(`Ngày của follower: ${followerDate}`);
                  
                  // Kiểm tra xem ngày có hợp lệ không
                  if (!isNaN(followerDate.getTime())) {
                    followerDate.setHours(0, 0, 0, 0);
                    const diffTime = Math.abs(today - followerDate);
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    console.log(`Ngày hôm nay: ${today}, Ngày follower: ${followerDate}, Chênh lệch: ${diffDays} ngày`);
                    
                    if (diffDays === 0) {
                      todayFollowers++;
                      console.log(`Tìm thấy follower mới: ${follower.firstName || ''} ${follower.lastName || ''}`);
                    }
                  } else {
                    console.error("Ngày không hợp lệ:", dateField);
                  }
                } else {
                  console.log("Follower không có thông tin ngày, coi là mới");
                  todayFollowers++;
                }
              } catch (error) {
                console.error("Lỗi khi xử lý ngày follower:", error);
              }
            }
          }
        }

        console.log(`Số lượng người theo dõi mới hôm nay: ${todayFollowers}`);
        
        // Chuyển đổi dữ liệu followers - cập nhật phần này để hiển thị thông tin đầy đủ
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

        // Bắt đầu tính doanh thu đơn hàng...
        console.log("Bắt đầu tính doanh thu đơn hàng...");
        console.log("Tất cả đơn hàng:", allOrders);

        // Kiểm tra cấu trúc dữ liệu đơn hàng để log
        if (allOrders.length > 0) {
          console.log("Cấu trúc đơn hàng đầu tiên:", JSON.stringify(allOrders[0]));
          
          // Kiểm tra các trường khác nhau có thể chứa thông tin giá trị đơn hàng
          if (allOrders[0].order) {
            console.log("Giá trị đơn hàng từ order.total_price:", allOrders[0].order.total_price);
          }
          
          if (allOrders[0].total_price) {
            console.log("Giá trị đơn hàng từ total_price:", allOrders[0].total_price);
          }
          
          if (allOrders[0].total) {
            console.log("Giá trị đơn hàng từ total:", allOrders[0].total);
          }
        }

        // Sử dụng trực tiếp pendingOrders để tính doanh thu
        let orderRevenueValue = 0;

        // Tính doanh thu dựa trên pendingOrders
        if (pendingOrders && pendingOrders.length > 0) {
          console.log("Đơn hàng chờ xác nhận:", pendingOrders);
          orderRevenueValue = pendingOrders.reduce((sum, order) => {
            const orderValue = Number(order.total || 0);
            console.log(`Đơn hàng #${order.id}: ${orderValue}`);
            return sum + orderValue;
          }, 0);
        } else {
          // Fallback - tính toán từ allOrders nếu cần
          const todayOrders = allOrders.filter(orderItem => {
            try {
              const orderDate = new Date(
                orderItem.order?.created_at || 
                orderItem.created_at || 
                orderItem.date || 
                new Date()
              );
              orderDate.setHours(0, 0, 0, 0);
              return orderDate.getTime() === today.getTime();
            } catch (error) {
              console.error("Lỗi khi lọc đơn hàng theo ngày:", error);
              return false;
            }
          });

          console.log("Đơn hàng trong ngày (từ allOrders):", todayOrders);
          orderRevenueValue = calculateTotalOrderValue(todayOrders);
        }

        console.log("Doanh thu đơn hàng (tổng giá trị đơn hàng trong ngày):", orderRevenueValue);

        // 2. Tính doanh thu trong ngày - chỉ tính đơn hàng đã thanh toán
        const paidOrders = allOrders.filter(orderItem => {
          try {
            const orderDate = new Date(
              orderItem.order?.created_at || 
              orderItem.created_at || 
              orderItem.date || 
              new Date()
            );
            orderDate.setHours(0, 0, 0, 0);
            
            // Kiểm tra ngày và trạng thái thanh toán
            const isPaid = orderItem.order?.status_id === 'delivered' || 
                          orderItem.order?.payment_status === 'paid' ||
                          orderItem.status_id === 'delivered' ||
                          orderItem.payment_status === 'paid';
            
            return orderDate.getTime() === today.getTime() && isPaid;
          } catch (error) {
            console.error("Lỗi khi lọc đơn hàng đã thanh toán:", error);
            return false;
          }
        });

        console.log("Đơn hàng đã thanh toán trong ngày:", paidOrders);
        const dailyRevenueValue = calculateTotalOrderValue(paidOrders);
        console.log("Doanh thu trong ngày (đơn hàng đã thanh toán):", dailyRevenueValue);

        // Update dashboard data với các giá trị mới tính
        setDashboardData({
          totalOrders: revenueStats.summary?.orders_count || allOrders.length || 0,
          newFollowers: todayFollowers,
          dailyRevenue: dailyRevenueValue,
          orderRevenue: orderRevenueValue,
          pendingOrders: pendingOrders.length,
          successfulOrders: successfulOrders.length,
          followers: formattedFollowers.slice(0, 5), // Get 5 most recent followers
          newOrders: pendingOrders.slice(0, 5) // Get 5 most recent pending orders
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, currentDate]);

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
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Bảng điều khiển</h2>
            <div className="text-gray-500">{formatDate(currentDate)}</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              { 
                value: dashboardData.totalOrders.toString(), 
                label: 'Tổng số đơn hàng', 
                subtext: 'Số đơn hàng được đặt trong ngày' 
              },
              { 
                value: dashboardData.newFollowers.toString(), 
                label: 'Số người theo dõi mới', 
                subtext: 'Số lượng người dùng đã theo dõi của hàng trong ngày' 
              },
              { 
                value: formatCurrency(dashboardData.dailyRevenue), 
                label: 'Doanh thu trong ngày', 
                subtext: 'Doanh thu khi đơn hàng được thanh toán' 
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
                label: 'Doanh thu đơn hàng', 
                subtext: 'Tổng doanh thu đơn hàng trong ngày' 
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
                      <div className="mt-1">
                        
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