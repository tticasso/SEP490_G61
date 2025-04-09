import { useEffect } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import Homepage from "./pages/Home/Homepage";
import LoginPage from "./pages/Login/Login";
import RegisterPage from "./pages/Register/Register";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import ShopDetail from "./pages/ShopDetail/ShopDetail";
import UserProfile from "./pages/UserProfile/UserProfile";
import Categories from "./pages/Categories/Categories";
import Cart from "./pages/cart/Cart";
import CheckoutPage from "./pages/checkout/Checkout";
import SellerDashboard from "./Seller/SellerDashboard";
import ProductList from "./Seller/ProductList";
import AddProduct from "./Seller/AddProduct";
import DiscountProducts from "./Seller/DiscountProduct";
import AddDiscount from "./Seller/AddDiscount";
import AllDiscounts from "./Seller/AllDiscount";
import InventoryStock from "./Seller/InventoryStock";
import ImportHistory from "./Seller/ImportHistory";
import AddStock from "./Seller/AddStock";
import RegisteredUsers from "./Seller/RegistedUser";
import AllOrders from "./Seller/AllOrder";
import ShopRegistration from "./sellerRegistration/ShopRegistration";
import ForgotPassword from './forgotPassword/ForgotPassword';
import ResetPassword from './forgotPassword/ResetPassword';
import AdminLayout from './admin/AdminLayout';
import ChatBot from './chatbot/ChatBot';
import StoreRequestsPage from './admin/store/StoreRequestsPage';
import { AuthProvider } from './pages/Login/context/AuthContext';
import ProtectedRoute, { AdminRoute, SellerRoute } from './route/ProtectedRoute';
import MyShop from './Seller/MyShop';
import OrderConfirmation from './pages/orderConfirm/OrderConfirmation';
import PaymentCallback from './pages/checkout/payment/PaymentCallback';
import MessageBubble from './pages/UserProfile/components/messageBubble';

import SellerSettings from './Seller/SellerChangePassword';
import ProductReviews from './Seller/ProductReview';
import ReviewDetail from './Seller/ReviewDetails';
import ShopRevenueDashboard from './Seller/ShopRevenueDashboard';

function App() {
  const location = useLocation();

  const noHeaderPaths = ['/register', '/login', '/admin', '/forgot-password', '/reset-password'];
  const noHeaderPage = noHeaderPaths.includes(location.pathname) || location.pathname.startsWith('/admin/');

  return (
    <div className="font-bold">
      <AuthProvider>
        {!noHeaderPage && <Header />}
        <Routes>
          {/* Public routes - accessible to everyone */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/product-detail" element={<ProductDetail />} />
          <Route path="/shop-detail" element={<ShopDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/shop-registration" element={<ShopRegistration />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />

          {/* Protected routes - require authentication */}
          <Route path="/user-profile/*" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/order-confirmation" element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />

          {/* Admin routes - require admin role */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          } />

          {/* Seller routes - require seller/mod role */}
          <Route path="/seller-dashboard" element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/product" element={
            <SellerRoute>
              <ProductList />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/add-product" element={
            <SellerRoute>
              <AddProduct />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/discount-product" element={
            <SellerRoute>
              <DiscountProducts />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/add-discount" element={
            <SellerRoute>
              <AddDiscount />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/discounts" element={
            <SellerRoute>
              <AllDiscounts />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/inventory-stock" element={
            <SellerRoute>
              <InventoryStock />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/import-history" element={
            <SellerRoute>
              <ImportHistory />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/create-import" element={
            <SellerRoute>
              <AddStock />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/registed-user" element={
            <SellerRoute>
              <RegisteredUsers />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/orders" element={
            <SellerRoute>
              <AllOrders />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/my-shop" element={
            <SellerRoute>
              <MyShop />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/settings" element={
            <SellerRoute>
              <SellerSettings />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/reviews" element={
            <SellerRoute>
              <ProductReviews />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/reviews/:id" element={
            <SellerRoute>
              <ReviewDetail />
            </SellerRoute>
          } />
          <Route path="/seller-dashboard/revenue" element={
            <SellerRoute>
              <ShopRevenueDashboard />
            </SellerRoute>
          } />

          {/* Catch-all route for 404 pages */}
          <Route path="*" element={<div className="text-center p-20">Page not found</div>} />
        </Routes>
        {!noHeaderPage && <Footer />}
        <ChatBot />
        {<MessageBubble />}
      </AuthProvider>
    </div>
  );
}

export default App;