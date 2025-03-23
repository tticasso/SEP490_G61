/**
 * Utility functions for the checkout process
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
 * Includes variant information if available
 * 
 * @param {Object} item - Cart item object
 * @returns {Object} Extracted product details with safe fallbacks
 */
export const extractProductDetails = (item) => {
    const product = item.product_id || {};
    const variant = item.variant_id && typeof item.variant_id === 'object' ? item.variant_id : null;
    
    // Get price from variant if available, otherwise from product
    const price = variant && variant.price 
        ? variant.price 
        : (product.discounted_price || product.price || 0);
    
    // Get image from variant if available, otherwise from product
    const image = variant && variant.images && variant.images.length > 0
        ? variant.images[0]
        : (product.image || product.thumbnail);
        
    return {
        name: product.name || "Product",
        image: image,
        price: price,
        quantity: item.quantity || 1,
        id: typeof product === 'object' ? (product._id || '') : (item.product_id || ''),
        variant: variant,
        variantName: variant ? variant.name : null,
        variantAttributes: variant && variant.attributes ? 
            (variant.attributes instanceof Map ? Object.fromEntries(variant.attributes) : variant.attributes) 
            : null
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
 * Fetch variant details for order items
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