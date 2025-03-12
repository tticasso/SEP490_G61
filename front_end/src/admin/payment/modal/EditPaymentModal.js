import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ApiService from '../../../services/ApiService';
import AuthService from '../../../services/AuthService';

const EditPaymentModal = ({ payment, onClose, onUpdate }) => {
    const [editingPayment, setEditingPayment] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Initialize form data with payment data
    useEffect(() => {
        if (payment) {
            setEditingPayment({
                ...payment
            });
        }
    }, [payment]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingPayment({
            ...editingPayment,
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

    // Handle toggle active status
    const handleToggleActive = () => {
        setEditingPayment({
            ...editingPayment,
            is_active: !editingPayment.is_active
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        const errors = {};
        if (!editingPayment.name) errors.name = 'Tên phương thức thanh toán là bắt buộc';
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            const updatedPayment = await ApiService.put(`/payment/edit/${editingPayment._id}`, editingPayment, true); // true để đảm bảo gửi token
            
            // Call onUpdate callback with updated payment
            if (onUpdate) {
                onUpdate(updatedPayment);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi cập nhật phương thức thanh toán: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    if (!editingPayment) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Chỉnh sửa phương thức thanh toán</h3>
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
                        {/* ID phương thức (readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID
                            </label>
                            <input
                                type="text"
                                value={editingPayment.id || ''}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                        </div>

                        {/* Tên phương thức thanh toán */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên phương thức thanh toán <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={editingPayment.name || ''}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                            )}
                        </div>
                        
                        {/* Trạng thái hoạt động */}
                        <div>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editingPayment.is_active}
                                    onChange={handleToggleActive}
                                    className="h-4 w-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Kích hoạt</span>
                            </label>
                            <p className="mt-1 text-xs text-gray-500">
                                {editingPayment.is_active 
                                    ? 'Phương thức thanh toán đang hoạt động và hiển thị với người dùng.' 
                                    : 'Phương thức thanh toán hiện không hoạt động và không hiển thị với người dùng.'}
                            </p>
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

export default EditPaymentModal;