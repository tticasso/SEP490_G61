import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  Store,
  Star, // Thêm icon Star cho phần đánh giá và phản hồi
  BarChart2, // Icon cho thống kê doanh thu
  DollarSign, // Icon thay thế cho doanh thu
  Landmark // Icon cho quản lý tài khoản ngân hàng
} from 'lucide-react';

const Sidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mở rộng menu sản phẩm theo mặc định khi đang ở các trang con của nó
  const isInProductSection = location.pathname.includes('/product') || 
                            location.pathname.includes('/add-product') || 
                            location.pathname.includes('/discount-product');
                            
  const isInPromotionSection = location.pathname.includes('/discounts') || 
                              location.pathname.includes('/create-discount-code');
  
  const isInInventorySection = location.pathname.includes('/inventory');
  
  const isInReviewSection = location.pathname.includes('/reviews') ||
                           location.pathname.includes('/feedback');
  
  const [openMenu, setOpenMenu] = useState(
    isInProductSection ? 'Sản phẩm' : 
    isInPromotionSection ? 'Khuyến mại' : 
    isInInventorySection ? 'Quản lý kho hàng' : 
    isInReviewSection ? 'Đánh giá & Phản hồi' : null
  );

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleNavigation = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    // Thêm mục "Cửa hàng của tôi" vào đầu danh sách
    { 
      icon: <Store className="mr-3 text-gray-500" />, 
      label: 'Cửa hàng của tôi', 
      path: '/seller-dashboard/my-shop',
      expandable: false
    },
    // Thêm mục thống kê doanh thu
    {
      icon: <DollarSign className="mr-3 text-gray-500" />,
      label: 'Thống kê doanh thu',
      path: '/seller-dashboard/revenue',
      expandable: false
    },
    // Thêm mục quản lý tài khoản ngân hàng
    {
      icon: <Landmark className="mr-3 text-gray-500" />,
      label: 'Tài khoản ngân hàng',
      path: '/seller-dashboard/bank-account',
      expandable: false
    },
    { 
      icon: <Package className="mr-3 text-gray-500" />, 
      label: 'Sản phẩm',
      expandable: true,
      subItems: [
        { label: 'Tất cả sản phẩm', path: '/seller-dashboard/product' },
        // { label: 'Thêm mới sản phẩm', path: '/seller-dashboard/add-product' },
        // { label: 'Giảm giá sản phẩm', path: '/seller-dashboard/discount-product' },
      ]
    },
    { 
      icon: <Package className="mr-3 text-gray-500" />, 
      label: 'Khuyến mại',
      expandable: true,
      subItems: [
        { label: 'Tất cả khuyến mại', path: '/seller-dashboard/discounts' },
        // { label: 'Tạo mã giảm giá', path: '/seller-dashboard/add-discount' }
      ]
    },
    // { 
    //   icon: <Package className="mr-3 text-gray-500" />, 
    //   label: 'Quản lý kho hàng', 
    //   expandable: true,
    //   subItems: [
    //     { label: 'Thống kê hàng tồn kho', path: '/seller-dashboard/inventory-stock' },
    //     { label: 'Lịch sử nhập hàng', path: '/seller-dashboard/import-history' },
    //     { label: 'Lịch sử xuất hàng', path: '/seller-dashboard/export-history' },
    //     { label: 'Nhập thêm hàng', path: '/seller-dashboard/create-import' }
    //   ]
    // },
    { 
      icon: <Users className="mr-3 text-gray-500" />, 
      label: 'Khách hàng',
      expandable: true,
      subItems: [
        { label: 'Khách hàng đăng ký', path: '/seller-dashboard/registed-user' },
        
      ]
    },
    // Thêm mục "Đánh giá & Phản hồi" sau phần Khách hàng
    { 
      icon: <Star className="mr-3 text-gray-500" />, 
      label: 'Đánh giá & Phản hồi',
      expandable: true,
      subItems: [
        { label: 'Tất cả đánh giá', path: '/seller-dashboard/reviews' },
      ]
    },
    { 
      icon: <ShoppingCart className="mr-3 text-gray-500" />, 
      label: 'Đơn hàng',
      expandable: true,
      subItems: [
        { label: 'Tất cả đơn hàng', path: '/seller-dashboard/orders' }
      ]
    },
    { icon: <HelpCircle className="mr-3 text-gray-500" />, label: 'Hỗ trợ', path: '/seller-dashboard/support' },
    { icon: <Settings className="mr-3 text-gray-500" />, label: 'Cài đặt', path: '/seller-dashboard/settings' }
  ];

  return (
    <div className="bg-white border-r w-64 h-full flex-shrink-0">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => handleNavigation('/seller-dashboard')}>
          Bảng điều khiển
        </h1>
      </div>
      <nav className="overflow-y-auto h-[calc(100%-64px)]">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.expandable ? (
                <div>
                  <div 
                    className={`flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 ${
                      (item.path && isActive(item.path)) || 
                      (item.subItems && item.subItems.some(subItem => isActive(subItem.path))) 
                        ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleMenu(item.label)}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="text-gray-700">{item.label}</span>
                    </div>
                    {openMenu === item.label 
                      ? <ChevronDown size={20} className="text-gray-500" /> 
                      : <ChevronRight size={20} className="text-gray-500" />
                    }
                  </div>
                  
                  {openMenu === item.label && (
                    <ul className="border-t">
                      {item.subItems.map((subItem, subIndex) => (
                        <li 
                          key={subIndex} 
                          className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${
                            isActive(subItem.path) ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNavigation(subItem.path)}
                        >
                          <span className="pl-10 text-gray-700">{subItem.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div 
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
                    isActive(item.path) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.icon}
                  <span className={`${item.path === '/shop/my-shop' ? 'text-purple-700 font-medium' : 'text-gray-700'}`}>{item.label}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;