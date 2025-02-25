import React, { useState } from 'react';
import { MapPin, Clock, ShoppingCart, MessageCircle, Heart, Share2, Check } from 'lucide-react';
import { SearchIcon, UserIcon, HeartIcon, ShoppingCartIcon, ClockIcon, LocationIcon, MessageSquareText } from 'lucide-react';
import dongho from '../assets/ProductDetail.png'
import ShopOwner from '../assets/ShopOwner.png'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const ProductDetail = () => {
    const [selectedImage, setSelectedImage] = useState(0);

    // In a real app, you would use actual image URLs here
    const images = [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx2H7NjwonpIuHCR8Ep6nGDv9Xxhja8IVKPw&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgavoKzoFybFmdqpQzLtuV6eIN6OiKsbwTAQ&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe3rwRqjmSrUCMMVWEuXwvDpxTbf1fGro8hQ&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7s7LSV8eEBwhkLb3OyieGHZlRFcLScF6eGA&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnX1-uqeeSC-XwHbJgTpZJTh5LsWGFdPNb6g&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgT9q0SMcbdv0YnOvN_eMgI6AvdtFSSwSS1w&s',
    ];

    return (
        <div className="bg-[#F1F5F9]">
            <div className="max-w-7xl mx-auto bg-[#F1F5F9] py-8">
                <div className="bg-white rounded-lg">
                    <div className="flex flex-col gap-6 md:flex-row bg-[#F1F5F9]">
                        {/* Left side - Product images */}
                        <div className="md:w-1/2 relative bg-[#F1F5F9] rounded-lg">
                            {/* Main image */}
                            <div className="relative bg-gray-100">
                                <img
                                    src={images[selectedImage]} // Use selectedImage index to display the image
                                    alt="Selected product"
                                    className="w-full h-72 md:h-96 object-fit rounded-lg"
                                />
                                <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                                    <Heart size={18} className="text-gray-600" />
                                </button>
                                <button className="absolute top-14 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                                    <Share2 size={18} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Thumbnail images */}
                            <Swiper
                                slidesPerView={3.7}
                                spaceBetween={10}
                                className="mySwiper mt-2 px-2"
                            >
                                {images.map((image, index) => (
                                    <SwiperSlide
                                        key={index}
                                        className={`w-16 h-16 border-2 rounded-md cursor-pointer overflow-hidden ${selectedImage === index ? "border-blue-500" : "border-gray-200"
                                            }`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img
                                            src={image}
                                            alt={`Product view ${index + 1}`}
                                            className="w-[151px] h-[125px] object-cover rounded-lg"
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Right side - Product details */}
                        <div className="md:w-1/2 px-8 pt-6 pb-2 bg-white rounded-lg">
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                                <MapPin size={14} className="mr-1" />
                                <span>235 Lượt xem trong 48h</span>
                            </div>

                            <h1 className="text-lg font-bold mb-1">Rolex GMT-Master</h1>
                            <p className="text-sm text-gray-700 mb-3">2020 Ref. M126710 GMT-Master Pepsi Blue Red 40mm Steel 10750 Watch</p>

                            <p className="text-sm text-gray-600 mb-4">Đã qua sử dụng | Sản xuất: 03/01 | Không có hộp | Không giấy tờ gốc</p>

                            <div className="text-red-600 font-bold text-xl mb-4">100.000.000 vnđ</div>

                            <div className="mb-4">
                                <h2 className="font-bold mb-2">Mô tả chi tiết:</h2>
                                <p className="text-sm text-gray-700">Đồng hồ sử dụng bình thường. Còn số, chế và bảo hành chính hãng toàn quốc</p>
                            </div>

                            {/* Seller info */}
                            <div className="flex items-center justify-between border rounded-lg p-3 mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                                        <img src={ShopOwner} alt="Seller avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="flex items-center">
                                            <span className="font-medium text-sm">Đồng hồ cũ Hào Lực</span>
                                            <Check size={14} className="ml-1 text-blue-500" />
                                        </div>
                                        <p className="text-xs text-gray-500">Trên 10 năm</p>
                                        <p className="text-xs text-gray-500">* Giao dịch đã được xác minh</p>
                                    </div>
                                </div>
                                <div className="text-right border-l-[2px] pl-4">    
                                    <div className="flex items-center justify-end">
                                        <span className="text-lg font-bold">5</span>
                                        <span className="text-yellow-500 ml-1">★</span>
                                    </div>
                                    <p className="text-xs text-gray-500">990 đánh giá</p>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex space-x-2">
                                <button className="bg-blue-500 hover:bg-blue-600 text-white flex-1 py-2 rounded-lg flex items-center justify-center font-medium transition-colors">
                                    Mua ngay
                                </button>
                                <button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors border-blue-600">
                                    <ShoppingCart size={18} className="text-gray-600" />
                                </button>
                                <button className="border border-gray-300 hover:bg-gray-50 flex-1 py-2 rounded-lg text-gray-600 border-blue-600 font-medium transition-colors">
                                   <p className='flex items-center justify-center gap-2 text-blue-600'><MessageSquareText size={18}/>Chat</p>
                                </button>
                            </div>

                            {/* Location and time */}
                            <div className="mt-4 text-sm text-gray-500">
                                <div className="flex items-center mb-1">
                                    <MapPin size={14} className="mr-1" />
                                    <span>Hà Nội</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock size={14} className="mr-1" />
                                    <span>20 giờ trước</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar products */}
                <div className="pt-10">
                    <div className="flex items-center mb-4 bg-white p-4">
                        <ClockIcon size={24} className="text-red-500 mr-2" />
                        <h2 className="text-lg font-bold text-red-500">SẢN PHẨM TƯƠNG TỰ</h2>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-5 gap-4 bg-[#F1F5F9]">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="border rounded bg-white overflow-hidden">
                                <img src={dongho} alt="Product" className="w-full h-40 object-cover" />
                                <div className="p-2">
                                    <h3 className="text-sm font-medium">Iphone 13 - VNA - 128GB</h3>
                                    <div className="text-xs text-gray-500">Đã qua sử dụng - 99%</div>
                                    <div className="text-red-500 font-bold mt-1">10.000.000 đ</div>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <ClockIcon size={12} className="mr-1" />
                                        <span>22 giờ trước</span>
                                        <span className="mx-1">•</span>
                                        <span>Hà Nội</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ProductDetail;