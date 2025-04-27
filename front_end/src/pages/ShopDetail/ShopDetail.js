import React, { useState, useEffect } from 'react';
import { Star, Grid, List, Heart, Flame, Clock as ClockIcon } from 'lucide-react';
import donghoAvatar from '../../assets/donghoAvatar.jpg';
import dongho from '../../assets/dongho.png';
import ShopDetailTabs from './component/ShopDetailTabs';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import { BE_API_URL } from '../../config/config';
import Pagination from './component/Pagination'; // Import component Pagination

// Utility function to get the correct image path
const getImagePath = (imgPath) => {
    if (!imgPath) return "";
    // Kiểm tra nếu imgPath đã là URL đầy đủ
    if (imgPath.startsWith('http')) return imgPath;
    // Kiểm tra nếu imgPath là đường dẫn tương đối
    if (imgPath.startsWith('/uploads')) return `${BE_API_URL}${imgPath}`;
    
    // Kiểm tra nếu đường dẫn có chứa "shops" để xử lý ảnh shop
    if (imgPath.includes('shops')) {
        const fileName = imgPath.split("\\").pop();
        return `${BE_API_URL}/uploads/shops/${fileName}`;
    }
    
    // Trường hợp imgPath là đường dẫn từ backend cho sản phẩm
    const fileName = imgPath.split("\\").pop();
    return `${BE_API_URL}/uploads/products/${fileName}`;
};

const ShopDetail = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [sortOption, setSortOption] = useState('Đặc sắc');
    const [shopDetails, setShopDetails] = useState(null);
    const [shopProducts, setShopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shopOwner, setShopOwner] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [hoveredProduct, setHoveredProduct] = useState(null); // Added for hover effects
    const [showProductModal, setShowProductModal] = useState(false); // For product modal
    const [selectedProduct, setSelectedProduct] = useState(null); // For product modal
    const [productReviews, setProductReviews] = useState({}); // Store review counts for each product
    const [productRatings, setProductRatings] = useState({}); // Store average ratings for each product
    const [shopReviewStats, setShopReviewStats] = useState({
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });

    // State cho phân trang sản phẩm
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Hiển thị 8 sản phẩm mỗi trang

    // Kiểm tra đăng nhập
    const isLoggedIn = AuthService.isLoggedIn();

    // Format price in VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(price)
            .replace('₫', 'đ');
    };

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return "Vừa đăng";
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

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setLoading(true);

                // Get shop ID from URL query parameter
                const urlParams = new URLSearchParams(window.location.search);
                const shopId = urlParams.get('id');

                if (!shopId) {
                    throw new Error("Không tìm thấy ID cửa hàng trong URL");
                }

                // Fetch shop details using the public API endpoint
                const shopData = await ApiService.get(`/shops/public/${shopId}`, false);
                
                // Xử lý đường dẫn ảnh logo và ảnh bìa của shop
                if (shopData) {
                    if (shopData.logo) {
                        shopData.logo = getImagePath(shopData.logo);
                    }
                    if (shopData.image_cover) {
                        shopData.image_cover = getImagePath(shopData.image_cover);
                    }
                }
                
                setShopDetails(shopData);

                // Fetch shop owner information if shop has user_id
                if (shopData.user_id) {
                    try {
                        const userData = await ApiService.get(`/user/${shopData.user_id}`, false);
                        setShopOwner(userData);
                        
                        // Fetch shop reviews và thống kê
                        try {
                            const reviews = await ApiService.get(`/product-review/seller/${shopData.user_id}`, false);
                            
                            // Handle both response formats (object with reviews or direct array)
                            const reviewsArray = reviews.reviews || (Array.isArray(reviews) ? reviews : []);
                            
                            // Tính toán thống kê đánh giá
                            const total = reviewsArray.length;
                            const sum = reviewsArray.reduce((acc, review) => acc + review.rating, 0);
                            const average = total > 0 ? sum / total : 0;
                            
                            // Tính phân bố đánh giá
                            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                            reviewsArray.forEach(review => {
                                if (review.rating >= 1 && review.rating <= 5) {
                                    distribution[Math.floor(review.rating)] = (distribution[Math.floor(review.rating)] || 0) + 1;
                                }
                            });
                            
                            setShopReviewStats({
                                average: parseFloat(average.toFixed(1)),
                                total,
                                distribution
                            });
                            
                            console.log("Shop reviews stats:", { total, average, distribution });
                        } catch (reviewError) {
                            console.error("Error fetching shop reviews:", reviewError);
                            // Set default values on error
                            setShopReviewStats({
                                average: 0,
                                total: 0,
                                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
                            });
                        }
                    } catch (userError) {
                        console.error("Error fetching shop owner data:", userError);
                        // Continue without shop owner data
                    }
                }

                // Fetch products from this shop using the product API
                try {
                    const productsData = await ApiService.get(`/product/shop/${shopId}`, false);
                    
                    // Lọc sản phẩm có trạng thái is_active = true
                    const activeProducts = productsData.filter(product => 
                        product.is_active === true || product.is_active === 'true' || product.is_active === 1
                    );
                    
                    // Xử lý đường dẫn ảnh cho các sản phẩm active
                    const productsWithImages = activeProducts.map(product => ({
                        ...product,
                        thumbnail: getImagePath(product.thumbnail)
                    }));
                    
                    setShopProducts(productsWithImages);
                    
                    // Tạo danh sách danh mục từ sản phẩm
                    extractCategoriesFromProducts(productsWithImages);
                    
                    // Fetch review counts and ratings for each product
                    fetchProductReviewsAndRatings(productsWithImages);
                } catch (productsError) {
                    console.error("Error fetching shop products:", productsError);
                    setShopProducts([]);
                }

                // Kiểm tra trạng thái follow nếu người dùng đã đăng nhập
                if (isLoggedIn) {
                    try {
                        const followStatus = await ApiService.get(`/shop-follow/status/${shopId}`, true);
                        setIsFollowing(followStatus.isFollowing);
                    } catch (followError) {
                        console.error("Error fetching follow status:", followError);
                        // Mặc định là chưa follow nếu có lỗi
                        setIsFollowing(false);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching shop data:", err);
                setError(err.message || "Đã xảy ra lỗi khi tải thông tin cửa hàng");
                setLoading(false);
            }
        };

        fetchShopData();
    }, [isLoggedIn]);
    
    // Function to fetch reviews and calculate ratings for each product
    const fetchProductReviewsAndRatings = async (products) => {
        const reviewsData = {};
        const ratingsData = {};
        
        try {
            // Fetch reviews for each product
            for (const product of products) {
                if (!product._id) continue;
                
                try {
                    const reviews = await ApiService.get(`/product-review/product/${product._id}`, false);
                    
                    // Store the review count
                    reviewsData[product._id] = reviews.length || 0;
                    
                    // Calculate the average rating for this product
                    if (reviews.length > 0) {
                        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
                        const average = sum / reviews.length;
                        ratingsData[product._id] = parseFloat(average.toFixed(1));
                    } else {
                        ratingsData[product._id] = 0;
                    }
                } catch (error) {
                    console.error(`Error fetching reviews for product ${product._id}:`, error);
                    reviewsData[product._id] = 0;
                    ratingsData[product._id] = 0;
                }
            }
            
            setProductReviews(reviewsData);
            setProductRatings(ratingsData);
        } catch (error) {
            console.error("Error fetching product reviews:", error);
        }
    };

    // Trích xuất danh mục từ sản phẩm
    const extractCategoriesFromProducts = (products) => {
        if (!products || products.length === 0) {
            setCategories([{ _id: 'all', name: 'Tất cả sản phẩm' }]);
            return;
        }
        
        // Tạo danh sách tất cả danh mục từ sản phẩm
        const categoriesMap = new Map();
        categoriesMap.set('all', { _id: 'all', name: 'Tất cả sản phẩm', count: products.length });
        
        products.forEach(product => {
            if (product.category_id) {
                // Xử lý trường hợp category_id là mảng
                if (Array.isArray(product.category_id)) {
                    product.category_id.forEach(cat => {
                        if (cat) {
                            const categoryId = typeof cat === 'object' ? cat._id : cat;
                            const categoryName = typeof cat === 'object' ? cat.name : null;
                            
                            if (categoryId) {
                                if (categoriesMap.has(categoryId)) {
                                    // Tăng count nếu danh mục đã tồn tại
                                    const category = categoriesMap.get(categoryId);
                                    category.count = (category.count || 0) + 1;
                                    categoriesMap.set(categoryId, category);
                                } else {
                                    // Thêm danh mục mới
                                    categoriesMap.set(categoryId, { 
                                        _id: categoryId, 
                                        name: categoryName || `Danh mục ${categoryId.slice(0, 5)}`, 
                                        count: 1 
                                    });
                                }
                            }
                        }
                    });
                } else if (typeof product.category_id === 'object') {
                    // Xử lý trường hợp category_id là object
                    const categoryId = product.category_id._id;
                    const categoryName = product.category_id.name;
                    
                    if (categoryId) {
                        if (categoriesMap.has(categoryId)) {
                            const category = categoriesMap.get(categoryId);
                            category.count = (category.count || 0) + 1;
                            categoriesMap.set(categoryId, category);
                        } else {
                            categoriesMap.set(categoryId, { 
                                _id: categoryId, 
                                name: categoryName || `Danh mục ${categoryId.slice(0, 5)}`, 
                                count: 1 
                            });
                        }
                    }
                } else if (typeof product.category_id === 'string') {
                    // Xử lý trường hợp category_id là string
                    const categoryId = product.category_id;
                    
                    if (categoryId) {
                        if (categoriesMap.has(categoryId)) {
                            const category = categoriesMap.get(categoryId);
                            category.count = (category.count || 0) + 1;
                            categoriesMap.set(categoryId, category);
                        } else {
                            categoriesMap.set(categoryId, { 
                                _id: categoryId, 
                                name: `Danh mục ${categoryId.slice(0, 5)}`, 
                                count: 1 
                            });
                        }
                    }
                }
            }
        });
        
        // Chuyển đổi Map thành mảng
        setCategories(Array.from(categoriesMap.values()));
    };

    // Lọc sản phẩm theo danh mục đã chọn
    const getFilteredProducts = () => {
        if (activeCategory === 'all') {
            return shopProducts;
        }
        
        return shopProducts.filter(product => {
            if (!product.category_id) return false;
            
            if (Array.isArray(product.category_id)) {
                return product.category_id.some(cat => {
                    const catId = typeof cat === 'object' ? cat._id : cat;
                    return catId === activeCategory;
                });
            } else if (typeof product.category_id === 'object') {
                return product.category_id._id === activeCategory;
            } else {
                return product.category_id === activeCategory;
            }
        });
    };

    // Sắp xếp sản phẩm theo tùy chọn
    const getSortedProducts = () => {
        const filteredProducts = getFilteredProducts();
        
        switch (sortOption) {
            case 'Mới nhất':
                return [...filteredProducts].sort((a, b) => {
                    const dateA = new Date(a.created_at || 0);
                    const dateB = new Date(b.created_at || 0);
                    return dateB - dateA;
                });
            case 'Bán chạy':
                return [...filteredProducts].sort((a, b) => (b.sold || 0) - (a.sold || 0));
            case 'Giá thấp đến cao':
                return [...filteredProducts].sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'Giá cao đến thấp':
                return [...filteredProducts].sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'Đặc sắc':
            default:
                return [...filteredProducts].sort((a, b) => {
                    // Ưu tiên sản phẩm được đánh dấu hot hoặc nổi bật
                    if (a.is_hot && !b.is_hot) return -1;
                    if (!a.is_hot && b.is_hot) return 1;
                    // Sau đó là sản phẩm có rating cao
                    const aRating = productRatings[a._id] || 0;
                    const bRating = productRatings[b._id] || 0;
                    return bRating - aRating;
                });
        }
    };

    // Tính toán chỉ số sản phẩm cho trang hiện tại
    const sortedProducts = getSortedProducts();
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    // Xử lý khi chuyển trang sản phẩm
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: document.getElementById('products-section')?.offsetTop - 100 || 0, behavior: 'smooth' });
    };

    // Reset về trang 1 khi thay đổi danh mục hoặc bộ lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, sortOption]);

    // Handle product click to see details
    const handleProductClick = (product) => {
        window.location.href = `/product-detail?id=${product._id}`;
    };

    // Hàm xử lý follow shop
    const handleFollowShop = async () => {
        try {
            // Kiểm tra đăng nhập
            if (!isLoggedIn) {
                window.location.href = "/login";
                return;
            }

            setFollowLoading(true);
            
            if (isFollowing) {
                // Nếu đang follow thì unfollow
                await ApiService.delete(`/shop-follow/unfollow/${shopDetails._id}`, true);
                setIsFollowing(false);
                
                // Giảm số lượng người theo dõi trong UI
                setShopDetails(prev => ({
                    ...prev,
                    follower: (prev.follower || 0) - 1
                }));
            } else {
                // Nếu chưa follow thì follow
                await ApiService.post('/shop-follow/follow', { shop_id: shopDetails._id }, true);
                setIsFollowing(true);
                
                // Tăng số lượng người theo dõi trong UI
                setShopDetails(prev => ({
                    ...prev,
                    follower: (prev.follower || 0) + 1
                }));
            }
            
            setFollowLoading(false);
        } catch (error) {
            console.error("Error handling shop follow:", error);
            alert("Không thể thực hiện thao tác theo dõi. Vui lòng thử lại sau.");
            setFollowLoading(false);
        }
    };

    // Thêm hàm handleStartChat vào component ShopDetail
    const handleStartChat = async () => {
        try {
            // Kiểm tra đăng nhập
            if (!isLoggedIn) {
                window.location.href = "/login";
                return;
            }

            // Tạo cuộc trò chuyện với shop
            await ApiService.post('/conversation/create', { shop_id: shopDetails._id }, true);

            // Chuyển hướng đến trang tin nhắn
            window.location.href = '/user-profile/messages';
        } catch (error) {
            console.error("Error starting chat with shop:", error);
            alert("Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại sau.");
        }
    };

    // Format date function
    const formatJoinDate = (dateString) => {
        if (!dateString) return { days: 0, date: 'Không rõ' };

        try {
            const createdDate = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - createdDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                days: diffDays,
                date: createdDate.toLocaleDateString('vi-VN')
            };
        } catch (error) {
            console.error("Date format error:", error);
            return { days: 0, date: 'Không rõ' };
        }
    };

    // Render stars based on product rating
    const renderStars = (productId) => {
        // Get the review count and rating for this product
        const reviewCount = productReviews[productId] || 0;
        const rating = productRatings[productId] || 0;
        
        // Only show filled stars if the product has at least one review
        const hasReviews = reviewCount > 0;

        // Render stars by rating value if there are reviews
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                size={16}
                className={`${hasReviews && index < Math.round(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    // Show loading state
    if (loading) {
        return (
            <div className="bg-[#E7E9EA] min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                    <p className="mt-4 text-center text-gray-700">Đang tải thông tin cửa hàng...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="bg-[#E7E9EA] min-h-screen flex items-center justify-center">
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

    // If shop details not found
    if (!shopDetails) {
        return (
            <div className="bg-[#E7E9EA] min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <p className="text-center text-gray-700">Không tìm thấy thông tin cửa hàng</p>
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

    // Process shop data
    const joinInfo = formatJoinDate(shopDetails.created_at);
    const shopInfo = {
        name: shopDetails.name || 'Shop không có tên',
        email: shopDetails.email || 'Không có email',
        address: shopDetails.address || 'Không có địa chỉ',
        phone: shopDetails.phone || 'Không có số điện thoại',
        followers: shopDetails.follower || 0,
        products: shopProducts.length || 0, 
        joinedDaysAgo: joinInfo.days,
        soldProduct: shopDetails.total_sold || 0,
        joinedDay: joinInfo.days,
        phoneNumber: shopDetails.phone || 'Không có số điện thoại',
        profileImage: shopDetails.logo || donghoAvatar,
        coverImage: shopDetails.image_cover,
        rating: shopReviewStats.average,
        totalReviews: shopReviewStats.total
    };

    // Helper function to render shop stars
    const renderShopStars = (rating) => {
        const hasReviews = shopInfo.totalReviews > 0;
        
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                size={16}
                className={`${hasReviews && index < Math.round(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className='bg-[#E7E9EA] pb-10'>
            <div className="mx-auto max-w-7xl pt-10">
                {/* Shop Header with Cover Image */}
                <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
                    {/* Thêm phần hiển thị ảnh bìa nếu có */}
                    {shopInfo.coverImage && (
                        <div className="w-full h-48 relative">
                            <img 
                                src={shopInfo.coverImage} 
                                alt={`${shopInfo.name} cover`} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    
                    {/* Shop Information */}
                    <div className="flex gap-4 items-center p-4">
                        <div className='mr-6 flex gap-4'>
                            <img
                                src={shopInfo.profileImage}
                                alt={shopInfo.name}
                                className="w-20 h-20 rounded-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = donghoAvatar;
                                }}
                            />
                            <div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-2xl font-bold">{shopInfo.name}</h1>
                                        <p className="text-gray-600">@{shopInfo.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex">
                                                {renderShopStars(shopInfo.rating || 0)}
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {shopInfo.totalReviews > 0 ? `${shopInfo.rating.toFixed(1)} (${shopInfo.totalReviews} đánh giá)` : "(0 đánh giá)"}
                                            </span>
                                        </div>
                                        <p>{shopInfo.followers} Người theo dõi</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="mt-2 text-sm text-gray-600">
                                <div className='mb-4 flex gap-4 items-center'>
                                    <p> {shopInfo.email}</p>
                                    <button onClick={handleStartChat} className="bg-purple-200 px-4 py-2 rounded-full">
                                        Nhắn tin
                                    </button>
                                </div>

                                <div className='flex gap-6 items-center'>
                                    <div className='flex items-center'>
                                        <p><Flame /></p>
                                        <p>
                                            {shopInfo.products} Sản phẩm
                                        </p>
                                    </div>
                                    <button 
                                        className={`px-4 py-2 rounded-full flex items-center justify-center ${
                                            isFollowing 
                                                ? "bg-red-100 text-red-500 hover:bg-red-200" 
                                                : "bg-blue-100 text-blue-500 hover:bg-blue-200"
                                        } ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={handleFollowShop}
                                        disabled={followLoading}
                                    >
                                        {followLoading ? (
                                            <span className="inline-block h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2"></span>
                                        ) : null}
                                        {isFollowing ? "Bỏ Theo Dõi" : "Theo Dõi"}
                                    </button>
                                </div>
                            </div>
                            <div className=''>
                                <p className='mb-2'>Địa chỉ: {shopInfo.address}</p>

                                <p className='mb-2'>Số điện thoại: {shopInfo.phoneNumber}</p>
                                <p>Email: {shopInfo.email}</p>
                            </div>
                            <div>
                                <p className='mb-2'>Sản phẩm đã bán: {shopInfo.soldProduct}</p>
                                <p className='mb-2'>Tham gia: {shopInfo.joinedDaysAgo} ngày trước</p>
                                <p>Thời gian phản hồi: Trong vòng 24h</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Detail Tabs Component */}
                <ShopDetailTabs shopDetails={shopDetails} />

                {/* Product Categories */}
                <div className="flex overflow-x-auto mb-4 bg-white p-2 rounded-lg mt-6" id="products-section">
                    {categories.map((category) => (
                        <button
                            key={category._id}
                            className={`px-4 py-2 whitespace-nowrap rounded-lg ${
                                activeCategory === category._id 
                                    ? 'bg-purple-600 text-white' 
                                    : 'hover:bg-gray-100'
                            }`}
                            onClick={() => setActiveCategory(category._id)}
                        >
                            {category.name} {category.count ? `(${category.count})` : ''}
                        </button>
                    ))}
                </div>

                {/* Product Sorting and View */}
                <div className="flex justify-between items-center mb-4 px-4 bg-white p-3">
                    <div>
                        <p>{sortedProducts.length} sản phẩm</p>
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
                            <option value="Giá thấp đến cao">Giá thấp đến cao</option>
                            <option value="Giá cao đến thấp">Giá cao đến thấp</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid - Updated to match the homepage style */}
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-5 gap-4' : 'grid-cols-1 gap-2'}`}>
                    {currentProducts.length > 0 ? (
                        currentProducts.map((product, index) => (
                            <div
                                key={product._id}
                                className={`border rounded bg-white overflow-hidden relative cursor-pointer ${
                                    viewMode === 'list' ? 'flex items-center' : ''
                                }`}
                                onMouseEnter={() => setHoveredProduct(`shop-${index}`)}
                                onMouseLeave={() => setHoveredProduct(null)}
                                onClick={() => handleProductClick(product)}
                            >
                                <div className={`relative ${viewMode === 'list' ? 'mr-4 w-1/5' : ''}`}>
                                    <img
                                        src={product.thumbnail || dongho}
                                        alt={product.name}
                                        className={`${viewMode === 'grid' ? 'w-full h-40 object-cover' : 'w-full h-24 object-cover'}`}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = dongho;
                                        }}
                                    />
                                    {product.is_hot && (
                                        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                            Mới
                                        </span>
                                    )}
                                    
                                    {/* Add to Cart Button - Appears on hover */}
                                    {hoveredProduct === `shop-${index}` && viewMode === 'grid' && (
                                        <div
                                            className="absolute bottom-0 left-0 right-0 py-2 bg-white bg-opacity-95 flex items-center justify-center transition-opacity duration-300 shadow-md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductClick(product);
                                            }}
                                        >
                                            <button className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md font-medium text-sm">
                                                Mua sản phẩm
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className={`${viewMode === 'list' ? 'flex-grow p-4' : 'p-2'}`}>
                                    <h3 className={`text-sm font-medium ${viewMode === 'list' ? '' : 'truncate'}`}>
                                        {product.name}
                                    </h3>
                                    <div className="text-xs text-gray-500">{product.condition || "Mới 100%"}</div>
                                    <div className="text-red-500 font-bold mt-1">{formatPrice(product.price)}</div>
                                    
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <div className="flex mr-2">
                                            {renderStars(product._id)}
                                        </div>
                                        <span>
                                            ({productReviews[product._id] || 0})
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <ClockIcon size={12} className="mr-1" />
                                        <span>{formatTime(product.created_at)}</span>
                                        <span className="mx-1">•</span>
                                        <span>Đã bán: {product.sold || 0}</span>
                                    </div>
                                    
                                    {/* Show Buy Button in list view */}
                                    {viewMode === 'list' && (
                                        <button 
                                            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md font-medium text-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductClick(product);
                                            }}
                                        >
                                            Mua sản phẩm
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-5 bg-white p-8 rounded-lg text-center">
                            <p className="text-gray-500">Không có sản phẩm nào trong danh mục này</p>
                        </div>
                    )}
                </div>

                {/* Pagination cho sản phẩm */}
                {sortedProducts.length > itemsPerPage && (
                    <div className="mt-8 bg-white p-4 rounded-lg shadow">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            showingFrom={indexOfFirstProduct + 1}
                            showingTo={Math.min(indexOfLastProduct, sortedProducts.length)}
                            totalItems={sortedProducts.length}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopDetail;