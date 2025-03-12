import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import dongho from '../../assets/dongho.png';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]); // Initialize as an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [voucher, setVoucher] = useState('');

    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || "";

    useEffect(() => {
        if (userId) {
            fetchCartData();
        } else {
            setLoading(false);
            setError("Please log in to view your cart");
        }
    }, [userId]);

    const fetchCartData = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get(`/cart/user/${userId}`);
            if (response && response.items) {
                setCartItems(response.items);
            } else {
                setCartItems([]); // Ensure we set an empty array if no items
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart data:', error);
            setError('Unable to load cart data. Please try again later.');
            setLoading(false);
            setCartItems([]); // Ensure we set an empty array on error
        }
    };

    const updateQuantity = async (cartItemId, change) => {
        try {
            const item = cartItems.find(item => item._id === cartItemId);
            if (!item) return;

            const newQuantity = Math.max(1, item.quantity + change);

            await ApiService.put('/cart/update-item', {
                cart_item_id: cartItemId,
                quantity: newQuantity
            });

            setCartItems(cartItems.map(item =>
                item._id === cartItemId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        } catch (error) {
            console.error('Error updating item quantity:', error);
            alert('Unable to update product quantity. Please try again later.');
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            await ApiService.delete(`/cart/remove-item/${cartItemId}`);

            setCartItems(cartItems.filter(item => item._id !== cartItemId));
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Unable to remove product. Please try again later.');
        }
    };

    const clearCart = async () => {
        try {
            if (!cartItems || cartItems.length === 0) return; // Check if cartItems is defined
            const cartId = cartItems[0].cart_id;

            await ApiService.delete(`/cart/clear/${cartId}`);

            setCartItems([]); // Clear the cart with an empty array
        } catch (error) {
            console.error('Error clearing cart:', error);
            alert('Unable to clear cart. Please try again later.');
        }
    };

    const calculateTotal = () => {
        if (!cartItems || cartItems.length === 0) return 0; // Check if cartItems is defined

        return cartItems.reduce((total, item) => {
            const price = item.product_id && typeof item.product_id === 'object'
                ? (item.product_id.discounted_price || item.product_id.price)
                : 0;
            return total + price * item.quantity;
        }, 0);
    };

    const groupItemsByShop = () => {
        const groups = {};

        if (!cartItems || cartItems.length === 0) { // Check if cartItems is defined
            return [];  // Return empty array instead of undefined
        }

        cartItems.forEach(item => {
            if (item.product_id && typeof item.product_id === 'object') {
                const shopId = item.product_id.shop_id || 'unknown';
                if (!groups[shopId]) {
                    groups[shopId] = {
                        shop_id: shopId,
                        shop_name: item.product_id.shop_name || 'Store',
                        shop_image: item.product_id.shop_image || dongho,
                        items: []
                    };
                }
                groups[shopId].items.push(item);
            }
        });

        return Object.values(groups);
    };

    const shops = groupItemsByShop();

    if (loading) {
        return <div className="text-center p-8">Loading cart...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    if (!userId) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-bold mb-4">Hãy đăng nhập để xem giỏ hàng của bạn</h2>
                <button
                    onClick={() => window.location.href = "/login"}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                    Login
                </button>
            </div>
        );
    }

    if (!cartItems || cartItems.length === 0) { // Check if cartItems is defined
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-bold mb-4">Giỏ hàng của bạn đang trống</h2>
                <button
                    onClick={() => window.location.href = "/"}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                    Tiếp tục mua hàng
                </button>
            </div>
        );
    }

    return (
        <div className='flex gap-10 max-w-7xl mx-auto'>
            <div className="w-2/3 flex flex-col bg-white shadow-md rounded-lg p-4 mt-8 mb-8">
                <div className="r-4">
                    <h2 className="text-xl text-center font-bold mb-4">Giỏ hàng</h2>

                    <div className="flex justify-end">
                        <button
                            onClick={clearCart}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Xóa tất cả
                        </button>
                    </div>

                    {shops && shops.map((shop, index) => (
                        <div key={index}>
                            <div className="flex items-center gap-4 p-4 bg-gray-200">
                                <div onClick={() => window.location.href = `/shop-detail/${shop.shop_id}`} className="h-14 w-14 rounded-full overflow-hidden cursor-pointer">
                                    <img
                                        src={shop.shop_image}
                                        alt={shop.shop_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p onClick={() => window.location.href = `/shop-detail/${shop.shop_id}`} className='cursor-pointer'>{shop.shop_name}</p>
                            </div>

                            {shop.items.map((item) => (
                                <div key={item._id} className="flex items-center border-b py-4">
                                    <div className='p-4'>
                                        <input type="checkbox" className='scale-150' />
                                    </div>
                                    <img
                                        src={item.product_id.image || dongho}
                                        alt={item.product_id.name}
                                        className="w-20 h-20 object-cover mr-4 rounded"
                                        onError={(e) => { e.target.src = dongho }}
                                    />
                                    <div className="flex-grow">
                                        <h3 className="text-sm font-medium">{item.product_id.name}</h3>
                                        <div className="flex items-center mt-2">
                                            <button
                                                onClick={() => updateQuantity(item._id, -1)}
                                                className="p-1 bg-gray-100 rounded"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="mx-2">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, 1)}
                                                className="p-1 bg-gray-100 rounded"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                onClick={() => removeItem(item._id)}
                                                className="ml-4 text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="mt-2">
                                            {item.product_id.original_price && (
                                                <span className="line-through text-gray-400 mr-2">
                                                    {item.product_id.original_price.toLocaleString()}đ
                                                </span>
                                            )}
                                            <span className="font-bold text-red-500">
                                                {(item.product_id.discounted_price || item.product_id.price).toLocaleString()}đ
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex p-4 bg-gray-200">
                                <button className="bg-red-500 text-white px-4 py-1 rounded">
                                    Thêm khuyến mãi
                                </button>
                            </div>

                            {index < shops.length - 1 && (
                                <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-1/3 pl-4 border-l pt-10">
                <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm flex">
                        <p className='mr-1'>Spend 1,500,000 VND to receive</p>  <strong className='text-red-500'>Free shipping</strong>
                    </p>
                </div>

                <div className="mt-4">
                    <div className="justify-between mb-2">
                        <h3>Discount code (Optional)</h3>
                        <div className='text-xs text-gray-600'>Discount code will be applied at checkout</div>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter discount code..."
                        value={voucher}
                        onChange={(e) => setVoucher(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className='w-full h-[1px] bg-gray-600 mt-8'></div>

                <div className='mt-4'>
                    <p>Voucher applied</p>
                    <div className='flex gap-2 mt-2'>
                        {/* This will be filled by data from the API */}
                    </div>
                </div>

                <div className='w-full h-[1px] bg-gray-600 mt-8'></div>

                <div className="mt-4">
                    <div className="flex justify-between mb-2">
                        <span>Total order:</span>
                        <span className="font-bold">{calculateTotal().toLocaleString()}đ</span>
                    </div>
                    <button onClick={() => window.location.href = "/checkout"} className="w-full bg-purple-600 text-white py-2 rounded mt-4">
                        Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;