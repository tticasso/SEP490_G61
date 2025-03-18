import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ApiService from '../../../services/ApiService';
import AuthService from '../../../services/AuthService';

const EditShippingModal = ({ shipping, onClose, onUpdate }) => {
    const [editingShipping, setEditingShipping] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Initialize form data with shipping data
    useEffect(() => {
        if (shipping) {
            setEditingShipping({
                ...shipping
            });
        }
    }, [shipping]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingShipping({
            ...editingShipping,
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
            setEditingShipping({
                ...editingShipping,
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        const errors = {};
        
        if (!editingShipping.name) {
            errors.name = 'Tên phương thức vận chuyển không được để trống';
        }
        
        if (!editingShipping.price || parseFloat(editingShipping.price) <= 0) {
            errors.price = 'Giá phải lớn hơn 0';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            
            // Convert price to number for API
            const dataToSubmit = {
                ...editingShipping,
                price: parseFloat(editingShipping.price)
            };
            
            const updatedShipping = await ApiService.put(`/shipping/edit/${editingShipping._id}`, dataToSubmit, true); // true để đảm bảo gửi token
            
            // Call onUpdate callback with updated shipping
            if (onUpdate) {
                onUpdate(updatedShipping);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi cập nhật phương thức vận chuyển: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    if (!editingShipping) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Chỉnh sửa phương thức vận chuyển</h3>
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
                        {/* ID shipping (readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID
                            </label>
                            <input
                                type="text"
                                value={editingShipping.id || ''}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                        </div>

                        {/* Tên phương thức vận chuyển */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên phương thức vận chuyển <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={editingShipping.name || ''}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                placeholder="Nhập tên phương thức vận chuyển"
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
                                    value={editingShipping.price || ''}
                                    onChange={handlePriceChange}
                                    className={`w-full pl-7 px-3 py-2 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                    placeholder="0"
                                />
                            </div>
                            {formErrors.price && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                            )}
                        </div>
                        
                        {/* Mô tả */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                value={editingShipping.description || ''}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Nhập mô tả cho phương thức vận chuyển này"
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
            </div>
        </div>
    );
};

export default EditShippingModal;