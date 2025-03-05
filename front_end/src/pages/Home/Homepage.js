import React from 'react';
import { SearchIcon, UserIcon, HeartIcon, ShoppingCartIcon, ClockIcon, LocationIcon } from 'lucide-react';
import image from '../../assets/image1.png'
import dongho from '../../assets/dongho.png'

const TroocEcommerce = () => {
    return (
        <div className='bg-[#F1F5F9] pb-20'>
            <div className="max-w-7xl mx-auto">

                {/* Main Content */}
                <div className="">

                    {/* Main Content */}
                    <div className="w-full">
                        {/* Banner */}
                        <div className="pt-4 pb-4 bg-[#F1F5F9]">

                            <div className="space-y-2">
                                <div className="w-full flex gap-x-8 justify-center">
                                    {/* Sidebar */}
                                    <div className="w-1/5 bg-white">
                                        <div className=" space-y-2 pt-3 pb-3 pl-3 pr-5">
                                            <div className="p-3 border-b border-black ">
                                                <h3 className="font-medium text-gray-800 mb-2">Thời trang nam</h3>
                                            </div>
                                            <div className="p-3 border-b border-black">
                                                <h3 className="font-medium text-gray-800 mb-2">Thời trang nữ</h3>
                                            </div>
                                            <div className="p-3 border-b border-black">
                                                <h3 className="font-medium text-gray-800 mb-2">Phụ kiện thời trang</h3>
                                            </div>
                                            <div className="p-3 border-b border-black">
                                                <h3 className="font-medium text-gray-800 mb-2">Đồ công nghệ</h3>
                                            </div>
                                            <div className="p-3">
                                                <h3 className="font-medium text-gray-800 mb-2">Đồng hồ</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='w-4/5'>
                                        <img src={image} alt="Apple logo" className="w-full"/>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* New products */}
                        <div className="">
                            <div className="flex items-center mb-4 bg-white p-4">
                                <ClockIcon size={24} className="text-red-500 mr-2" />
                                <h2 className="text-lg font-bold text-red-500">SẢN PHẨM MỚI</h2>
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
                        <div className="mt-10 p-4 bg-white pb-10">
                            <div className="w-full">
                                <h2 className="text-lg text-center font-bold text-blue-500">GỢI Ý HÔM NAY</h2>
                            </div>

                            <div className='bg-[#5E81C2] h-[4px]'></div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-5 gap-4 pt-8">
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

                            {/* Product Grid */}
                            <div className="grid grid-cols-5 gap-4 pt-8">
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
            </div>
        </div>
    );
};

export default TroocEcommerce;