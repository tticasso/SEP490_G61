import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import SellerDashboard from "./pages/Seller/SellerDashboard";
import ProductList from "./pages/Seller/ProductList";
import AddProduct from "./pages/Seller/AddProduct";
import DiscountProducts from "./pages/Seller/DiscountProduct";
import AddDiscount from "./pages/Seller/AddDiscount";
import AllDiscounts from "./pages/Seller/AllDiscount";



function App() {
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  return (
    <div className="font-bold">
      {!isLoginPage && !isRegisterPage && <Header />} 
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/product-detail" element={<ProductDetail />} />
          <Route path="/shop-detail" element={<ShopDetail />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/seller-dashboard/product" element={<ProductList />} />
          <Route path="/seller-dashboard/add-product" element={<AddProduct />} />
          <Route path="/seller-dashboard/discount-product" element={<DiscountProducts />} />
          <Route path="/seller-dashboard/discount-product/add-discount" element={<AddDiscount />} />
          <Route path="/seller-dashboard/discounts" element={<AllDiscounts />} />
          
        </Routes>
        <Footer/>
    </div>
  );
}

export default App;