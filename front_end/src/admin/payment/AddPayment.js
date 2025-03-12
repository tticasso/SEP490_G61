import React, { useState } from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';

const AddPayment = () => {
    const [formData, setFormData] = useState({
        name: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const navigate = useNavigate();

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
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        
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
            
            await ApiService.post('/payment/create', dataToSend, true); // true để đảm bảo gửi token
            
            // Redirect to payment list page
            navigate('/admin/payments');
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi tạo phương thức thanh toán: ' + error
            });
            setLoading(false);
        }
    };

    // Handle toggle active status
    const handleToggleActive = () => {
        setIsActive(!isActive);
    };

    return (
        <div className="flex-1 bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">THÊM PHƯƠNG THỨC THANH TOÁN</h1>
                <div className="flex items-center">
                    <button className="flex items-center text-gray-600 mr-4">
                        <RefreshCw size={18} className="mr-2" />
                        <span>Dữ liệu mới nhất</span>
                    </button>
                    <div className="text-gray-500">
                        {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}
                    </div>
                </div>
            </div>

            {/* Back button */}
            <div className="p-6">
                <button 
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
                    onClick={() => navigate('/admin/payments')}
                >
                    <ChevronLeft size={18} className="mr-1" />
                    <span>Quay lại</span>
                </button>

                {formErrors.submit && (
                    <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {formErrors.submit}
                    </div>
                )}

                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        {/* Payment method name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên phương thức thanh toán <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nhập tên phương thức thanh toán"
                                className={`w-full p-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                            )}
                        </div>

                        {/* Active status */}
                        <div className="mb-6">
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

                        {/* Action buttons */}
                        <div className="mt-8 flex justify-center space-x-4">
                            <button
                                type="button"
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                onClick={() => navigate('/admin/payments')}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : 'Lưu phương thức thanh toán'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddPayment;