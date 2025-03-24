import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import ApiService from '../../../services/ApiService';

const ProductDetailModal = ({ product, variant, onClose }) => {
    const [allVariants, setAllVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showVariantSection, setShowVariantSection] = useState(!!variant);

    // Fetch all variants for this product if not provided
    useEffect(() => {
        const fetchVariants = async () => {
            if (!product) return;
            
            if (!variant) {
                try {
                    setLoading(true);
                    const response = await ApiService.get(`/product-variant/product/${product._id}`);
                    if (Array.isArray(response)) {
                        setAllVariants(response);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching variants:', error);
                    setLoading(false);
                }
            } else {
                // If a variant is provided, set it as the only variant in the array
                setAllVariants([variant]);
            }
        };

        fetchVariants();
    }, [product, variant]);

    // Format price to VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Render variant attributes
    const renderVariantAttributes = (variant) => {
        if (!variant || !variant.attributes) return null;
        
        // Parse attributes based on structure
        const attributes = variant.attributes instanceof Map 
            ? Object.fromEntries(variant.attributes) 
            : variant.attributes;
        
        if (!attributes || Object.keys(attributes).length === 0) {
            return <div className="text-gray-500">Không có thuộc tính</div>;
        }
        
        // Early return after hooks are defined
    if (!product) return null;
    
    return (
            <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(attributes).map(([key, value]) => (
                    <div key={key} className="bg-gray-100 p-2 rounded">
                        <span className="text-gray-600 capitalize">{key}: </span>
                        <span className="font-medium">{value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">
                        {variant ? 'Chi tiết biến thể sản phẩm' : 'Chi tiết sản phẩm'}
                    </h3>
                    <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                    {/* Left column: Image and basic info */}
                    <div className="space-y-4">
                        <div className="border rounded-lg p-2 flex justify-center">
                            <img 
                                src={
                                    (variant && variant.images && variant.images.length > 0)
                                        ? variant.images[0]
                                        : (product.thumbnail || 'https://via.placeholder.com/300')
                                } 
                                alt={variant ? (variant.name || product.name) : product.name} 
                                className="h-64 object-contain"
                            />
                        </div>
                        
                        <div className="border rounded-lg p-4 space-y-2">
                            <div>
                                <span className="font-semibold text-gray-700">Trạng thái:</span>
                                <div className="flex items-center mt-1">
                                    <span 
                                        className={`h-3 w-3 rounded-full mr-2 ${
                                            variant 
                                                ? (variant.is_delete ? 'bg-red-500' : 'bg-green-500')
                                                : (product.is_delete ? 'bg-red-500' : (product.is_active ? 'bg-green-500' : 'bg-yellow-500'))
                                        }`}
                                    ></span>
                                    <span>
                                        {variant 
                                            ? (variant.is_delete ? 'Đã xóa' : 'Đang bán')
                                            : (product.is_delete ? 'Đã xóa' : (product.is_active ? 'Đang bán' : 'Ngừng bán'))}
                                    </span>
                                </div>
                            </div>
                            
                            {!variant && (
                                <>
                                    <div>
                                        <span className="font-semibold text-gray-700">Loại sản phẩm:</span>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {product.is_hot && (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Nổi bật</span>
                                            )}
                                            {product.is_feature && (
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Đặc trưng</span>
                                            )}
                                            {!product.is_hot && !product.is_feature && (
                                                <span className="text-gray-500 text-sm">Thông thường</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <span className="font-semibold text-gray-700">Tình trạng:</span>
                                        <div className="mt-1">
                                            <span className="text-gray-600">
                                                {product.condition === 'new' ? 'Mới' : 
                                                (product.condition === 'used' ? 'Đã qua sử dụng' : 
                                                (product.condition === 'refurbished' ? 'Tân trang' : 'Không xác định'))}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {variant && (
                                <div>
                                    <span className="font-semibold text-gray-700">Mã SKU:</span>
                                    <div className="mt-1">
                                        <span className="text-gray-600">
                                            {variant.sku || 'Chưa cấu hình mã SKU'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Middle and right column: Detailed information */}
                    <div className="col-span-2 space-y-4">
                        <div className="border rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-3">
                                {variant ? (variant.name || product.name) : product.name}
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-gray-500 text-sm">Giá bán</span>
                                    <div className="text-lg font-bold text-red-600">
                                        {variant ? formatPrice(variant.price || product.price) : formatPrice(product.price)}
                                    </div>
                                </div>
                                
                                <div>
                                    {variant ? (
                                        <>
                                            <span className="text-gray-500 text-sm">Tồn kho</span>
                                            <div className="font-semibold">
                                                {variant.stock !== undefined ? variant.stock : 'Không xác định'}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-gray-500 text-sm">Đã bán</span>
                                            <div className="font-semibold">{product.sold || 0} sản phẩm</div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {!variant && (
                                <>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <span className="text-gray-500 text-sm">Danh mục</span>
                                            <div className="font-semibold">
                                                {product.category_id && product.category_id.length > 0 
                                                    ? product.category_id.map(cat => cat.name || cat).join(', ') 
                                                    : 'Không có'}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <span className="text-gray-500 text-sm">Thương hiệu</span>
                                            <div className="font-semibold">
                                                {product.brand_id ? (product.brand_id.name || product.brand_id) : 'Không có'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <span className="text-gray-500 text-sm">Cửa hàng</span>
                                        <div className="font-semibold">
                                            {product.shop_id ? (product.shop_id.name || product.shop_id) : 'Không có'}
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {variant && (
                                <div className="mb-4">
                                    <span className="text-gray-500 text-sm">Thuộc tính biến thể</span>
                                    {renderVariantAttributes(variant)}
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-gray-500 text-sm">Ngày tạo</span>
                                    <div className="font-semibold">
                                        {formatDate(variant ? variant.created_at : product.created_at)}
                                    </div>
                                </div>
                                
                                <div>
                                    <span className="text-gray-500 text-sm">Cập nhật lần cuối</span>
                                    <div className="font-semibold">
                                        {formatDate(variant ? variant.updated_at : product.updated_at)}
                                    </div>
                                </div>
                            </div>
                            
                            {!variant && (
                                <>
                                    <div className="mb-4">
                                        <span className="text-gray-500 text-sm">Slug</span>
                                        <div className="font-semibold">
                                            {product.slug || 'N/A'}
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <span className="text-gray-500 text-sm">Khối lượng</span>
                                        <div className="font-semibold">
                                            {product.weight ? `${product.weight}g` : 'N/A'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {!variant && (
                            <>
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-2">Mô tả sản phẩm</h4>
                                    <div className="text-gray-700 whitespace-pre-line">
                                        {product.description || 'Không có mô tả'}
                                    </div>
                                </div>
                                
                                <div className="border rounded-lg p-4">
                                    <h4 className="font-semibold mb-2">Chi tiết sản phẩm</h4>
                                    <div className="text-gray-700 whitespace-pre-line">
                                        {product.detail || 'Không có chi tiết'}
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {/* Variant section for the product */}
                        {!variant && (
                            <div className="border rounded-lg p-4">
                                <div 
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={() => setShowVariantSection(!showVariantSection)}
                                >
                                    <h4 className="font-semibold">Biến thể sản phẩm</h4>
                                    <button className="text-gray-500">
                                        {showVariantSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                </div>
                                
                                {showVariantSection && (
                                    <div className="mt-4">
                                        {loading ? (
                                            <div className="text-center py-4">
                                                <div className="inline-block animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                                                <p className="mt-2 text-gray-600">Đang tải biến thể...</p>
                                            </div>
                                        ) : allVariants.length === 0 ? (
                                            <div className="text-center py-4 text-gray-600">
                                                Sản phẩm chưa có biến thể
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {allVariants.map((v) => (
                                                    <div key={v._id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h5 className="font-medium">
                                                                    {v.name || 'Biến thể không tên'}
                                                                </h5>
                                                                <div className="text-sm text-gray-500">
                                                                    {v.sku ? `SKU: ${v.sku}` : 'Chưa có SKU'}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-red-600">
                                                                    {formatPrice(v.price || product.price)}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Tồn kho: {v.stock !== undefined ? v.stock : 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {renderVariantAttributes(v)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {!variant && (
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Thông tin SEO</h4>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-gray-500 text-sm">Meta Title</span>
                                        <div className="font-semibold">
                                            {product.meta_title || 'N/A'}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <span className="text-gray-500 text-sm">Meta Keywords</span>
                                        <div className="font-semibold">
                                            {product.meta_keyword || 'N/A'}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <span className="text-gray-500 text-sm">Meta Description</span>
                                        <div className="font-semibold">
                                            {product.meta_description || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;