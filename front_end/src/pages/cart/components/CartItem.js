import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import dongho from '../../../assets/dongho.png';
import { BE_API_URL } from '../../../config/config';

const CartItem = ({ 
    item, 
    isSelected, 
    onSelect, 
    onUpdateQuantity, 
    onRemove, 
    getItemPrice 
}) => {
    // Lấy hình ảnh dựa trên biến thể hoặc sản phẩm
    const getImagePath = (imgPath) => {
        if (!imgPath) return dongho;
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
    
    // Cập nhật phương thức getItemImage
    const getItemImage = () => {
        // Kiểm tra nếu có variant_id và variant_id là object
        if (item.variant_id && typeof item.variant_id === 'object') {
            if (item.variant_id.images && item.variant_id.images.length > 0) {
                return getImagePath(item.variant_id.images[0]);
            }
        }
        
        // Fallback to product image
        if (item.product_id && typeof item.product_id === 'object') {
            return getImagePath(item.product_id.thumbnail || item.product_id.image || dongho);
        }
        
        return dongho;
    };

    // Render variant info
    const renderVariantInfo = () => {
        if (!item.variant_id) return null;
        
        // Nếu variant_id là object đầy đủ thông tin
        if (typeof item.variant_id === 'object') {
            const variant = item.variant_id;
            const attributes = variant.attributes instanceof Map 
                ? Object.fromEntries(variant.attributes) 
                : variant.attributes;
            
            return (
                <div className="mt-1">
                    {variant.name && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                            {variant.name}
                        </span>
                    )}
                    
                    {attributes && Object.keys(attributes).length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                            {Object.entries(attributes).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                    <span className="capitalize">{key}</span>: <strong>{value}</strong>
                                </span>
                            ))}
                        </div>
                    )}
                    
                    {variant.stock !== undefined && (
                        <div className="text-xs mt-1">
                            {variant.stock > 0 ? (
                                <span className="text-green-600">Còn {variant.stock} sản phẩm</span>
                            ) : (
                                <span className="text-red-600">Hết hàng</span>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        
        // Fallback khi variant_id chỉ là string
        return (
            <div className="text-xs text-gray-500 mt-1">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    Biến thể đã chọn
                </span>
            </div>
        );
    };

    // Kiểm tra xem số lượng có vượt quá tồn kho không
    const isMaxQuantityReached = () => {
        if (item.variant_id && typeof item.variant_id === 'object') {
            const variant = item.variant_id;
            return variant.stock !== undefined && item.quantity >= variant.stock;
        }
        return false;
    };
    

    // Lấy thông tin sản phẩm
    const productName = item.product_id && typeof item.product_id === 'object' 
        ? item.product_id.name 
        : 'Sản phẩm';

    const originalPrice = item.product_id && typeof item.product_id === 'object' 
        ? item.product_id.original_price 
        : null;

    const price = getItemPrice(item);

    // Kiểm tra trạng thái của nút tăng số lượng
    const isPlusButtonDisabled = isMaxQuantityReached();

    return (
        <div className="flex items-center border-b py-4 hover:bg-gray-50">
            <div className='p-4'>
                <input 
                    type="checkbox" 
                    className='scale-150'
                    checked={isSelected || false}
                    onChange={onSelect}
                />
            </div>
            <img
                src={getItemImage()}
                alt={productName}
                className="w-20 h-20 object-cover mr-4 rounded"
                onError={(e) => { e.target.src = dongho }}
            />
            <div className="flex-grow">
                <h3 className="text-sm font-medium">{productName}</h3>
                
                {/* Hiển thị thông tin variant */}
                {renderVariantInfo()}
                
                <div className="flex items-center mt-2">
                    <button
                        onClick={() => onUpdateQuantity(item._id, -1)}
                        className={`p-1 bg-gray-100 rounded ${!isPlusButtonDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={!isPlusButtonDisabled}
                    >
                        <Minus size={16} />
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item._id, 1)}
                        className={`p-1 bg-gray-100 rounded ${isPlusButtonDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={isPlusButtonDisabled}
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={() => onRemove(item._id)}
                        className="ml-4 text-red-500"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                <div className="mt-2">
                    {originalPrice && (
                        <span className="line-through text-gray-400 mr-2">
                            {originalPrice.toLocaleString()}đ
                        </span>
                    )}
                    <span className="font-bold text-red-500">
                        {price.toLocaleString()}đ
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CartItem;