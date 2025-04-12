import React from 'react';
import dongho from '../../../assets/dongho.png';
import { BE_API_URL } from '../../../config/config';

const ProductCard = ({ 
    product, 
    viewMode, 
    hoveredProduct, 
    setHoveredProduct, 
    handleProductClick, 
    addToCart,
    formatPrice 
}) => {
    // Quy đổi _id hoặc id để sử dụng nhất quán
    const productId = product._id || product.id;
    
    // Kiểm tra xem sản phẩm có biến thể hay không
    // Phải kiểm tra từ backend hoặc dựa vào cấu trúc dữ liệu của bạn
    // Ví dụ: có thể sử dụng trường has_variants hoặc variants_count nếu có
    const hasVariants = product.has_variants || product.variants_count > 0 || false;
    const getImagePath = (imgPath) => {
        if (!imgPath) return "";
        // Kiểm tra nếu imgPath đã là URL đầy đủ
        if (imgPath.startsWith('http')) return imgPath;
        // Kiểm tra nếu imgPath là đường dẫn tương đối
        if (imgPath.startsWith('/uploads')) return `${BE_API_URL}${imgPath}`;
        
        // Kiểm tra nếu đường dẫn có chứa "shops" để xử lý ảnh shop
        if (imgPath.includes('shops')) {
            const fileName = imgPath.split("\\").pop();
            return `${BE_API_URL}/uploads/shops/${fileName}`;
        }
        
        // Trường hợp imgPath là đường dẫn từ backend cho sản phẩm
        const fileName = imgPath.split("\\").pop();
        return `${BE_API_URL}/uploads/products/${fileName}`;
    };

    return (
        <div
            key={productId}
            className={`
                border rounded-lg p-4 relative cursor-pointer hover:shadow-md transition-shadow
                ${viewMode === 'grid' ? 'w-full' : 'flex items-center'}
            `}
            onMouseEnter={() => setHoveredProduct(productId)}
            onMouseLeave={() => setHoveredProduct(null)}
            onClick={() => handleProductClick(product)}
        >
            {product.is_hot && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
                    HOT
                </div>
            )}
            {product.is_feature && !product.is_hot && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
                    Đặc sắc
                </div>
            )}
            {hasVariants && (
                <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded z-10">
                    Nhiều lựa chọn
                </div>
            )}
            <div className={`${viewMode === 'grid' ? 'flex flex-col' : 'flex items-center'} relative`}>
                <div className="relative">
                    <img
                        src={getImagePath(product.thumbnail) || dongho}
                        alt={product.name}
                        className={`
                            object-cover 
                            ${viewMode === 'grid' ? 'w-full h-48' : 'w-48 h-48 mr-4'}
                        `}
                    />

                    {/* Nút Thêm giỏ hàng - hiển thị khi hover */}
                    {hoveredProduct === productId && (
                        <div
                            className="absolute bottom-0 left-0 right-0 py-2 bg-white bg-opacity-95 flex items-center justify-center transition-opacity duration-300 shadow-md z-10"
                            onClick={(e) => {
                                e.stopPropagation(); // Ngăn mở modal
                                // Luôn mở modal để chọn biến thể hoặc xem thông tin chi tiết sản phẩm
                                handleProductClick(product);
                            }}
                        >
                            <button className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md font-medium text-sm">
                                {hasVariants ? 'Chọn biến thể' : 'Xem chi tiết'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-grow mt-2">
                    <h3 className="text-sm font-medium truncate">{product.name}</h3>
                    <span className="text-xs text-gray-500">Đã bán {product.sold || 0}</span>
                    <p className="text-purple-600 font-bold mt-1">
                        {hasVariants ? `Từ ${formatPrice(product.price)}` : formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {product.condition || ''} {product.location ? `| ${product.location}` : ''}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;