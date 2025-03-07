import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ApiService from '../../../services/ApiService';

const EditProductModal = ({ product, onClose, onUpdate }) => {
    const [editingProduct, setEditingProduct] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    // State for categories and brands
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch categories and brands, and initialize product data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true);
                const [categoriesResponse, brandsResponse] = await Promise.all([
                    ApiService.get('/categories'),
                    ApiService.get('/brand')
                ]);
                setCategories(categoriesResponse);
                setBrands(brandsResponse);
                
                // Initialize editing product
                if (product) {
                    setEditingProduct({
                        ...product,
                        // Ensure nested fields are properly handled
                        category_id: product.category_id ? 
                            (Array.isArray(product.category_id) ? 
                                product.category_id.map(cat => cat._id || cat) : [product.category_id]) : [],
                        brand_id: product.brand_id?._id || product.brand_id || ''
                    });
                }
            } catch (error) {
                setFormErrors({
                    submit: 'Lỗi khi tải dữ liệu danh mục và thương hiệu: ' + error
                });
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [product]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingProduct({
            ...editingProduct,
            [name]: value
        });
        
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    // Handle checkbox/toggle input change
    const handleToggleChange = (e) => {
        const { name, checked } = e.target;
        setEditingProduct({
            ...editingProduct,
            [name]: checked
        });
    };

    // Handle category select change (multiple)
    const handleCategoryChange = (e) => {
        // Convert selected options to array of values
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        
        setEditingProduct({
            ...editingProduct,
            category_id: selectedOptions
        });
        
        // Clear error for this field
        if (formErrors.category_id) {
            setFormErrors({
                ...formErrors,
                category_id: ''
            });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        const errors = {};
        if (!editingProduct.name) errors.name = 'Tên sản phẩm là bắt buộc';
        if (!editingProduct.price) errors.price = 'Giá sản phẩm là bắt buộc';
        if (!editingProduct.brand_id) errors.brand_id = 'Thương hiệu là bắt buộc';
        if (!editingProduct.slug) errors.slug = 'Slug là bắt buộc';
        if (!editingProduct.weight) errors.weight = 'Khối lượng sản phẩm là bắt buộc';
        if (!editingProduct.category_id || editingProduct.category_id.length === 0) {
            errors.category_id = 'Danh mục là bắt buộc';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            const updatedProduct = await ApiService.put(`/product/edit/${editingProduct._id}`, editingProduct);
            
            // Call onUpdate callback with updated product
            if (onUpdate) {
                onUpdate(updatedProduct);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi cập nhật sản phẩm: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    if (!editingProduct) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Chỉnh sửa sản phẩm</h3>
                    <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {loadingData ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="text-gray-500">Đang tải dữ liệu...</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formErrors.submit && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {formErrors.submit}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-6">
                            {/* Tên sản phẩm */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editingProduct.name || ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                                )}
                            </div>
                            
                            {/* Giá */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá bán <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={editingProduct.price || ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                                {formErrors.price && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                                )}
                            </div>
                            
                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={editingProduct.slug || ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${formErrors.slug ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                                {formErrors.slug && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.slug}</p>
                                )}
                            </div>
                            
                            {/* Thương hiệu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thương hiệu <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="brand_id"
                                    value={editingProduct.brand_id || ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${formErrors.brand_id ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                >
                                    <option value="">Chọn thương hiệu</option>
                                    {brands.map((brand) => (
                                        <option key={brand._id} value={brand._id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.brand_id && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.brand_id}</p>
                                )}
                            </div>
                            
                            {/* Khối lượng */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Khối lượng (gram) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={editingProduct.weight || ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${formErrors.weight ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                                {formErrors.weight && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.weight}</p>
                                )}
                            </div>
                            
                            {/* Tình trạng */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tình trạng
                                </label>
                                <select
                                    name="condition"
                                    value={editingProduct.condition || 'new'}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="new">Mới</option>
                                    <option value="used">Đã qua sử dụng</option>
                                    <option value="refurbished">Tân trang</option>
                                </select>
                            </div>
                            
                            {/* Danh mục */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục <span className="text-red-500">*</span>
                                </label>
                                <select
                                    multiple
                                    name="category_id"
                                    value={editingProduct.category_id || []}
                                    onChange={handleCategoryChange}
                                    className={`w-full px-3 py-2 border ${formErrors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-md h-32`}
                                >
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Giữ phím Ctrl (hoặc Command trên Mac) để chọn nhiều danh mục
                                </p>
                                {formErrors.category_id && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.category_id}</p>
                                )}
                            </div>
                            
                            {/* Mô tả */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả sản phẩm
                                </label>
                                <textarea
                                    name="description"
                                    value={editingProduct.description || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            {/* Chi tiết */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chi tiết sản phẩm
                                </label>
                                <textarea
                                    name="detail"
                                    value={editingProduct.detail || ''}
                                    onChange={handleInputChange}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            {/* Thumbnail */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Hình ảnh
                                </label>
                                <input
                                    type="text"
                                    name="thumbnail"
                                    value={editingProduct.thumbnail || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                                {editingProduct.thumbnail && (
                                    <div className="mt-2">
                                        <img
                                            src={editingProduct.thumbnail}
                                            alt="Thumbnail preview"
                                            className="h-20 w-20 object-cover border"
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {/* Meta fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    name="meta_title"
                                    value={editingProduct.meta_title || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Keyword
                                </label>
                                <input
                                    type="text"
                                    name="meta_keyword"
                                    value={editingProduct.meta_keyword || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Description
                                </label>
                                <textarea
                                    name="meta_description"
                                    value={editingProduct.meta_description || ''}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            {/* Status toggles */}
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={editingProduct.is_active || false}
                                        onChange={handleToggleChange}
                                        className="h-4 w-4 mr-2"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                        Hiển thị trên cửa hàng
                                    </label>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_hot"
                                        name="is_hot"
                                        checked={editingProduct.is_hot || false}
                                        onChange={handleToggleChange}
                                        className="h-4 w-4 mr-2"
                                    />
                                    <label htmlFor="is_hot" className="text-sm font-medium text-gray-700">
                                        Sản phẩm nổi bật
                                    </label>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_feature"
                                        name="is_feature"
                                        checked={editingProduct.is_feature || false}
                                        onChange={handleToggleChange}
                                        className="h-4 w-4 mr-2"
                                    />
                                    <label htmlFor="is_feature" className="text-sm font-medium text-gray-700">
                                        Sản phẩm đặc trưng
                                    </label>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_delete"
                                        name="is_delete"
                                        checked={editingProduct.is_delete || false}
                                        onChange={handleToggleChange}
                                        className="h-4 w-4 mr-2"
                                    />
                                    <label htmlFor="is_delete" className="text-sm font-medium text-gray-700">
                                        Xóa sản phẩm
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-5 border-t">
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                                onClick={onClose}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditProductModal;