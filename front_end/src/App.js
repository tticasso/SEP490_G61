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
import TroocAdminDashboard from "./admin/Sidebar";
import ShopRegistration from "./sellerRegistration/ShopRegistration";
import ForgotPassword from './forgotPassword/ForgotPassword';
import ResetPassword from './forgotPassword/ResetPassword';

function useGoogleAuth() {
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      // Lưu token vào localStorage
      localStorage.setItem('user', JSON.stringify({ accessToken: token }));
      // Xóa token khỏi URL để bảo mật
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);
}

function App() {
  useGoogleAuth();
  const location = useLocation();

 // Xử lý đăng nhập Google - đơn giản hóa
 useEffect(() => {
  // Kiểm tra xem có dữ liệu đăng nhập Google không
  const params = new URLSearchParams(location.search);
  const googleAuthData = params.get('googleAuth');
  
  if (googleAuthData) {
    try {
      console.log('Nhận được dữ liệu googleAuth:', googleAuthData);
      console.log('URL hiện tại:', window.location.href);
  console.log('Params:', location.search);
      // Giải mã dữ liệu nhận được
      const userData = JSON.parse(decodeURIComponent(googleAuthData));
      console.log('Đã parse dữ liệu người dùng:', userData);
      
      // Lưu dữ liệu người dùng vào localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Đã lưu dữ liệu vào localStorage');
      
      // Xóa thông tin khỏi URL để bảo mật
      window.history.replaceState({}, document.title, '/');
      
      // Tải lại trang để cập nhật trạng thái đăng nhập
      window.location.href = '/';
    } catch (error) {
      console.error('Lỗi xử lý dữ liệu đăng nhập Google:', error);
    }
  }
}, [location.search]); 

  const noHeaderPaths = ['/register', '/login', '/admin', '/forgot-password', '/reset-password'];
  const noHeaderPage = noHeaderPaths.includes(location.pathname) || location.pathname.startsWith('/admin/');

  return (
    <div className="font-bold">
      {!noHeaderPage && <Header />}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/shop-detail" element={<ShopDetail />} />
        <Route path="/user-profile/*" element={<UserProfile />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        {/* Routes cho seller dashboard */}
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/seller-dashboard/product" element={<ProductList />} />
        <Route path="/seller-dashboard/add-product" element={<AddProduct />} />
        <Route path="/seller-dashboard/discount-product" element={<DiscountProducts />} />
        <Route path="/seller-dashboard/discount-product/add-discount" element={<AddDiscount />} />
        <Route path="/seller-dashboard/discounts" element={<AllDiscounts />} />


        {/* Routes cho quản lý kho hàng  của seller*/}
        <Route path="/seller-dashboard/inventory-stock" element={<InventoryStock />} />
        <Route path="/seller-dashboard/import-history" element={<ImportHistory />} />
        <Route path="/seller-dashboard/create-import" element={<AddStock />} />

        {/* /Routes cho quản lí khách hàng của seller */}
        <Route path="/seller-dashboard/registed-user" element={<RegisteredUsers />} />
        {/* Routes cho quản lí order của seller */}
        <Route path="/seller-dashboard/orders" element={<AllOrders />} />
        {/* Admin routers */}
        <Route path="/admin" element={<TroocAdminDashboard />} />
        <Route path="/shop-registration" element={<ShopRegistration />} />

      </Routes>
      {!noHeaderPage && <Footer />}
    </div>
  );
}

export default App;