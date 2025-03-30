import React, { useState } from 'react';
import { X } from 'lucide-react';
import ApiService from '../../services/ApiService';

const AddCategoryModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Handle form input change
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        const errors = {};
        if (!formData.name) errors.name = 'Tên danh mục là bắt buộc';
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            const newCategory = await ApiService.post('/categories/create', formData);
            
            // Call onAdd callback with new category
            if (onAdd) {
                onAdd(newCategory);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi tạo danh mục: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Thêm danh mục mới</h3>
                    <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {formErrors.submit && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {formErrors.submit}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {/* Tên danh mục */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên danh mục <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                            )}
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
                            {loading ? 'Đang lưu...' : 'Tạo danh mục'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryModal;