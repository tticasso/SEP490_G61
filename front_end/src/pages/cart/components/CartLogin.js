import React from 'react';
import { LogIn } from 'lucide-react';

const CartLogin = () => {
    return (
        <div className="text-center p-8">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <LogIn size={24} className="text-purple-600" />
            </div>
            <h2 className="text-xl font-bold mb-4">Hãy đăng nhập để xem giỏ hàng của bạn</h2>
            <button
                onClick={() => window.location.href = "/login"}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
                Đăng nhập
            </button>
        </div>
    );
};

export default CartLogin;