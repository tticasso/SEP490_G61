import React, { useState, useEffect } from 'react';
import { CircleX, ShoppingCart, Info } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import CartItem from './CartItems';
import { CartEventBus } from './CartEventBus';

const CartModal = ({ isOpen, onClose, refreshTrigger = 0 }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartTotal, setCartTotal] = useState(0);

    // Lấy user_id từ thông tin người dùng đã đăng nhập
    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || "";

    // Subscribe vào CartEventBus để cập nhật khi có thay đổi
    useEffect(() => {
        const unsubscribe = CartEventBus.subscribe('cartUpdated', () => {
            if (isOpen && userId) {
                fetchCartData();
            }
        });

        return () => unsubscribe();
    }, [isOpen, userId]);

    // Làm mới dữ liệu giỏ hàng khi modal mở hoặc refreshTrigger thay đổi
    useEffect(() => {
        if (isOpen && userId) {
            fetchCartData();
        } else if (isOpen) {
            setLoading(false);
            setError('Vui lòng đăng nhập để xem giỏ hàng');
        }
    }, [isOpen, userId, refreshTrigger]);

    const fetchCartData = async () => {
        try {
            setLoading(true);
            // Thêm timestamp để tránh cache
            const response = await ApiService.get(`/cart/user/${userId}?_t=${Date.now()}`);
            if (response && response.items) {
                setCartItems(response.items);
                calculateTotal(response.items);
            } else {
                setCartItems([]);
                setCartTotal(0);
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
            // Kiểm tra tồn kho của biến thể trước khi cập nhật
            const currentItem = cartItems.find(item => item._id === cartItemId);
            
            if (currentItem && currentItem.variant_id) {
                // Nếu variant_id là object và có thông tin stock
                if (typeof currentItem.variant_id === 'object' && currentItem.variant_id.stock !== undefined) {
                    if (newQuantity > currentItem.variant_id.stock) {
                        alert(`Chỉ còn ${currentItem.variant_id.stock} sản phẩm trong kho`);
                        return;
                    }
                } else {
                    // Nếu chỉ có variant_id string, cần fetch thông tin
                    const productId = typeof currentItem.product_id === 'object' 
                        ? currentItem.product_id._id 
                        : currentItem.product_id;
                    
                    const variantId = typeof currentItem.variant_id === 'object'
                        ? currentItem.variant_id._id
                        : currentItem.variant_id;
                    
                    if (productId && variantId) {
                        const variants = await ApiService.get(`/product-variant/product/${productId}`, false);
                        const variant = variants.find(v => v._id === variantId);
                        
                        if (variant && variant.stock !== undefined && newQuantity > variant.stock) {
                            alert(`Chỉ còn ${variant.stock} sản phẩm trong kho`);
                            return;
                        }
                    }
                }
            }

            // Gọi API cập nhật số lượng
            await ApiService.put('/cart/update-item', {
                cart_item_id: cartItemId,
                quantity: newQuantity
            });

            // Thông báo rằng giỏ hàng đã thay đổi
            CartEventBus.publish('cartUpdated');

            // Cập nhật state local
            const updatedItems = cartItems.map(item =>
                item._id === cartItemId ? { ...item, quantity: newQuantity } : item
            );
            
            setCartItems(updatedItems);
            calculateTotal(updatedItems);
        } catch (error) {
            console.error('Error updating item quantity:', error);
            alert('Không thể cập nhật số lượng sản phẩm');
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            // Gọi API xóa sản phẩm
            await ApiService.delete(`/cart/remove-item/${cartItemId}`);

            // Thông báo rằng giỏ hàng đã thay đổi
            CartEventBus.publish('cartUpdated');

            // Cập nhật state local
            const remainingItems = cartItems.filter(item => item._id !== cartItemId);
            setCartItems(remainingItems);
            calculateTotal(remainingItems);
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Không thể xóa sản phẩm');
        }
    };

    const calculateTotal = (items) => {
        const total = items.reduce((sum, item) => {
            let price = 0;
            
            // Xác định giá từ biến thể hoặc sản phẩm
            if (item.variant_id) {
                if (typeof item.variant_id === 'object' && item.variant_id.price) {
                    price = item.variant_id.price;
                }
            } else if (item.product_id && typeof item.product_id === 'object') {
                price = item.product_id.discounted_price || item.product_id.price || 0;
            }
            
            return sum + (price * item.quantity);
        }, 0);
        
        setCartTotal(total);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-50 
            transition-transform duration-300 ease-in-out transform translate-x-0"
        >
            <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center">
                    <ShoppingCart size={20} className="mr-2 text-purple-600" />
                    <h2 className="text-xl font-bold">Giỏ Hàng</h2>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <CircleX size={20} />
                </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                {loading ? (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin h-5 w-5 border-2 border-gray-300 border-t-purple-600 rounded-full"></div>
                        <p className="mt-2">Đang tải...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-4 text-red-500">{error}</div>
                ) : !userId ? (
                    <div className="text-center py-4">
                        <p className="mb-4">Vui lòng đăng nhập để xem giỏ hàng</p>
                        <button
                            onClick={() => window.location.href = "/login"}
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                            Đăng nhập
                        </button>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="text-center py-8">
                        <ShoppingCart size={40} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Giỏ hàng của bạn đang trống</p>
                        <button
                            onClick={() => window.location.href = "/"}
                            className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Thông tin về biến thể */}
                        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm flex items-start">
                            <Info size={16} className="text-blue-600 mr-2 mt-0.5" />
                            <p className="text-blue-800">
                                Sản phẩm trong giỏ hàng hiển thị theo biến thể bạn đã chọn. Giá và số lượng tồn kho có thể khác nhau giữa các biến thể.
                            </p>
                        </div>
                        
                        {/* Danh sách sản phẩm */}
                        {cartItems.map((item) => (
                            <CartItem
                                key={item._id}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                            />
                        ))}
                    </>
                )}
            </div>

            {userId && cartItems.length > 0 && (
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between mb-3">
                        <span className="text-gray-700">Tạm tính</span>
                        <span className="font-bold text-purple-600">{cartTotal.toLocaleString()} đ</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => window.location.href = "/cart"}
                            className="w-full bg-white border border-purple-600 text-purple-600 py-2 rounded 
                            hover:bg-purple-50 transition-colors"
                        >
                            Xem Giỏ Hàng
                        </button>
                        <button
                            onClick={() => window.location.href = "/checkout"}
                            className="w-full bg-purple-600 text-white py-2 rounded 
                            hover:bg-purple-700 transition-colors"
                        >
                            Thanh Toán
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartModal;