import React, { useState } from 'react';
import { CircleX } from 'lucide-react';
import CartItem from './CartItems';
import dongho from '../../assets/dongho.png'

const CartModal = ({ isOpen, onClose }) => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'PC Computer, Intel Core 7 Ultra...',
            price: 8712000,
            originalPrice: 9000000,
            quantity: 1,
            image: dongho
        },
        {
            id: 2,
            name: 'Khẩu trang 5d xám, Khẩu trang 5d xin...',
            price: 90000,
            quantity: 1,
            image: dongho
        }
    ]);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        
        setCartItems(cartItems.map(item => 
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
                {cartItems.map((item) => (
                    <CartItem 
                        key={item.id} 
                        item={item} 
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                    />
                ))}
            </div>

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
        </div>
    );
};

export default CartModal;