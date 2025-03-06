import React, { useState } from 'react';
import { Search, Download, Calendar, ArrowLeft, RefreshCw, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const ImportHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Dữ liệu tổng số tiền
  const totalAmounts = {
    today: 0,
    week: 0,
    month: 0,
    year: 696346500
  };

  // Format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', '')
      .trim();
  };

  // Xử lý nhấn nút thêm mới
  const handleAddNew = () => {
    navigate('/seller-dashboard/create-import');
  };

  // Xử lý toggle chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.length > 0) {
      setSelectedItems([]);
    } else {
      // Giả định rằng không có dữ liệu nên không chọn gì cả
      setSelectedItems([]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Thông tin tổng số tiền */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-700">
              <span className="font-medium">Tổng số tiền đã nhập hàng:</span>
              <span className="ml-2">Hôm nay : {formatCurrency(totalAmounts.today)}</span>
              <span className="ml-2">Tuần : {formatCurrency(totalAmounts.week)}</span>
              <span className="ml-2">Tháng : {formatCurrency(totalAmounts.month)}</span>
              <span className="ml-2">Năm: {formatCurrency(totalAmounts.year)}</span>
            </div>
            
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              onClick={handleAddNew}
            >
              <Plus size={16} className="mr-1" />
              Thêm mới
            </button>
          </div>

          {/* Thanh chức năng */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-600">
              Chức năng: <span className="text-red-500">Thêm vô thùng rác (0)</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="month" 
                  className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="2024-07"
                />
              </div>
              
              <div className="relative">
                <div className="flex items-center border rounded-md px-3 py-2">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    className="outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4"
                      checked={selectedItems.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MÃ NHẬP HÀNG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SỐ LƯỢNG NHẬP THÊM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TỔNG SỐ TIỀN NHẬP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GHI CHÚ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NGÀY NHẬP
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Phân trang */}
            <div className="px-6 py-3 flex justify-between items-center border-t border-gray-200">
              <div className="flex items-center">
                <button className="mr-2 p-1 rounded-full border w-8 h-8 flex items-center justify-center">
                  <ArrowLeft size={16} />
                </button>
                <button className="mr-2 p-1 rounded-full bg-blue-600 text-white w-8 h-8 flex items-center justify-center">
                  1
                </button>
                <button className="p-1 rounded-full border w-8 h-8 flex items-center justify-center">
                  <ArrowLeft size={16} className="rotate-180" />
                </button>
              </div>
              
              <div className="flex items-center text-sm">
                <span>Trang 1 của 0</span>
                <span className="mx-4">-</span>
                <span>Hiển thị</span>
                <select 
                  className="mx-2 border rounded p-1" 
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span>/</span>
                <span className="ml-2">0 Sản phẩm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportHistory;