import React, { useState } from 'react';
import ShopAvatar from '../../../assets/ShopAvatar.png';

// Profile Content Component
const ProfileContent = ({ profile, handleInputChange, handleBirthDateChange }) => {
    const UserProfile = () => {
        const [activeTab, setActiveTab] = useState('profile');
        const [profile, setProfile] = useState({
          lastName: 'Lã',
          firstName: 'Hiếu',
          email: 'lahieutx@gmail.com',
          phone: '0966768150',
          gender: 'Nam',
          birthDate: {
            day: '1',
            month: '1',
            year: '2003'
          }
        });
      
        const handleInputChange = (field, value) => {
          setProfile(prev => ({...prev, [field]: value}));
        };
      
        const handleBirthDateChange = (type, value) => {
          setProfile(prev => ({
            ...prev, 
            birthDate: {...prev.birthDate, [type]: value}
          }));
        };
      
      };

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

            <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
                        <input
                            type="text"
                            value={profile.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                        <input
                            type="text"
                            value={profile.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                    <div className="flex space-x-4">
                        {['Nam', 'Nữ', 'Khác'].map((gender) => (
                            <div key={gender} className="flex items-center">
                                <input
                                    type="radio"
                                    id={gender}
                                    name="gender"
                                    value={gender}
                                    checked={profile.gender === gender}
                                    onChange={() => handleInputChange('gender', gender)}
                                    className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <label
                                    htmlFor={gender}
                                    className="ml-2 block text-sm font-medium text-gray-700"
                                >
                                    {gender}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tháng năm sinh</label>
                    <div className="grid grid-cols-3 gap-4">
                        <select
                            value={profile.birthDate.day}
                            onChange={(e) => handleBirthDateChange('day', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                        <select
                            value={profile.birthDate.month}
                            onChange={(e) => handleBirthDateChange('month', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                        <select
                            value={profile.birthDate.year}
                            onChange={(e) => handleBirthDateChange('year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {[...Array(100)].map((_, i) => {
                                const year = new Date().getFullYear() - i;
                                return <option key={year} value={year}>{year}</option>
                            })}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        Lưu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileContent;