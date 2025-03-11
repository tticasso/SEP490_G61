import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ShoppingCart, MessageCircle, Heart, Share2, Check, Star } from 'lucide-react';
import { SearchIcon, UserIcon, HeartIcon, ShoppingCartIcon, ClockIcon, LocationIcon, MessageSquareText } from 'lucide-react';
import dongho from '../../assets/ProductDetail.png';
import ShopOwner from '../../assets/ShopOwner.png';
import ApiService from '../../services/ApiService';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const ProductDetail = () => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('details');
    
    // States for API data
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [seller, setSeller] = useState(null);

    // Get product ID from URL
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                
                // Get product ID from URL query parameter
                const urlParams = new URLSearchParams(window.location.search);
                const productId = urlParams.get('id');
                
                if (!productId) {
                    throw new Error("Không tìm thấy ID sản phẩm trong URL");
                }
                
                // Fetch product details
                const productData = await ApiService.get(`/product/${productId}`, false);
                console.log("Product data:", productData); // Debug log
                
                if (!productData) {
                    throw new Error("Không tìm thấy thông tin sản phẩm");
                }
                
                setProduct(productData);
                
                // Fetch seller info if product has creator information
                if (productData.created_by) {
                    try {
                        const sellerData = await ApiService.get(`/user/find/${productData.created_by}`, false);
                        setSeller(sellerData);
                    } catch (sellerError) {
                        console.error("Error fetching seller data:", sellerError);
                        // Don't throw error here, continue with product display
                    }
                }
                
                // Fetch similar products (products in the same category)
                try {
                    if (productData.category_id) {
                        // Handle if category_id is an array or a single object
                        let categoryId;
                        
                        if (Array.isArray(productData.category_id) && productData.category_id.length > 0) {
                            // Handle various possible structures of category_id array
                            const firstCategory = productData.category_id[0];
                            if (typeof firstCategory === 'string') {
                                categoryId = firstCategory;
                            } else if (firstCategory && typeof firstCategory === 'object') {
                                categoryId = firstCategory._id || firstCategory.id || firstCategory;
                            }
                        } else if (typeof productData.category_id === 'string') {
                            // If category_id is a string
                            categoryId = productData.category_id;
                        } else if (productData.category_id && typeof productData.category_id === 'object') {
                            // If category_id is an object
                            categoryId = productData.category_id._id || productData.category_id.id || productData.category_id;
                        }
                        
                        if (categoryId) {
                            const allProducts = await ApiService.get('/product', false);
                            
                            // Extra protection for filtering
                            const filtered = allProducts
                                .filter(p => {
                                    // Skip undefined/null products
                                    if (!p) return false;
                                    
                                    // Skip current product
                                    if (p._id === productId) return false;
                                    
                                    // Handle various possible structures of category_id
                                    try {
                                        if (Array.isArray(p.category_id) && p.category_id.length > 0) {
                                            return p.category_id.some(cat => {
                                                if (!cat) return false;
                                                if (typeof cat === 'string') return cat === categoryId;
                                                return (cat._id || cat.id || cat) === categoryId;
                                            });
                                        } else if (typeof p.category_id === 'string') {
                                            return p.category_id === categoryId;
                                        } else if (p.category_id && typeof p.category_id === 'object') {
                                            const catId = p.category_id._id || p.category_id.id || p.category_id;
                                            return catId === categoryId;
                                        }
                                        return false;
                                    } catch (filterError) {
                                        console.error("Error filtering product:", filterError, p);
                                        return false;
                                    }
                                })
                                .slice(0, 5); // Get up to 5 similar products
                            
                            setSimilarProducts(filtered);
                        }
                    }
                } catch (similarError) {
                    console.error("Error fetching similar products:", similarError);
                    // Don't throw error here, continue with product display
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching product data:", err);
                setError(err.message || "Đã xảy ra lỗi khi tải thông tin sản phẩm");
                setLoading(false);
            }
        };

        fetchProductData();
    }, []);

    // Format price in Vietnamese format
    const formatPrice = (price) => {
        if (!price && price !== 0) return "Liên hệ";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(price)
            .replace('₫', 'đ');
    };
    
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('vi-VN', options);
        } catch (error) {
            console.error("Date formatting error:", error);
            return dateString;
        }
    };
    
    // Calculate time ago
    const getTimeAgo = (dateString) => {
        if (!dateString) return "Không rõ";
        
        try {
            const now = new Date();
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return "Không rõ";
            }
            
            const diffMs = now - date;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            
            if (diffHours < 1) {
                return "Vừa đăng";
            } else if (diffHours < 24) {
                return `${diffHours} giờ trước`;
            } else {
                const diffDays = Math.floor(diffHours / 24);
                if (diffDays < 30) {
                    return `${diffDays} ngày trước`;
                } else {
                    const diffMonths = Math.floor(diffDays / 30);
                    return `${diffMonths} tháng trước`;
                }
            }
        } catch (error) {
            console.error("Time ago calculation error:", error);
            return "Không rõ";
        }
    };

    // Safe rendering function to prevent undefined errors
    const safeRender = (value, fallback = "") => {
        return value !== undefined && value !== null ? value : fallback;
    };

    // Function to render the active tab content
    const renderTabContent = () => {
        if (!product) return null;
        
        switch (activeTab) {
            case 'details':
                return (
                    <div className="py-6">
                        <h2 className="font-bold text-lg mb-4">{safeRender(product.name)}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Thông số kỹ thuật:</h3>
                                <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: safeRender(product.detail, 'Không có thông tin chi tiết') }}></div>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Mô tả sản phẩm:</h3>
                                <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: safeRender(product.description, 'Không có mô tả') }}></div>
                            </div>
                            {product.condition && (
                                <div>
                                    <h3 className="font-medium mb-2">Tình trạng:</h3>
                                    <p className="text-sm text-gray-700">{product.condition}</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'shipping':
                return (
                    <div className="py-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold mb-3">VẬN CHUYỂN</h3>
                                <p className="text-sm text-gray-700">Miễn phí vận chuyển mặt đất trong vòng 1 đến 7 ngày làm việc. Nhận hàng tại cửa hàng trong vòng 1 đến 7 ngày làm việc. Tùy chọn giao hàng vào ngày hôm sau và chuyển phát nhanh cũng có sẵn.</p>
                                <p className="text-sm text-gray-700 mt-2">Xem Câu hỏi thường gặp về giao hàng để biết chi tiết về phương thức vận chuyển, chi phí và thời gian giao hàng.</p>
                            </div>
                            
                            <div>
                                <h3 className="font-bold mb-3">TRẢ LẠI VÀ ĐỔI HÀNG</h3>
                                <p className="text-sm text-gray-700">Dễ dàng và miễn phí, trong vòng 14 ngày. Xem các điều kiện và thủ tục trong Câu hỏi thường gặp về việc hoàn trả của chúng tôi.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'reviews':
                return (
                    <div className="py-6">
                        <div className="flex items-center mb-6">
                            <div className="flex items-center">
                                <span className="text-xl font-bold mr-2">{safeRender(product.rating, '0.0')}</span>
                                <span className="text-gray-500">Của 5</span>
                            </div>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="text-gray-500">0 đánh giá</span>
                        </div>
                        
                        <div className="space-y-2 mb-8">
                            {[5, 4, 3, 2, 1].map(rating => (
                                <div key={rating} className="flex items-center">
                                    <div className="w-10 flex items-center">
                                        <span>{rating}</span>
                                        <Star className="h-4 w-4 text-yellow-400 ml-1" fill="#FBBF24" />
                                    </div>
                                    <div className="flex-grow h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                    <span className="w-8 text-right text-gray-500">0%</span>
                                </div>
                            ))}
                        </div>
                        
                    </div>
                );
            default:
                return null;
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="bg-[#F1F5F9] min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                    <p className="mt-4 text-center text-gray-700">Đang tải thông tin sản phẩm...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="bg-[#F1F5F9] min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
                    <div className="text-red-500 text-center mb-4">❌ Đã xảy ra lỗi</div>
                    <p className="text-gray-700 text-center mb-4">{error}</p>
                    <div className="flex justify-center">
                        <button 
                            onClick={() => window.location.href = '/'}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2"
                        >
                            Về trang chủ
                        </button>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If product is not loaded
    if (!product) {
        return (
            <div className="bg-[#F1F5F9] min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <p className="text-center text-gray-700">Không tìm thấy thông tin sản phẩm</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg block mx-auto"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    // Prepare images array
    const images = [
        product.thumbnail || dongho,
        // Add fallback images if the product doesn't have multiple images
        ...Array(5).fill(product.thumbnail || dongho)
    ];

    // Safe ID for links - avoid the "_id" undefined error
    const getSafeId = (obj) => {
        if (!obj) return 'unknown';
        return obj._id || obj.id || 'unknown';
    };

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
                                    src={images[selectedImage]} 
                                    alt={safeRender(product.name, 'Product image')}
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
                                            alt={`${safeRender(product.name, 'Product')} - view ${index + 1}`}
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

                            <h1 className="text-lg font-bold mb-1">{safeRender(product.name)}</h1>
                            <p className="text-sm text-gray-700 mb-3">{safeRender(product.meta_description || (product.description ? product.description.substring(0, 100) : ''))}</p>

                            <p className="text-sm text-gray-600 mb-4">
                                {safeRender(product.condition, 'Tình trạng: Mới')} 
                                {product.created_at && ` | Đăng: ${formatDate(product.created_at)}`}
                            </p>

                            <div className="text-red-600 font-bold text-xl mb-4">{formatPrice(product.price)}</div>

                            <div className="mb-4">
                                <h2 className="font-bold mb-2">Mô tả chi tiết:</h2>
                                <p className="text-sm text-gray-700">{safeRender(product.description ? product.description.substring(0, 150) + '...' : 'Không có mô tả chi tiết')}</p>
                            </div>

                            {/* Seller info */}
                            <div className="flex items-center justify-between border rounded-lg p-3 mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                                        <a href={`/shop-detail?id=${getSafeId(seller)}`}>
                                            <img src={ShopOwner} alt="Seller avatar" className="w-full h-full object-cover" />
                                        </a>
                                    </div>
                                    <div>
                                        <div className="flex items-center">
                                            <a href={`/shop-detail?id=${getSafeId(seller)}`} className="font-medium text-sm">
                                                {seller ? `${seller.firstName || ''} ${seller.lastName || ''}` : 'Shop name'}
                                            </a>
                                            <Check size={14} className="ml-1 text-blue-500" />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {seller?.createdAt ? `Thành viên từ ${new Date(seller.createdAt).getFullYear()}` : 'Thành viên'}
                                        </p>
                                        <p className="text-xs text-gray-500">* Giao dịch đã được xác minh</p>
                                    </div>
                                </div>
                                <div className="text-right border-l-[2px] pl-4">    
                                    <div className="flex items-center justify-end">
                                        <span className="text-lg font-bold">{safeRender(product.rating, '5')}</span>
                                        <span className="text-yellow-500 ml-1">★</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{safeRender(product.sold, '0')} đánh giá</p>
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
                                <button onClick={() => window.location.href = '/user-profile/messages'} className="border border-gray-300 hover:bg-gray-50 flex-1 py-2 rounded-lg text-gray-600 border-blue-600 font-medium transition-colors">
                                   <p className='flex items-center justify-center gap-2 text-blue-600'><MessageSquareText size={18}/>Chat</p>
                                </button>
                            </div>

                            {/* Location and time */}
                            <div className="mt-4 text-sm text-gray-500">
                                <div className="flex items-center mb-1">
                                    <MapPin size={14} className="mr-1" />
                                    <span>{safeRender(product.location, 'Vị trí không rõ')}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock size={14} className="mr-1" />
                                    <span>{product.created_at ? getTimeAgo(product.created_at) : 'Vừa đăng'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Information Tabs */}
                <div className="bg-white mt-6 rounded-lg overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex border-b">
                        <button 
                            className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'details' ? 'text-indigo-600 border-indigo-600' : 'text-gray-600 border-transparent'}`}
                            onClick={() => setActiveTab('details')}
                        >
                            CHI TIẾT SẢN PHẨM
                        </button>
                        <button 
                            className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'shipping' ? 'text-indigo-600 border-indigo-600' : 'text-gray-600 border-transparent'}`}
                            onClick={() => setActiveTab('shipping')}
                        >
                            VẬN CHUYỂN & TRẢ HÀNG
                        </button>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="px-6">
                        {renderTabContent()}
                    </div>
                </div>

                {/* Similar products */}
                {similarProducts.length > 0 && (
                    <div className="pt-10">
                        <div className="flex items-center mb-4 bg-white p-4">
                            <ClockIcon size={24} className="text-red-500 mr-2" />
                            <h2 className="text-lg font-bold text-red-500">SẢN PHẨM TƯƠNG TỰ</h2>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 bg-[#F1F5F9]">
                            {similarProducts.map((product) => (
                                <div 
                                    key={getSafeId(product)} 
                                    className="border rounded bg-white overflow-hidden cursor-pointer"
                                    onClick={() => window.location.href = `/product-detail?id=${getSafeId(product)}`}
                                >
                                    <img 
                                        src={safeRender(product.thumbnail, dongho)} 
                                        alt={safeRender(product.name, 'Product')} 
                                        className="w-full h-40 object-cover" 
                                    />
                                    <div className="p-2">
                                        <h3 className="text-sm font-medium">{safeRender(product.name, 'Sản phẩm')}</h3>
                                        <div className="text-xs text-gray-500">{safeRender(product.condition, 'Mới 100%')}</div>
                                        <div className="text-red-500 font-bold mt-1">{formatPrice(product.price)}</div>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <ClockIcon size={12} className="mr-1" />
                                            <span>{product.created_at ? getTimeAgo(product.created_at) : 'Mới đăng'}</span>
                                            <span className="mx-1">•</span>
                                            <span>{safeRender(product.location, 'Hà Nội')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;