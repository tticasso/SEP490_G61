import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';

const RegisteredUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState('');

  // Dữ liệu người dùng đăng ký mẫu
  const registeredUsers = [
    {
      id: 1,
      name: 'Gichi',
      registered_time: '22:43 29/6/2024',
      email: 'lhlam2003@gmail.com',
      phone: '0917162JQK'
    }
  ];

  // Xử lý toggle chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(registeredUsers.map(user => user.id));
    }
  };

  // Xử lý toggle chọn một người dùng
  const toggleUserSelection = (userId) => {
    if (selectedItems.includes(userId)) {
      setSelectedItems(selectedItems.filter(id => id !== userId));
    } else {
      setSelectedItems([...selectedItems, userId]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white min-h-screen">
          {/* Menu tabs */}
          <div className="p-4 border-b flex items-center space-x-6 text-sm">
            <div className="text-gray-500">Tất cả ( 0 )</div>
            <div className="text-gray-500">Hiển thị ( 0 )</div>
            <div className="text-gray-500">Nhập ( 0 )</div>
            <div className="text-gray-500">Thùng rác ( 0 )</div>
          </div>

          {/* Công cụ tìm kiếm và lọc */}
          <div className="p-4 flex justify-between items-center">
            <div>
              {/* Có thể thêm các bộ lọc ở đây nếu cần */}
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select 
                  className="border rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Sắp xếp theo</option>
                  <option value="name">Tên</option>
                  <option value="date">Ngày đăng ký</option>
                </select>
              </div>
              
              <div className="relative border rounded-md">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  className="px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="px-4">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4"
                      checked={selectedItems.length === registeredUsers.length && registeredUsers.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KHÁCH HÀNG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    THỜI GIAN LÚC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ĐIỆN THOẠI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registeredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4"
                        checked={selectedItems.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src="/api/placeholder/40/40" 
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.registered_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="px-4 py-3 flex justify-between items-center border-t border-gray-200">
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
  );
};

export default RegisteredUsers;