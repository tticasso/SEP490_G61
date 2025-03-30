import React, { useState } from 'react';
import ShopAvatar from '../../../assets/ShopAvatar.png';
import ApiService from '../../../services/ApiService';

// Profile Content Component
const ProfileContent = ({ profile, handleInputChange, handleBirthDateChange, updateProfile }) => {
    // Thêm state để theo dõi trạng thái chỉnh sửa
    const [isEditing, setIsEditing] = useState(false);
    // State cho loading
    const [loading, setLoading] = useState(false);
    // State cho thông báo lỗi và thành công
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Lưu trữ giá trị ban đầu để có thể hủy thay đổi
    const [initialProfile, setInitialProfile] = useState(null);

    // Xử lý khi nhấn nút Chỉnh sửa
    const handleEdit = () => {
        setInitialProfile({ ...profile }); // Lưu giá trị hiện tại trước khi chỉnh sửa
        setIsEditing(true);
        // Reset thông báo
        setError('');
        setSuccess('');
    };

    // Xử lý khi nhấn nút Hủy
    const handleCancel = () => {
        // Khôi phục giá trị ban đầu
        if (initialProfile) {
            Object.keys(initialProfile).forEach(key => {
                if (key === 'birthDate') {
                    Object.keys(initialProfile.birthDate).forEach(dateKey => {
                        handleBirthDateChange(dateKey, initialProfile.birthDate[dateKey]);
                    });
                } else {
                    handleInputChange(key, initialProfile[key]);
                }
            });
        }
        setIsEditing(false);
        // Reset thông báo
        setError('');
        setSuccess('');
    };

    const validateProfileData = () => {
        let errors = {};

        // Kiểm tra firstname không được để trống
        if (!profile.firstName || profile.firstName.trim() === '') {
            errors.firstName = 'Tên không được để trống';
        }

        // Kiểm tra lastName không được để trống
        if (!profile.lastName || profile.lastName.trim() === '') {
            errors.lastName = 'Họ không được để trống';
        }

        // Kiểm tra số điện thoại chỉ chứa số và đủ 10 chữ số
        if (profile.phone) {
            const phoneRegex = /^(0|\+84)[0-9]{9}$/;
            if (!phoneRegex.test(profile.phone)) {
                errors.phone = 'Số điện thoại không hợp lệ (bắt đầu bằng 0 hoặc +84 và có 10 chữ số)';
            }
        }

        return { isValid: Object.keys(errors).length === 0, errors };
    };

    // Cập nhật hàm handleSave để dùng validation
    const handleSave = async (e) => {
        e.preventDefault();

        // Validate dữ liệu trước khi gửi
        const { isValid, errors } = validateProfileData();
        if (!isValid) {
            const errorMessage = Object.values(errors).join(', ');
            setError(errorMessage);
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Gọi hàm updateProfile để cập nhật thông tin người dùng
            const result = await updateProfile(profile);

            if (result.success) {
                setSuccess('Cập nhật thông tin thành công!');
                setIsEditing(false);
            } else {
                setError(result.error || 'Đã xảy ra lỗi khi cập nhật thông tin.');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra nếu profile chưa được load
    if (!profile) {
        return <div className="p-6">Loading profile data...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <img src={ShopAvatar} className='w-full h-full' alt="Profile" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Dung lượng file tối đa 1 MB</p>
                    <p className="text-sm text-gray-500">Định dạng: JPEG, PNG</p>
                </div>
            </div>

            {/* Hiển thị thông báo lỗi nếu có */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Hiển thị thông báo thành công nếu có */}
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSave}>
                {isEditing && (
                    <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                        <p className="text-sm">
                            <strong>Lưu ý:</strong> Bạn có thể cập nhật họ, tên và số điện thoại, email không thể thay đổi.
                        </p>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
                        <input
                            type="text"
                            value={profile.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                        <input
                            type="text"
                            value={profile.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={true} // Email không được phép thay đổi
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={!isEditing}
                    />
                </div>


                <div className="flex justify-end space-x-4 pt-4">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            Chỉnh sửa
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProfileContent;