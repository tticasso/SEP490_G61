import React, { useState } from 'react';
import { X } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

const AddPaymentModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isActive, setIsActive] = useState(true);

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

    // Handle toggle active status
    const handleToggleActive = () => {
        setIsActive(!isActive);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Tên phương thức thanh toán là bắt buộc';
        }
        
        // Kiểm tra quyền admin
        if (!AuthService.hasRole('ROLE_ADMIN')) {
            errors.auth = 'Bạn không có quyền thực hiện chức năng này';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            
            // Create the payment method with active status
            const dataToSend = {
                ...formData,
                is_active: isActive
            };
            
            const newPayment = await ApiService.post('/payment/create', dataToSend, true); // true để đảm bảo gửi token
            
            // Call onAdd callback with new payment
            if (onAdd) {
                onAdd(newPayment);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi tạo phương thức thanh toán: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Thêm phương thức thanh toán mới</h3>
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
                    
                    {formErrors.auth && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {formErrors.auth}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {/* Tên phương thức thanh toán */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên phương thức thanh toán <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nhập tên phương thức thanh toán"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                            )}
                        </div>
                        
                        {/* Active status */}
                        <div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={isActive}
                                    onChange={handleToggleActive}
                                    className="h-4 w-4 mr-2"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                    Kích hoạt phương thức thanh toán
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 ml-6">
                                {isActive 
                                    ? 'Phương thức thanh toán sẽ được kích hoạt và hiển thị với người dùng.' 
                                    : 'Phương thức thanh toán sẽ được tạo nhưng không hiển thị với người dùng.'}
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
                            {loading ? 'Đang lưu...' : 'Tạo phương thức thanh toán'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentModal;