import React from 'react';
import { RefreshCw } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="flex-1 bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">BẢNG ĐIỀU KHIỂN</h1>
                <div className="flex items-center">
                    <div className="flex items-center mr-4">
                        <span className="text-gray-500 mr-2">Dữ liệu mới nhất</span>
                        <RefreshCw size={18} className="text-gray-500" />
                    </div>
                    <div className="text-gray-500">July 12, 2024 16:10 PM</div>
                </div>
            </div>

            {/* Stats Grid - First Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">0</h3>
                    <p className="text-gray-500 mt-2 text-lg">Tổng số đơn hàng</p>
                    <div className="flex items-center mt-2 text-gray-400 text-sm">
                        <span className="mr-1">⚪</span>
                        <span>Số đơn hàng được đặt trong ngày</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">0</h3>
                    <p className="text-gray-500 mt-2 text-lg">Khách hàng mới</p>
                    <div className="flex items-center mt-2 text-gray-400 text-sm">
                        <span className="mr-1">⚪</span>
                        <span>Số lượng người dùng tạo tài khoản trong ngày</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">0 đ</h3>
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
                    <h3 className="text-5xl font-bold text-gray-800">0 đ</h3>
                    <p className="text-gray-500 mt-2 text-lg">Doanh thu đơn hàng</p>
                    <div className="flex items-center mt-2 text-gray-400 text-sm">
                        <span className="mr-1">⚪</span>
                        <span>Tổng doanh thu đơn hàng trong ngày</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">0</h3>
                    <p className="text-gray-500 mt-2 text-lg">Số đơn hàng mới cần duyệt</p>
                    <div className="flex items-center mt-2 text-gray-400 text-sm">
                        <span className="mr-1">⚪</span>
                        <span>Số đơn hàng chờ được xác nhận</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-5xl font-bold text-gray-800">0</h3>
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
                        <button className="text-blue-500 text-sm">Xem tất cả</button>
                    </div>
                    <div className="text-center py-6 text-gray-500">
                        Không có người đăng ký mới trong ngày
                    </div>
                </div>

                {/* New Orders Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Đơn hàng mới cần xác nhận</h2>
                    </div>
                    <div className="border-t border-gray-200 mt-4">
                        <div className="grid grid-cols-3 py-3 text-sm font-medium text-gray-600">
                            <div># MÃ ĐƠN HÀNG</div>
                            <div>TRẠNG THÁI</div>
                            <div>NGÀY ĐẶT HÀNG</div>
                        </div>
                        {/* Orders would be listed here */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;