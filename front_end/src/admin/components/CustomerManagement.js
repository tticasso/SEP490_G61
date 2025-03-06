import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CustomerManagement = () => {
  // Sample customer data
  const customerData = [
    {
      id: 1,
      name: 'vu dinh',
      avatar: null,
      email: 'vuvandinh2031@gmail.com',
      orders: 0,
      lastActivity: '22:43 29/6/2024'
    },
    {
      id: 2,
      name: 'Vũ Đình',
      avatar: '/api/placeholder/50/50',
      email: 'vuvandinh203@gmail.com',
      orders: 11,
      lastActivity: '22:43 29/6/2024'
    },
    {
      id: 3,
      name: 'Bùi Thị Hồng Thơm',
      avatar: null,
      email: 'thomhong102003@gmail.com',
      orders: 0,
      lastActivity: '22:43 29/6/2024'
    },
    {
      id: 4,
      name: 'Hồng Oanh',
      avatar: null,
      email: 'oanhoanh@gmail.com',
      orders: 0,
      lastActivity: '22:43 29/6/2024'
    },
    {
      id: 5,
      name: 'đinh vũ',
      avatar: null,
      email: 'thomcute2810@gmail.com',
      orders: 8,
      lastActivity: '9:2 30/6/2024'
    }
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;

  // Filter states
  const [filter, setFilter] = useState({
    all: true,
    visible: false,
    imported: false,
    trash: false
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter customers based on search term
  const filteredCustomers = customerData.filter(customer => {
    return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle pagination
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Handle view customer detail
  const handleViewCustomerDetail = (customer) => {
    console.log("View customer details:", customer);
    // We would navigate to a customer detail page or open a modal here
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex space-x-6 text-gray-600">
          <button 
            className={`${filter.all ? 'text-blue-600' : ''}`}
            onClick={() => setFilter({all: true, visible: false, imported: false, trash: false})}
          >
            Tất cả ( 0 )
          </button>
          <button 
            className={`${filter.visible ? 'text-blue-600' : ''}`}
            onClick={() => setFilter({all: false, visible: true, imported: false, trash: false})}
          >
            Hiển thị ( 0 )
          </button>
          <button 
            className={`${filter.imported ? 'text-blue-600' : ''}`}
            onClick={() => setFilter({all: false, visible: false, imported: true, trash: false})}
          >
            Nhập ( 0 )
          </button>
          <button 
            className={`${filter.trash ? 'text-blue-600' : ''}`}
            onClick={() => setFilter({all: false, visible: false, imported: false, trash: true})}
          >
            Thùng rác ( 0 )
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

      {/* Customers table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-md shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Họ và tên
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Tham gia
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="h-10 w-10 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-500 font-medium">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span 
                        className="text-sm text-gray-900 hover:text-blue-600 cursor-pointer"
                        onClick={() => handleViewCustomerDetail(customer)}
                      >
                        {customer.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">{customer.email}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{customer.orders}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{customer.lastActivity}</td>
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
                className="p-2 border border-gray-300 rounded-md"
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="flex items-center text-sm text-gray-700">
              <span>Trang 1 của 2</span>
              <span className="mx-4">-</span>
              <span>Hiển thị</span>
              <select className="mx-2 border border-gray-300 rounded p-1">
                <option>5</option>
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
              <span>/</span>
              <span className="ml-2">8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;