import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import ApiService from '../../services/ApiService';

const Dashboard = () => {
    // State variables for data
    const [orderStats, setOrderStats] = useState(null);
    const [revenueStats, setRevenueStats] = useState(null);
    const [newUsers, setNewUsers] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Fetch all data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Function to fetch all dashboard data
    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch order statistics
            const orderStatsResponse = await ApiService.get('/order/statistics');
            setOrderStats(orderStatsResponse);

            // Fetch revenue overview
            const revenueResponse = await ApiService.get('/revenue/system/overview?period=today');
            setRevenueStats(revenueResponse);

            // Fetch new users (last 5 users)
            const usersResponse = await ApiService.get('/user/list');
            // Sort by creation date (newest first) and take the first 5
            const sortedUsers = [...usersResponse].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            ).slice(0, 5);
            setNewUsers(sortedUsers);

            // Fetch pending orders
            const ordersResponse = await ApiService.get('/order/list');
            // Filter pending orders
            const pending = ordersResponse.filter(order => order.order_status === 'pending')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);
            setPendingOrders(pending);

            setLastUpdated(new Date());
            setLoading(false);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError('Lỗi khi tải dữ liệu bảng điều khiển');
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: 'numeric', 
            day: 'numeric',
            hour: 'numeric', 
            minute: 'numeric'
        }).format(date);
    };

    // Format currency for display
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount || 0).replace('₫', 'đ');
    };

    // Handle refresh button click
    const handleRefresh = () => {
        fetchDashboardData();
    };

    if (loading) {
        return (
            <div className="flex-1 bg-gray-50 p-6 flex justify-center items-center">
                <p className="text-gray-500">Đang tải dữ liệu bảng điều khiển...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 bg-gray-50 p-6">
                <div className="text-red-500 bg-red-50 p-4 rounded-md border border-red-300">
                    {error}
                    <button 
                        onClick={handleRefresh}
                        className="ml-4 text-blue-500 hover:text-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">BẢNG ĐIỀU KHIỂN</h1>
                <div className="flex items-center">
                    <div className="flex items-center mr-4">
                        <span className="text-gray-500 mr-2">Dữ liệu mới nhất</span>
                        <RefreshCw 
                            size={18} 
                            className="text-gray-500 cursor-pointer" 
                            onClick={handleRefresh}
                        />
                    </div>
                    <div className="text-gray-500">{formatDate(lastUpdated)}</div>
                </div>
            </div>

            {/* Stats Grid - First Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">
                        {orderStats ? orderStats.totalOrders : 0}
                    </h3>
                    <p className="text-gray-500 mt-2 text-lg">Tổng số đơn hàng</p>
                    <div className="flex items-center mt-2 text-gray-400 text-sm">
                        <span className="mr-1">⚪</span>
                        <span>Số đơn hàng được đặt trong hệ thống</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">
                        {newUsers.length}
                    </h3>
                    <p className="text-gray-500 mt-2 text-lg">Khách hàng mới</p>
                    <div className="flex items-center mt-2 text-gray-400 text-sm">
                        <span className="mr-1">⚪</span>
                        <span>Số lượng người dùng tạo tài khoản gần đây</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">
                        {revenueStats && revenueStats.summary 
                            ? formatCurrency(revenueStats.summary.total_revenue)
                            : '0 đ'}
                    </h3>
                    <p className="text-gray-500 mt-2 text-lg">Doanh thu trong ngày</p>
                    <div className="flex items-center mt-2 text-gray-400 text-sm">
                        <span className="mr-1">⚪</span>
                        <span>Doanh thu khi đơn hàng đã được thanh toán</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Second Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">
                        {orderStats && orderStats.totalRevenue
                            ? formatCurrency(orderStats.totalRevenue)
                            : '0 đ'}
                    </h3>
                    <p className="text-gray-500 mt-2 text-lg">Doanh thu đơn hàng</p>
                    <div className="flex items-center mt-2 text-gray-400 text-sm">
                        <span className="mr-1">⚪</span>
                        <span>Tổng doanh thu đơn hàng thành công</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">
                        {orderStats && orderStats.ordersByStatus 
                            ? orderStats.ordersByStatus.pending 
                            : 0}
                    </h3>
                    <p className="text-gray-500 mt-2 text-lg">Số đơn hàng mới cần duyệt</p>
                    <div className="flex items-center mt-2 text-gray-400 text-sm">
                        <span className="mr-1">⚪</span>
                        <span>Số đơn hàng chờ được xác nhận</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">
                        {orderStats && orderStats.ordersByStatus 
                            ? orderStats.ordersByStatus.delivered 
                            : 0}
                    </h3>
                    <p className="text-gray-500 mt-2 text-lg">Số đơn hàng thành công</p>
                    <div className="flex items-center mt-2 text-gray-400 text-sm">
                        <span className="mr-1">⚪</span>
                        <span>Tổng số đơn hàng đã được giao đến khách hàng</span>
                    </div>
                </div>
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-2 gap-6">
                {/* New Users Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Người đăng ký mới</h2>
                        <button onClick={() => window.location.href ='/admin/customers'} className="text-blue-500 text-sm">Xem tất cả</button>
                    </div>
                    {newUsers.length > 0 ? (
                        <div>
                            {newUsers.map(user => (
                                <div key={user._id} className="flex items-center py-3 border-b border-gray-100">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                        <span className="text-gray-700 font-medium">
                                            {user.firstName ? user.firstName.charAt(0).toUpperCase() : ''}
                                            {user.lastName ? user.lastName.charAt(0).toUpperCase() : ''}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.lastName} {user.firstName}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                    <div className="ml-auto text-sm text-gray-500">
                                        {formatDate(new Date(user.createdAt))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            Không có người đăng ký mới gần đây
                        </div>
                    )}
                </div>

                {/* New Orders Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Đơn hàng mới cần xác nhận</h2>
                        <button onClick={() => window.location.href ='/admin/orders'} className="text-blue-500 text-sm">Xem tất cả</button>
                    </div>
                    <div className="border-t border-gray-200 mt-4">
                        <div className="grid grid-cols-3 py-3 text-sm font-medium text-gray-600">
                            <div># MÃ ĐƠN HÀNG</div>
                            <div>TRẠNG THÁI</div>
                            <div>NGÀY ĐẶT HÀNG</div>
                        </div>
                        {pendingOrders.length > 0 ? (
                            <div>
                                {pendingOrders.map(order => (
                                    <div key={order._id} className="grid grid-cols-3 py-3 text-sm border-t border-gray-100">
                                        <div>{order.id}</div>
                                        <div>
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                                Chờ xác nhận
                                            </span>
                                        </div>
                                        <div>{formatDate(new Date(order.created_at))}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                Không có đơn hàng mới cần xác nhận
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;