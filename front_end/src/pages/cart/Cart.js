import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import { CartEventBus } from './CartEventBus';

// Import các component con
import CartHeader from './components/CartHeader';
import CartEmpty from './components/CartEmpty';
import CartLoading from './components/CartLoading';
import CartError from './components/CartError';
import CartLogin from './components/CartLogin';
import ShopGroup from './components/ShopGroup';
import CartSidebar from './components/CartSidebar';
import CouponModal from './components/CouponModal';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [selectedItems, setSelectedItems] = useState({});
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [loadingCoupons, setLoadingCoupons] = useState(false);

    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || "";

    useEffect(() => {
        if (userId) {
            fetchCartData();
            fetchAvailableCoupons();
        } else {
            setLoading(false);
            setError("Please log in to view your cart");
        }
    }, [userId]);

    // Subscribe to cart update events
    useEffect(() => {
        const unsubscribe = CartEventBus.subscribe('cartUpdated', fetchCartData);
        return () => unsubscribe();
    }, []);

    const fetchCartData = async () => {
        try {
            setLoading(true);

            if (!userId) {
                setError("Vui lòng đăng nhập để xem giỏ hàng");
                setLoading(false);
                return;
            }

            const response = await ApiService.get(`/cart/user/${userId}?t=${Date.now()}`);

            if (response && response.items && response.items.length > 0) {
                setCartItems(response.items);

                // Khởi tạo selectedItems với tất cả các item là false (không chọn)
                const initialSelectedState = {};
                response.items.forEach(item => {
                    initialSelectedState[item._id] = false;
                });
                setSelectedItems(initialSelectedState);
            } else {
                setCartItems([]);
                setSelectedItems({});
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart data:', error);
            setError('Không thể tải dữ liệu giỏ hàng. Vui lòng thử lại sau.');
            setLoading(false);
            setCartItems([]);
        }
    };
    useEffect(() => {
        // Chỉ gọi khi đã có danh sách giỏ hàng và có sự thay đổi về lựa chọn
        if (cartItems.length > 0) {
            fetchAvailableCoupons();
        }
    }, [selectedItems]);

    const fetchAvailableCoupons = async () => {
        try {
            setLoadingCoupons(true);
    
            // Tính toán các thông tin cần thiết cho việc kiểm tra mã giảm giá
            const cartTotal = calculateTotal();
    
            // Lấy danh sách sản phẩm và danh mục đã chọn
            const selectedProductIds = cartItems
                .filter(item => selectedItems[item._id])
                .map(item => {
                    if (item.product_id && typeof item.product_id === 'object') {
                        return item.product_id._id;
                    }
                    return item.product_id;
                });
    
            // Nếu không có sản phẩm nào được chọn, trả về danh sách rỗng
            if (selectedProductIds.length === 0) {
                setAvailableCoupons([]);
                setLoadingCoupons(false);
                return;
            }
    
            const selectedCategoryIds = cartItems
                .filter(item => selectedItems[item._id])
                .map(item => {
                    if (item.product_id && typeof item.product_id === 'object' && item.product_id.category_id) {
                        // Nếu category_id là mảng (nhiều danh mục)
                        if (Array.isArray(item.product_id.category_id)) {
                            return item.product_id.category_id.map(cat =>
                                typeof cat === 'object' ? cat._id : cat
                            );
                        }
                        // Nếu category_id là object hoặc string
                        return typeof item.product_id.category_id === 'object'
                            ? item.product_id.category_id._id
                            : item.product_id.category_id;
                    }
                    return null;
                })
                .filter(id => id !== null)
                .flat(); // Làm phẳng mảng trong trường hợp có mảng lồng nhau
    
            // Lấy danh sách cửa hàng được chọn
            const selectedShopIds = cartItems
                .filter(item => selectedItems[item._id])
                .map(item => {
                    if (item.product_id && typeof item.product_id === 'object' && item.product_id.shop_id) {
                        return typeof item.product_id.shop_id === 'object'
                            ? item.product_id.shop_id._id
                            : item.product_id.shop_id;
                    }
                    return null;
                })
                .filter(id => id !== null);
    
            // Dữ liệu biến thể được chọn
            const selectedVariantIds = cartItems
                .filter(item => selectedItems[item._id] && item.variant_id)
                .map(item => {
                    return typeof item.variant_id === 'object'
                        ? item.variant_id._id
                        : item.variant_id;
                });
    
            // Lấy danh sách mã giảm giá
            const response = await ApiService.get('/coupon/list?active=true&limit=100');
    
            if (response && response.coupons && response.coupons.length > 0) {
                // Lọc các mã giảm giá còn hạn sử dụng
                const currentDate = new Date();
                const validCoupons = response.coupons.filter(coupon => {
                    const startDate = new Date(coupon.start_date);
                    const endDate = new Date(coupon.end_date);
                    return startDate <= currentDate && endDate >= currentDate && !coupon.is_delete;
                });
    
                // Kiểm tra tính hợp lệ của từng mã giảm giá với các sản phẩm đã chọn
                const enhancedCoupons = await Promise.all(validCoupons.map(async (coupon) => {
                    try {
                        // Bỏ qua việc kiểm tra nếu không có sản phẩm nào được chọn
                        if (selectedProductIds.length === 0) {
                            return {
                                ...coupon,
                                isValid: false,
                                validationMessage: 'Vui lòng chọn sản phẩm để áp dụng mã giảm giá',
                                discountAmount: 0
                            };
                        }
    
                        // Kiểm tra tính hợp lệ của mã giảm giá
                        const validationResponse = await ApiService.post('/coupon/validate', {
                            code: coupon.code,
                            userId: userId,
                            cartTotal: cartTotal,
                            productIds: selectedProductIds,
                            categoryIds: selectedCategoryIds,
                            shopIds: selectedShopIds,
                            variantIds: selectedVariantIds
                        });
    
                        return {
                            ...coupon,
                            isValid: validationResponse.valid || false,
                            validationMessage: validationResponse.message || '',
                            discountAmount: validationResponse.discountAmount || 0
                        };
                    } catch (error) {
                        // Nếu có lỗi, đánh dấu mã giảm giá là không hợp lệ
                        const errorMessage = typeof error === 'object' && error.message ? 
                            error.message : 
                            'Mã giảm giá không hợp lệ';
                        
                        return {
                            ...coupon,
                            isValid: false,
                            validationMessage: errorMessage,
                            discountAmount: 0
                        };
                    }
                }));
    
                setAvailableCoupons(enhancedCoupons);
            } else {
                setAvailableCoupons([]);
            }
    
            setLoadingCoupons(false);
        } catch (error) {
            console.error('Error fetching available coupons:', error);
            setAvailableCoupons([]);
            setLoadingCoupons(false);
        }
    };


    const applyCoupon = async (code) => {
        if (!code.trim()) {
            setCouponError('Vui lòng chọn mã giảm giá');
            return;
        }
    
        // Kiểm tra xem có sản phẩm nào được chọn không
        if (!hasSelectedItems()) {
            setCouponError('Vui lòng chọn ít nhất một sản phẩm để áp dụng mã giảm giá');
            return;
        }
    
        try {
            // Lấy danh sách sản phẩm được chọn
            const productIds = cartItems
                .filter(item => selectedItems[item._id])
                .map(item => {
                    if (item.product_id && typeof item.product_id === 'object') {
                        return item.product_id._id;
                    }
                    return item.product_id;
                });
    
            // Lấy danh sách danh mục
            const categoryIds = cartItems
                .filter(item => selectedItems[item._id])
                .map(item => {
                    if (item.product_id && typeof item.product_id === 'object') {
                        if (Array.isArray(item.product_id.category_id)) {
                            return item.product_id.category_id.map(cat =>
                                typeof cat === 'object' ? cat._id : cat
                            );
                        }
                        return item.product_id.category_id && typeof item.product_id.category_id === 'object'
                            ? item.product_id.category_id._id
                            : item.product_id.category_id;
                    }
                    return null;
                })
                .filter(id => id !== null)
                .flat();
    
            // Lấy danh sách shop
            const shopIds = cartItems
                .filter(item => selectedItems[item._id])
                .map(item => {
                    if (item.product_id && typeof item.product_id === 'object' && item.product_id.shop_id) {
                        return typeof item.product_id.shop_id === 'object'
                            ? item.product_id.shop_id._id
                            : item.product_id.shop_id;
                    }
                    return null;
                })
                .filter(id => id !== null);
    
            // Lấy danh sách biến thể
            const variantIds = cartItems
                .filter(item => selectedItems[item._id] && item.variant_id)
                .map(item => {
                    return typeof item.variant_id === 'object'
                        ? item.variant_id._id
                        : item.variant_id;
                });
    
            const response = await ApiService.post('/coupon/validate', {
                code: code,
                userId: userId,
                cartTotal: calculateTotal(),
                productIds: productIds,
                categoryIds: categoryIds,
                shopIds: shopIds,
                variantIds: variantIds
            });
    
            if (response.valid) {
                setAppliedCoupon(response.coupon);
                setCouponError('');
                setShowCouponModal(false);
                // Thông báo thành công
                alert(`Đã áp dụng mã giảm giá "${code}" thành công. Bạn được giảm ${response.discountAmount.toLocaleString()}đ`);
            } else {
                setCouponError(response.message || 'Mã giảm giá không hợp lệ');
                // Hiển thị modal thông báo lỗi
                alert(`Không thể áp dụng mã giảm giá: ${response.message}`);
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            let errorMessage = 'Không thể áp dụng mã giảm giá.';
            
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage += ' ' + error.response.data.message;
            } else if (typeof error === 'string') {
                errorMessage += ' ' + error;
            }
            
            setCouponError(errorMessage);
            alert(errorMessage + ' Vui lòng thử lại sau.');
        }
    };

    useEffect(() => {
        // Nếu đã có coupon được áp dụng, kiểm tra lại tính hợp lệ
        if (appliedCoupon && hasSelectedItems()) {
            const checkAppliedCoupon = async () => {
                try {
                    // Lấy danh sách sản phẩm và danh mục được chọn
                    const productIds = cartItems
                        .filter(item => selectedItems[item._id])
                        .map(item => {
                            if (item.product_id && typeof item.product_id === 'object') {
                                return item.product_id._id;
                            }
                            return item.product_id;
                        });

                    const categoryIds = cartItems
                        .filter(item => selectedItems[item._id])
                        .map(item => {
                            if (item.product_id && typeof item.product_id === 'object' && item.product_id.category_id) {
                                if (Array.isArray(item.product_id.category_id)) {
                                    return item.product_id.category_id.map(cat =>
                                        typeof cat === 'object' ? cat._id : cat
                                    );
                                }
                                return typeof item.product_id.category_id === 'object'
                                    ? item.product_id.category_id._id
                                    : item.product_id.category_id;
                            }
                            return null;
                        })
                        .filter(id => id !== null)
                        .flat();

                    // Kiểm tra lại mã giảm giá
                    const response = await ApiService.post('/coupon/validate', {
                        code: appliedCoupon.code,
                        userId: userId,
                        cartTotal: calculateTotal(),
                        productIds: productIds,
                        categoryIds: categoryIds
                    });

                    // Nếu mã không còn hợp lệ, gỡ bỏ
                    if (!response.valid) {
                        setAppliedCoupon(null);
                        alert(`Mã giảm giá "${appliedCoupon.code}" không còn áp dụng được với các sản phẩm đã chọn. Vui lòng chọn mã khác.`);
                    } else if (appliedCoupon._id !== response.coupon._id) {
                        // Nếu giá trị coupon thay đổi, cập nhật lại
                        setAppliedCoupon(response.coupon);
                    }
                } catch (error) {
                    console.error('Error re-validating coupon:', error);
                    setAppliedCoupon(null);
                }
            };

            checkAppliedCoupon();
        } else if (appliedCoupon && !hasSelectedItems()) {
            // Nếu không có sản phẩm nào được chọn nhưng có coupon, gỡ bỏ coupon
            setAppliedCoupon(null);
        }
    }, [selectedItems]);

    const updateQuantity = async (cartItemId, change) => {
        try {
            const item = cartItems.find(item => item._id === cartItemId);
            if (!item) return;

            const newQuantity = Math.max(1, item.quantity + change);

            // Kiểm tra số lượng tồn kho nếu là biến thể
            if (item.variant_id && typeof item.variant_id === 'object') {
                const variant = item.variant_id;
                if (variant.stock !== undefined && newQuantity > variant.stock) {
                    alert(`Chỉ còn ${variant.stock} sản phẩm trong kho`);
                    return;
                }
            }

            await ApiService.put('/cart/update-item', {
                cart_item_id: cartItemId,
                quantity: newQuantity
            });

            // Thông báo giỏ hàng đã cập nhật
            CartEventBus.publish('cartUpdated');

            // Cập nhật state local
            setCartItems(cartItems.map(item =>
                item._id === cartItemId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        } catch (error) {
            console.error('Error updating item quantity:', error);
            alert('Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại sau.');
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            await ApiService.delete(`/cart/remove-item/${cartItemId}`);

            // Thông báo giỏ hàng đã cập nhật
            CartEventBus.publish('cartUpdated');

            // Update local state
            setCartItems(cartItems.filter(item => item._id !== cartItemId));
            // Xóa item khỏi selectedItems
            const newSelectedItems = { ...selectedItems };
            delete newSelectedItems[cartItemId];
            setSelectedItems(newSelectedItems);
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
        }
    };

    const clearCart = async () => {
        try {
            if (!cartItems || cartItems.length === 0) return;
            const cartId = cartItems[0].cart_id;

            await ApiService.delete(`/cart/clear/${cartId}`);

            // Thông báo giỏ hàng đã cập nhật
            CartEventBus.publish('cartUpdated');

            setCartItems([]);
            setSelectedItems({});
        } catch (error) {
            console.error('Error clearing cart:', error);
            alert('Không thể xóa giỏ hàng. Vui lòng thử lại sau.');
        }
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems({
            ...selectedItems,
            [itemId]: !selectedItems[itemId]
        });
    };

    const handleSelectAllShopItems = (shopItems, isSelected) => {
        const updatedSelectedItems = { ...selectedItems };
        shopItems.forEach(item => {
            updatedSelectedItems[item._id] = !isSelected;
        });
        setSelectedItems(updatedSelectedItems);
    };

    const areAllShopItemsSelected = (shopItems) => {
        return shopItems.every(item => selectedItems[item._id]);
    };

    const calculateTotal = () => {
        if (!cartItems || cartItems.length === 0) return 0;

        // Chỉ tính tổng cho các sản phẩm được chọn
        const subtotal = cartItems.reduce((total, item) => {
            // Kiểm tra xem item có được chọn không
            if (!selectedItems[item._id]) return total;

            // Lấy giá của item (từ variant hoặc product)
            const price = getItemPrice(item);
            return total + price * item.quantity;
        }, 0);

        // Áp dụng giảm giá nếu có
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percentage') {
                // Giảm giá theo phần trăm
                const discountAmount = (subtotal * appliedCoupon.value) / 100;
                return subtotal - Math.min(discountAmount, appliedCoupon.max_discount_value || Infinity);
            } else if (appliedCoupon.type === 'fixed') {
                // Giảm giá cố định
                return Math.max(0, subtotal - appliedCoupon.value);
            }
        }

        return subtotal;
    };

    // Lấy giá dựa trên biến thể hoặc sản phẩm
    const getItemPrice = (item) => {
        // Kiểm tra nếu có variant_id và variant_id là object
        if (item.variant_id && typeof item.variant_id === 'object') {
            if (item.variant_id.price !== undefined) {
                return item.variant_id.price;
            }
        }

        // Fallback to product price
        if (item.product_id && typeof item.product_id === 'object') {
            return item.product_id.discounted_price || item.product_id.price || 0;
        }

        return 0;
    };

    // Kiểm tra xem có ít nhất một sản phẩm được chọn không
    const hasSelectedItems = () => {
        return Object.values(selectedItems).some(isSelected => isSelected);
    };

    // Nhóm sản phẩm theo shop
    const groupItemsByShop = () => {
        const groups = {};

        if (!cartItems || cartItems.length === 0) {
            return [];
        }

        cartItems.forEach(item => {
            if (item.product_id && typeof item.product_id === 'object') {
                // Lấy shop_id từ sản phẩm
                let shopId = 'unknown';
                let shopName = 'Cửa hàng';
                let shopImage = '';

                // Xử lý trường hợp shop_id là object 
                if (item.product_id.shop_id) {
                    if (typeof item.product_id.shop_id === 'object') {
                        shopId = item.product_id.shop_id._id || item.product_id.shop_id.id || 'unknown';
                        shopName = item.product_id.shop_id.name || 'Cửa hàng';
                        shopImage = item.product_id.shop_id.logo || '';
                    } else {
                        // Khi shop_id chỉ là ID, gán ID và đánh dấu cần fetch thêm thông tin
                        shopId = item.product_id.shop_id;
                    }
                }

                if (!groups[shopId]) {
                    groups[shopId] = {
                        shop_id: shopId,
                        shop_name: shopName,
                        shop_image: shopImage,
                        items: [],
                        // Flag để ShopGroup component biết cần fetch thông tin shop hay không
                        needFetch: typeof item.product_id.shop_id !== 'object'
                    };
                }

                groups[shopId].items.push(item);
            } else if (item.shop_id) {
                // Trường hợp item trực tiếp có shop_id
                const shopId = typeof item.shop_id === 'object' ? (item.shop_id._id || item.shop_id.id) : item.shop_id;
                const needFetch = typeof item.shop_id !== 'object';

                if (!groups[shopId]) {
                    groups[shopId] = {
                        shop_id: shopId,
                        shop_name: item.shop_name || 'Cửa hàng',
                        shop_image: item.shop_image || '',
                        items: [],
                        needFetch: needFetch
                    };
                }

                groups[shopId].items.push(item);
            } else {
                // Fallback nếu không có thông tin shop
                if (!groups['unknown']) {
                    groups['unknown'] = {
                        shop_id: 'unknown',
                        shop_name: 'Cửa hàng không xác định',
                        shop_image: '',
                        items: [],
                        needFetch: false
                    };
                }

                groups['unknown'].items.push(item);
            }
        });

        return Object.values(groups);
    };

    const shops = groupItemsByShop();
    const totalAmount = calculateTotal();

    if (loading) {
        return <CartLoading />;
    }

    if (error) {
        return <CartError message={error} />;
    }

    if (!userId) {
        return <CartLogin />;
    }

    if (!cartItems || cartItems.length === 0) {
        return <CartEmpty />;
    }

    return (
        <div className='flex gap-10 max-w-7xl mx-auto'>
            {/* Modal chọn mã giảm giá */}
            <CouponModal
                show={showCouponModal}
                onClose={() => setShowCouponModal(false)}
                availableCoupons={availableCoupons}
                loading={loadingCoupons}
                applyCoupon={applyCoupon}
                cartTotal={totalAmount}
                error={couponError}
            />

            <div className="w-2/3 flex flex-col bg-white shadow-md rounded-lg p-4 mt-8 mb-8">
                <CartHeader clearCart={clearCart} />

                {shops.map((shop, index) => (
                    <ShopGroup
                        key={shop.shop_id}
                        shop={shop}
                        index={index}
                        shopsLength={shops.length}
                        selectedItems={selectedItems}
                        areAllShopItemsSelected={() => areAllShopItemsSelected(shop.items)}
                        handleSelectAllShopItems={(isSelected) => handleSelectAllShopItems(shop.items, isSelected)}
                        handleSelectItem={handleSelectItem}
                        updateQuantity={updateQuantity}
                        removeItem={removeItem}
                        getItemPrice={getItemPrice}
                    />
                ))}
            </div>

            <CartSidebar
                totalAmount={totalAmount}
                appliedCoupon={appliedCoupon}
                setAppliedCoupon={setAppliedCoupon}
                setShowCouponModal={setShowCouponModal}
                hasSelectedItems={hasSelectedItems}
                selectedItems={selectedItems}
                cartItems={cartItems}
            />
        </div>
    );
};

export default Cart;