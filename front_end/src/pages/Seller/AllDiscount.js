import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Search,
  ChevronDown,
  ChevronRight,
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  HelpCircle,
  Copy,
  Plus
} from 'lucide-react';

const AllDiscounts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sidebar state
  const [openMenu, setOpenMenu] = useState('Khuyến mại');
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Discount data
  const discounts = [
    {
      id: 1,
      name: 'Siêu sale ngày 30/6 giảm 11k cho tất cả sản phẩm',
      code: '31UIZT9AJP',
      type: 'products',
      value: '-11.000 đ',
      status: 'Hết hạn',
      usageCount: 0
    },
    {
      id: 2,
      name: 'Giảm giá sốc 30/6 giảm đến 22%',
      code: 'UKYAWDHIBV',
      type: 'products',
      value: '-22 %',
      status: 'Hết hạn',
      usageCount: 0
    }
  ];
  
  // Filtered discounts based on search
  const filteredDiscounts = discounts.filter(discount => 
    discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sidebar menu items
  const menuItems = [
    { 
      icon: <Package className="mr-3 text-gray-500" />, 
      label: 'Sản phẩm',
      subItems: [
        { label: 'Tất cả sản phẩm', path: '/seller-dashboard/product' },
        { label: 'Thêm mới sản phẩm', path: '/seller-dashboard/add-product' },
        { label: 'Giảm giá sản phẩm', path: '/seller-dashboard/discount-product' },
        { label: 'Danh sách biến thể', path: '/seller-dashboard/variants' }
      ]
    },
    { 
      icon: <Package className="mr-3 text-gray-500" />, 
      label: 'Khuyến mại',
      subItems: [
        { label: 'Tất cả khuyến mại', path: '/seller-dashboard/discounts' },
        { label: 'Tạo mã giảm giá', path: '/seller-dashboard/create-discount-code' }
      ]
    },
    { icon: <Package className="mr-3 text-gray-500" />, label: 'Quản lý kho hàng', path: '/seller-dashboard/inventory' },
    { icon: <Users className="mr-3 text-gray-500" />, label: 'Khách hàng', path: '/seller-dashboard/customers' },
    { icon: <ShoppingCart className="mr-3 text-gray-500" />, label: 'Đơn hàng', path: '/seller-dashboard/orders' },
    { icon: <HelpCircle className="mr-3 text-gray-500" />, label: 'Hỗ trợ', path: '/seller-dashboard/support' },
    { icon: <Settings className="mr-3 text-gray-500" />, label: 'Cài đặt', path: '/seller-dashboard/settings' }
  ];

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const toggleDiscountSelection = (discountId) => {
    if (selectedDiscounts.includes(discountId)) {
      setSelectedDiscounts(selectedDiscounts.filter(id => id !== discountId));
    } else {
      setSelectedDiscounts([...selectedDiscounts, discountId]);
    }
  };
  
  const toggleAllDiscounts = () => {
    if (selectedDiscounts.length === filteredDiscounts.length) {
      setSelectedDiscounts([]);
    } else {
      setSelectedDiscounts(filteredDiscounts.map(discount => discount.id));
    }
  };
  
  const handleCreateDiscount = () => {
    navigate('/seller-dashboard/create-discount-code');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex-shrink-0 overflow-y-auto">
        <h1 
          className="text-xl font-bold p-4 cursor-pointer"
          onClick={() => navigate('/seller-dashboard')}
        >
          Bảng điều khiển
        </h1>
        <nav className="overflow-y-auto">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <div 
                  className={`flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 ${
                    (item.path && isActive(item.path)) || 
                    (item.subItems && item.subItems.some(subItem => isActive(subItem.path))) 
                      ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (item.subItems) {
                      toggleMenu(item.label);
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                  {item.subItems && (
                    openMenu === item.label 
                      ? <ChevronDown size={20} className="text-gray-500" /> 
                      : <ChevronRight size={20} className="text-gray-500" />
                  )}
                </div>
                
                {item.subItems && openMenu === item.label && (
                  <ul className="border-t">
                    {item.subItems.map((subItem, subIndex) => (
                      <li 
                        key={subIndex} 
                        className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                          isActive(subItem.path) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => navigate(subItem.path)}
                      >
                        <span className="pl-10 text-gray-700">{subItem.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-100 min-h-screen">
          {/* Function bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-600">
              Chức năng: <span className="text-red-500">Thêm vô thùng rác (0)</span>
            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <div className="flex items-center border rounded p-2 bg-white">
                  <select className="outline-none bg-transparent">
                    <option>Sắp xếp theo</option>
                    <option>Tên khuyến mãi</option>
                    <option>Mã khuyến mãi</option>
                    <option>Ngày tạo</option>
                  </select>
                </div>
              </div>
              <div className="relative">
                <div className="flex items-center border rounded p-2 bg-white">
                  <Search size={18} className="text-gray-400 mr-2" />
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

          {/* Discounts Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4" 
                      checked={selectedDiscounts.length === filteredDiscounts.length && filteredDiscounts.length > 0}
                      onChange={toggleAllDiscounts}
                    />
                  </th>
                  <th className="p-4 text-left">TÊN KHUYẾN MÃI</th>
                  <th className="p-4 text-left">MÃ KHUYẾN MÃI</th>
                  <th className="p-4 text-left">LOẠI KHUYẾN MÃI</th>
                  <th className="p-4 text-left">GIÁ TRỊ</th>
                  <th className="p-4 text-left">TRẠNG THÁI</th>
                  <th className="p-4 text-left">ĐÃ SỬ DỤNG</th>
                  <th className="p-4 text-center">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4"
                        checked={selectedDiscounts.includes(discount.id)}
                        onChange={() => toggleDiscountSelection(discount.id)}
                      />
                    </td>
                    <td className="p-4">{discount.name}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="bg-red-50 text-red-500 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                          <Package size={12} />
                        </div>
                        <span>{discount.code}</span>
                        <Copy size={16} className="ml-2 text-gray-400 cursor-pointer" />
                      </div>
                    </td>
                    <td className="p-4">{discount.type}</td>
                    <td className="p-4">{discount.value}</td>
                    <td className="p-4">
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                        {discount.status}
                      </span>
                    </td>
                    <td className="p-4">{discount.usageCount}</td>
                    <td className="p-4">
                      <div className="flex justify-center space-x-4">
                        <Edit size={18} className="text-gray-500 cursor-pointer" />
                        <div className="text-gray-300">|</div>
                        <Trash2 size={18} className="text-red-500 cursor-pointer" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
              <div className="flex items-center">
                <button className="mr-2 p-1 rounded-full border w-8 h-8 flex items-center justify-center">
                  <ChevronRight className="rotate-180" size={16} />
                </button>
                <button className="mr-2 p-1 rounded-full bg-red-500 text-white w-8 h-8 flex items-center justify-center">
                  1
                </button>
                <button className="mr-2 p-1 rounded-full border w-8 h-8 flex items-center justify-center">
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex items-center text-sm">
                <span>Trang 1 của 1</span>
                <span className="mx-4">-</span>
                <span>Hiển thị</span>
                <select className="mx-2 border rounded p-1">
                  <option>5</option>
                  <option>10</option>
                  <option>20</option>
                </select>
                <span>/</span>
                <span className="ml-2">0 Sản phẩm</span>
              </div>
            </div>
          </div>
          
          {/* Floating Add Button */}
          <button
            className="fixed bottom-8 right-8 bg-red-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-red-600"
            onClick={handleCreateDiscount}
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllDiscounts;