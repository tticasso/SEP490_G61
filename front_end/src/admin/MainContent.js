import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProductManagement from './product/ProductManagement';
import CategoryManagement from './category/CategoryManagement';
import AddCategory from './category/AddCategory';
import Dashboard from './dashboard/Dashboard';
import BrandList from './brand/BrandList';
import AddBrand from './brand/AddBrand';
import StoreList from './store/StoreList';
import StoreDetail from './store/StoreDetail';
import CustomerManagement from './customer/CustomerManagement';
import OrderManagement from './order/OrderManagement';
import PaymentManagement from './payment/PaymentManagement';
import AddPayment from './payment/AddPayment';
import ShippingManagement from './shipping/ShippingManagement';
import AddShipping from './shipping/AddShipping';
import CouponManagement from './coupon/CouponManagement';
import AddCouponForm from './coupon/AddCoupon';
import EditCouponForm from './coupon/EditCoupon';
import logo from '../assets/logo.png'
import StoreRequestsPage from './store/StoreRequestsPage';

// Main Content Component
const MainContent = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div onClick={() => window.location.href ='/'} className="p-4 flex gap-2 items-center">
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
      <div className="flex-1">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/products" element={<ProductManagement />} />

          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/add-category" element={<AddCategory />} />

          <Route path="/brands" element={<BrandList />} />
          <Route path="/add-brand" element={<AddBrand />} />

          <Route path="/stores" element={<StoreList />} />
          <Route path="/store/:id" element={<StoreDetail onBack={() => navigate('/admin/stores')} />} />
          <Route path="/store-requests" element={<StoreRequestsPage />} />

          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/orders" element={<OrderManagement />} />

          {/* Updated coupon routes to use separate components */}
          <Route path="/coupons" element={<CouponManagement />} />
          <Route path="/add-coupon" element={<AddCouponForm />} />
          <Route path="/edit-coupon/:id" element={<EditCouponForm />} />

          <Route path="/shippings" element={<ShippingManagement />} />
          <Route path="/add-shipping" element={<AddShipping />} />

          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/add-payment" element={<AddPayment />} />

          <Route path="/support" element={<div className="p-6">Nội dung Hỗ trợ</div>} />
          <Route path="/settings" element={<div className="p-6">Nội dung Cài đặt</div>} />

          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainContent;