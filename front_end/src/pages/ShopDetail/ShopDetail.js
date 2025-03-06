import React, { useState } from 'react';
import { Star, Grid, List, Heart, Flame } from 'lucide-react';
import donghoAvatar from '../../assets/donghoAvatar.jpg'
import dongho from '../../assets/dongho.png'
import ShopDetailTabs from './component/ShopDetailTabs';

const ShopDetail = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [sortOption, setSortOption] = useState('Đặc sắc');

    const shopDetails = {
        name: 'hieuLa',
        email: 'lahieutx@gmail.com',
        address: '66-69 Mục uyên, Tân Xã, Thạch hòa, Thạch Thất, Hà Nội',
        phone: '0966768150',
        followers: 100,
        products: 19,
        joinedDaysAgo: 13,
        soldProduct: 22,
        joinedDay: 110,
        phoneNumber: '0966768150',
        profileImage: donghoAvatar
    };

    const productCategories = [
        'Tất cả sản phẩm',
        'Điện thoại & phụ kiện',
        'Sắc đẹp',
        'Thiết bị điện tử',
        'Nhà sách online',
        'Thời trang nam'
    ];

    const products = [
        {
            id: 1,
            name: 'Apple iPhone 15 Plus 128GB',
            rating: 5,
            ratingCount: 0,
            image: dongho,
            sold: 2,
            isNew: false
        },
        {
            id: 2,
            name: 'Sữa rửa mặt CERAVE Cho da dầu da mụn và Da khô nhạy cảm',
            rating: 5,
            ratingCount: 0,
            image: dongho,
            sold: 3,
            isNew: true
        },
        {
            id: 3,
            name: 'Sữa Chống Nắng Cực Mạnh Sunplay Super Block SPF88+',
            rating: 5,
            ratingCount: 0,
            image: dongho,
            sold: 4,
            isNew: false
        },
        {
            id: 4,
            name: 'Bộ Mặc Nhà Nam Nữ Unisex Trơn Dài Tay Chất Lụa Siêu Mát',
            rating: 5,
            ratingCount: 5,
            image: dongho,
            sold: 9,
            isNew: true
        },
        {
            id: 5,
            name: 'Áo POLO nam nữ với tùng co giãn 4 chiều đen cao cấp',
            rating: 5,
            ratingCount: 5,
            image: dongho,
            sold: 10,
            isNew: true
        },
        {
            id: 6,
            name: 'Áo KHOÁC KAKI JEAN NAM ĐẸP THỜI TRANG MỚI NHẤT',
            rating: 5,
            ratingCount: 11,
            image: dongho,
            sold: 12,
            isNew: true
        }
    ];

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                size={16}
                className={`${index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className='bg-[#E7E9EA] pb-10'>
            <div className="mx-auto max-w-7xl pt-10">
                {/* Shop Header */}
                <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-md mb-4">
                    <div className='mr-6 flex gap-4'>
                        <img
                            src={shopDetails.profileImage}
                            alt={shopDetails.name}
                            className="w-20 h-20 rounded-full "
                        />
                        <div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold">{shopDetails.name}</h1>
                                    <p className="text-gray-600">@{shopDetails.name}</p>
                                    <p>{shopDetails.followers} Người theo dõi</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="mt-2 text-sm text-gray-600">
                            <div className='mb-4 flex gap-4 items-center'>
                                <p> {shopDetails.email}</p>
                                <button onClick={() => window.location.href = '/user-profile/messages'} className="bg-purple-200 px-4 py-2 rounded-full">
                                    Nhắn tin
                                </button>
                            </div>

                            <div className='flex gap-6 items-center'>
                                <div className='flex items-center'>
                                    <p><Flame /></p>
                                    <p>
                                        {shopDetails.products} Sản phẩm
                                    </p>
                                </div>
                                <button className="bg-gray-200 px-4 py-2 rounded-full">
                                    Bỏ Theo Dõi
                                </button>
                            </div>
                        </div>
                        <div className=''>
                            <p className='mb-2'>Địa chỉ: {shopDetails.address}</p>

                            <p className='mb-2'>Số điện thoại: {shopDetails.phoneNumber}</p>
                            <p>Email: {shopDetails.email}</p>
                        </div>
                        <div>
                            <p className='mb-2'>Sản phẩm đã bán: {shopDetails.soldProduct}</p>
                            <p className='mb-2'>Tham gia: {shopDetails.joinedDaysAgo} ngày trước</p>
                            <p>Thời gian hoạt động: 24/7</p>
                        </div>
                    </div>
                </div>

                {/* Shop Detail Tabs Component */}
                <ShopDetailTabs shopDetails={shopDetails} />

                {/* Product Categories */}
                <div className="flex overflow-x-auto mb-4 bg-white p-2 rounded-lg mt-6">
                    {productCategories.map((category) => (
                        <button
                            key={category}
                            className="px-4 py-2 whitespace-nowrap hover:bg-gray-100 rounded-lg"
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Product Sorting and View */}
                <div className="flex justify-between items-center mb-4 px-4 bg-white p-3">
                    <div>
                        <p>{shopDetails.products} sản phẩm</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200' : ''}`}
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-gray-200' : ''}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>Sắp xếp theo:</span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="border rounded px-2 py-1"
                        >
                            <option value="Đặc sắc">Đặc sắc</option>
                            <option value="Mới nhất">Mới nhất</option>
                            <option value="Bán chạy">Bán chạy</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-5 gap-4' : 'grid-cols-1 gap-2'}`}>
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className={`bg-white rounded-lg shadow-md p-3 ${viewMode === 'list' ? 'flex items-center' : ''
                                }`}
                        >
                            <div className={`relative ${viewMode === 'list' ? 'mr-4' : ''}`}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className={`${viewMode === 'grid' ? 'w-full h-48 object-cover' : 'w-24 h-24 object-cover'
                                        } rounded-lg`}
                                />
                                {product.isNew && (
                                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                        Mới
                                    </span>
                                )}
                                <button className="absolute top-2 right-2 bg-white rounded-full p-1">
                                    <Heart size={20} className="text-gray-500" />
                                </button>
                            </div>
                            <div className={`${viewMode === 'list' ? 'flex-grow' : ''}`}>
                                <h3 className={`font-medium ${viewMode === 'grid' ? 'text-center mt-2' : 'mb-1'}`}>
                                    {product.name}
                                </h3>
                                <div className={`flex items-center ${viewMode === 'grid' ? 'justify-center' : 'mb-1'}`}>
                                    {renderStars(product.rating)}
                                    <span className="text-gray-500 text-sm ml-2">({product.ratingCount})</span>
                                    <span className='pl-6 text-sm mt-2'>Đã bán ({product.sold}) </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShopDetail;