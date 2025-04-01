import React, { useState, useEffect } from 'react';
import { Star, Grid, List, Heart, Flame } from 'lucide-react';
import donghoAvatar from '../../assets/donghoAvatar.jpg'
import dongho from '../../assets/dongho.png'
import ShopDetailTabs from './component/ShopDetailTabs';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import { BE_API_URL } from '../../config/config';

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

    // Kiểm tra đăng nhập
    const isLoggedIn = AuthService.isLoggedIn();

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
                } catch (productsError) {
                    console.error("Error fetching shop products:", productsError);
                    setShopProducts([]);
                }

                // Fetch categories for the category filter
                try {
                    const categoriesData = await ApiService.get('/categories', false);
                    setCategories(categoriesData);
                } catch (categoriesError) {
                    console.error("Error fetching categories:", categoriesError);
                    // Set default categories if API fails
                    setCategories([
                        { _id: 'all', name: 'Tất cả sản phẩm' },
                        { _id: 'electronics', name: 'Điện thoại & phụ kiện' },
                        { _id: 'beauty', name: 'Sắc đẹp' },
                        { _id: 'devices', name: 'Thiết bị điện tử' },
                        { _id: 'books', name: 'Nhà sách online' },
                        { _id: 'fashion', name: 'Thời trang nam' }
                    ]);
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

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                size={16}
                className={`${index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
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
        products: shopProducts.length || 0, // Đã cập nhật để chỉ đếm sản phẩm active
        joinedDaysAgo: joinInfo.days,
        soldProduct: shopDetails.total_sold || 0,
        joinedDay: joinInfo.days,
        phoneNumber: shopDetails.phone || 'Không có số điện thoại',
        profileImage: shopDetails.logo || donghoAvatar,
        coverImage: shopDetails.image_cover // Thêm ảnh bìa nếu có
    };

    const productCategories = categories.length > 0
        ? categories.map(cat => cat.name)
        : [
            'Tất cả sản phẩm',
            'Điện thoại & phụ kiện',
            'Sắc đẹp',
            'Thiết bị điện tử',
            'Nhà sách online',
            'Thời trang nam'
        ];

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
                                <p>Thời gian hoạt động: 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Detail Tabs Component */}
                <ShopDetailTabs shopDetails={shopDetails} />

                {/* Product Categories */}
                <div className="flex overflow-x-auto mb-4 bg-white p-2 rounded-lg mt-6">
                    {productCategories.map((category) => (
                        <button
                            key={category}
                            className="px-4 py-2 whitespace-nowrap hover:bg-gray-100 rounded-lg"
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Product Sorting and View */}
                <div className="flex justify-between items-center mb-4 px-4 bg-white p-3">
                    <div>
                        <p>{shopInfo.products} sản phẩm</p>
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
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-5 gap-4' : 'grid-cols-1 gap-2'}`}>
                    {shopProducts.length > 0 ? (
                        shopProducts.map((product) => (
                            <div
                                key={product._id}
                                className={`bg-white rounded-lg shadow-md p-3 ${viewMode === 'list' ? 'flex items-center' : ''}`}
                                onClick={() => window.location.href = `/product-detail?id=${product._id}`}
                            >
                                <div className={`relative ${viewMode === 'list' ? 'mr-4' : ''}`}>
                                    <img
                                        src={product.thumbnail || dongho}
                                        alt={product.name}
                                        className={`${viewMode === 'grid' ? 'w-full h-48 object-cover' : 'w-24 h-24 object-cover'} rounded-lg`}
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
                                    <button className="absolute top-2 right-2 bg-white rounded-full p-1">
                                        <Heart size={20} className="text-gray-500" />
                                    </button>
                                </div>
                                <div className={`${viewMode === 'list' ? 'flex-grow' : ''}`}>
                                    <h3 className={`font-medium ${viewMode === 'grid' ? 'text-center mt-2' : 'mb-1'}`}>
                                        {product.name}
                                    </h3>
                                    <div className={`flex items-center ${viewMode === 'grid' ? 'justify-center' : 'mb-1'}`}>
                                        {renderStars(product.rating || 5)}
                                        <span className="text-gray-500 text-sm ml-2">({product.rating_count || 0})</span>
                                        <span className='pl-6 text-sm mt-2'>Đã bán ({product.sold || 0}) </span>
                                    </div>
                                    <div className="text-red-500 font-bold text-center mt-1">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                            .format(product.price)
                                            .replace('₫', 'đ')}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-5 bg-white p-8 rounded-lg text-center">
                            <p className="text-gray-500">Không có sản phẩm nào trong cửa hàng này</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopDetail;