import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import OrderDetail from './OrderDetail';

const OrderManagement = () => {
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sample order data
  const orderData = [
    {
      id: 49,
      paymentStatus: 'Đã thanh toán',
      orderStatus: 'ĐÃ XÁC NHẬN',
      orderDate: '16:1 12/7/2024',
      shippingFee: '25.000 đ',
      total: '205.000 đ'
    },
    {
      id: 48,
      paymentStatus: 'Đã thanh toán',
      orderStatus: 'THÀNH CÔNG',
      orderDate: '9:43 10/7/2024',
      shippingFee: '15.000 đ',
      total: '105.000 đ'
    },
    {
      id: 46,
      paymentStatus: 'Chưa thanh toán',
      orderStatus: 'CHỜ XÁC NHẬN',
      orderDate: '9:42 10/7/2024',
      shippingFee: '15.000 đ',
      total: '87.000 đ'
    },
    {
      id: 47,
      paymentStatus: 'Chưa thanh toán',
      orderStatus: 'CHỜ XÁC NHẬN',
      orderDate: '9:42 10/7/2024',
      shippingFee: '15.000 đ',
      total: '105.000 đ'
    },
    {
      id: 45,
      paymentStatus: 'Chưa thanh toán',
      orderStatus: 'CHỜ XÁC NHẬN',
      orderDate: '9:42 10/7/2024',
      shippingFee: '15.000 đ',
      total: '170.000 đ'
    }
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;
  const itemsCount = 21;

  // Filter states
  const [filter, setFilter] = useState({
    all: true,
    pending: false,
    confirmed: false,
    shipping: false,
    delivered: false,
    completed: false,
    cancelled: false
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter orders based on filter and search term
  const filteredOrders = orderData.filter(order => {
    const searchMatch = order.id.toString().includes(searchTerm) || 
                      order.orderDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      order.total.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter.all) return searchMatch;
    if (filter.pending && order.orderStatus === 'CHỜ XÁC NHẬN') return searchMatch;
    if (filter.confirmed && order.orderStatus === 'ĐÃ XÁC NHẬN') return searchMatch;
    if (filter.shipping && order.orderStatus === 'ĐANG VẬN CHUYỂN') return searchMatch;
    if (filter.delivered && order.orderStatus === 'ĐANG GIAO') return searchMatch;
    if (filter.completed && order.orderStatus === 'THÀNH CÔNG') return searchMatch;
    if (filter.cancelled && order.orderStatus === 'HỦY ĐƠN') return searchMatch;
    
    return false;
  });

  // Handle pagination
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Handle view order detail
  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  // Handle back from order detail
  const handleBackFromDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  // Get status class for display
  const getStatusClass = (status) => {
    switch(status) {
      case 'CHỜ XÁC NHẬN':
        return 'bg-yellow-500 text-white';
      case 'ĐÃ XÁC NHẬN':
        return 'bg-green-500 text-white';
      case 'ĐANG VẬN CHUYỂN':
        return 'bg-blue-500 text-white';
      case 'ĐANG GIAO':
        return 'bg-purple-500 text-white';
      case 'THÀNH CÔNG':
        return 'bg-green-500 text-white';
      case 'HỦY ĐƠN':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Get payment status class
  const getPaymentStatusClass = (status) => {
    return status === 'Đã thanh toán' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getPaymentStatusIcon = (status) => {
    return status === 'Đã thanh toán' 
      ? '●' 
      : '●';
  };

  return (
    <div className="flex-1 bg-gray-50">
      {showOrderDetail ? (
        <OrderDetail onBack={handleBackFromDetail} />
      ) : (
        <>
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex space-x-6 text-gray-600">
              <button 
                className={`${filter.all ? 'text-blue-600' : ''}`}
                onClick={() => setFilter({all: true, pending: false, confirmed: false, shipping: false, delivered: false, completed: false, cancelled: false})}
              >
                Tất cả ( 0 )
              </button>
              <button 
                className={`${filter.pending ? 'text-blue-600' : ''}`}
                onClick={() => setFilter({all: false, pending: true, confirmed: false, shipping: false, delivered: false, completed: false, cancelled: false})}
              >
                Chờ xác nhận ( 0 )
              </button>
              <button 
                className={`${filter.confirmed ? 'text-blue-600' : ''}`}
                onClick={() => setFilter({all: false, pending: false, confirmed: true, shipping: false, delivered: false, completed: false, cancelled: false})}
              >
                Đã xác nhận ( 0 )
              </button>
              <button 
                className={`${filter.shipping ? 'text-blue-600' : ''}`}
                onClick={() => setFilter({all: false, pending: false, confirmed: false, shipping: true, delivered: false, completed: false, cancelled: false})}
              >
                Đang vận chuyển ( 0 )
              </button>
              <button 
                className={`${filter.delivered ? 'text-blue-600' : ''}`}
                onClick={() => setFilter({all: false, pending: false, confirmed: false, shipping: false, delivered: true, completed: false, cancelled: false})}
              >
                Đang giao ( 0 )
              </button>
              <button 
                className={`${filter.completed ? 'text-blue-600' : ''}`}
                onClick={() => setFilter({all: false, pending: false, confirmed: false, shipping: false, delivered: false, completed: true, cancelled: false})}
              >
                Thành công ( 0 )
              </button>
              <button 
                className={`${filter.cancelled ? 'text-blue-600' : ''}`}
                onClick={() => setFilter({all: false, pending: false, confirmed: false, shipping: false, delivered: false, completed: false, cancelled: true})}
              >
                Hủy đơn ( 0 )
              </button>
            </div>
          </div>

          {/* Function bar */}
          <div className="flex justify-end items-center px-6 py-4">
            <div className="flex items-center">
              <div className="mr-4">
                <select className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                  <option>Sắp xếp theo</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          {/* Orders table */}
          <div className="px-6 pb-6">
            <div className="bg-white rounded-md shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Thanh toán
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Thời gian đặt hàng
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Phí giao hàng
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Tổng đơn hàng
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">
                        #{order.id}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 inline-flex items-center text-xs font-medium rounded-full ${getPaymentStatusClass(order.paymentStatus)}`}>
                          <span className="mr-1">{getPaymentStatusIcon(order.paymentStatus)}</span> 
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusClass(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {order.orderDate}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {order.shippingFee}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700 font-medium">
                        {order.total}
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          className="text-gray-500 hover:text-blue-600"
                          onClick={() => handleViewOrderDetail(order)}
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    className="p-2 border border-gray-300 rounded-md mr-2"
                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <button className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center mr-2">
                    1
                  </button>
                  
                  <button 
                    className="w-8 h-8 rounded-full text-gray-700 flex items-center justify-center mr-2"
                    onClick={() => goToPage(2)}
                  >
                    2
                  </button>
                  
                  <button 
                    className="w-8 h-8 rounded-full text-gray-700 flex items-center justify-center mr-2"
                    onClick={() => goToPage(3)}
                  >
                    3
                  </button>
                  
                  <button 
                    className="p-2 border border-gray-300 rounded-md"
                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="flex items-center text-sm text-gray-700">
                  <span>Trang 1 của 5</span>
                  <span className="mx-4">-</span>
                  <span>Hiển thị</span>
                  <select className="mx-2 border border-gray-300 rounded p-1">
                    <option>5</option>
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                  <span>/</span>
                  <span className="ml-2">21</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer links */}
          <div className="px-6 py-4 flex text-sm text-gray-500">
            <button className="mr-6 hover:text-gray-700">Các điều khoản và điểm kiểm</button>
            <button className="mr-6 hover:text-gray-700">Chính sách bảo mật</button>
            <button className="hover:text-gray-700">Hỗ trợ</button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderManagement;