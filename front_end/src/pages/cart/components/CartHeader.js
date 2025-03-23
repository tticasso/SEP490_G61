import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

const CartHeader = ({ clearCart }) => {
    return (
        <>
            <h2 className="text-xl text-center font-bold mb-4">Giỏ hàng</h2>

            {/* Thông tin quan trọng về biến thể */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-start">
                <AlertTriangle size={20} className="text-blue-600 mr-2 mt-0.5" />
                <div>
                    <p className="text-blue-800 font-medium">Thông tin biến thể sản phẩm</p>
                    <p className="text-blue-700 text-sm mt-1">
                        Sản phẩm trong giỏ hàng được hiển thị theo biến thể bạn đã chọn. 
                        Giá và số lượng tồn kho có thể khác nhau giữa các biến thể.
                    </p>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <button
                    onClick={clearCart}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                    <Trash2 size={16} className="mr-2" />
                    Xóa tất cả
                </button>
            </div>
        </>
    );
};

export default CartHeader;