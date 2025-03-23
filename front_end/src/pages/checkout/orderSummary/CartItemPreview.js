import React from 'react';
import defaultImage from '../../../assets/khautrang5d.jpg';

/**
 * CartItemPreview Component
 * 
 * Displays a compact preview of a cart item for the order summary.
 * Shows the product image, name, price, variant details, and quantity.
 * 
 * @param {Object} item - The cart item to display
 */
const CartItemPreview = ({ item }) => {
    // Get product data safely from item object
    const product = item.product_id || {};
    const productName = product.name || "Product";
    
    // Get variant data if available
    const variant = item.variant_id && typeof item.variant_id === 'object' ? item.variant_id : null;
    
    // Get the correct image (variant image first, then product image)
    const productImage = variant && variant.images && variant.images.length > 0 
        ? variant.images[0] 
        : (product.image || product.thumbnail);
    
    // Get the correct price (variant price first, then product price)
    const price = variant && variant.price 
        ? variant.price 
        : (product.discounted_price || product.price || 0);
    
    const quantity = item.quantity || 1;

    // Render variant attributes if available
    const renderVariantInfo = () => {
        if (!variant) return null;
        
        // Get variant name if available
        if (variant.name) {
            return (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {variant.name}
                </span>
            );
        }
        
        // Try to get variant attributes
        const attributes = variant.attributes instanceof Map 
            ? Object.fromEntries(variant.attributes) 
            : variant.attributes;
        
        if (!attributes || Object.keys(attributes).length === 0) {
            return null;
        }
        
        return (
            <div className="text-xs text-gray-600 flex flex-wrap gap-1 mt-1">
                {Object.entries(attributes).map(([key, value]) => (
                    <span key={key} className="bg-gray-100 px-1 py-0.5 rounded">
                        <span className="capitalize">{key}</span>: <strong>{value}</strong>
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="flex items-center mb-4">
            <img
                src={productImage}
                alt={productName}
                className="w-20 h-20 object-cover mr-4 rounded"
                onError={(e) => { e.target.src = defaultImage }}
            />
            <div className="flex-grow">
                <h3 className="font-medium">{productName}</h3>
                {renderVariantInfo()}
                <p className="text-gray-600 mt-1">
                    {price.toLocaleString()}đ x {quantity}
                </p>
            </div>
        </div>
    );
};

export default CartItemPreview;