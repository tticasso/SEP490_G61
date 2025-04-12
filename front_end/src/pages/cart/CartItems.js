import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import defaultImage from '../../assets/dongho.png';
import ApiService from '../../services/ApiService';
import { BE_API_URL } from '../../../src/config/config';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const [variantDetail, setVariantDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Kiểm tra cấu trúc dữ liệu của item và trích xuất thông tin
    const productInfo = item.product_id && typeof item.product_id === 'object' 
        ? item.product_id 
        : { name: 'Sản phẩm không xác định', price: 0 };
    
    // Kiểm tra và phân tích thông tin biến thể
    useEffect(() => {
        const fetchVariantDetail = async () => {
            if (!item.variant_id) return;
            
            // Nếu variant_id đã là object đầy đủ thông tin
            if (item.variant_id && typeof item.variant_id === 'object' && (item.variant_id.attributes || item.variant_id.name)) {
                setVariantDetail(item.variant_id);
                return;
            }
            
            // Nếu variant_id là string hoặc chỉ có _id, cần fetch chi tiết
            if (item.variant_id) {
                try {
                    setLoading(true);
                    const variantId = typeof item.variant_id === 'string' ? item.variant_id : item.variant_id._id;
                    
                    // Lấy productId để gọi API lấy danh sách variants
                    const productId = typeof item.product_id === 'object' 
                        ? (item.product_id._id || item.product_id.id) 
                        : item.product_id;
                    
                    if (productId) {
                        const variants = await ApiService.get(`/product-variant/product/${productId}`, false);
                        
                        if (variants && variants.length > 0) {
                            // Tìm variant mà người dùng đã chọn
                            const foundVariant = variants.find(v => v._id === variantId);
                            if (foundVariant) {
                                setVariantDetail(foundVariant);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching variant detail:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        
        fetchVariantDetail();
    }, [item.variant_id, item.product_id]);
    
    // Xác định giá hiển thị: giá của variant (nếu có) hoặc giá của sản phẩm
    const getDisplayPrice = () => {
        if (variantDetail && variantDetail.price) {
            return variantDetail.price;
        }
        
        return productInfo.discounted_price || productInfo.price || 0;
    };
    
    // Xác định hình ảnh hiển thị: hình của variant (nếu có) hoặc hình của sản phẩm
    const getImagePath = (imgPath) => {
        if (!imgPath) return defaultImage;
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
    
    // Cập nhật phương thức getDisplayImage
    const getDisplayImage = () => {
        if (variantDetail && variantDetail.images && variantDetail.images.length > 0) {
            return getImagePath(variantDetail.images[0]);
        }
        
        return getImagePath(productInfo.thumbnail || productInfo.image || defaultImage);
    };
    
    
    // Hiển thị các thuộc tính của variant
    const renderVariantAttributes = () => {
        if (!variantDetail) return null;
        
        // Lấy thông tin attributes từ variant
        const attributes = variantDetail.attributes instanceof Map 
            ? Object.fromEntries(variantDetail.attributes) 
            : variantDetail.attributes;
        
        // Nếu không có attributes hoặc attributes là object rỗng
        if (!attributes || Object.keys(attributes).length === 0) {
            // Chỉ hiển thị tên variant nếu có
            if (variantDetail.name) {
                return (
                    <div className="text-xs text-gray-500 mt-1">
                        Biến thể: <span className="font-medium">{variantDetail.name}</span>
                    </div>
                );
            }
            return null;
        }
        
        return (
            <div className="text-xs text-gray-500 mt-1">
                {Object.entries(attributes).map(([key, value]) => (
                    <span key={key} className="mr-2">
                        <span className="capitalize">{key}</span>: <strong>{value}</strong>
                    </span>
                ))}
            </div>
        );
    };
    
    // Hiển thị tên biến thể và badge nếu có
    const renderVariantName = () => {
        if (!variantDetail || !variantDetail.name) return null;
        
        return (
            <div className="mt-1">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {variantDetail.name}
                </span>
            </div>
        );
    };
    
    // Hiển thị thông tin còn hàng
    const renderStockInfo = () => {
        if (!variantDetail || variantDetail.stock === undefined) return null;
        
        return (
            <div className="text-xs mt-1">
                {variantDetail.stock > 0 ? (
                    <span className="text-green-600">Còn {variantDetail.stock} sản phẩm</span>
                ) : (
                    <span className="text-red-600">Hết hàng</span>
                )}
            </div>
        );
    };
    
    // Hiển thị giá
    const displayPrice = getDisplayPrice();
    const displayOriginalPrice = productInfo.original_price || null;
    
    // Kiểm tra xem nút tăng số lượng có bị vô hiệu hóa không
    const isPlusButtonDisabled = variantDetail && 
        variantDetail.stock !== undefined && 
        item.quantity >= variantDetail.stock;
    
    return (
        <div className="flex items-center mb-4 pb-4 border-b last:border-b-0">
            <img 
                src={getDisplayImage()} 
                alt={productInfo.name} 
                className="w-20 h-20 object-cover mr-4 rounded"
                onError={(e) => {e.target.src = defaultImage}}
            />
            <div className="flex-grow">
                <h3 className="text-sm font-medium">{productInfo.name}</h3>
                
                {/* Hiển thị thông tin variant - với loading state */}
                {loading ? (
                    <div className="text-xs text-gray-500 mt-1">Đang tải thông tin biến thể...</div>
                ) : (
                    <>
                        {renderVariantName()}
                        {renderVariantAttributes()}
                        {renderStockInfo()}
                    </>
                )}
                
                <p className="text-purple-600 font-bold mt-1">
                    {displayPrice.toLocaleString()} đ
                    {displayOriginalPrice && (
                        <span className="line-through text-gray-400 ml-2 text-xs">
                            {displayOriginalPrice.toLocaleString()} đ
                        </span>
                    )}
                </p>
                <div className="flex items-center mt-2">
                    <button 
                        onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                        className="p-1 border rounded"
                        disabled={item.quantity <= 1}
                    >
                        <Minus size={16} />
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button 
                        onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                        className={`p-1 border rounded ${isPlusButtonDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={isPlusButtonDisabled}
                    >
                        <Plus size={16} />
                    </button>
                    <button 
                        onClick={() => onRemove(item._id)}
                        className="ml-auto text-red-500"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItem;