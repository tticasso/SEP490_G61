import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import ShopAvatar from '../../assets/ShopAvatar.png'
import ShopOwner from '../../assets/ShopOwner.png'
import nguoidep from '../../assets/nguoidep.jpg'
import ShopBackground from '../../assets/ShopBackground.png'

const StoreDetail = ({ onBack, storeData: initialData }) => {
    // Store data fixed for demo
    const [storeData, setStoreData] = useState(initialData || {
        // Basic info
        name: 'dinh shop',
        username: 'shodinh',
        phone: '033583800',
        website: '',
        email: 'vuvandinh203@gmail.com',
        description: '',
        logo: ShopOwner,

        // Location
        country: 'Việt Nam',
        province: 'An Giang',
        address: '18/1/2 đường số 8 linh xuân',

        // Contact person
        contactLastName: 'vu',
        contactFirstName: 'dinh',
        contactPhone: '0123-456-789',
        idNumber: '068203002554',
    });

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStoreData({
            ...storeData,
            [name]: value
        });
    };

    // Handle save
    const handleSave = () => {
        console.log("Saving store data:", storeData);
        // API call would go here
    };

    // Handle lock account
    const handleLockAccount = () => {
        console.log("Locking account:", storeData.username);
        // API call would go here
    };

    return (
        <div className="flex-1 bg-white mx-auto max-w-7xl mb-10">
            {/* Top navigation */}
            <div className="p-6 flex justify-between items-center">
                <div className="flex items-center">
                    <button
                        className="flex items-center text-gray-600 hover:text-gray-800"
                        onClick={onBack}
                    >
                        <ChevronLeft size={18} className="mr-1" />
                        <span>Quay lại</span>
                    </button>
                </div>
                <div className="flex space-x-4">
                    <button
                        className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        onClick={handleLockAccount}
                    >
                        Khóa tài khoản
                    </button>
                    <button
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        onClick={handleSave}
                    >
                        Lưu chỉnh sửa
                    </button>
                </div>
            </div>

            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">QUẢN LÝ THÔNG TIN CỬA HÀNG</h1>

                {/* Form content */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Left section - Store info */}
                    <div>
                        <div className="mb-8">
                            <h2 className="text-lg font-medium text-gray-700 mb-2">CỬA HÀNG</h2>
                            <p className="text-sm text-gray-500 mb-4">Các thông tin về cửa hàng của bạn</p>

                            <div className="mb-8 flex justify-center">
                                <div className="relative">
                                    <img
                                        src={ShopBackground}
                                        alt="Store logo"
                                        className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md">
                                        <p className="text-sm text-center">Ảnh đại diện</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên cửa hàng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={storeData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên tài khoản <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={storeData.username}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={storeData.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    placeholder="https://"
                                    value={storeData.website}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={storeData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giới thiệu chung về cửa hàng
                                </label>
                                <textarea
                                    name="description"
                                    value={storeData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter some text..."
                                    rows={5}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                                <p className="text-sm text-gray-500 mt-1">Các mô tả về cửa hàng</p>
                            </div>
                        </div>
                    </div>

                    {/* Right section - Location and contact */}
                    <div>
                        <div className="mb-8">
                            <h2 className="text-lg font-medium text-gray-700 mb-2">VỊ TRÍ</h2>
                            <p className="text-sm text-gray-500 mb-4">Vị trí của cửa hàng</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quốc gia
                                    </label>
                                    <select
                                        name="country"
                                        value={storeData.country}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="Việt Nam">Việt Nam</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tỉnh / Thành phố
                                    </label>
                                    <select
                                        name="province"
                                        value={storeData.province}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="An Giang">An Giang</option>
                                        <option value="Hà Nội">Hà Nội</option>
                                        <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
                                        <option value="Đà Nẵng">Đà Nẵng</option>
                                    </select>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">We lied, this isn't required.</p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Địa chỉ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={storeData.address}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-700 mb-2">LIÊN HỆ</h2>
                            <p className="text-sm text-gray-500 mb-4">Các thông tin chủ cửa hàng</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ đệm <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="contactLastName"
                                        value={storeData.contactLastName}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="contactFirstName"
                                        value={storeData.contactFirstName}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại
                                </label>
                                <div className="flex">
                                    <select className="w-20 p-2 border border-gray-300 rounded-l-md">
                                        <option>+84</option>
                                    </select>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={storeData.contactPhone}
                                        onChange={handleInputChange}
                                        className="flex-1 p-2 border border-gray-300 border-l-0 rounded-r-md"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Căn cước công dân
                                </label>
                                <input
                                    type="text"
                                    name="idNumber"
                                    value={storeData.idNumber}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreDetail;