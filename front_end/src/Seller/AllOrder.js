import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Eye } from 'lucide-react';
import Sidebar from './Sidebar';

const AllOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Dữ liệu đơn hàng mẫu
  const orders = [
    {
      id: '#49',
      status: 'Chờ xác nhận',
      discount: 'Không',
      orderTime: '16:1 12/7/2024',
      total: '180.000 đ',
      statusClass: 'bg-green-500'
    },
    {
      id: '#48',
      status: 'Thành công',
      discount: 'Không',
      orderTime: '9:43 10/7/2024',
      total: '90.000 đ',
      statusClass: 'bg-green-500'
    },
    {
      id: '#47',
      status: 'Chờ xác nhận',
      discount: 'Không',
      orderTime: '9:42 10/7/2024',
      total: '90.000 đ',
      statusClass: 'bg-green-500'
    },
    {
      id: '#39',
      status: 'Đang vận chuyển',
      discount: 'Không',
      orderTime: '21:1 3/7/2024',
      total: '59.640 đ',
      statusClass: 'bg-green-500'
    },
    {
      id: '#38',
      status: 'Chờ xác nhận',
      discount: 'Không',
      orderTime: '9:55 30/6/2024',
      total: '239.360 đ',
      statusClass: 'bg-green-500'
    }
  ];

  // Xử lý toggle chọn tất cả
  const toggleSelectAll = () => {
    if (selectedOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  // Xử lý toggle chọn một đơn hàng
  const toggleOrderSelection = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Xử lý xem chi tiết đơn hàng
  const handleViewOrder = (orderId) => {
    // Có thể cài đặt sau để chuyển hướng đến trang chi tiết đơn hàng
    alert(`Xem chi tiết đơn hàng ${orderId}`);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Header và công cụ tìm kiếm */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Đơn hàng</h1>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="border rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Bảng dữ liệu đơn hàng */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-white border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    MÃ ĐƠN HÀNG
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    TRẠNG THÁI
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    GIẢM GIÁ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    THỜI GIAN ĐẶT HÀNG
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    TỔNG ĐƠN HÀNG
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                    THAO TÁC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${order.statusClass}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.discount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Phân trang */}
            <div className="px-6 py-3 flex justify-between items-center border-t border-gray-200">
              <div className="flex items-center">
                <button className="mr-2 p-1 rounded-full border w-8 h-8 flex items-center justify-center">
                  <ArrowLeft size={16} />
                </button>
                <button className="mr-2 p-1 rounded-full bg-pink-500 text-white w-8 h-8 flex items-center justify-center">
                  1
                </button>
                <button className="p-1 rounded-full border w-8 h-8 flex items-center justify-center">
                  <ArrowLeft size={16} className="rotate-180" />
                </button>
              </div>
              
              <div className="flex items-center text-sm">
                <span>Trang 1 của 1</span>
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

export default AllOrders;