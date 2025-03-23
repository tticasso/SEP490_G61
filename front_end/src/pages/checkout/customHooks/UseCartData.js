import { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';

/**
 * Custom hook for managing cart data
 * 
 * Handles:
 * - Loading cart items
 * - Calculating totals
 * - Managing coupons
 * - Placing orders
 * 
 * @param {string} userId - User ID to fetch cart for
 * @returns {Object} Cart data and management functions
 */
const useCartData = (userId) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load cart data from localStorage or API
    const fetchCartData = async () => {
        try {
            setLoading(true);
            
            // Get selected products from localStorage
            const selectedItemsStr = localStorage.getItem('selectedCartItems');
            
            if (selectedItemsStr) {
                const selectedItems = JSON.parse(selectedItemsStr);
                
                if (Array.isArray(selectedItems) && selectedItems.length > 0) {
                    setCartItems(selectedItems);
                    
                    // Calculate total price (without discount)
                    const subtotal = calculateSubtotal(selectedItems);
                    setCartTotal(subtotal);
                } else {
                    // No selected products, fetch from API as fallback
                    await fetchAllCartItems();
                }
            } else {
                // No data in localStorage, fetch from API
                await fetchAllCartItems();
            }
            
            // Check for applied coupon
            loadAppliedCoupon();
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart data:', error);
            setError('Cannot load cart data. Please try again later.');
            setLoading(false);
        }
    };
    
    // Calculate subtotal for a list of items with variant support
    const calculateSubtotal = () => {
        // Nếu không có chi tiết đơn hàng, trả về 0
        if (!orderDetails || orderDetails.length === 0) return 0;
        
        // Ưu tiên sử dụng giá trị từ server nếu có
        if (order && typeof order.original_price === 'number' && order.original_price > 0) {
          return order.original_price;
        }
        
        // Tính lại tổng từ chi tiết đơn hàng nếu không có giá trị từ server
        return orderDetails.reduce((total, detail) => {
          const price = getItemPrice(detail);
          return total + (price * detail.quantity);
        }, 0);
      };
    
    // Load coupon from localStorage
    const loadAppliedCoupon = () => {
        const appliedCouponStr = localStorage.getItem('appliedCoupon');
        if (appliedCouponStr) {
            const couponData = JSON.parse(appliedCouponStr);
            setAppliedCoupon(couponData);
            
            // Calculate discount amount
            updateDiscountAmount(couponData, cartTotal);
        }
    };
    
    // Update discount amount when coupon or total changes
    const updateDiscountAmount = (coupon, total) => {
        if (!coupon) {
            setDiscountAmount(0);
            return;
        }
        
        if (coupon.type === 'percentage') {
            // Percentage discount
            let discount = (total * coupon.value) / 100;
            // Apply maximum discount limit if exists
            if (coupon.max_discount_value) {
                discount = Math.min(discount, coupon.max_discount_value);
            }
            setDiscountAmount(discount);
        } else if (coupon.type === 'fixed') {
            // Fixed discount
            setDiscountAmount(coupon.value);
        }
    };
    
    // Fetch all cart items from API
    const fetchAllCartItems = async () => {
        if (!userId) {
            setCartItems([]);
            setCartTotal(0);
            return;
        }
        
        try {
            const response = await ApiService.get(`/cart/user/${userId}`);
            if (response && response.items) {
                setCartItems(response.items);

                // Calculate cart total
                const subtotal = calculateSubtotal(response.items);
                setCartTotal(subtotal);
            } else {
                setCartItems([]);
                setCartTotal(0);
            }
        } catch (error) {
            console.error('Error fetching all cart items:', error);
            setCartItems([]);
            setCartTotal(0);
        }
    };

    // Remove applied coupon
    const removeCoupon = () => {
        localStorage.removeItem('appliedCoupon');
        setAppliedCoupon(null);
        setDiscountAmount(0);
    };

    // Calculate final total (subtotal - discount + shipping)
    const calculateTotal = (shippingCost) => {
        const subtotal = cartTotal;
        // Subtract discount amount from coupon
        const afterDiscount = Math.max(0, subtotal - discountAmount);
        // Add shipping fee
        return afterDiscount + shippingCost;
    };

    // Place order
    const placeOrder = async (orderData) => {
        try {
            setLoading(true);
            
            // Prepare order items data
            const orderItems = cartItems.map(item => ({
                product_id: typeof item.product_id === 'object' ? item.product_id._id : item.product_id,
                quantity: item.quantity,
                cart_id: item.cart_id,
                discount_id: item.discount_id
            }));
            
            // Create payload for API
            const orderPayload = {
                customer_id: userId,
                shipping_id: orderData.deliveryMethodId, 
                payment_id: orderData.paymentMethodId, 
                user_address_id: orderData.addressId, 
                orderItems: orderItems,
                order_payment_id: `PAY-${Date.now()}`, 
                discount_id: null,
                coupon_id: appliedCoupon ? appliedCoupon._id : null,
                discount_amount: discountAmount
            };
            
            // Call API to create order
            const response = await ApiService.post('/order/create', orderPayload);
            
            // Handle successful order
            if (response && response.order) {
                // Clear saved data in localStorage
                localStorage.removeItem('selectedCartItems');
                localStorage.removeItem('appliedCoupon');
                
                // Clear cart after successful order
                if (cartItems.length > 0 && cartItems[0].cart_id) {
                    await ApiService.delete(`/cart/clear/${cartItems[0].cart_id}`);
                }
                
                return { 
                    success: true, 
                    orderId: response.order._id 
                };
            }
            
            return { success: false, error: 'Order creation failed' };
        } catch (error) {
            console.error("Error creating order:", error);
            
            // Check for coupon-related errors
            if (error.response && error.response.data && error.response.data.message) {
                const errorMessage = error.response.data.message;
                
                // Handle case where coupon cannot be applied to products in cart
                if (errorMessage.includes("coupon only applies to specific products")) {
                    // Save coupon info for display in notification
                    const couponCode = appliedCoupon ? appliedCoupon.code : "selected";
                    
                    // Remove coupon
                    removeCoupon();
                    
                    return { 
                        success: false, 
                        couponError: true,
                        error: `Coupon ${couponCode} does not apply to products in your cart.`
                    };
                }
                
                return { success: false, error: errorMessage };
            }
            
            return { 
                success: false, 
                error: error.message || 'An error occurred while placing your order. Please try again later.'
            };
        } finally {
            setLoading(false);
        }
    };

    // Update discount when cart total changes
    useEffect(() => {
        if (appliedCoupon) {
            updateDiscountAmount(appliedCoupon, cartTotal);
        }
    }, [cartTotal]);

    // Load cart data on initial render
    useEffect(() => {
        if (userId) {
            fetchCartData();
        } else {
            setLoading(false);
            setCartItems([]);
            setCartTotal(0);
        }
    }, [userId]);

    return {
        cartItems,
        cartTotal,
        appliedCoupon,
        discountAmount,
        loading,
        error,
        fetchCartData,
        removeCoupon,
        calculateTotal,
        placeOrder
    };
};

export default useCartData;