import React from 'react';
import { ClockIcon } from 'lucide-react';
import dongho from '../../../assets/dongho.png';

const ProductCard = ({ 
    product, 
    index, 
    isHoveredProduct, 
    onHover, 
    onClick, 
    onAddToCart,
    formatPrice 
}) => {
    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return "Vừa đăng";
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 24) {
            return `${diffHours} giờ trước`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} ngày trước`;
        }
    };

    return (
        <div
            className="border rounded bg-white overflow-hidden relative cursor-pointer"
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(product)}
        >
            <img
                src={product.thumbnail || dongho}
                alt={product.name}
                className="w-full h-40 object-cover"
            />

            {/* Add to Cart Button - Appears on hover at the bottom of the product */}
            {isHoveredProduct && (
                <div
                    className="absolute bottom-0 left-0 right-0 py-2 bg-white bg-opacity-95 flex items-center justify-center transition-opacity duration-300 shadow-md"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent opening modal when clicking button
                        // Thay vì thêm trực tiếp vào giỏ hàng, mở modal để chọn biến thể
                        onClick(product);
                    }}
                >
                    <button className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md font-medium text-sm">
                        Mua sản phẩm
                    </button>
                </div>
            )}

            <div className="p-2">
                <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <div className="text-xs text-gray-500">{product.condition || "Mới 100%"}</div>
                <div className="text-red-500 font-bold mt-1">{formatPrice(product.price)}</div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                    <ClockIcon size={12} className="mr-1" />
                    <span>{formatTime(product.created_at)}</span>
                    <span className="mx-1">•</span>
                    {/* Hiển thị tên cửa hàng nếu có */}
                    <span>{product.shop_id?.name || "Hà Nội"}</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;