import React, { useState } from 'react';
import { BarChart2, Package, Grid, ShoppingBag, Users, Truck, HelpCircle, Settings, ChevronDown, ArrowRight } from 'lucide-react';
import MainContent from './MainContent';


// Sidebar Component
const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const [expandedMenus, setExpandedMenus] = useState(['products']);
  
  const menuItems = [
    { id: 'dashboard', icon: <BarChart2 size={20} />, label: 'Bảng điều khiển', hasSubmenu: false },
    { id: 'products', icon: <Package size={20} />, label: 'Sản phẩm', hasSubmenu: true, submenus: [
      { id: 'productManagement', label: 'Quản lý sản phẩm' }
    ]},
    { id: 'categories', icon: <Grid size={20} />, label: 'Danh mục', hasSubmenu: true, submenus: [
      { id: 'allCategories', label: 'Tất cả danh mục' },
      { id: 'addCategory', label: 'Thêm mới danh mục' }
    ]},
    { id: 'brands', icon: <ShoppingBag size={20} />, label: 'Thương hiệu', hasSubmenu: true, submenus: [
      { id: 'brandList', label: 'Danh sách thương hiệu' },
      { id: 'addBrand', label: 'Thêm mới thương hiệu' }
    ]},
    { id: 'stores', icon: <ShoppingBag size={20} />, label: 'Cửa hàng', hasSubmenu: true, submenus: [
      { id: 'storeList', label: 'Danh sách cửa hàng' },
      { id: 'addStore', label: 'Thêm mới cửa hàng' }
    ]},
    { id: 'customers', icon: <Users size={20} />, label: 'Khách hàng', hasSubmenu: true, submenus: [
      { id: 'customerManagement', label: 'Quản lý khách hàng' }
    ]},
    { id: 'orders', icon: <Truck size={20} />, label: 'Đơn hàng', hasSubmenu: true, submenus: [
      { id: 'orderManagement', label: 'Tất cả đơn hàng' }
    ]},
    { id: 'support', icon: <HelpCircle size={20} />, label: 'Hỗ trợ', hasSubmenu: false },
    { id: 'settings', icon: <Settings size={20} />, label: 'Cài đặt', hasSubmenu: false },
  ];
  
  const toggleMenu = (menuId) => {
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== menuId));
    } else {
      setExpandedMenus([...expandedMenus, menuId]);
    }
  };

  return (
    <div className="h-screen bg-white border-r border-gray-200 overflow-y-auto px-6">
      
      <div className="px-4 py-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            <div 
              className={`flex items-center p-3 my-1 rounded-lg cursor-pointer ${activeMenu === item.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => {
                if (item.hasSubmenu) {
                  toggleMenu(item.id);
                } else {
                  setActiveMenu(item.id);
                }
              }}
            >
              <div className="mr-3 text-gray-500">
                {item.icon}
              </div>
              <span className="flex-grow font-medium text-gray-700">{item.label}</span>
              {item.hasSubmenu && (
                <ChevronDown size={18} className={`text-gray-400 transform transition-transform ${expandedMenus.includes(item.id) ? 'rotate-180' : ''}`} />
              )}
            </div>
            
            {/* Submenu items */}
            {item.hasSubmenu && item.submenus && expandedMenus.includes(item.id) && (
              <div className="ml-7 my-1">
                {item.submenus.map(submenu => (
                  <div
                    key={submenu.id}
                    className={`flex items-center p-2 pl-4 my-1 rounded-lg cursor-pointer ${activeMenu === submenu.id ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-50'}`}
                    onClick={() => setActiveMenu(submenu.id)}
                  >
                    <ArrowRight size={16} className="mr-2 text-gray-400" />
                    <span className={`text-sm ${activeMenu === submenu.id ? 'font-medium text-blue-600' : 'text-gray-600'}`}>
                      {submenu.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App Component
const TroocAdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <div className="flex h-screen">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <MainContent activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
    </div>
  );
};

export default TroocAdminDashboard;