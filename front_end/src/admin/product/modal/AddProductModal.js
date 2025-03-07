import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ApiService from '../../../services/ApiService';

const AddProductModal = ({ onClose, onProductAdded }) => {
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        detail: '',
        thumbnail: '',
        slug: '',
        category_id: [],
        brand_id: '',
        meta_title: '',
        meta_keyword: '',
        meta_description: '',
        weight: '',
        condition: 'new', // Default value
        is_active: true,
        is_hot: false,
        is_feature: false,
        is_delete: false
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    // State for categories and brands
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch categories and brands on component mount
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
            } catch (error) {
                setFormErrors({
                    submit: 'Lỗi khi tải dữ liệu danh mục và thương hiệu: ' + error
                });
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({
            ...newProduct,
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
        setNewProduct({
            ...newProduct,
            [name]: checked
        });
    };

    // Handle category select change (multiple)
    const handleCategoryChange = (e) => {
        // Convert selected options to array of values
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        
        setNewProduct({
            ...newProduct,
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
        if (!newProduct.name) errors.name = 'Tên sản phẩm là bắt buộc';
        if (!newProduct.price) errors.price = 'Giá sản phẩm là bắt buộc';
        if (!newProduct.brand_id) errors.brand_id = 'Thương hiệu là bắt buộc';
        if (!newProduct.slug) errors.slug = 'Slug là bắt buộc';
        if (!newProduct.description) errors.description = 'Mô tả sản phẩm là bắt buộc';
        if (!newProduct.detail) errors.detail = 'Chi tiết sản phẩm là bắt buộc';
        if (!newProduct.meta_title) errors.meta_title = 'Meta title là bắt buộc';
        if (!newProduct.meta_keyword) errors.meta_keyword = 'Meta keyword là bắt buộc';
        if (!newProduct.meta_description) errors.meta_description = 'Meta description là bắt buộc';
        if (!newProduct.weight) errors.weight = 'Khối lượng sản phẩm là bắt buộc';
        if (!newProduct.category_id || newProduct.category_id.length === 0) {
            errors.category_id = 'Danh mục là bắt buộc';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            const createdProduct = await ApiService.post('/product/create', newProduct);
            
            // Call onProductAdded callback with created product
            if (onProductAdded) {
                onProductAdded(createdProduct);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi tạo sản phẩm: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Thêm sản phẩm mới</h3>
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
                                    value={newProduct.name}
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
                                    value={newProduct.price}
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
                                    value={newProduct.slug}
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
                                    value={newProduct.brand_id}
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
                            
                            {/* Danh mục */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục <span className="text-red-500">*</span>
                                </label>
                                <select
                                    multiple
                                    name="category_id"
                                    value={newProduct.category_id}
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
                            
                            {/* Khối lượng */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Khối lượng (gram) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={newProduct.weight}
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
                                    value={newProduct.condition}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="new">Mới</option>
                                    <option value="used">Đã qua sử dụng</option>
                                    <option value="refurbished">Tân trang</option>
                                </select>
                            </div>
                            
                            {/* Mô tả */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={newProduct.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`w-full px-3 py-2 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                                )}
                            </div>
                            
                            {/* Chi tiết */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chi tiết sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="detail"
                                    value={newProduct.detail}
                                    onChange={handleInputChange}
                                    rows={5}
                                    className={`w-full px-3 py-2 border ${formErrors.detail ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                                {formErrors.detail && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.detail}</p>
                                )}
                            </div>
                            
                            {/* Thumbnail */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Hình ảnh
                                </label>
                                <input
                                    type="text"
                                    name="thumbnail"
                                    value={newProduct.thumbnail}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                                {newProduct.thumbnail && (
                                    <div className="mt-2">
                                        <img
                                            src={newProduct.thumbnail}
                                            alt="Thumbnail preview"
                                            className="h-20 w-20 object-cover border"
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {/* Meta fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="meta_title"
                                    value={newProduct.meta_title}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${formErrors.meta_title ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                                {formErrors.meta_title && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.meta_title}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Keyword <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="meta_keyword"
                                    value={newProduct.meta_keyword}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${formErrors.meta_keyword ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                                {formErrors.meta_keyword && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.meta_keyword}</p>
                                )}
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="meta_description"
                                    value={newProduct.meta_description}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className={`w-full px-3 py-2 border ${formErrors.meta_description ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                                {formErrors.meta_description && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.meta_description}</p>
                                )}
                            </div>
                            
                            {/* Status toggles */}
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={newProduct.is_active}
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
                                        checked={newProduct.is_hot}
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
                                        checked={newProduct.is_feature}
                                        onChange={handleToggleChange}
                                        className="h-4 w-4 mr-2"
                                    />
                                    <label htmlFor="is_feature" className="text-sm font-medium text-gray-700">
                                        Sản phẩm đặc trưng
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
                                {loading ? 'Đang thêm...' : 'Thêm sản phẩm'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddProductModal;