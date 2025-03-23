import React from 'react';
import { ShoppingBag } from 'lucide-react';

const CartEmpty = () => {
    return (
        <div className="text-center p-8">
            <ShoppingBag size={40} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-4">Giỏ hàng của bạn đang trống</h2>
            <button
                onClick={() => window.location.href = "/"}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
                Tiếp tục mua hàng
            </button>
        </div>
    );
};

export default CartEmpty;