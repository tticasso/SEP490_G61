import React from 'react';
import { SearchIcon, UserIcon, HeartIcon, ShoppingCartIcon, ClockIcon, LocationIcon } from 'lucide-react';

const Header = () => {
    return (
        <div className="">
            <header className="flex items-center justify-between py-4 px-4 bg-white max-w-7xl mx-auto ">
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

            <div className='border-b border-gray-500'></div>

            <nav className="max-w-7xl mx-auto flex items- justify-stretch space-x-6 px-4 py-2 bg-white">
                <button className="flex items-center text-blue-600">
                    <span className="mr-2">☰</span>
                    <span className="font-medium">Danh mục sản phẩm</span>
                </button>
                <a href="#" className="text-gray-700">Trang chủ</a>
                <a href="#" className="text-gray-700">Danh mục</a>
                <a href="#" className="text-gray-700">Hỗ Trợ</a>
                <a href="#" className="text-red-500">Đăng kí bán hàng</a>
            </nav>

            <div className='border-b border-gray-500'></div>

        </div>
    );
};

export default Header;