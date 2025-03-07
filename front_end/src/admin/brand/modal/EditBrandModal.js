import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ApiService from '../../../services/ApiService';

const EditBrandModal = ({ brand, onClose, onUpdate }) => {
    const [editingBrand, setEditingBrand] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    // State for categories
    const [categories, setCategories] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch categories and initialize brand data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true);
                const categoriesResponse = await ApiService.get('/categories');
                setCategories(categoriesResponse);
                
                // Initialize editing brand
                if (brand) {
                    setEditingBrand({
                        ...brand,
                        // Ensure categories field is properly handled
                        categories: brand.categories ? 
                            (Array.isArray(brand.categories) ? 
                                brand.categories.map(cat => cat._id || cat) : [brand.categories]) : []
                    });
                }
            } catch (error) {
                setFormErrors({
                    submit: 'Lỗi khi tải dữ liệu danh mục: ' + error
                });
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [brand]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingBrand({
            ...editingBrand,
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

    // Handle category select change (multiple)
    const handleCategoryChange = (e) => {
        // Convert selected options to array of values
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        
        setEditingBrand({
            ...editingBrand,
            categories: selectedOptions
        });
        
        // Clear error for this field
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
        
        // Basic validation
        const errors = {};
        if (!editingBrand.name) errors.name = 'Tên thương hiệu là bắt buộc';
        if (!editingBrand.categories || editingBrand.categories.length === 0) {
            errors.categories = 'Danh mục là bắt buộc';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            const updatedBrand = await ApiService.put(`/brand/edit/${editingBrand._id}`, editingBrand);
            
            // Call onUpdate callback with updated brand
            if (onUpdate) {
                onUpdate(updatedBrand);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi cập nhật thương hiệu: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    if (!editingBrand) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Chỉnh sửa thương hiệu</h3>
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
                        
                        <div className="space-y-4">
                            {/* Tên thương hiệu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên thương hiệu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editingBrand.name || ''}
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
                                <select
                                    multiple
                                    name="categories"
                                    value={editingBrand.categories || []}
                                    onChange={handleCategoryChange}
                                    className={`w-full px-3 py-2 border ${formErrors.categories ? 'border-red-500' : 'border-gray-300'} rounded-md h-32`}
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
                                {formErrors.categories && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.categories}</p>
                                )}
                            </div>
                            
                            {/* Mô tả */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={editingBrand.description || ''}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
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

export default EditBrandModal;