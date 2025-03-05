import React, { useState } from 'react';
import { Star, MapPin, MessageCircle, Calendar, CheckCircle, Plus, MoreHorizontal, Clock } from 'lucide-react';
import dongho from '../../assets/dongho.png'
import ShopAvatar from '../../assets/ShopAvatar.png'
import ShopBackground from '../../assets/ShopBackground.png'


const ShopDetail = () => {
    const [activeTab, setActiveTab] = useState('current'); // 'current' or 'sold'

    // Product data based on tab selection
    const productsData = {
        current: [
            { id: 1, title: 'iPhone 13 - VNA - 128GB', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKTHQUeMyrxYEsSIP5_6d2b9I2ggJQDLgrOg&s', condition: 'Đã qua sử dụng', percent: '99%', price: '10.000.000 đ', time: '22 giờ trước', location: 'Hà Nội' },
            { id: 2, title: 'iPhone 13 - VNA - 128GB', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5hgsEU1J769SQUrjUoRchulbdk_5h6XWAeg&s', condition: 'Đã qua sử dụng', percent: '99%', price: '10.000.000 đ', time: '22 giờ trước', location: 'Hà Nội' },
            { id: 3, title: 'iPhone 13 - VNA - 128GB', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQTgViYnzNv5X64p6p_MALsGF0K8xQgbu2bw&s', condition: 'Đã qua sử dụng', percent: '99%', price: '10.000.000 đ', time: '22 giờ trước', location: 'Hà Nội' },
            { id: 4, title: 'iPhone 13 - VNA - 128GB', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG0RN0j9Jbq8C9I_KlO_TDnYt70Q8j06jhHw&s', condition: 'Đã qua sử dụng', percent: '99%', price: '10.000.000 đ', time: '22 giờ trước', location: 'Hà Nội' },
            { id: 5, title: 'iPhone 13 - VNA - 128GB', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv6fOYQFDYUkvKm3fr-svoMgp9btSH4uTX9Q&s', condition: 'Đã qua sử dụng', percent: '99%', price: '10.000.000 đ', time: '22 giờ trước', location: 'Hà Nội' },
            { id: 6, title: 'iPhone 13 - VNA - 128GB', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaVINBafcG_aXBY7HuKfKwJMY9Y2WjfXFpjw&s', condition: 'Đã qua sử dụng', percent: '99%', price: '10.000.000 đ', time: '22 giờ trước', location: 'Hà Nội' },
        ],
        sold: [
            { id: 7, title: 'Apple Watch Series 8', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvMirBhijAC1K7cs95xtOMEqIqfX8CTaCUSA&s', condition: 'Đã qua sử dụng', percent: '95%', price: '8.500.000 đ', time: '5 ngày trước', location: 'Hà Nội' },
            { id: 8, title: 'AirPods Pro 2', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6lLIBb2h-0kYLgIsk2aSTQkXEfnWnVWi5-w&s', condition: 'Mới', percent: '100%', price: '5.200.000 đ', time: '1 tuần trước', location: 'Hà Nội' },
            { id: 9, title: 'Macbook Air M2', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZy0fiReypEemjsJaz5WnuEvRHmpWyTlRc5Q&s', condition: 'Đã qua sử dụng', percent: '98%', price: '22.500.000 đ', time: '2 tuần trước', location: 'Hà Nội' },
            { id: 10, title: 'iPad Pro 12.9" 2022', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiRmughNCryRijKl-Mcta-uZEOnQmyojmEiQ&s', condition: 'Đã qua sử dụng', percent: '97%', price: '25.000.000 đ', time: '3 tuần trước', location: 'Hà Nội' },
            { id: 11, title: 'iPhone 14 Pro Max', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsOPdLv9j1Ca9SW9lyayohX1ra-fD4sSi1hQ&s', condition: 'Đã qua sử dụng', percent: '96%', price: '24.000.000 đ', time: '1 tháng trước', location: 'Hà Nội' },
            { id: 12, title: 'Sạc MagSafe', image: 'https://transustore.com/wp-content/uploads/2023/02/Adapter-Sac-Macbook-45w-Magsafe-2.jpg', condition: 'Mới', percent: '100%', price: '750.000 đ', time: '1 tháng trước', location: 'Hà Nội' },
        ]
    };

    // Get current products based on active tab
    const currentProducts = productsData[activeTab];

    return (
        <div className='bg-[#F1F5F9] pt-10'>
            <div className="bg-[#F1F5F9] flex flex-col md:flex-row gap-4 max-w-7xl mx-auto">
                {/* Left Column - Profile Section */}
                <div className="w-full md:w-2/5 h-full bg-white rounded-lg shadow-sm">
                    <div className="relative">
                        {/* Banner Image */}
                        <div className="h-32 w-full rounded-lg overflow-hidden">
                            <img
                                src={ShopBackground}
                                alt="Mount Fuji with red autumn leaves"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* More Options Icon */}
                        <button className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
                            <MoreHorizontal size={18} className="text-gray-700" />
                        </button>

                        {/* Profile Picture */}
                        <div className="absolute -bottom-10 left-8">
                            <div className="rounded-full w-32 h-32 border-4 border-white overflow-hidden">
                                <img
                                    src={ShopAvatar}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="mt-8 p-6">
                        <h2 className="text-lg font-semibold">Lã Hiếu đẹp trai</h2>

                        {/* Rating */}
                        <div className="flex items-center my-1">
                            <span className="font-bold mr-2">5.0</span>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} size={16} className="fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="text-gray-500 text-sm ml-2">(150 đánh giá)</span>
                        </div>

                        {/* Followers */}
                        <div className="text-sm text-gray-600 mb-2">
                            <span>Người theo dõi: 99</span>
                            <span className="mx-2">|</span>
                            <span>Đang theo dõi: 20</span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-800 mb-4">Bán Hàng Trung Thực Và Trách Nhiệm</p>

                        {/* Follow Button */}
                        <button className="w-full bg-blue-600 text-white py-2 rounded-md flex items-center justify-center gap-1">
                            <Plus size={18} />
                            <span>Theo dõi</span>
                        </button>

                        {/* Additional Info */}
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <MessageCircle size={16} className="mr-2" />
                                <span>Tỉ lệ phản hồi chat: 87% (Trong 2 giờ)</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar size={16} className="mr-2" />
                                <span>Đã tham gia: 4 năm trước</span>
                            </div>

                            <div className="flex items-center text-sm text-teal-600">
                                <CheckCircle size={16} className="mr-2" />
                                <span>Nhà bán hàng đã xác thực</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin size={16} className="mr-2" />
                                <span>Địa chỉ: Ba Chẽ - Quảng Ninh</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Products */}
                <div className="w-full md:w-3/5 bg-white rounded-lg shadow-sm p-4">
                    {/* Clickable Tabs */}
                    <div className="flex border-b mb-4">
                        <button
                            onClick={() => setActiveTab('current')}
                            className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'current'
                                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Đang hiển thị (9)
                        </button>
                        <button
                            onClick={() => setActiveTab('sold')}
                            className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'sold'
                                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Đã bán (143)
                        </button>
                    </div>

                    {/* Products Grid - Changes based on active tab */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 p-4">
                        {currentProducts.map(product => (
                            <a href='product-detail' key={product.id} className="border rounded-md p-2 hover:shadow-md transition-shadow cursor-pointer">
                                {/* Product Image */}
                                <div className="aspect-square bg-gray-100 mb-2 rounded overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="text-xs">
                                    <p className="font-semibold">{product.title}</p>
                                    <div className="flex items-center text-gray-500 mb-1">
                                        <span>{product.condition}</span>
                                        <span className="mx-1">·</span>
                                        <span>{product.percent}</span>
                                    </div>
                                    <p className="text-red-600 font-bold">{product.price}</p>
                                    <div className="flex items-center mt-1 text-gray-500">
                                        <Clock size={12} className="mr-1" />
                                        <span>{product.time} - {product.location}</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ShopDetail;