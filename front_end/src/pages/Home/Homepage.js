import React, { useState } from 'react';
import { SearchIcon, UserIcon, HeartIcon, ShoppingCartIcon, ClockIcon, LocationIcon, X as XIcon, Minus as MinusIcon, Plus as PlusIcon } from 'lucide-react';
import image from '../../assets/image1.png'
import dongho from '../../assets/dongho.png'
import clockBanner from '../../assets/clockBanner.jpg'
import clothesBanner from '../../assets/clothesBanner.jpg'
import phoneBanner from '../../assets/phoneBanner.jpg'

const TroocEcommerce = () => {
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

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
                                    <div 
                                        key={item} 
                                        className="border rounded bg-white overflow-hidden relative cursor-pointer"
                                        onMouseEnter={() => setHoveredProduct(item)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                        onClick={() => {
                                            setSelectedProduct({
                                                id: item,
                                                name: "Iphone 13 - VNA - 128GB",
                                                price: "10.000.000 đ",
                                                condition: "Đã qua sử dụng - 99%",
                                                image: dongho
                                            });
                                            setShowProductModal(true);
                                        }}
                                    >
                                        <img src={dongho} alt="Product" className="w-full h-40 object-cover" />
                                        {/* Add to Cart Button - Appears on hover at the bottom of the product */}
                                        {hoveredProduct === item && (
                                            <div className="absolute bottom-0 left-0 right-0 py-2 bg-white bg-opacity-95 flex items-center justify-center transition-opacity duration-300 shadow-md">
                                                <button className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md font-medium text-sm">
                                                    Thêm Giỏ Hàng
                                                </button>
                                            </div>
                                        )}
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

                        {/* Promotional Banners - Added based on the image */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            {/* Clock Banner */}
                            <div className="bg-indigo-700 p-6 rounded-lg text-white relative overflow-hidden">
                                <div className="z-10 relative">
                                    <h3 className="text-2xl font-bold mb-1">Quần áo</h3>
                                    <p className="text-yellow-300 font-bold text-xl">Giảm 20% Sản phẩm</p>
                                    <p className="text-sm mt-1">Miễn phí ships</p>
                                </div>
                                <img 
                                    src={clothesBanner} 
                                    alt="Game controller" 
                                    className="absolute right-0 bottom-0 w-full h-full z-0"
                                />
                            </div>
                            
                            {/* Clothes Banner */}
                            <div className="bg-teal-500 p-6 rounded-lg text-white relative overflow-hidden">
                                <div className="z-10 relative">
                                    <h3 className="text-2xl font-bold mb-1">Điện thoại 2hand</h3>
                                    <p className="text-yellow-300 font-bold text-xl">Giảm giá 80%</p>
                                    <p className="text-sm mt-1">Miễn phí ship toàn quốc</p>
                                </div>
                                <img 
                                    src={phoneBanner} 
                                    alt="Polaroid camera" 
                                    className="absolute right-0 bottom-0 w-full h-full z-0"
                                />
                            </div>
                            
                            {/* Phone Banner */}
                            <div className="bg-red-500 p-6 rounded-lg text-white relative overflow-hidden">
                                <div className="z-10 relative">
                                    <h3 className="text-2xl font-bold mb-1">Máy tính bảng</h3>
                                    <p className="text-yellow-300 font-bold text-xl">Giảm đến 1 triệu đồng</p>
                                    <p className="text-sm mt-1">Free shipping 20km Radius</p>
                                </div>
                                <img 
                                    src={clockBanner} 
                                    alt="Tablet computer" 
                                    className="absolute right-0 bottom-0 w-full h-full z-0"
                                />
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
                                    <div 
                                        key={item} 
                                        className="border rounded bg-white overflow-hidden relative cursor-pointer"
                                        onMouseEnter={() => setHoveredProduct(item+100)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                        onClick={() => {
                                            setSelectedProduct({
                                                id: item+100,
                                                name: "Iphone 13 - VNA - 128GB",
                                                price: "10.000.000 đ",
                                                condition: "Đã qua sử dụng - 99%",
                                                image: dongho
                                            });
                                            setShowProductModal(true);
                                        }}
                                    >
                                        <img src={dongho} alt="Product" className="w-full h-40 object-cover" />
                                        {/* Add to Cart Button - Appears on hover at the bottom of the product */}
                                        {hoveredProduct === item+100 && (
                                            <div className="absolute bottom-0 left-0 right-0 py-2 bg-white bg-opacity-95 flex items-center justify-center transition-opacity duration-300 shadow-md">
                                                <button className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md font-medium text-sm">
                                                    Thêm Giỏ Hàng
                                                </button>
                                            </div>
                                        )}
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
                                    <div 
                                        key={item} 
                                        className="border rounded bg-white overflow-hidden relative cursor-pointer"
                                        onMouseEnter={() => setHoveredProduct(item+200)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                        onClick={() => {
                                            setSelectedProduct({
                                                id: item+200,
                                                name: "Iphone 13 - VNA - 128GB",
                                                price: "10.000.000 đ",
                                                condition: "Đã qua sử dụng - 99%",
                                                image: dongho
                                            });
                                            setShowProductModal(true);
                                        }}
                                    >
                                        <img src={dongho} alt="Product" className="w-full h-40 object-cover" />
                                        {/* Add to Cart Button - Appears on hover at the bottom of the product */}
                                        {hoveredProduct === item+200 && (
                                            <div className="absolute bottom-0 left-0 right-0 py-2 bg-white bg-opacity-95 flex items-center justify-center transition-opacity duration-300 shadow-md">
                                                <button className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md font-medium text-sm">
                                                    Thêm Giỏ Hàng
                                                </button>
                                            </div>
                                        )}
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

            {/* Product Modal */}
            {showProductModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-11/12 max-w-4xl overflow-hidden relative">
                        <button 
                            className="absolute top-4 right-4 text-gray-800"
                            onClick={() => setShowProductModal(false)}
                        >
                            <XIcon size={24} />
                        </button>
                        
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-6">CHỌN BIẾN THỂ</h2>
                            
                            <div className="flex gap-8">
                                {/* Product Image */}
                                <div className="w-1/3">
                                    <img 
                                        src={selectedProduct.image} 
                                        alt={selectedProduct.name} 
                                        className="w-full h-auto rounded"
                                    />
                                    
                                    <div className="flex gap-2 mt-4">
                                        <div className="border border-gray-300 p-1 w-16 h-16">
                                            <img 
                                                src={selectedProduct.image} 
                                                alt="Thumbnail" 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div className="border border-gray-300 p-1 w-16 h-16">
                                            <img 
                                                src={selectedProduct.image} 
                                                alt="Thumbnail" 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Product Details */}
                                <div className="w-2/3">
                                    <h3 className="text-lg font-bold mb-1">{selectedProduct.name}</h3>
                                    <p className="text-red-500 font-bold text-lg mb-6">{selectedProduct.price}</p>
                                    
                                    {/* Color Selection */}
                                    <div className="mb-6">
                                        <p className="text-gray-600 mb-2">Màu:</p>
                                        <div className="flex gap-2">
                                            <button className="border border-gray-300 px-4 py-2 rounded bg-black text-white">
                                                Đen
                                            </button>
                                            <button className="border border-purple-500 px-4 py-2 rounded bg-white text-gray-800">
                                                Trắng
                                            </button>
                                            <button className="border border-gray-300 px-4 py-2 rounded bg-white text-gray-800">
                                                Hồng
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Size Selection */}
                                    <div className="mb-6">
                                        <p className="text-gray-600 mb-2">Kích thước:</p>
                                        <div className="flex gap-2">
                                            <button className="border border-purple-500 px-4 py-2 rounded bg-white text-gray-800">
                                                M<br/>&lt;45kg&gt;
                                            </button>
                                            <button className="border border-gray-300 px-4 py-2 rounded bg-white text-gray-800">
                                                L<br/>&lt;55kg&gt;
                                            </button>
                                            <button className="border border-gray-300 px-4 py-2 rounded bg-white text-gray-800">
                                                XL<br/>&lt;70kg&gt;
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Quantity */}
                                    <div className="mb-8">
                                        <p className="text-gray-600 mb-2">Số lượng:</p>
                                        <div className="flex items-center">
                                            <button className="border border-gray-300 px-3 py-1 flex items-center justify-center">
                                                <MinusIcon size={16} />
                                            </button>
                                            <input 
                                                type="text" 
                                                value="1" 
                                                className="border-t border-b border-gray-300 w-16 py-1 text-center" 
                                                readOnly
                                            />
                                            <button className="border border-gray-300 px-3 py-1 flex items-center justify-center">
                                                <PlusIcon size={16} />
                                            </button>
                                            <span className="text-gray-500 ml-4">12 sản phẩm có sẵn</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Add to Cart Button */}
                            <div className='flex gap-4'>
                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium mt-4">
                                THÊM VÀO GIỎ HÀNG
                            </button>
                            <button onClick={() => window.location.href = '/product-detail'} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium mt-4">
                                Xem thông tin chi tiết
                            </button>
                            </div>
                            
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TroocEcommerce;