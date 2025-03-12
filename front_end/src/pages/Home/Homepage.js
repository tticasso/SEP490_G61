import React, { useState, useEffect } from 'react';
import { SearchIcon, UserIcon, HeartIcon, ShoppingCartIcon, ClockIcon, X as XIcon, Minus as MinusIcon, Plus as PlusIcon } from 'lucide-react';
import image from '../../assets/image1.png'
import dongho from '../../assets/dongho.png'
import clockBanner from '../../assets/clockBanner.jpg'
import clothesBanner from '../../assets/clothesBanner.jpg'
import phoneBanner from '../../assets/phoneBanner.jpg'
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import CartModal from '../cart/CartModal'; // Import CartModal component

const TroocEcommerce = () => {
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productQuantity, setProductQuantity] = useState(1); // Track quantity for modal
    const [selectedColor, setSelectedColor] = useState('Đen'); // Default color
    const [selectedSize, setSelectedSize] = useState('M'); // Default size
    const [addCartMessage, setAddCartMessage] = useState(''); // Message for cart confirmation
    const [showMessage, setShowMessage] = useState(false); // Control message visibility
    const [showCartModal, setShowCartModal] = useState(false); // State for CartModal visibility
    const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0); // Trigger để làm mới CartModal
    
    // States cho dữ liệu từ API
    const [products, setProducts] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get current user information
    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || "";

    // Gọi API lấy danh sách sản phẩm khi component được mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Lấy danh sách sản phẩm
                const productsData = await ApiService.get('/product', false);
                setProducts(productsData);
                
                // Lấy danh sách danh mục
                const categoriesData = await ApiService.get('/categories', false);
                setCategories(categoriesData);
                
                // Lọc sản phẩm mới (5 sản phẩm mới nhất)
                const sortedByDate = [...productsData].sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setNewProducts(sortedByDate.slice(0, 5));
                
                // Lọc sản phẩm đề xuất (sản phẩm có is_feature = true hoặc là các sản phẩm bán chạy nhất)
                const featuredProducts = productsData.filter(product => product.is_feature);
                const hotProducts = productsData.filter(product => product.is_hot);
                const sortedBySold = [...productsData].sort((a, b) => b.sold - a.sold);
                
                // Kết hợp các sản phẩm đặc biệt, loại bỏ trùng lặp và lấy tối đa 10 sản phẩm
                const combined = [...featuredProducts, ...hotProducts, ...sortedBySold];
                const uniqueIds = new Set();
                const uniqueProducts = [];
                
                for (const product of combined) {
                    if (!uniqueIds.has(product._id)) {
                        uniqueIds.add(product._id);
                        uniqueProducts.push(product);
                        if (uniqueProducts.length >= 10) break;
                    }
                }
                
                setRecommendedProducts(uniqueProducts);
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Hàm format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(price)
            .replace('₫', 'đ');
    };
    
    // Hàm format thời gian
    const formatTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 24) {
            return `${diffHours} giờ trước`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} ngày trước`;
        }
    };

    
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
                quantity: fromModal ? productQuantity : quantity
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
                setProductQuantity(1); // Reset quantity
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

    // Component hiển thị sản phẩm
    const ProductCard = ({ product, index, isHoveredProduct }) => {
        return (
            <div 
                key={product._id} 
                className="border rounded bg-white overflow-hidden relative cursor-pointer"
                onMouseEnter={() => setHoveredProduct(index)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => {
                    setSelectedProduct({
                        id: product._id,
                        name: product.name,
                        price: formatPrice(product.price),
                        condition: product.condition || "Mới 100%",
                        image: product.thumbnail || dongho,
                        // Pass the full product for cart functionality
                        fullProduct: product
                    });
                    setShowProductModal(true);
                }}
            >
                <img 
                    src={product.thumbnail || dongho} 
                    alt={product.name} 
                    className="w-full h-40 object-cover" 
                />
                
                {/* Add to Cart Button - Appears on hover at the bottom of the product */}
                {isHoveredProduct && (
                    <div className="absolute bottom-0 left-0 right-0 py-2 bg-white bg-opacity-95 flex items-center justify-center transition-opacity duration-300 shadow-md">
                        <button 
                            className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md font-medium text-sm"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent opening modal when clicking button
                                addToCart(product);
                            }}
                        >
                            Thêm Giỏ Hàng
                        </button>
                    </div>
                )}
                
                <div className="p-2">
                    <h3 className="text-sm font-medium">{product.name}</h3>
                    <div className="text-xs text-gray-500">{product.condition || "Mới 100%"}</div>
                    <div className="text-red-500 font-bold mt-1">{formatPrice(product.price)}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                        <ClockIcon size={12} className="mr-1" />
                        <span>{formatTime(product.created_at)}</span>
                        <span className="mx-1">•</span>
                        <span>Hà Nội</span>
                    </div>
                </div>
            </div>
        );
    };

    // Hiển thị loading
    if (loading) {
        return (
            <div className="bg-[#F1F5F9] min-h-screen flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Đang tải dữ liệu...</h2>
                    <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    // Hiển thị lỗi
    if (error) {
        return (
            <div className="bg-[#F1F5F9] min-h-screen flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2 text-red-600">Đã xảy ra lỗi</h2>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-[#F1F5F9] pb-20 relative'>
            {/* Success/Error Message */}
            {showMessage && (
                <div className="fixed top-5 right-5 bg-white p-4 rounded-lg shadow-lg z-50 border-l-4 border-green-500">
                    <p>{addCartMessage}</p>
                </div>
            )}
            
            {/* Cart Modal Component */}
            <CartModal 
                isOpen={showCartModal} 
                onClose={() => setShowCartModal(false)}
                refreshTrigger={cartRefreshTrigger} // Sử dụng prop này để kích hoạt refresh
            />
            
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
                                            {categories.map((category) => (
                                                <div key={category._id} className="p-3 border-b border-black">
                                                    <h3 className="font-medium text-gray-800 mb-2">{category.name}</h3>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className='w-4/5'>
                                        <img src={image} alt="Banner" className="w-full"/>
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
                                {newProducts.map((product, index) => (
                                    <ProductCard 
                                        key={product._id}
                                        product={product}
                                        index={`new-${index}`} 
                                        isHoveredProduct={hoveredProduct === `new-${index}`}
                                    />
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
                                {recommendedProducts.slice(0, 5).map((product, index) => (
                                    <ProductCard 
                                        key={product._id}
                                        product={product}
                                        index={`rec1-${index}`} 
                                        isHoveredProduct={hoveredProduct === `rec1-${index}`}
                                    />
                                ))}
                            </div>

                            {/* Product Grid - Second Row */}
                            {recommendedProducts.length > 5 && (
                                <div className="grid grid-cols-5 gap-4 pt-8">
                                    {recommendedProducts.slice(5, 10).map((product, index) => (
                                        <ProductCard 
                                            key={product._id}
                                            product={product}
                                            index={`rec2-${index}`} 
                                            isHoveredProduct={hoveredProduct === `rec2-${index}`}
                                        />
                                    ))}
                                </div>
                            )}
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
                                            <button 
                                                className={`border ${selectedColor === 'Đen' ? 'border-purple-500' : 'border-gray-300'} px-4 py-2 rounded bg-black text-white`}
                                                onClick={() => setSelectedColor('Đen')}
                                            >
                                                Đen
                                            </button>
                                            <button 
                                                className={`border ${selectedColor === 'Trắng' ? 'border-purple-500' : 'border-gray-300'} px-4 py-2 rounded bg-white text-gray-800`}
                                                onClick={() => setSelectedColor('Trắng')}
                                            >
                                                Trắng
                                            </button>
                                            <button 
                                                className={`border ${selectedColor === 'Hồng' ? 'border-purple-500' : 'border-gray-300'} px-4 py-2 rounded bg-white text-gray-800`}
                                                onClick={() => setSelectedColor('Hồng')}
                                            >
                                                Hồng
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Size Selection */}
                                    <div className="mb-6">
                                        <p className="text-gray-600 mb-2">Kích thước:</p>
                                        <div className="flex gap-2">
                                            <button 
                                                className={`border ${selectedSize === 'M' ? 'border-purple-500' : 'border-gray-300'} px-4 py-2 rounded bg-white text-gray-800`}
                                                onClick={() => setSelectedSize('M')}
                                            >
                                                M<br/>&lt;45kg&gt;
                                            </button>
                                            <button 
                                                className={`border ${selectedSize === 'L' ? 'border-purple-500' : 'border-gray-300'} px-4 py-2 rounded bg-white text-gray-800`}
                                                onClick={() => setSelectedSize('L')}
                                            >
                                                L<br/>&lt;55kg&gt;
                                            </button>
                                            <button 
                                                className={`border ${selectedSize === 'XL' ? 'border-purple-500' : 'border-gray-300'} px-4 py-2 rounded bg-white text-gray-800`}
                                                onClick={() => setSelectedSize('XL')}
                                            >
                                                XL<br/>&lt;70kg&gt;
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Quantity */}
                                    <div className="mb-8">
                                        <p className="text-gray-600 mb-2">Số lượng:</p>
                                        <div className="flex items-center">
                                            <button 
                                                className="border border-gray-300 px-3 py-1 flex items-center justify-center"
                                                onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                                            >
                                                <MinusIcon size={16} />
                                            </button>
                                            <input 
                                                type="text" 
                                                value={productQuantity} 
                                                className="border-t border-b border-gray-300 w-16 py-1 text-center" 
                                                readOnly
                                            />
                                            <button 
                                                className="border border-gray-300 px-3 py-1 flex items-center justify-center"
                                                onClick={() => setProductQuantity(productQuantity + 1)}
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
                                onClick={() => addToCart(selectedProduct.fullProduct, productQuantity, true)}
                            >
                                THÊM VÀO GIỎ HÀNG
                            </button>
                            <button 
                                onClick={() => {
                                    window.location.href = `/product-detail?id=${selectedProduct.id}`;
                                }} 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium mt-4"
                            >
                                Xem thông tin chi tiết
                            </button>
                            </div>
                            
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Button (now more visible) */}
            <button
                className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 z-40 flex items-center justify-center"
                onClick={() => {
                    setShowCartModal(true);
                }}
            >
                <ShoppingCartIcon size={24} />
            </button>
        </div>
    );
};

export default TroocEcommerce;