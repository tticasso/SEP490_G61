import React, { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';

const AddShipping = () => {
    const [formData, setFormData] = useState({
        created_by: '',
        price: '',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');

    const navigate = useNavigate();

    // Fetch users for dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Replace with your actual API endpoint to fetch users
                const response = await ApiService.get('/user/list');
                setUsers(response);

                // If there are users, select the first one by default
                if (response && response.length > 0) {
                    setSelectedUser(response[0]._id);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

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

    // Handle user selection
    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
    
        // Validation
        const errors = {};
        
        if (!formData.price || parseFloat(formData.price) <= 0) {
            errors.price = 'Giá phải lớn hơn 0';
        }
    
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
    
        try {
            setLoading(true);
    
            // Lấy thông tin người dùng từ localStorage một cách chính xác
            const userStr = localStorage.getItem("user");
            let userData = null;
            
            if (userStr) {
                try {
                    userData = JSON.parse(userStr);
                    console.log("User data:", userData);
                } catch (err) {
                    console.error("Error parsing user data:", err);
                }
            }
    
            // Kiểm tra có ID người dùng không
            if (!userData || !userData.id) {
                throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            }
    
            // Prepare data for API - thêm user_id
            const dataToSubmit = {
                ...formData,
                user_id: userData.id, // Thêm user_id từ dữ liệu người dùng
                price: parseFloat(formData.price)
            };
    
            // Log để kiểm tra
            console.log("Data to submit:", dataToSubmit);
    
            await ApiService.post('/shipping/create', dataToSubmit);
    
            // Redirect to shipping list page
            navigate('/admin/shippings');
        } catch (error) {
            console.error("Error:", error);
            setFormErrors({
                submit: 'Lỗi khi tạo phương thức vận chuyển: ' + error
            });
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">THÊM PHƯƠNG THỨC VẬN CHUYỂN</h1>
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
                    onClick={() => navigate('/admin/shippings')}
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
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên phương thức vận chuyển <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nhập tên phương thức vận chuyển"
                                className={`w-full p-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                value={formData.name || ''}
                                onChange={handleInputChange}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                    className={`w-full pl-7 p-3 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                    value={formData.price || ''}
                                    onChange={handlePriceChange}
                                />
                            </div>
                            {formErrors.price && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                placeholder="Nhập mô tả cho phương thức vận chuyển này"
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-8 flex justify-center space-x-4">
                            <button
                                type="button"
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                onClick={() => navigate('/admin/shippings')}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : 'Lưu phương thức vận chuyển'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddShipping;