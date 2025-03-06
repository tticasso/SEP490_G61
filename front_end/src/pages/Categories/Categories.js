import React, { useState } from 'react';
import { Star, Grid, List, Filter, X as XIcon, Minus as MinusIcon, Plus as PlusIcon } from 'lucide-react';
import dongho from '../../assets/dongho.png'

const Categories = () => {
    // Sample product data (you would typically fetch this from an API)
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'dwdqw123',
            image: dongho,
            price: 1212000,
            rating: 5,
            soldCount: 0,
            location: 'Phú Thọ',
            isNew: true
        },
        {
            id: 2,
            name: 'Đồng hồ trắng',
            image: dongho,
            price: 326000,
            rating: 5,
            soldCount: 5,
            location: 'Hải Phòng',
            isNew: true
        },
        {
            id: 3,
            name: 'Đồng hồ đen',
            image: dongho,
            price: 4420000,
            rating: 5,
            soldCount: 0,
            location: 'Ninh Bình',
            isNew: true
        },
        {
            id: 4,
            name: 'Đồng hồ đẳng cấp số 1 Châu Á',
            image: dongho,
            price: 2700000,
            rating: 5,
            soldCount: 0,
            location: 'Phú Thọ',
            isNew: true
        },
        {
            id: 5,
            name: 'Đồng hồ Casio',
            image: dongho,
            price: 23459000,
            rating: 5,
            soldCount: 0,
            location: 'Hưng yên',
            isNew: true
        },
        {
            id: 6,
            name: 'Đồng hồ Legion 5 pro',
            image: dongho,
            price: 19990000,
            rating: 5,
            soldCount: 0,
            location: 'Quảng Ngãi',
            discount: 9
        }
    ]);

    const provinces = [
        "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
        "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
        "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
        "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
        "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng",
        "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang",
        "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai",
        "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận",
        "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi",
        "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh",
        "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang",
        "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
    ];

    // State for view mode and sorting
    const [viewMode, setViewMode] = useState('grid');
    const [sortOption, setSortOption] = useState('Đặc sắc');

    // Add these states for hover and modal functionality
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Sidebar categories
    const categories = [
        'Đồ điện tử',
        'Đồng hồ',
        "Thời Trang Nam",
        "Thời Trang Nữ",
        "Đồ gia dụng",
        "Đồ cho thú cưng",
    ];

    // Render product card
    const renderProductCard = (product) => {
        return (
            <div
                key={product.id}
                className={`
                    border rounded-lg p-4 relative cursor-pointer
                    ${viewMode === 'grid' ? 'w-full' : 'flex items-center'}
                `}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => {
                    setSelectedProduct(product);
                    setShowProductModal(true);
                    setQuantity(1);
                }}
            >
                {product.isNew && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-10">
                        Mới
                    </div>
                )}
                {product.discount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
                        -{product.discount}%
                    </div>
                )}
                <div className={`${viewMode === 'grid' ? 'flex flex-col' : 'flex items-center'} relative`}>
                    <div className="relative">
                        <img
                            src={product.image}
                            alt={product.name}
                            className={`
                                object-cover 
                                ${viewMode === 'grid' ? 'w-full h-48' : 'w-48 h-48 mr-4'}
                            `}
                        />

                        {/* Add to Cart Button - Shows on hover */}
                        {hoveredProduct === product.id && (
                            <div
                                className="absolute bottom-0 left-0 right-0 py-2 bg-white bg-opacity-95 flex items-center justify-center transition-opacity duration-300 shadow-md z-10"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent opening the modal
                                    // Add to cart logic here
                                    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
                                }}
                            >
                                <button className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md font-medium text-sm">
                                    Thêm Giỏ Hàng
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-grow mt-2">
                        <h3 className="text-sm font-medium">{product.name}</h3>
                        <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={`
                                        ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}
                                    `}
                                    fill={i < product.rating ? '#fbbf24' : 'none'}
                                />
                            ))}
                            <span className="ml-2 text-xs text-gray-500">Đã bán {product.soldCount}</span>
                        </div>
                        <p className="text-purple-600 font-bold mt-1">
                            {product.price.toLocaleString()} đ
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Còn {Math.floor(Math.random() * 300)} Sản phẩm | {product.location}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // Handle increment and decrement quantity
    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex">
                {/* Sidebar Categories */}
                <div className="pr-6 border-r w-1/4">
                    <h2 className="text-lg font-bold mb-4">DANH MỤC LIÊN QUAN</h2>
                    <ul className="space-y-2">
                        {categories.map((category, index) => (
                            <li
                                key={index}
                                className="text-sm text-gray-700 hover:text-purple-600 cursor-pointer"
                            >
                                {category}
                            </li>
                        ))}
                    </ul>
                    <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                    <div className="mt-8">
                        <h3 className="text-lg font-bold mb-4">BỘ LỌC</h3>
                        <div className="flex items-center text-gray-500">
                            <Filter size={16} className="mr-2" />
                            <span>Xóa bộ lọc</span>
                        </div>
                    </div>
                    <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                    <div className="mt-4">
                        <h3 className="text-lg font-bold mb-4">GIÁ</h3>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-full border rounded px-2 py-1"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-full border rounded px-2 py-1"
                            />
                        </div>
                        <button className="w-full mt-2 bg-purple-600 text-white py-2 rounded">
                            Áp dụng
                        </button>
                    </div>
                    <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                    <div className="mt-4">
                        <h3 className="text-lg font-bold mb-4">ĐÁNH GIÁ CỦA NGƯỜI BÁN</h3>
                        <ul>
                            {[5, 4, 3, 2, 1].map((rating, index, array) => (
                                <li key={rating} className="flex items-center space-x-2">
                                    <input type="checkbox" id={`rating-${rating}`} />
                                    <label htmlFor={`rating-${rating}`} className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill={i < rating ? '#fbbf24' : 'none'}
                                            />
                                        ))}
                                        {index !== 0 && ( // Kiểm tra nếu không phải phần tử đầu tiên (5 sao)
                                            <span className="ml-2 text-sm text-gray-700">({rating}) Trở lên</span>
                                        )}
                                        {index !== 5 || index !== 0 && (
                                            <span className="ml-2 text-sm text-gray-700">(5)</span>
                                        )}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                    <div className="mt-4">
                        <h3 className="text-lg font-bold mb-4">NƠI BÁN</h3>
                        <ul>
                            {provinces.map((province) => (
                                <li key={province} className="flex items-center space-x-2">
                                    <input type="checkbox" id={`location-${province}`} />
                                    <label htmlFor={`location-${province}`} className="text-sm text-gray-700">
                                        {province} (0)
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                </div>

                {/* Product Listing */}
                <div className="flex-grow pl-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-gray-700">
                            <span>14 Sản phẩm</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`
                                        p-2 rounded 
                                        ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'}
                                    `}
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`
                                        p-2 rounded 
                                        ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'}
                                    `}
                                >
                                    <List size={20} />
                                </button>
                            </div>
                            <div>
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="Đặc sắc">Đặc sắc</option>
                                    <option value="Giá thấp">Giá thấp</option>
                                    <option value="Giá cao">Giá cao</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`
                            grid gap-4 
                            ${viewMode === 'grid'
                                ? 'grid-cols-4'
                                : 'grid-cols-1'
                            }
                        `}
                    >
                        {products.map(renderProductCard)}
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
                                    <p className="text-red-500 font-bold text-lg mb-6">{selectedProduct.price.toLocaleString()} đ</p>

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
                                                M<br />&lt;45kg&gt;
                                            </button>
                                            <button className="border border-gray-300 px-4 py-2 rounded bg-white text-gray-800">
                                                L<br />&lt;55kg&gt;
                                            </button>
                                            <button className="border border-gray-300 px-4 py-2 rounded bg-white text-gray-800">
                                                XL<br />&lt;70kg&gt;
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="mb-8">
                                        <p className="text-gray-600 mb-2">Số lượng:</p>
                                        <div className="flex items-center">
                                            <button
                                                className="border border-gray-300 px-3 py-1 flex items-center justify-center"
                                                onClick={handleDecrement}
                                            >
                                                <MinusIcon size={16} />
                                            </button>
                                            <input
                                                type="text"
                                                value={quantity}
                                                className="border-t border-b border-gray-300 w-16 py-1 text-center"
                                                readOnly
                                            />
                                            <button
                                                className="border border-gray-300 px-3 py-1 flex items-center justify-center"
                                                onClick={handleIncrement}
                                            >
                                                <PlusIcon size={16} />
                                            </button>
                                            <span className="text-gray-500 ml-4">12 sản phẩm có sẵn</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <div className='flex gap-4'>
                                <button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium mt-4"
                                    onClick={() => {
                                        alert(`Đã thêm ${quantity} ${selectedProduct.name} vào giỏ hàng!`);
                                        setShowProductModal(false);
                                    }}
                                >
                                    THÊM VÀO GIỎ HÀNG
                                </button>
                                <button onClick={() => window.location.href = '/product-detail'} className='w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium mt-4'>
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

export default Categories;