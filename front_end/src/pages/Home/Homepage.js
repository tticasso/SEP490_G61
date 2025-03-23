import React, { useState, useEffect } from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import image from '../../assets/image1.png';
import ApiService from '../../services/ApiService';
import CartModal from '../cart/CartModal';
import { useAuth } from '../Login/context/AuthContext';
import { CartEventBus } from '../cart/CartEventBus';

// Import components
import ProductCard from './components/ProductCard';
import CategorySidebar from './components/CategorySidebar';
import PromotionalBanners from './components/PromotionalBanners';
import ProductModal from './components/ProductModal';
import ProductSection from './components/ProductSection';

const TroocEcommerce = () => {
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productQuantity, setProductQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [addCartMessage, setAddCartMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0);

    // States cho dữ liệu từ API
    const [products, setProducts] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get current user information
    const { currentUser, isLoggedIn } = useAuth();
    const userId = currentUser?.id || currentUser?._id || "";

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

                // Lọc sản phẩm mới (5 sản phẩm mới nhất dựa vào created_at)
                const sortedByDate = [...productsData].sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setNewProducts(sortedByDate.slice(0, 5));

                // Lọc sản phẩm đề xuất
                const featuredProducts = productsData.filter(product => product.is_feature);
                const hotProducts = productsData.filter(product => product.is_hot);
                const sortedBySold = [...productsData].sort((a, b) => b.sold - a.sold);

                // Kết hợp các sản phẩm đặc biệt, loại bỏ trùng lặp
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

    // Updated addToCart function to handle variants
    const addToCart = async (product, quantity = 1, fromModal = false) => {
        if (!isLoggedIn) {
            // Redirect to login if user is not logged in
            window.location.href = "/login";
            return;
        }

        // Kiểm tra xem đang thêm từ modal và có biến thể chưa
        if (fromModal) {
            // Fetch variants để kiểm tra xem sản phẩm có biến thể hay không
            try {
                const variants = await ApiService.get(`/product-variant/product/${product._id}`, false);
                const hasVariants = variants && variants.length > 0;

                // Nếu sản phẩm có biến thể nhưng chưa chọn biến thể
                if (hasVariants && !selectedVariant) {
                    setAddCartMessage("Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng");
                    setShowMessage(true);
                    setTimeout(() => {
                        setShowMessage(false);
                    }, 3000);
                    return;
                }
            } catch (error) {
                console.error("Error checking product variants:", error);
            }
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

            // Prepare payload
            const payload = {
                cart_id: cartId,
                product_id: product._id,
                quantity: fromModal ? productQuantity : quantity
            };

            // If a variant is selected, add it to the payload
            if (fromModal && selectedVariant) {
                payload.variant_id = selectedVariant._id;
            }

            // Use the correct path - matches with your router
            await ApiService.post('/cart/add-item', payload);

            // Notify that cart has changed
            CartEventBus.publish('cartUpdated');

            // Close cart modal if open
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

            // Always trigger a refresh of the cart when adding items
            setCartRefreshTrigger(prev => prev + 1);

            // If adding from modal, close it
            if (fromModal) {
                setShowProductModal(false);
                setProductQuantity(1); // Reset quantity
                setSelectedVariant(null); // Reset selected variant
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


    // Handle variant selection from ProductVariantSelector
    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        if (variant) {
            setProductQuantity(1); // Reset quantity when variant changes
        }
    };

    // Handle quantity change from ProductVariantSelector
    const handleQuantityChange = (newQuantity) => {
        setProductQuantity(newQuantity);
    };

    // Handle opening product modal
    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
        setProductQuantity(1); // Reset quantity when opening modal
        setSelectedVariant(null); // Reset selected variant
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
                refreshTrigger={cartRefreshTrigger}
            />

            <div className="max-w-7xl mx-auto">
                <div className="w-full">
                    {/* Banner with Categories Sidebar */}
                    <div className="pt-4 pb-4 bg-[#F1F5F9]">
                        <div className="space-y-2">
                            <div className="w-full flex gap-x-8 justify-center">
                                <CategorySidebar categories={categories} />
                                <div className='w-4/5'>
                                    <img src={image} alt="Banner" className="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* New Products Section */}
                    <ProductSection
                        title="SẢN PHẨM MỚI"
                        products={newProducts}
                        hoveredProduct={hoveredProduct}
                        setHoveredProduct={setHoveredProduct}
                        handleProductClick={handleProductClick}
                        addToCart={addToCart}
                        formatPrice={formatPrice}
                    />

                    {/* Promotional Banners */}
                    <PromotionalBanners />

                    {/* Recommended Products Section */}
                    <div className="mt-10 p-4 bg-white pb-10">
                        <div className="w-full">
                            <h2 className="text-lg text-center font-bold text-blue-500">GỢI Ý HÔM NAY</h2>
                        </div>

                        <div className='bg-[#5E81C2] h-[4px]'></div>

                        {/* First row of products */}
                        <div className="grid grid-cols-5 gap-4 pt-8">
                            {recommendedProducts.slice(0, 5).map((product, index) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    index={`rec1-${index}`}
                                    isHoveredProduct={hoveredProduct === `rec1-${index}`}
                                    onHover={setHoveredProduct}
                                    onClick={handleProductClick}
                                    onAddToCart={addToCart}
                                    formatPrice={formatPrice}
                                />
                            ))}
                        </div>

                        {/* Second row of products if available */}
                        {recommendedProducts.length > 5 && (
                            <div className="grid grid-cols-5 gap-4 pt-8">
                                {recommendedProducts.slice(5, 10).map((product, index) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        index={`rec2-${index}`}
                                        isHoveredProduct={hoveredProduct === `rec2-${index}`}
                                        onHover={setHoveredProduct}
                                        onClick={handleProductClick}
                                        onAddToCart={addToCart}
                                        formatPrice={formatPrice}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {showProductModal && selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    selectedVariant={selectedVariant}
                    quantity={productQuantity}
                    onVariantSelect={handleVariantSelect}
                    onQuantityChange={handleQuantityChange}
                    onAddToCart={addToCart}
                    onClose={() => setShowProductModal(false)}
                    formatPrice={formatPrice}
                />
            )}

            {/* Cart Button */}
            <button
                className="fixed bottom-24 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 z-40 flex items-center justify-center"
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