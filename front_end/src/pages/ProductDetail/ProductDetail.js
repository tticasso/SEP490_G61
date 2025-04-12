import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Heart, Store } from 'lucide-react';
import dongho from '../../assets/ProductDetail.png';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

// Import components
import ProductHeader from './components/ProductHeader';
import ProductImages from './components/ProductImages';
import ProductVariantSelector from '../../components/ProductVariantSelector';
import SellerInfo from './components/SellerInfo';
import ActionButtons from './components/ActionButton';
import ProductTabs from './components/ProductTabs';
import SimilarProducts from './components/SimilarProducts';

import { BE_API_URL } from '../../config/config';

const ProductDetail = () => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('details');

    // States for API data
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [seller, setSeller] = useState(null);
    const [shopData, setShopData] = useState(null);
    const [isFollowingShop, setIsFollowingShop] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState('');
    const [showCartMessage, setShowCartMessage] = useState(false);
    const [variantImages, setVariantImages] = useState([]);
    const hasVariants = variants.length > 0;
    const isOutOfStock = selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock <= 0;

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

    // Check if user is logged in
    const isLoggedIn = AuthService.isLoggedIn();
    const currentUser = AuthService.getCurrentUser();

    const fetchProductReviews = async (productId) => {
        try {
            const reviews = await ApiService.get(`/product-review/product/${productId}`, false);
            return reviews;
        } catch (error) {
            console.error("Error fetching product reviews:", error);
            return [];
        }
    };

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
                console.log("Product data:", productData);

                if (!productData) {
                    throw new Error("Không tìm thấy thông tin sản phẩm");
                }

                // Xử lý đường dẫn ảnh cho sản phẩm
                if (productData.thumbnail) {
                    productData.thumbnail = getImagePath(productData.thumbnail);
                }

                setProduct(productData);

                // Fetch product variants
                try {
                    const variantsData = await ApiService.get(`/product-variant/product/${productId}`, false);
                    console.log("Variants data:", variantsData);

                    if (variantsData && variantsData.length > 0) {
                        // Xử lý đường dẫn ảnh cho các biến thể
                        const processedVariants = variantsData.map(variant => ({
                            ...variant,
                            images: variant.images?.map(img => getImagePath(img)) || []
                        }));

                        setVariants(processedVariants);

                        // Find default variant or use the first one
                        const defaultVariant = processedVariants.find(v => v.is_default) || processedVariants[0];
                        setSelectedVariant(defaultVariant);

                        // Set variant images if available
                        if (defaultVariant.images && defaultVariant.images.length > 0) {
                            setVariantImages(defaultVariant.images);
                        }
                    }
                } catch (variantError) {
                    console.error("Error fetching product variants:", variantError);
                }

                // Fetch shop info
                await fetchShopInfo(productData);

                // Fetch similar products
                await fetchSimilarProducts(productData, productId);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching product data:", err);
                setError(err.message || "Đã xảy ra lỗi khi tải thông tin sản phẩm");
                setLoading(false);
            }
        };

        fetchProductData();
    }, [isLoggedIn]);

    // Fetch shop information
    const fetchShopInfo = async (productData) => {
        if (!productData.shop_id) return;

        try {
            // Handle case where shop_id could be an object or string
            const shopId = typeof productData.shop_id === 'object' ?
                productData.shop_id._id || productData.shop_id.id :
                productData.shop_id;

            // Fetch shop data
            const shopData = await ApiService.get(`/shops/public/${shopId}`, false);

            // Xử lý ảnh logo và ảnh bìa cho shop
            if (shopData) {
                if (shopData.logo) {
                    shopData.logo = getImagePath(shopData.logo);
                }
                if (shopData.image_cover) {
                    shopData.image_cover = getImagePath(shopData.image_cover);
                }
            }

            setShopData(shopData);

            // Fetch shop owner data if available
            if (shopData.user_id) {
                const userData = await ApiService.get(`/user/${shopData.user_id}`, false);
                setSeller(userData);
            }

            // Check if user is following this shop
            if (isLoggedIn) {
                try {
                    const followStatus = await ApiService.get(`/shop-follow/status/${shopId}`, true);
                    setIsFollowingShop(followStatus.isFollowing);
                } catch (followError) {
                    setIsFollowingShop(false);
                }
            }
        } catch (shopError) {
            console.error("Error fetching shop data:", shopError);
        }
    };

    // Fetch similar products
    const fetchSimilarProducts = async (productData, productId) => {
        try {
            if (!productData.category_id) return;

            // Handle if category_id is an array or a single object
            let categoryId;

            if (Array.isArray(productData.category_id) && productData.category_id.length > 0) {
                // Handle different possible structures of category_id array
                const firstCategory = productData.category_id[0];
                if (typeof firstCategory === 'string') {
                    categoryId = firstCategory;
                } else if (firstCategory && typeof firstCategory === 'object') {
                    categoryId = firstCategory._id || firstCategory.id || firstCategory;
                }
            } else if (typeof productData.category_id === 'string') {
                categoryId = productData.category_id;
            } else if (productData.category_id && typeof productData.category_id === 'object') {
                categoryId = productData.category_id._id || productData.category_id.id || productData.category_id;
            }

            if (categoryId) {
                const allProducts = await ApiService.get('/product', false);

                // Filter similar products
                const filtered = allProducts
                    .filter(p => {
                        if (!p || p._id === productId) return false;

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

                // Xử lý đường dẫn ảnh cho các sản phẩm tương tự
                const productsWithImages = filtered.map(product => ({
                    ...product,
                    thumbnail: getImagePath(product.thumbnail)
                }));

                setSimilarProducts(productsWithImages);
            }
        } catch (similarError) {
            console.error("Error fetching similar products:", similarError);
        }
    };

    // Handle variant selection
    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);

        // Update variant images if available
        if (variant && variant.images && variant.images.length > 0) {
            setVariantImages(variant.images);
            setSelectedImage(0); // Reset selected image to first one
        } else if (product) {
            // Reset to product images if variant has no images
            setVariantImages([]);
            setSelectedImage(0);
        }

        setQuantity(1); // Reset quantity when changing variant
    };

    // Handle quantity change
    const handleQuantityChange = (newQuantity) => {
        setQuantity(newQuantity);
    };

    // Add to cart function
    const addToCart = async () => {
        if (!isLoggedIn) {
            window.location.href = "/login";
            return;
        }

        // Kiểm tra xem sản phẩm có biến thể không và đã chọn biến thể chưa
        if (variants.length > 0 && !selectedVariant) {
            setCartMessage("Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng");
            setShowCartMessage(true);
            setTimeout(() => {
                setShowCartMessage(false);
            }, 3000);
            return;
        }

        // Kiểm tra xem biến thể đã chọn có còn hàng không
        if (selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock <= 0) {
            setCartMessage("Biến thể này đã hết hàng. Vui lòng chọn biến thể khác.");
            setShowCartMessage(true);
            setTimeout(() => {
                setShowCartMessage(false);
            }, 3000);
            return;
        }

        try {
            setIsAddingToCart(true);

            // Check if user has a cart
            let cartId;
            try {
                const cartResponse = await ApiService.get(`/cart/user/${currentUser.id || currentUser._id}`, false);
                cartId = cartResponse._id;
            } catch (error) {
                // Create a new cart if none exists
                const newCart = await ApiService.post('/cart/create', { user_id: currentUser.id || currentUser._id });
                cartId = newCart._id;
            }

            // Add product to cart
            const payload = {
                cart_id: cartId,
                product_id: product._id,
                quantity: quantity
            };

            // Add variant ID if a variant is selected
            if (selectedVariant) {
                payload.variant_id = selectedVariant._id;
            }

            await ApiService.post('/cart/add-item', payload);

            // Show success message
            setCartMessage(`Đã thêm ${product.name} vào giỏ hàng!`);
            setShowCartMessage(true);

            // Hide message after 3 seconds
            setTimeout(() => {
                setShowCartMessage(false);
            }, 3000);
        } catch (error) {
            console.error("Error adding to cart:", error);
            setCartMessage("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");
            setShowCartMessage(true);

            setTimeout(() => {
                setShowCartMessage(false);
            }, 3000);
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Buy now function
    const buyNow = async () => {
        if (!isLoggedIn) {
            window.location.href = "/login";
            return;
        }

        // Kiểm tra xem sản phẩm có biến thể không và đã chọn biến thể chưa
        if (variants.length > 0 && !selectedVariant) {
            setCartMessage("Vui lòng chọn biến thể sản phẩm trước khi mua ngay");
            setShowCartMessage(true);
            setTimeout(() => {
                setShowCartMessage(false);
            }, 3000);
            return;
        }

        // Kiểm tra xem biến thể đã chọn có còn hàng không
        if (selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock <= 0) {
            setCartMessage("Biến thể này đã hết hàng. Vui lòng chọn biến thể khác.");
            setShowCartMessage(true);
            setTimeout(() => {
                setShowCartMessage(false);
            }, 3000);
            return;
        }

        try {
            setIsAddingToCart(true);
            await addToCart();
            window.location.href = "/checkout";
        } catch (error) {
            console.error("Error with buy now:", error);
            setCartMessage("Không thể thực hiện chức năng mua ngay. Vui lòng thử lại sau.");
            setShowCartMessage(true);

            setTimeout(() => {
                setShowCartMessage(false);
            }, 3000);
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Follow/unfollow shop
    const handleFollowShop = async () => {
        try {
            if (!isLoggedIn) {
                window.location.href = "/login";
                return;
            }

            setFollowLoading(true);

            if (isFollowingShop) {
                // Unfollow
                await ApiService.delete(`/shop-follow/unfollow/${getShopId()}`, true);
                setIsFollowingShop(false);

                // Update follower count in UI
                setShopData(prev => ({
                    ...prev,
                    follower: (prev.follower || 0) - 1
                }));
            } else {
                // Follow
                await ApiService.post('/shop-follow/follow', { shop_id: getShopId() }, true);
                setIsFollowingShop(true);

                // Update follower count in UI
                setShopData(prev => ({
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

    // Start chat with shop
    const handleStartChat = async () => {
        try {
            if (!isLoggedIn) {
                window.location.href = "/login";
                return;
            }

            const shopId = getShopId();
            if (shopId === 'unknown') {
                alert("Không thể xác định cửa hàng để chat");
                return;
            }

            await ApiService.post('/conversation/create', { shop_id: shopId }, true);
            window.location.href = '/user-profile/messages';
        } catch (error) {
            console.error("Error starting chat with shop:", error);
            alert("Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại sau.");
        }
    };

    // Format price
    const formatPrice = (price) => {
        if (!price && price !== 0) return "Liên hệ";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(price)
            .replace('₫', 'đ');
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('vi-VN', options);
        } catch (error) {
            return dateString;
        }
    };

    // Calculate time ago
    const getTimeAgo = (dateString) => {
        if (!dateString) return "Không rõ";

        try {
            const now = new Date();
            const date = new Date(dateString);

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
            return "Không rõ";
        }
    };

    // Safe render to prevent undefined errors
    const safeRender = (value, fallback = "") => {
        return value !== undefined && value !== null ? value : fallback;
    };

    // Get shop ID
    const getShopId = () => {
        if (shopData) return shopData._id || shopData.id || 'unknown';
        if (product.shop_id) {
            return typeof product.shop_id === 'object' ?
                product.shop_id._id || product.shop_id.id || 'unknown' :
                product.shop_id;
        }
        return 'unknown';
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

    // Prepare images array - prioritize variant images if available
    const images = variantImages.length > 0
        ? variantImages
        : [
            getImagePath(product.thumbnail) || dongho,
            // Add fallback images if the product doesn't have multiple images
            ...Array(5).fill(getImagePath(product.thumbnail) || dongho)
        ];

    return (
        <div className="bg-[#F1F5F9]">
            <div className="max-w-7xl mx-auto bg-[#F1F5F9] py-8">
                <div className="bg-white rounded-lg">
                    <div className="flex flex-col gap-6 md:flex-row bg-[#F1F5F9]">
                        {/* Left side - Product images */}                 
                        <ProductImages
                            images={images}
                            selectedImage={selectedImage}
                            setSelectedImage={setSelectedImage}
                            product={product}
                        />
                        

                        {/* Right side - Product details */}
                        <div className="w-1/2 px-8 pt-6 pb-2 bg-white rounded-lg">
                            <ProductHeader
                                product={product}
                                formatDate={formatDate}
                            />

                            {/* Display price - prefer variant price if selected */}
                            <div className="text-red-600 font-bold text-xl mb-4">
                                {selectedVariant
                                    ? formatPrice(selectedVariant.price)
                                    : formatPrice(product.price)}
                            </div>

                            {/* Product description */}
                            <div className="mb-4">
                                <h2 className="font-bold mb-2">Mô tả chi tiết:</h2>
                                <p className="text-sm text-gray-700">
                                    {safeRender(product.description ?
                                        product.description.substring(0, 150) + '...' :
                                        'Không có mô tả chi tiết')}
                                </p>
                            </div>

                            {/* Product Variant Selector */}
                            <ProductVariantSelector
                                productId={product._id}
                                onVariantSelect={handleVariantSelect}
                                initialQuantity={quantity}
                                onQuantityChange={handleQuantityChange}
                            />

                            {/* Seller info */}
                            <SellerInfo
                                shop={shopData}
                                seller={seller}
                                product={product}
                                getShopId={getShopId}
                            />

                            {/* Action buttons */}
                            <ActionButtons
                                isAddingToCart={isAddingToCart}
                                addToCart={addToCart}
                                buyNow={buyNow}
                                handleStartChat={handleStartChat}
                                hasVariants={hasVariants}
                                selectedVariant={selectedVariant}
                                isOutOfStock={isOutOfStock}
                            />

                            {/* Location, time and follow button */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    <div className="flex items-center mb-1">
                                        <MapPin size={14} className="mr-1" />
                                        <span>{safeRender(shopData?.address || product.location, 'Vị trí không rõ')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock size={14} className="mr-1" />
                                        <span>{product.created_at ? getTimeAgo(product.created_at) : 'Vừa đăng'}</span>
                                    </div>
                                </div>

                                {/* Follow Shop Button */}
                                <button
                                    onClick={handleFollowShop}
                                    className={`px-4 py-2 rounded-lg ${isFollowingShop
                                        ? "bg-red-100 text-red-500 hover:bg-red-200"
                                        : "bg-blue-100 text-blue-500 hover:bg-blue-200"
                                        } ${followLoading ? "opacity-50 cursor-not-allowed" : ""} flex items-center text-sm`}
                                    disabled={followLoading}
                                >
                                    {followLoading && (
                                        <span className="inline-block h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2"></span>
                                    )}
                                    <Heart size={16} className={`mr-1 ${isFollowingShop ? "fill-red-500" : ""}`} />
                                    {isFollowingShop ? "Đang theo dõi" : "Theo dõi shop"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Information Tabs */}
                <ProductTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    product={product}
                    variants={variants}
                    formatPrice={formatPrice}
                    safeRender={safeRender}
                    formatDate={formatDate}
                />

                {/* Similar products */}
                <SimilarProducts
                    similarProducts={similarProducts}
                    formatPrice={formatPrice}
                    getTimeAgo={getTimeAgo}
                    safeRender={safeRender}
                />
            </div>

            {/* Cart message */}
            {showCartMessage && (
                <div className="fixed top-5 right-5 bg-white p-4 rounded-lg shadow-lg z-50 border-l-4 border-green-500">
                    <p>{cartMessage}</p>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;