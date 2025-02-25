import React from 'react';
import { SearchIcon, UserIcon, HeartIcon, ShoppingCartIcon, ClockIcon, LocationIcon } from 'lucide-react';
import image from '../assets/image1.png'
import dongho from '../assets/dongho.png'

const TroocEcommerce = () => {
    return (
        <div className='bg-[#F1F5F9]'>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between py-4 px-4 border-b bg-white">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-3xl italic font-bold text-blue-600">TROOC</h1>
                    </div>

                    <div className="relative w-96">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full rounded-full border border-gray-300 py-2 px-4 focus:outline-none"
                        />
                        <button className="absolute right-0 top-0 bg-[#446AB1] text-white h-full px-8 rounded-r-full">
                            <SearchIcon size={20} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-10">
                        <div className="flex items-center">
                            <UserIcon size={24} className="mr-2 text-blue-800" />
                            <div className="flex flex-col text-sm">
                                <span className="font-medium">Đăng nhập</span>
                                <span>Tài khoản</span>
                            </div>
                        </div>

                        <HeartIcon size={28} className="text-blue-600" />

                        <div className="flex items-center">
                            <ShoppingCartIcon size={28} className="text-blue-600 mr-2" />
                            <div className="flex flex-col text-sm">
                                <span className="font-medium">Giỏ hàng</span>
                                <span>0 đ</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Navigation */}
                <nav className="flex items- justify-stretch space-x-6 px-4 py-2 border-b bg-white">
                    <button className="flex items-center text-blue-600">
                        <span className="mr-2">☰</span>
                        <span className="font-medium">Danh mục sản phẩm</span>
                    </button>
                    <a href="#" className="text-gray-700">Trang chủ</a>
                    <a href="#" className="text-gray-700">Danh mục</a>
                    <a href="#" className="text-gray-700">Hỗ Trợ</a>
                    <a href="#" className="text-red-500">Đăng kí bán hàng</a>
                </nav>

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