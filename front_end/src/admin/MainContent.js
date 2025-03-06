import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import ProductManagement from './components/ProductManagement';
import CategoryManagement from './components/CategoryManagement';
import AddCategory from './components/AddCategory';
import Dashboard from './components/Dashboard';
import BrandList from './components/BrandList';
import AddBrand from './components/AddBrand';
import StoreList from './components/StoreList';
import StoreDetail from './components/StoreDetail';
import CustomerManagement from './components/CustomerManagement';
import OrderManagement from './components/OrderManagement';
import logo from '../assets/logo.png'

// Main Content Component
const MainContent = ({ activeMenu, setActiveMenu }) => {

  // Render content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <div className="p-6">Nội dung Sản phẩm</div>;
      case 'productManagement':
        return <ProductManagement />;
      case 'categories':
        return <div className="p-6">Nội dung Danh mục</div>;
      case 'allCategories':
        return <CategoryManagement />;
      case 'addCategory':
        return <AddCategory />;
      case 'brands':
        return <div className="p-6">Nội dung Thương hiệu</div>;
      case 'brandList':
        return <BrandList />;
      case 'addBrand':
        return <AddBrand />;
      case 'storeDetail':
        return <StoreDetail onBack={() => setActiveMenu('storeList')} />;
      case 'stores':
        return <div className="p-6">Nội dung Cửa hàng</div>;
      case 'storeList':
        return <StoreList />;
      case 'customers':
        return <div className="p-6">Nội dung Khách hàng</div>;
      case 'customerManagement':
        return <CustomerManagement />;
      case 'orders':
        return <div className="p-6">Nội dung Đơn hàng</div>;
      case 'orderManagement':
        return <OrderManagement />;
      case 'support':
        return <div className="p-6">Nội dung Hỗ trợ</div>;
      case 'settings':
        return <div className="p-6">Nội dung Cài đặt</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}

      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="p-4 flex gap-2 items-center">
          <img src={logo} alt="VVDShop Logo" className="h-10" />
          <p>TROOC2HAND</p>
        </div>
        <div className="relative w-3/5">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <div className="flex items-center">
          <div className="mr-4 flex items-center">
            <span className="mr-2">Việt Nam</span>
            <ChevronDown size={16} />
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {/* User profile picture or initials */}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {renderContent()}
    </div>
  );
};

export default MainContent;