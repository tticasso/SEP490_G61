import React, { useState, useEffect } from 'react';
import { CircleX } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import CartItem from './CartItems';
import dongho from '../../assets/dongho.png';

const CartModal = ({ isOpen, onClose, refreshTrigger = 0 }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Lấy user_id từ thông tin người dùng đã đăng nhập
    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || "";

    // Làm mới dữ liệu giỏ hàng khi modal mở hoặc refreshTrigger thay đổi
    useEffect(() => {
        if (isOpen && userId) {
            fetchCartData();
        } else if (isOpen) {
            setLoading(false);
            setError('Vui lòng đăng nhập để xem giỏ hàng');
        }
    }, [isOpen, userId, refreshTrigger]); // Thêm refreshTrigger vào dependencies

    const fetchCartData = async () => {
        try {
            setLoading(true);
            console.log('Fetching cart data...'); // Debug log
            // Thêm timestamp để tránh cache
            const response = await ApiService.get(`/cart/user/${userId}?_t=${Date.now()}`);
            if (response && response.items) {
                console.log('Cart items received:', response.items.length); // Debug log
                setCartItems(response.items);
            } else {
                console.log('No cart items or empty response'); // Debug log
                setCartItems([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart data:', error);
            setError('Không thể tải dữ liệu giỏ hàng');
            setLoading(false);
        }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        
        try {
            // Gọi API cập nhật số lượng
            await ApiService.put('/cart/update-item', {
                cart_item_id: cartItemId,
                quantity: newQuantity
            });
            
            // Cập nhật state local
            setCartItems(cartItems.map(item => 
                item._id === cartItemId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (error) {
            console.error('Error updating item quantity:', error);
            alert('Không thể cập nhật số lượng sản phẩm');
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            // Gọi API xóa sản phẩm
            await ApiService.delete(`/cart/remove-item/${cartItemId}`);
            
            // Cập nhật state local
            setCartItems(cartItems.filter(item => item._id !== cartItemId));
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Không thể xóa sản phẩm');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            // Kiểm tra xem product_id có phải là object có price không
            const price = item.product_id && typeof item.product_id === 'object' 
                ? (item.product_id.discounted_price || item.product_id.price) 
                : 0;
            return total + price * item.quantity;
        }, 0);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-50 
            transition-transform duration-300 ease-in-out transform translate-x-0"
        >
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Giỏ Hàng</h2>
                <button onClick={onClose} className="text-gray-500">
                    <CircleX size={20} />
                </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                {loading ? (
                    <div className="text-center py-4">Đang tải...</div>
                ) : error ? (
                    <div className="text-center py-4 text-red-500">{error}</div>
                ) : !userId ? (
                    <div className="text-center py-4">
                        <p className="mb-4">Vui lòng đăng nhập để xem giỏ hàng</p>
                        <button 
                            onClick={() => window.location.href = "/login"}
                            className="bg-purple-600 text-white px-4 py-2 rounded"
                        >
                            Đăng nhập
                        </button>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="text-center py-4">Giỏ hàng trống</div>
                ) : (
                    cartItems.map((item) => (
                        <CartItem 
                            key={item._id} 
                            item={item} 
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeItem}
                        />
                    ))
                )}
            </div>

            {userId && cartItems.length > 0 && (
                <div className="p-4 border-t">
                    <div className="flex justify-between mb-2">
                        <span>Tạm tính</span>
                        <span className="font-bold">{calculateTotal().toLocaleString()} đ</span>
                    </div>
                    <button
                        onClick={() => window.location.href = "/cart"}
                        className="w-full bg-purple-600 text-white py-2 rounded mt-2 
                        hover:bg-purple-700 transition-colors"
                    >
                        Xem Giỏ Hàng
                    </button>
                </div>
            )}
            
            {/* Nút làm mới thủ công */}
            <button 
                onClick={fetchCartData}
                className="absolute bottom-4 left-4 text-sm text-purple-600 hover:text-purple-800"
            >
                Làm mới giỏ hàng
            </button>
        </div>
    );
};

export default CartModal;