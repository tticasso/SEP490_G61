import React, { useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const InventoryStock = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleString('en-US', { month: 'long' })} ${currentDate.getDate()}, ${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')} ${currentDate.getHours() >= 12 ? 'PM' : 'AM'}`;

  // State để lưu trữ lựa chọn bộ lọc
  const [filterOption, setFilterOption] = useState('Năm');

  // Xử lý khi thay đổi bộ lọc
  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  // Xử lý khi nhấn nút "XEM THÊM"
  const handleViewMore = (type) => {
    if (type === 'export') {
      navigate('/seller-dashboard/import-history');
    } else if (type === 'top-products') {
      navigate('/seller-dashboard/product');
    }
  };

  // Xử lý khi nhấn nút làm mới dữ liệu
  const handleRefreshData = () => {
    // Logic để làm mới dữ liệu
    alert('Đang cập nhật dữ liệu mới...');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-50">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">THỐNG KÊ HÀNG TỒN KHO</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button 
                  className="flex items-center gap-1 text-blue-600"
                  onClick={handleRefreshData}
                >
                  <RefreshCw size={16} />
                  <span>Dữ liệu mới nhất</span>
                </button>
              </div>
              <div className="text-gray-500">{formattedDate}</div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Lọc theo:</span>
              <select 
                className="border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterOption}
                onChange={handleFilterChange}
              >
                <option>Năm</option>
                <option>Tháng</option>
                <option>Quý</option>
                <option>Tuần</option>
              </select>
            </div>
          </div>

          {/* Stats Cards - First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Card 1 */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between">
                <div>
                  <div className="text-gray-500 text-sm">Nhập hàng</div>
                  <div className="text-2xl font-semibold mt-1">696.346.500 đ</div>
                  <div className="flex items-center text-green-500 text-sm mt-2">
                    <span>0%</span>
                    <span className="ml-2">So với năm trước</span>
                  </div>
                </div>
                <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <img src="/api/placeholder/30/30" alt="Icon" className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between">
                <div>
                  <div className="text-gray-500 text-sm">Doanh thu</div>
                  <div className="text-2xl font-semibold mt-1">0 đ</div>
                  <div className="flex items-center text-green-500 text-sm mt-2">
                    <span>0%</span>
                    <span className="ml-2">So với năm trước</span>
                  </div>
                </div>
                <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <img src="/api/placeholder/30/30" alt="Icon" className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between">
                <div>
                  <div className="text-gray-500 text-sm">Tiền lời ước tính (chưa trừ khuyến mãi)</div>
                  <div className="text-2xl font-semibold mt-1">0 đ</div>
                  <div className="flex items-center text-green-500 text-sm mt-2">
                    <span>0%</span>
                    <span className="ml-2">So với năm trước</span>
                  </div>
                </div>
                <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <img src="/api/placeholder/30/30" alt="Icon" className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Card 4 */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between">
                <div>
                  <div className="text-gray-500 text-sm">Tổng sản phẩm còn trong kho</div>
                  <div className="text-2xl font-semibold mt-1">863</div>
                </div>
                <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <img src="/api/placeholder/30/30" alt="Icon" className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between">
                <div>
                  <div className="text-gray-500 text-sm">Tổng giá trị sản phẩm trong kho</div>
                  <div className="text-2xl font-semibold mt-1">1.032.845.900 đ</div>
                </div>
                <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <img src="/api/placeholder/30/30" alt="Icon" className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between">
                <div>
                  <div className="text-gray-500 text-sm">Sản phẩm đang chờ xuất kho</div>
                  <div className="text-2xl font-semibold mt-1">42</div>
                </div>
                <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <img src="/api/placeholder/30/30" alt="Icon" className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Đơn hàng cần xuất kho Table */}
            <div className="bg-white rounded-md shadow-sm">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold">Đơn hàng cần xuất kho</h2>
                <button 
                  className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                  onClick={() => handleViewMore('export')}
                >
                  XEM THÊM
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-500">
                      <th className="px-4 py-3">MÃ ĐƠN HÀNG</th>
                      <th className="px-4 py-3">TRẠNG THÁI</th>
                      <th className="px-4 py-3">SỐ LƯỢNG</th>
                      <th className="px-4 py-3">TỔNG ĐƠN HÀNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top sản phẩm bán chạy nhất Table */}
            <div className="bg-white rounded-md shadow-sm">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold">Top sản phẩm bán chạy nhất</h2>
                <button 
                  className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                  onClick={() => handleViewMore('top-products')}
                >
                  SEE ALL
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-500">
                      <th className="px-4 py-3">TÊN SẢN PHẨM</th>
                      <th className="px-4 py-3">GIÁ</th>
                      <th className="px-4 py-3">ĐÃ BÁN</th>
                      <th className="px-4 py-3">CÒN LẠI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStock;