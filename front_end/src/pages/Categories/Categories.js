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
import ProductVariantSelector from '../../components/ProductVariantSelector';
import Pagination from './components/Pagination'; // Import the new Pagination component


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

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8); // Số sản phẩm mỗi trang

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
                
                // Lọc sản phẩm theo trạng thái is_active = true
                const activeProducts = productsData.filter(product => 
                    product.is_active === true || product.is_active === 'true' || product.is_active === 1
                );

                // Kiểm tra hàng tồn kho của tất cả biến thể
                let productsInStock = [];
                
                // Dùng Promise.all để kiểm tra song song tất cả sản phẩm
                const productStockChecks = await Promise.all(
                    activeProducts.map(async (product) => {
                        try {
                            const variants = await ApiService.get(`/product-variant/product/${product._id}`, false);
                            
                            // Lọc ra các biến thể đang active
                            const activeVariants = variants.filter(variant => 
                                variant.is_active === true || variant.is_active === 'true' || variant.is_active === 1
                            );
                            
                            // Kiểm tra xem có ít nhất một biến thể còn hàng không
                            const hasStock = activeVariants.length === 0 || 
                                             activeVariants.some(variant => 
                                                variant.stock === undefined || variant.stock > 0
                                             );
                                             
                            return {
                                product,
                                hasStock
                            };
                        } catch (error) {
                            console.error(`Error checking variants for product ${product._id}:`, error);
                            // Nếu có lỗi khi kiểm tra, coi như sản phẩm còn hàng
                            return {
                                product,
                                hasStock: true
                            };
                        }
                    })
                );
                
                // Lọc ra các sản phẩm còn hàng
                productsInStock = productStockChecks
                    .filter(item => item.hasStock)
                    .map(item => item.product);

                // Parse URL parameters
                const urlParams = new URLSearchParams(location.search);
                const search = urlParams.get('search');
                const categoryId = urlParams.get('category');
                const page = urlParams.get('page');

                // Xử lý tìm kiếm và lọc từ sản phẩm còn hàng
                if (search) {
                    setSearchQuery(search);

                    // Filter products based on search query
                    const searchLower = search.toLowerCase();
                    const filteredProducts = productsInStock.filter(product =>
                        product.name.toLowerCase().includes(searchLower) ||
                        (product.description && product.description.toLowerCase().includes(searchLower))
                    );
                    setProducts(filteredProducts);
                } else {
                    setProducts(productsInStock);
                    // Clear search query when no search is present
                    setSearchQuery('');
                }

                // Set selected category if present in URL
                if (categoryId) {
                    setSelectedCategory(categoryId);
                }

                // Set current page if present in URL
                if (page) {
                    setCurrentPage(parseInt(page, 10));
                } else {
                    setCurrentPage(1); // Reset to page 1 when filters change
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

    // Reset về trang 1 khi thay đổi bộ lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, priceRange.min, priceRange.max, selectedLocations.length, searchQuery, sortOption]);

    // Fetch product variants khi có product được chọn
    useEffect(() => {
        const fetchVariants = async () => {
            if (!selectedProduct || !selectedProduct._id) return;
            
            try {
                setLoadingVariants(true);
                const response = await ApiService.get(`/product-variant/product/${selectedProduct._id}`, false);
                
                // Lọc chỉ lấy các biến thể có is_active = true
                const activeVariants = response.filter(variant => 
                    variant.is_active === true || variant.is_active === 'true' || variant.is_active === 1
                );
                
                if (activeVariants && activeVariants.length > 0) {
                    setProductVariants(activeVariants);
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

        // Kiểm tra trạng thái active của sản phẩm
        try {
            const updatedProduct = await ApiService.get(`/product/${product._id}`, false);
            if (!(updatedProduct.is_active === true || updatedProduct.is_active === 'true' || updatedProduct.is_active === 1)) {
                setAddCartMessage("Sản phẩm này hiện không có sẵn.");
                setShowMessage(true);
                setTimeout(() => {
                    setShowMessage(false);
                }, 3000);
                return;
            }
            
            // Kiểm tra xem sản phẩm còn hàng không
            const variants = await ApiService.get(`/product-variant/product/${updatedProduct._id}`, false);
            
            // Lọc ra các biến thể đang active
            const activeVariants = variants.filter(variant => 
                variant.is_active === true || variant.is_active === 'true' || variant.is_active === 1
            );
            
            // Kiểm tra xem có ít nhất một biến thể còn hàng không
            const hasStock = activeVariants.length === 0 || 
                             activeVariants.some(variant => 
                                variant.stock === undefined || variant.stock > 0
                             );
            
            if (!hasStock) {
                setAddCartMessage("Sản phẩm này hiện đã hết hàng.");
                setShowMessage(true);
                setTimeout(() => {
                    setShowMessage(false);
                }, 3000);
                return;
            }
        } catch (error) {
            console.error("Error checking product status:", error);
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
                // Kiểm tra trạng thái active của biến thể
                if (!(selectedVariant.is_active === true || selectedVariant.is_active === 'true' || selectedVariant.is_active === 1)) {
                    setAddCartMessage("Biến thể sản phẩm này hiện không có sẵn.");
                    setShowMessage(true);
                    setTimeout(() => {
                        setShowMessage(false);
                    }, 3000);
                    return;
                }
                
                // Kiểm tra stock của biến thể đã chọn
                if (selectedVariant.stock !== undefined && selectedVariant.stock <= 0) {
                    setAddCartMessage("Biến thể sản phẩm này hiện đã hết hàng.");
                    setShowMessage(true);
                    setTimeout(() => {
                        setShowMessage(false);
                    }, 3000);
                    return;
                }
                
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

    // Tính toán các giá trị cho phân trang
    const totalItems = sortedProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const showingFrom = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const showingTo = Math.min(currentPage * itemsPerPage, totalItems);

    // Lấy mảng sản phẩm cho trang hiện tại
    const currentItems = sortedProducts.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    // Xử lý khi thay đổi trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        
        // Cập nhật URL để lưu trạng thái trang
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('page', pageNumber);
        
        // Thực hiện thay đổi URL mà không làm mới trang
        const newUrl = `${location.pathname}?${searchParams.toString()}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        
        // Cuộn lên đầu trang
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
        try {
            // Kiểm tra lại trạng thái active của sản phẩm trước khi mở modal
            const updatedProduct = await ApiService.get(`/product/${product._id}`, false);
            if (updatedProduct.is_active === true || updatedProduct.is_active === 'true' || updatedProduct.is_active === 1) {
                // Kiểm tra xem sản phẩm còn hàng không
                const variants = await ApiService.get(`/product-variant/product/${updatedProduct._id}`, false);
                
                // Lọc ra các biến thể đang active
                const activeVariants = variants.filter(variant => 
                    variant.is_active === true || variant.is_active === 'true' || variant.is_active === 1
                );
                
                // Kiểm tra xem có ít nhất một biến thể còn hàng không
                const hasStock = activeVariants.length === 0 || 
                                activeVariants.some(variant => 
                                    variant.stock === undefined || variant.stock > 0
                                );
                
                if (hasStock) {
                    setSelectedProduct(updatedProduct);
                    setShowProductModal(true);
                    setQuantity(1);
                    setSelectedVariant(null);
                } else {
                    setAddCartMessage("Sản phẩm này hiện đã hết hàng.");
                    setShowMessage(true);
                    setTimeout(() => {
                        setShowMessage(false);
                    }, 3000);
                }
            } else {
                setAddCartMessage("Sản phẩm này hiện không có sẵn.");
                setShowMessage(true);
                setTimeout(() => {
                    setShowMessage(false);
                }, 3000);
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
            // Fallback nếu không thể kiểm tra trạng thái
            setSelectedProduct(product);
            setShowProductModal(true);
            setQuantity(1);
            setSelectedVariant(null);
        }
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
                {/* Sidebar Categories - Sử dụng w-64 để đảm bảo chiều rộng cố định */}
                <div className="md:w-64 flex-shrink-0 mb-6 md:mb-0">
                    <CategorySidebar 
                        categories={categories}
                        selectedCategory={selectedCategory}
                        handleCategorySelect={handleCategorySelect}
                        priceRange={priceRange}
                        handlePriceChange={handlePriceChange}
                        applyPriceFilter={applyPriceFilter}
                        clearFilters={clearFilters}
                    />
                </div>

                {/* Product Listing */}
                <div className="md:flex-grow md:pl-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-gray-700">
                            <span>{totalItems} Sản phẩm</span>
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

                    {currentItems.length > 0 ? (
                        <div
                            className={`
                                grid gap-4 
                                ${viewMode === 'grid'
                                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                                    : 'grid-cols-1'
                                }
                            `}
                        >
                            {currentItems.map(product => (
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

                    {/* Pagination Component */}
                    {totalItems > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            showingFrom={showingFrom}
                            showingTo={showingTo}
                            totalItems={totalItems}
                        />
                    )}
                </div>
            </div>

            {/* Product Modal with ProductVariantSelector */}
            {showProductModal && selectedProduct && (
                <ProductModal
                    selectedProduct={selectedProduct}
                    selectedVariant={selectedVariant}
                    quantity={quantity}
                    formatPrice={formatPrice}
                    handleVariantSelect={handleVariantSelect}
                    handleQuantityChange={handleQuantityChange}
                    addToCart={addToCart}
                    closeModal={() => setShowProductModal(false)}
                />
            )}
        </div>
    );
};

export default Categories;