import React, { useState, useEffect } from 'react';
import { Star, Grid, List, Filter, X as XIcon, Minus as MinusIcon, Plus as PlusIcon, ShoppingCartIcon } from 'lucide-react';
import dongho from '../../assets/dongho.png'
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import CartModal from '../cart/CartModal'; // Import CartModal component
import { useLocation } from 'react-router-dom';
import { CartEventBus } from '../cart/CartEventBus';

const Categories = () => {
    // State cho dữ liệu từ API
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho bộ lọc
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    // const [selectedRatings, setSelectedRatings] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);

    // Add a new state variable to store the search query
    const [searchQuery, setSearchQuery] = useState('');

    // State cho chế độ xem và sắp xếp
    const [viewMode, setViewMode] = useState('grid');
    const [sortOption, setSortOption] = useState('Đặc sắc');

    // State cho tương tác sản phẩm
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('Đen'); // Default color
    const [selectedSize, setSelectedSize] = useState('M'); // Default size

    // State cho giỏ hàng
    const [showCartModal, setShowCartModal] = useState(false);
    const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0);
    const [addCartMessage, setAddCartMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);

    // Get current user information
    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || "";

    //add this near the top of your component
    const location = useLocation();

    // Danh sách các tỉnh thành
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

    // Lấy dữ liệu danh mục và sản phẩm từ backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Lấy danh mục
                const categoriesData = await ApiService.get('/categories', false);
                setCategories(categoriesData);

                // Lấy sản phẩm
                const productsData = await ApiService.get('/product', false);

                // Parse URL parameters
                const urlParams = new URLSearchParams(location.search);
                const search = urlParams.get('search');
                const categoryId = urlParams.get('category');

                // Save search query in state if present
                if (search) {
                    setSearchQuery(search);

                    // Filter products based on search query
                    const searchLower = search.toLowerCase();
                    const filteredProducts = productsData.filter(product =>
                        product.name.toLowerCase().includes(searchLower) ||
                        (product.description && product.description.toLowerCase().includes(searchLower))
                    );
                    setProducts(filteredProducts);
                } else {
                    setProducts(productsData);
                    // Clear search query when no search is present
                    setSearchQuery('');
                }

                // Set selected category if present in URL
                if (categoryId) {
                    setSelectedCategory(categoryId);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
                setLoading(false);
            }
        };

        fetchData();
    }, [location.search]);

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = async (product, quantity = 1, fromModal = false) => {
        if (!userId) {
            // Redirect to login if user is not logged in
            window.location.href = "/login";
            return;
        }

        try {
            // First find if the user already has a cart
            let cartId;
            try {
                const cartResponse = await ApiService.get(`/cart/user/${userId}`, false);
                cartId = cartResponse._id;
            } catch (error) {
                // If cart doesn't exist, create a new one
                const newCart = await ApiService.post('/cart/create', { user_id: userId });
                cartId = newCart._id;
            }

            // Now add the item to the cart
            const payload = {
                cart_id: cartId,
                product_id: product._id,
                quantity: fromModal ? quantity : 1
            };

            // If options are selected in modal, include them
            if (fromModal && (selectedColor || selectedSize)) {
                payload.selected_options = {
                    color: selectedColor,
                    size: selectedSize
                };
            }

            // Use the correct path - matches with your router
            await ApiService.post('/cart/add-item', payload);

            // Thông báo rằng giỏ hàng đã thay đổi
            CartEventBus.publish('cartUpdated');

            // Đóng cart modal nếu đang mở
            if (showCartModal) {
                setShowCartModal(false);
            }

            // Show success message
            setAddCartMessage(`${product.name} đã được thêm vào giỏ hàng!`);
            setShowMessage(true);

            // Hide message after 3 seconds
            setTimeout(() => {
                setShowMessage(false);
            }, 3000);

            // Always trigger a refresh of the cart when adding items,
            // regardless of whether the cart modal is open or not
            setCartRefreshTrigger(prev => prev + 1);

            // If adding from modal, close it
            if (fromModal) {
                setShowProductModal(false);
                setQuantity(1); // Reset quantity
            }
        } catch (error) {
            console.error("Error adding item to cart:", error);
            setAddCartMessage("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");
            setShowMessage(true);

            setTimeout(() => {
                setShowMessage(false);
            }, 3000);
        }
    };


    // Lọc sản phẩm dựa trên bộ lọc đã chọn
    const filteredProducts = products.filter(product => {
        // Lọc theo danh mục
        if (selectedCategory && product.category_id) {
            // Kiểm tra nếu category_id là mảng hoặc đối tượng
            if (Array.isArray(product.category_id)) {
                const categoryMatch = product.category_id.some(catId =>
                    catId === selectedCategory || (catId._id && catId._id === selectedCategory)
                );
                if (!categoryMatch) return false;
            } else if (product.category_id._id) {
                if (product.category_id._id !== selectedCategory) return false;
            } else if (product.category_id !== selectedCategory) {
                return false;
            }
        }

        // Lọc theo khoảng giá
        if (priceRange.min && product.price < parseFloat(priceRange.min)) return false;
        if (priceRange.max && product.price > parseFloat(priceRange.max)) return false;

        // Lọc theo đánh giá
        // if (selectedRatings.length > 0) {
        //     const productRating = product.rating || 0;
        //     const matchRating = selectedRatings.some(rating => productRating >= rating);
        //     if (!matchRating) return false;
        // }

        // Lọc theo địa điểm
        if (selectedLocations.length > 0) {
            // Giả định mỗi sản phẩm có trường location
            // Nếu không có, bạn cần điều chỉnh logic này
            const productLocation = product.location || 'Hà Nội';
            if (!selectedLocations.includes(productLocation)) return false;
        }

        return true;
    });

    // Sắp xếp sản phẩm dựa trên tùy chọn đã chọn
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOption === 'Giá thấp') {
            return a.price - b.price;
        } else if (sortOption === 'Giá cao') {
            return b.price - a.price;
        } else {
            // Đặc sắc (Featured) - sắp xếp theo is_hot, is_feature, hoặc rating
            // Đầu tiên theo is_hot
            if ((a.is_hot && !b.is_hot) || (a.is_hot === true && b.is_hot !== true)) return -1;
            if ((!a.is_hot && b.is_hot) || (a.is_hot !== true && b.is_hot === true)) return 1;

            // Sau đó theo is_feature
            if ((a.is_feature && !b.is_feature) || (a.is_feature === true && b.is_feature !== true)) return -1;
            if ((!a.is_feature && b.is_feature) || (a.is_feature !== true && b.is_feature === true)) return 1;

            // Sau đó theo rating
            return (b.rating || 0) - (a.rating || 0);
        }
    });

    // Xử lý khi chọn danh mục
    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    };

    // Xử lý khi thay đổi khoảng giá
    const handlePriceChange = (type, value) => {
        setPriceRange(prev => ({ ...prev, [type]: value }));
    };

    // Xử lý khi áp dụng bộ lọc giá
    const applyPriceFilter = () => {
        // Đã được xử lý trong filteredProducts
        console.log("Applied price filter:", priceRange);
    };

    // Xử lý khi chọn đánh giá
    // const handleRatingSelect = (rating) => {
    //     setSelectedRatings(prev => {
    //         if (prev.includes(rating)) {
    //             return prev.filter(r => r !== rating);
    //         } else {
    //             return [...prev, rating];
    //         }
    //     });
    // };

    // Xử lý khi chọn địa điểm
    const handleLocationSelect = (location) => {
        setSelectedLocations(prev => {
            if (prev.includes(location)) {
                return prev.filter(loc => loc !== location);
            } else {
                return [...prev, location];
            }
        });
    };

    // Xóa tất cả bộ lọc
    const clearFilters = () => {
        setSelectedCategory(null);
        setPriceRange({ min: '', max: '' });
        // setSelectedRatings([]);
        setSelectedLocations([]);
    };

    // Xử lý tăng giảm số lượng
    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    // Định dạng giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(price)
            .replace('₫', 'đ');
    };

    // Hiển thị card sản phẩm
    const renderProductCard = (product) => {
        // Quy đổi _id hoặc id để sử dụng nhất quán
        const productId = product._id || product.id;

        return (
            <div
                key={productId}
                className={`
                    border rounded-lg p-4 relative cursor-pointer
                    ${viewMode === 'grid' ? 'w-full' : 'flex items-center'}
                `}
                onMouseEnter={() => setHoveredProduct(productId)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => {
                    setSelectedProduct(product);
                    setShowProductModal(true);
                    setQuantity(1);
                }}
            >
                {product.is_hot && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
                        HOT
                    </div>
                )}
                {product.is_feature && !product.is_hot && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
                        Đặc sắc
                    </div>
                )}
                <div className={`${viewMode === 'grid' ? 'flex flex-col' : 'flex items-center'} relative`}>
                    <div className="relative">
                        <img
                            src={product.thumbnail || dongho}
                            alt={product.name}
                            className={`
                                object-cover 
                                ${viewMode === 'grid' ? 'w-full h-48' : 'w-48 h-48 mr-4'}
                            `}
                        />

                        {/* Nút Thêm giỏ hàng - hiển thị khi hover */}
                        {hoveredProduct === productId && (
                            <div
                                className="absolute bottom-0 left-0 right-0 py-2 bg-white bg-opacity-95 flex items-center justify-center transition-opacity duration-300 shadow-md z-10"
                                onClick={(e) => {
                                    e.stopPropagation(); // Ngăn mở modal
                                    addToCart(product);
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
                        {/* <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={`
                                        ${i < (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                                    `}
                                    fill={i < (product.rating || 0) ? '#fbbf24' : 'none'}
                                />
                            ))}
                            
                        </div> */}
                        <span className="text-xs text-gray-500">Đã bán {product.sold || 0}</span>
                        <p className="text-purple-600 font-bold mt-1">
                            {formatPrice(product.price)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {product.condition || ''} {product.location ? `| ${product.location}` : ''}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // Hiển thị trạng thái đang tải
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    // Hiển thị trạng thái lỗi
    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">❌ Đã xảy ra lỗi</div>
                    <p className="text-gray-700">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                        Tải lại trang
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
            {/* Cart Modal Component */}
            <CartModal
                isOpen={showCartModal}
                onClose={() => setShowCartModal(false)}
                refreshTrigger={cartRefreshTrigger}
            />

            {/* Success/Error Message */}
            {showMessage && (
                <div className="fixed top-5 right-5 bg-white p-4 rounded-lg shadow-lg z-50 border-l-4 border-green-500">
                    <p>{addCartMessage}</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row">
                {/* Sidebar Categories */}
                <div className="md:pr-6 md:border-r md:w-1/4 mb-6 md:mb-0">
                    <h2 className="text-lg font-bold mb-4">DANH MỤC LIÊN QUAN</h2>
                    <ul className="space-y-2">
                        {categories.map((category) => (
                            <li
                                key={category._id}
                                className={`
                                    text-sm cursor-pointer
                                    ${selectedCategory === category._id
                                        ? 'text-purple-600 font-bold'
                                        : 'text-gray-700 hover:text-purple-600'}
                                `}
                                onClick={() => handleCategorySelect(category._id)}
                            >
                                {category.name}
                            </li>
                        ))}
                    </ul>
                    <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                    <div className="mt-8">
                        <h3 className="text-lg font-bold mb-4">BỘ LỌC</h3>
                        <div
                            className="flex items-center text-gray-500 cursor-pointer hover:text-purple-600"
                            onClick={clearFilters}
                        >
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
                                value={priceRange.min}
                                onChange={(e) => handlePriceChange('min', e.target.value)}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-full border rounded px-2 py-1"
                                value={priceRange.max}
                                onChange={(e) => handlePriceChange('max', e.target.value)}
                            />
                        </div>
                        <button
                            className="w-full mt-2 bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                            onClick={applyPriceFilter}
                        >
                            Áp dụng
                        </button>
                    </div>
                    <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                    {/* <div className="mt-4">
                        <h3 className="text-lg font-bold mb-4">NƠI BÁN</h3>
                        <ul className="max-h-60 overflow-y-auto">
                            {provinces.map((province) => {
                                // Tính toán số lượng sản phẩm trên mỗi địa điểm
                                const productCount = products.filter(p => p.location === province).length;
                                if (productCount === 0) return null; // Không hiển thị tỉnh không có sản phẩm
                                
                                return (
                                    <li key={province} className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            id={`location-${province}`} 
                                            checked={selectedLocations.includes(province)}
                                            onChange={() => handleLocationSelect(province)}
                                        />
                                        <label htmlFor={`location-${province}`} className="text-sm text-gray-700">
                                            {province} ({productCount})
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className='w-full h-[1px] bg-gray-600 mt-8'></div> */}
                </div>

                {/* Product Listing */}
                <div className="md:flex-grow md:pl-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-gray-700">
                            <span>{sortedProducts.length} Sản phẩm</span>
                        </div>

                        {searchQuery && (
                            <div className="mb-4 p-3 bg-purple-100 rounded">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-purple-700">
                                        Kết quả tìm kiếm cho: "{searchQuery}"
                                    </span>
                                    <button
                                        className="ml-auto text-xs pl-4 text-purple-500 hover:text-purple-700"
                                        onClick={() => {
                                            // Clear search by redirecting to categories without search param
                                            window.location.href = '/categories';
                                        }}
                                    >
                                        Xóa tìm kiếm
                                    </button>
                                </div>
                            </div>
                        )}
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

                    {/* Hiện thị bộ lọc đang áp dụng */}
                    {(selectedCategory || priceRange.min || priceRange.max > 0 || selectedLocations.length > 0) && (
                        <div className="mb-4 p-3 bg-gray-100 rounded">
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>

                                {selectedCategory && (
                                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center">
                                        {categories.find(c => c._id === selectedCategory)?.name}
                                        <XIcon
                                            size={14}
                                            className="ml-1 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCategory(null);
                                            }}
                                        />
                                    </div>
                                )}

                                {(priceRange.min || priceRange.max) && (
                                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center">
                                        Giá: {priceRange.min ? formatPrice(priceRange.min) : '0đ'} - {priceRange.max ? formatPrice(priceRange.max) : '∞'}
                                        <XIcon
                                            size={14}
                                            className="ml-1 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPriceRange({ min: '', max: '' });
                                            }}
                                        />
                                    </div>
                                )}

                                {/* {selectedRatings.length > 0 && (
                                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center">
                                        Đánh giá: {selectedRatings.sort().join(', ')} sao trở lên
                                        <XIcon 
                                            size={14} 
                                            className="ml-1 cursor-pointer" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRatings([]);
                                            }}
                                        />
                                    </div>
                                )} */}

                                {selectedLocations.length > 0 && (
                                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center">
                                        Địa điểm: {selectedLocations.length > 2
                                            ? `${selectedLocations.slice(0, 2).join(', ')} +${selectedLocations.length - 2}`
                                            : selectedLocations.join(', ')}
                                        <XIcon
                                            size={14}
                                            className="ml-1 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedLocations([]);
                                            }}
                                        />
                                    </div>
                                )}

                                <button
                                    className="text-xs text-red-500 hover:text-red-700 ml-auto"
                                    onClick={clearFilters}
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                        </div>
                    )}

                    {sortedProducts.length > 0 ? (
                        <div
                            className={`
                                grid gap-4 
                                ${viewMode === 'grid'
                                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                                    : 'grid-cols-1'
                                }
                            `}
                        >
                            {sortedProducts.map(renderProductCard)}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.</p>
                            <button
                                className="mt-4 text-purple-600 hover:text-purple-800"
                                onClick={clearFilters}
                            >
                                Xóa bộ lọc và thử lại
                            </button>
                        </div>
                    )}
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

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Product Image */}
                                <div className="w-full md:w-1/3">
                                    <img
                                        src={selectedProduct.thumbnail || dongho}
                                        alt={selectedProduct.name}
                                        className="w-full h-auto rounded"
                                    />

                                    <div className="flex gap-2 mt-4">
                                        <div className="border border-gray-300 p-1 w-16 h-16">
                                            <img
                                                src={selectedProduct.thumbnail || dongho}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="border border-gray-300 p-1 w-16 h-16">
                                            <img
                                                src={selectedProduct.thumbnail || dongho}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="w-full md:w-2/3">
                                    <h3 className="text-lg font-bold mb-1">{selectedProduct.name}</h3>
                                    <p className="text-red-500 font-bold text-lg mb-6">{formatPrice(selectedProduct.price)}</p>

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
                            <div className='flex flex-col sm:flex-row gap-4'>
                                <button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium mt-4"
                                    onClick={() => {
                                        alert(`Đã thêm ${quantity} ${selectedProduct.name} vào giỏ hàng!`);
                                        setShowProductModal(false);
                                    }}
                                >
                                    THÊM VÀO GIỎ HÀNG
                                </button>
                                <button
                                    onClick={() => window.location.href = `/product-detail?id=${selectedProduct._id || selectedProduct.id}`}
                                    className='w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium mt-4'
                                >
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