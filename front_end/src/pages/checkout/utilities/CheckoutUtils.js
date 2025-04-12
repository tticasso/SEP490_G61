/**
 * Enhanced utility functions for the checkout process
 * Improved to better handle product variants and update sold counts
 */

/**
 * Format a price with the currency symbol and thousands separators
 * 
 * @param {number} price - The price to format
 * @param {string} currency - The currency symbol to use (default: đ)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'đ') => {
    if (price == null || isNaN(price)) return `0${currency}`;
    return `${price.toLocaleString()}${currency}`;
};

/**
 * Extract product details safely from a cart item
 * Enhanced to properly prioritize variant information
 * 
 * @param {Object} item - Cart item object
 * @returns {Object} Extracted product details with safe fallbacks
 */
export const extractProductDetails = (item) => {
    const product = item.product_id || {};
    const variant = item.variant_id && typeof item.variant_id === 'object' ? item.variant_id : null;
    
    // Always prioritize variant price if available
    const price = variant && variant.price 
        ? variant.price 
        : (product.discounted_price || product.price || 0);
    
    // Always prioritize variant image if available
    const image = variant && variant.images && variant.images.length > 0
        ? variant.images[0]
        : (product.image || product.thumbnail);
    
    // Extract variant attributes in a safe way
    const variantAttributes = variant && variant.attributes 
        ? (variant.attributes instanceof Map 
            ? Object.fromEntries(variant.attributes) 
            : variant.attributes) 
        : null;
        
    return {
        name: product.name || "Product",
        image: image,
        price: price,
        quantity: item.quantity || 1,
        id: typeof product === 'object' ? (product._id || '') : (item.product_id || ''),
        variant: variant,
        variantId: variant ? (variant._id || '') : null,
        variantName: variant ? variant.name : null,
        variantAttributes: variantAttributes,
        variantStock: variant ? variant.stock : null
    };
};

/**
 * Check if all required checkout fields are filled
 * 
 * @param {Object} checkoutData - Checkout form data
 * @returns {boolean} True if all required fields are filled
 */
export const validateCheckoutForm = ({
    addressId,
    paymentMethodId,
    cartItems
}) => {
    return Boolean(
        addressId && 
        paymentMethodId && 
        cartItems && 
        Array.isArray(cartItems) && 
        cartItems.length > 0
    );
};

/**
 * Generate a human-readable error message for order placement failures
 * 
 * @param {Object} error - Error object from the API or order process
 * @returns {string} Human-readable error message
 */
export const getOrderErrorMessage = (error) => {
    if (!error) return "An unknown error occurred";
    
    if (typeof error === 'string') return error;
    
    if (error.couponError) {
        return error.error || "The coupon could not be applied to your order";
    }
    
    if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
    }
    
    return error.message || "An error occurred while processing your order. Please try again.";
};

/**
 * Verify that the shipping address is complete and valid
 * 
 * @param {Object} address - Address object to validate
 * @returns {boolean} True if address is valid
 */
export const isValidAddress = (address) => {
    if (!address) return false;
    
    // Check required fields
    const requiredFields = ['address_line1', 'city', 'phone'];
    return requiredFields.every(field => 
        address[field] && typeof address[field] === 'string' && address[field].trim() !== ''
    );
};

/**
 * Enhanced function to fetch variant details for order items
 * Handles both direct variant fetch and product-variant lookup
 * 
 * @param {Array} orderItems - List of order items
 * @param {Function} apiService - API service to use for fetching
 * @returns {Object} Map of order item ID to variant details
 */
export const fetchVariantDetailsForOrder = async (orderItems, apiService) => {
    if (!orderItems || orderItems.length === 0) return {};
    
    const variantDetails = {};
    
    for (const item of orderItems) {
        if (item.variant_id) {
            // If variant_id is already a full object with attributes
            if (typeof item.variant_id === 'object' && item.variant_id.attributes) {
                variantDetails[item._id] = item.variant_id;
                continue;
            }
            
            // Get product ID to fetch variants
            const productId = typeof item.product_id === 'object' 
                ? (item.product_id._id || item.product_id.id) 
                : item.product_id;
            
            // Get variant ID to find in the list
            const variantId = typeof item.variant_id === 'string' 
                ? item.variant_id 
                : (item.variant_id?._id || '');
            
            if (productId && variantId && !variantDetails[item._id]) {
                try {
                    // First try direct variant fetch by ID
                    try {
                        const directVariant = await apiService.get(`/product-variant/${variantId}`, false);
                        if (directVariant && directVariant._id) {
                            variantDetails[item._id] = directVariant;
                            continue;
                        }
                    } catch (directError) {
                        // If direct fetch fails, continue to product variants approach
                        console.log("Direct variant fetch failed, trying product variants");
                    }
                    
                    // If direct variant fetch fails, try to get all variants for the product
                    const variants = await apiService.get(`/product-variant/product/${productId}`, false);
                    
                    if (variants && variants.length > 0) {
                        // Find the variant that was selected
                        const foundVariant = variants.find(v => v._id === variantId);
                        if (foundVariant) {
                            variantDetails[item._id] = foundVariant;
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching variants for product ${productId}:`, error);
                }
            }
        }
    }
    
    return variantDetails;
};

/**
 * Calculate the correct price for an order item, considering variants
 * 
 * @param {Object} item - The order item
 * @param {Object} variantDetails - Map of variant details by item ID
 * @returns {number} The correct price for the item
 */
export const getCorrectItemPrice = (item, variantDetails = {}) => {
    // First check if we have complete variant details for this item
    if (item._id && variantDetails[item._id] && variantDetails[item._id].price) {
        return variantDetails[item._id].price;
    }
    
    // Next check if item.variant_id is an object with price
    if (item.variant_id && typeof item.variant_id === 'object' && item.variant_id.price) {
        return item.variant_id.price;
    }
    
    // Fall back to product price
    if (item.product_id && typeof item.product_id === 'object') {
        return item.product_id.discounted_price || item.product_id.price || 0;
    }
    
    // Default to item.price or 0
    return item.price || 0;
};

/**
 * Prepare order items from cart items with correct variant handling
 * 
 * @param {Array} cartItems - The cart items
 * @returns {Array} Order items ready for API submission
 */
export const prepareOrderItems = (cartItems) => {
    if (!cartItems || !Array.isArray(cartItems)) return [];
    
    return cartItems.map(item => {
        // Get product ID
        const productId = typeof item.product_id === 'object' 
            ? item.product_id._id 
            : item.product_id;
        
        // Get variant ID if exists
        let variantId = null;
        if (item.variant_id) {
            variantId = typeof item.variant_id === 'object' 
                ? item.variant_id._id 
                : item.variant_id;
        }
        
        // Calculate correct price
        let price = 0;
        
        // Variant price has priority
        if (item.variant_id && typeof item.variant_id === 'object' && item.variant_id.price) {
            price = item.variant_id.price;
        }
        // Fall back to product price
        else if (item.product_id && typeof item.product_id === 'object') {
            price = item.product_id.discounted_price || item.product_id.price || 0;
        }
        
        return {
            product_id: productId,
            variant_id: variantId,
            quantity: item.quantity || 1,
            price: price,
            cart_id: item.cart_id
        };
    });
};

/**
 * Cập nhật số lượng đã bán (sold) cho sản phẩm sau khi thanh toán
 * 
 * @param {string} productId - ID của sản phẩm cần cập nhật
 * @param {number} quantity - Số lượng sản phẩm đã bán
 * @param {Object} apiService - API service để gọi API
 * @returns {Promise<boolean>} Kết quả cập nhật thành công hay không
 */
export const updateProductSoldCount = async (productId, quantity, apiService) => {
    try {
        if (!productId || !apiService) {
            console.error('Thiếu thông tin cần thiết để cập nhật sold');
            return false;
        }
        
        // Đầu tiên, lấy thông tin sản phẩm hiện tại
        const product = await apiService.get(`/product/${productId}`);
        
        if (!product) {
            console.error(`Không tìm thấy sản phẩm với ID: ${productId}`);
            return false;
        }
        
        // Tính toán giá trị mới cho trường sold
        const currentSold = product.sold || 0;
        const newSold = currentSold + quantity;
        
        // Gọi API để cập nhật giá trị sold
        await apiService.put(`/product/update/${productId}`, {
            sold: newSold
        });
        
        console.log(`Đã cập nhật số lượng đã bán cho sản phẩm ${productId}: ${currentSold} → ${newSold}`);
        return true;
    } catch (error) {
        console.error(`Lỗi khi cập nhật số lượng đã bán cho sản phẩm ${productId}:`, error);
        return false;
    }
};

/**
 * Cập nhật số lượng đã bán cho tất cả sản phẩm trong một đơn hàng
 * 
 * @param {string} orderId - ID của đơn hàng
 * @param {Object} apiService - API service để gọi API
 * @returns {Promise<boolean>} Kết quả cập nhật thành công hay không
 */
export const updateSoldCountsForOrder = async (orderId, apiService) => {
    try {
        if (!orderId || !apiService) {
            console.error('Thiếu thông tin cần thiết để cập nhật số lượng bán');
            return false;
        }
        
        // Lấy chi tiết đơn hàng từ API
        const orderDetails = await apiService.get(`/order/${orderId}`);
        
        if (!orderDetails || !orderDetails.orderItems || !Array.isArray(orderDetails.orderItems)) {
            console.error('Không thể lấy thông tin đơn hàng hoặc không có sản phẩm trong đơn hàng');
            return false;
        }
        
        // Cập nhật sold cho từng sản phẩm trong đơn hàng
        const updatePromises = orderDetails.orderItems.map(item => {
            const productId = typeof item.product_id === 'object' ? item.product_id._id : item.product_id;
            const quantity = item.quantity || 1;
            
            return updateProductSoldCount(productId, quantity, apiService);
        });
        
        // Chờ tất cả các cập nhật hoàn tất
        await Promise.all(updatePromises);
        
        return true;
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng bán cho đơn hàng:', error);
        return false;
    }
};