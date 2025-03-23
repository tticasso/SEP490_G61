import React from 'react';

const CartLoading = () => {
    return (
        <div className="text-center p-8">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-gray-300 border-t-purple-600 rounded-full"></div>
            <p className="mt-4">Đang tải giỏ hàng...</p>
        </div>
    );
};

export default CartLoading;