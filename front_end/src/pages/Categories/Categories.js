import React, { useState, useEffect } from 'react';
import { Filter, X as XIcon, AlertCircle } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import CartModal from '../cart/CartModal';
import { useLocation } from 'react-router-dom';
import { CartEventBus } from '../cart/CartEventBus';
import { BE_API_URL } from '../../config/config';

// Import Components
import ProductCard from './components/ProductCard';
import ViewModeSelector from './components/ViewModeSelector';
import CategorySidebar from './components/CategorySidebar';
import FilterDisplay from './components/FilterDisplay';
import ProductModal from './components/ProductModal';
import ProductVariantSelector from '../../components/ProductVariantSelector'


const Categories = () => {
    // State cho dữ liệu từ API
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho bộ lọc
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedLocations, setSelectedLocations] = useState([]);

    // State for search query
    const [searchQuery, setSearchQuery] = useState('');

    // State cho chế độ xem và sắp xếp
    const [viewMode, setViewMode] = useState('grid');
    const [sortOption, setSortOption] = useState('Đặc sắc');

    // State cho tương tác sản phẩm
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [productVariants, setProductVariants] = useState([]);
    const [loadingVariants, setLoadingVariants] = useState(false);

    // State cho giỏ hàng
    const [showCartModal, setShowCartModal] = useState(false);
    const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0);
    const [addCartMessage, setAddCartMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);

    // Get current user information
    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || "";
    const isLoggedIn = !!userId;

    // Get location for URL parameters
    const location = useLocation();

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

    // Fetch product variants khi có product được chọn
    useEffect(() => {
        const fetchVariants = async () => {
            if (!selectedProduct || !selectedProduct._id) return;
            
            try {
                setLoadingVariants(true);
                const response = await ApiService.get(`/product-variant/product/${selectedProduct._id}`, false);
                
                if (response && response.length > 0) {
                    setProductVariants(response);
                    // Không tự động chọn biến thể, để người dùng chọn
                    setSelectedVariant(null);
                } else {
                    setProductVariants([]);
                }
            } catch (err) {
                console.error("Error fetching product variants:", err);
                setProductVariants([]);
            } finally {
                setLoadingVariants(false);
            }
        };

        if (selectedProduct) {
            fetchVariants();
        }
    }, [selectedProduct]);

    // Handle variant selection
    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        if (variant) {
            setQuantity(1);
        }
    };

    // Handle quantity change
    const handleQuantityChange = (newQuantity) => {
        setQuantity(newQuantity);
    };

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = async (product, quantity = 1, fromModal = false) => {
        if (!isLoggedIn) {
            // Redirect to login if user is not logged in
            window.location.href = "/login";
            return;
        }

        // Kiểm tra xem đang thêm từ modal và sản phẩm có biến thể không
        if (fromModal && productVariants.length > 0 && !selectedVariant) {
            setAddCartMessage("Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng");
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
            }, 3000);
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

            // If a variant is selected and adding from modal, include it
            if (fromModal && selectedVariant) {
                payload.variant_id = selectedVariant._id;
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
                setSelectedVariant(null); // Reset selected variant
                setProductVariants([]); // Reset variants
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
        setSelectedLocations([]);
    };

    // Định dạng giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(price)
            .replace('₫', 'đ');
    };

    // Handling product card click
    const handleProductClick = async (product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
        setQuantity(1);
        setSelectedVariant(null);
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
                <CategorySidebar 
                    categories={categories}
                    selectedCategory={selectedCategory}
                    handleCategorySelect={handleCategorySelect}
                    priceRange={priceRange}
                    handlePriceChange={handlePriceChange}
                    applyPriceFilter={applyPriceFilter}
                    clearFilters={clearFilters}
                />

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
                        
                        <ViewModeSelector 
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            sortOption={sortOption}
                            setSortOption={setSortOption}
                        />
                    </div>

                    {/* Hiện thị bộ lọc đang áp dụng */}
                    <FilterDisplay 
                        selectedCategory={selectedCategory}
                        categories={categories}
                        priceRange={priceRange}
                        selectedLocations={selectedLocations}
                        setPriceRange={setPriceRange}
                        setSelectedLocations={setSelectedLocations}
                        setSelectedCategory={setSelectedCategory}
                        clearFilters={clearFilters}
                        formatPrice={formatPrice}
                    />

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
                            {sortedProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    viewMode={viewMode}
                                    hoveredProduct={hoveredProduct}
                                    setHoveredProduct={setHoveredProduct}
                                    handleProductClick={handleProductClick}
                                    addToCart={addToCart}
                                    formatPrice={formatPrice}
                                />
                            ))}
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

            {/* Product Modal with ProductVariantSelector */}
            {showProductModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-11/12 max-w-4xl overflow-y-auto max-h-[90vh] relative">
                        <button
                            className="absolute top-4 right-4 text-gray-800 hover:bg-gray-100 p-1 rounded-full"
                            onClick={() => setShowProductModal(false)}
                        >
                            <XIcon size={24} />
                        </button>

                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-6">CHỌN BIẾN THỂ SẢN PHẨM</h2>

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Product Image */}
                                <div className="w-full md:w-1/3">
                                    <img
                                        src={selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 
                                            ? selectedVariant.images[0] 
                                            : (getImagePath(selectedProduct.thumbnail))}
                                        alt={selectedProduct.name}
                                        className="w-full h-auto rounded object-cover"
                                    />

                                    <div className="flex gap-2 mt-4 overflow-x-auto">
                                        {/* Variant images if available */}
                                        {selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 ? (
                                            selectedVariant.images.slice(0, 4).map((imgSrc, idx) => (
                                                <div key={idx} className="border border-gray-300 p-1 w-16 h-16 flex-shrink-0">
                                                    <img
                                                        src={imgSrc}
                                                        alt={`Biến thể ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <>
                                                <div className="border border-gray-300 p-1 w-16 h-16 flex-shrink-0">
                                                    <img
                                                        src={getImagePath(selectedProduct.thumbnail)}
                                                        alt="Thumbnail"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Product Details with Variant Selector */}
                                <div className="w-full md:w-2/3">
                                    <h3 className="text-lg font-bold mb-1">{selectedProduct.name}</h3>
                                    <p className="text-red-500 font-bold text-xl mb-3">
                                        {selectedVariant 
                                            ? formatPrice(selectedVariant.price) 
                                            : formatPrice(selectedProduct.price)}
                                    </p>
                                    
                                    {/* Thông báo chọn biến thể */}
                                    {productVariants.length > 0 && !selectedVariant && (
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                                            <div className="flex items-center">
                                                <AlertCircle size={16} className="text-yellow-600 mr-2" />
                                                <p className="text-yellow-700">Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Variant Selector Component */}
                                    <ProductVariantSelector
                                        productId={selectedProduct._id}
                                        onVariantSelect={handleVariantSelect}
                                        initialQuantity={quantity}
                                        onQuantityChange={handleQuantityChange}
                                    />
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <div className='flex flex-col sm:flex-row gap-4 mt-6'>
                                <button
                                    className={`w-full ${
                                        (productVariants.length > 0 && !selectedVariant) || (selectedVariant && selectedVariant.stock <= 0)
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-purple-600 hover:bg-purple-700'} 
                                        text-white py-3 rounded-md font-medium transition-colors`}
                                    onClick={() => addToCart(selectedProduct, quantity, true)}
                                    disabled={(productVariants.length > 0 && !selectedVariant) || (selectedVariant && selectedVariant.stock <= 0)}
                                >
                                    {selectedVariant && selectedVariant.stock <= 0
                                        ? "HẾT HÀNG" 
                                        : productVariants.length > 0 && !selectedVariant
                                            ? "VUI LÒNG CHỌN BIẾN THỂ"
                                            : "THÊM VÀO GIỎ HÀNG"}
                                </button>
                                <button
                                    onClick={() => window.location.href = `/product-detail?id=${selectedProduct._id || selectedProduct.id}`}
                                    className='w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium transition-colors'
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