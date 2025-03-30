import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import ApiService from '../../services/ApiService';

const AddBrandModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categories: []
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await ApiService.get('/categories');
                setCategories(response);
                setLoadingCategories(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setFormErrors({
                    submit: 'Lỗi khi tải dữ liệu danh mục: ' + error
                });
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
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

    // Handle category selection
    const handleCategoryChange = (categoryId) => {
        let updatedCategories;
        
        if (formData.categories.includes(categoryId)) {
            // Remove if already selected
            updatedCategories = formData.categories.filter(id => id !== categoryId);
        } else {
            // Add if not selected
            updatedCategories = [...formData.categories, categoryId];
        }
        
        setFormData({
            ...formData,
            categories: updatedCategories
        });
        
        // Clear error for categories
        if (formErrors.categories) {
            setFormErrors({
                ...formErrors,
                categories: ''
            });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Tên thương hiệu là bắt buộc';
        }
        if (formData.categories.length === 0) {
            errors.categories = 'Vui lòng chọn ít nhất một danh mục';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            const newBrand = await ApiService.post('/brand/create', formData);
            
            // Call onAdd callback with new brand
            if (onAdd) {
                onAdd(newBrand);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi tạo thương hiệu: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Thêm thương hiệu mới</h3>
                    <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {loadingCategories ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="text-gray-500">Đang tải dữ liệu danh mục...</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formErrors.submit && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {formErrors.submit}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            {/* Tên thương hiệu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên thương hiệu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nhập tên thương hiệu"
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                                )}
                            </div>
                            
                            {/* Danh mục */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục <span className="text-red-500">*</span>
                                </label>
                                <div className={`max-h-[150px] overflow-y-auto border ${formErrors.categories ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}>
                                    {categories.map((category) => (
                                        <div key={category._id} className="mb-2 flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`category-${category._id}`}
                                                checked={formData.categories.includes(category._id)}
                                                onChange={() => handleCategoryChange(category._id)}
                                                className="mr-2"
                                            />
                                            <label htmlFor={`category-${category._id}`} className="text-sm text-gray-700">
                                                {category.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {formErrors.categories && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.categories}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Chọn tất cả danh mục mà thương hiệu này thuộc về
                                </p>
                            </div>
                            
                            {/* Mô tả */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Nhập mô tả cho thương hiệu"
                                />
                            </div>
                            
                            {/* Hình ảnh (có thể mở rộng sau) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hình đại diện
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <Upload size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">Upload or drop a file right here</p>
                                    <p className="text-xs text-gray-400">JPEG, PNG, GIF, JPG</p>
                                    <p className="text-xs text-gray-500 mt-1">(Tính năng sẽ được cập nhật sau)</p>
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
                                {loading ? 'Đang lưu...' : 'Tạo thương hiệu'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddBrandModal;