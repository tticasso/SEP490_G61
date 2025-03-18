import React from 'react';
import { X } from 'lucide-react';

const ProductDetailModal = ({ product, onClose }) => {
    if (!product) return null;

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Chi tiết sản phẩm</h3>
                    <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                    {/* Cột trái: Hình ảnh và thông tin cơ bản */}
                    <div className="space-y-4">
                        <div className="border rounded-lg p-2 flex justify-center">
                            <img 
                                src={product.thumbnail || 'https://via.placeholder.com/300'} 
                                alt={product.name} 
                                className="h-64 object-contain"
                            />
                        </div>
                        
                        <div className="border rounded-lg p-4 space-y-2">
                            <div>
                                <span className="font-semibold text-gray-700">Trạng thái:</span>
                                <div className="flex items-center mt-1">
                                    <span 
                                        className={`h-3 w-3 rounded-full mr-2 ${
                                            product.is_delete ? 'bg-red-500' : (product.is_active ? 'bg-green-500' : 'bg-yellow-500')
                                        }`}
                                    ></span>
                                    <span>
                                        {product.is_delete ? 'Đã xóa' : (product.is_active ? 'Đang bán' : 'Ngừng bán')}
                                    </span>
                                </div>
                            </div>
                            
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
                        </div>
                    </div>
                    
                    {/* Cột giữa và phải: Thông tin chi tiết */}
                    <div className="col-span-2 space-y-4">
                        <div className="border rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-3">{product.name}</h4>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-gray-500 text-sm">Giá bán</span>
                                    <div className="text-lg font-bold text-red-600">{formatPrice(product.price)}</div>
                                </div>
                                
                                <div>
                                    <span className="text-gray-500 text-sm">Đã bán</span>
                                    <div className="font-semibold">{product.sold || 0} sản phẩm</div>
                                </div>
                            </div>
                            
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
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-gray-500 text-sm">Ngày tạo</span>
                                    <div className="font-semibold">
                                        {formatDate(product.created_at)}
                                    </div>
                                </div>
                                
                                <div>
                                    <span className="text-gray-500 text-sm">Cập nhật lần cuối</span>
                                    <div className="font-semibold">
                                        {formatDate(product.updated_at)}
                                    </div>
                                </div>
                            </div>
                            
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
                        </div>
                        
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