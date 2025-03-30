import React, { useState } from 'react';
import { X } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

const AddShippingModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        estimate_time: 24 // Default 24 hours for estimated delivery time
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

    // Handle price input change with validation
    const handlePriceChange = (e) => {
        const value = e.target.value;
        
        // Allow empty or numeric values only
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData({
                ...formData,
                price: value
            });
            
            // Clear price error
            if (formErrors.price) {
                setFormErrors({
                    ...formErrors,
                    price: ''
                });
            }
        }
    };

    // Handle estimate time input change
    const handleEstimateTimeChange = (e) => {
        const value = e.target.value;
        
        // Only allow positive integers
        if (value === '' || /^\d+$/.test(value)) {
            setFormData({
                ...formData,
                estimate_time: value
            });
            
            if (formErrors.estimate_time) {
                setFormErrors({
                    ...formErrors,
                    estimate_time: ''
                });
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const errors = {};
        
        if (!formData.name || formData.name.trim() === '') {
            errors.name = 'Tên phương thức vận chuyển không được để trống';
        }
        
        if (!formData.price || parseFloat(formData.price) <= 0) {
            errors.price = 'Giá phải lớn hơn 0';
        }
        
        if (!formData.estimate_time || parseInt(formData.estimate_time) <= 0) {
            errors.estimate_time = 'Thời gian dự kiến phải lớn hơn 0';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            
            // Lấy thông tin người dùng từ AuthService
            const userData = AuthService.getCurrentUser();
            
            if (!userData || !userData.id) {
                throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            }
            
            // Prepare data for API
            const dataToSubmit = {
                ...formData,
                user_id: userData.id,
                price: parseFloat(formData.price),
                estimate_time: parseInt(formData.estimate_time)
            };
            
            const newShipping = await ApiService.post('/shipping/create', dataToSubmit);
            
            // Call onAdd callback with new shipping
            if (onAdd) {
                onAdd(newShipping);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            console.error("Error:", error);
            setFormErrors({
                submit: 'Lỗi khi tạo phương thức vận chuyển: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Thêm phương thức vận chuyển mới</h3>
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
                        {/* Tên phương thức vận chuyển */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên phương thức vận chuyển <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nhập tên phương thức vận chuyển"
                                value={formData.name || ''}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                            )}
                        </div>
                        
                        {/* Giá vận chuyển */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá vận chuyển <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500">₫</span>
                                </div>
                                <input
                                    type="text"
                                    name="price"
                                    placeholder="0"
                                    value={formData.price || ''}
                                    onChange={handlePriceChange}
                                    className={`w-full pl-7 px-3 py-2 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                />
                            </div>
                            {formErrors.price && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                            )}
                        </div>
                        
                        {/* Thời gian dự kiến */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thời gian dự kiến (giờ) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="estimate_time"
                                placeholder="24"
                                value={formData.estimate_time || ''}
                                onChange={handleEstimateTimeChange}
                                className={`w-full px-3 py-2 border ${formErrors.estimate_time ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            />
                            {formErrors.estimate_time && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.estimate_time}</p>
                            )}
                        </div>
                        
                        {/* Mô tả */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                placeholder="Nhập mô tả cho phương thức vận chuyển này"
                                rows={4}
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            ></textarea>
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
                            {loading ? 'Đang lưu...' : 'Tạo phương thức vận chuyển'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddShippingModal;