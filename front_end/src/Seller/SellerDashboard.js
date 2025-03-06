import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const SellerDashboard = () => {
  const navigate = useNavigate();

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
            <div className="text-gray-500">July 12, 2024 16:03 PM</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              { value: '1', label: 'Tổng số đơn hàng', subtext: 'Số đơn hàng được đặt trong ngày' },
              { value: '0', label: 'Số người theo dõi mới', subtext: 'Số lượng người dùng đã theo dõi của hàng trong ngày' },
              { value: '0₫', label: 'Doanh thu trong ngày', subtext: 'Doanh thu khi đơn hàng được thanh toán' }
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
              { value: '180.000₫', label: 'Doanh thu đơn hàng', subtext: 'Tổng doanh thu đơn hàng trong ngày' },
              { value: '1', label: 'Số đơn hàng mới cần duyệt', subtext: 'Số đơn hàng chờ được xác nhận' },
              { value: '0', label: 'Số đơn hàng thành công', subtext: 'Tổng số đơn hàng đã được giao đến khách hàng' }
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
                <a href="#" className="text-blue-500 text-sm">Xem tất cả</a>
              </div>
              {/* Placeholder for new followers */}
              <div className="text-gray-500 text-center py-6">Không có người theo dõi mới</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Đơn hàng mới cần xác nhận</h3>
              </div>
              {/* Placeholder for new orders */}
              <div className="text-gray-500 text-center py-6">Không có đơn hàng mới</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;