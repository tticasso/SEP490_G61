import React from 'react';
import defaultImage from '../../../assets/khautrang5d.jpg';
import { BE_API_URL } from '../../../config/config';

/**
 * CartItemPreview Component
 * 
 * Displays a compact preview of a cart item for the order summary.
 * Shows the product image, name, price, variant details, and quantity.
 * Enhanced to properly display variant information and pricing.
 * 
 * @param {Object} item - The cart item to display
 */
const CartItemPreview = ({ item }) => {
    const getImagePath = (imgPath) => {
        if (!imgPath) return defaultImage;
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
    // Get product data safely from item object
    const product = item.product_id || {};
    const productName = product.name || "Product";
    
    // Get variant data if available
    const variant = item.variant_id && typeof item.variant_id === 'object' ? item.variant_id : null;
    
    // Get the correct image (variant image first, then product image)
    const productImage = getImagePath(
        (variant && variant.images && variant.images.length > 0) 
            ? variant.images[0] 
            : (product.image || product.thumbnail || defaultImage)
    );
    
    // Get the correct price (variant price first, then product price)
    const price = variant && variant.price 
        ? variant.price 
        : (product.discounted_price || product.price || 0);
    
    const quantity = item.quantity || 1;

    // Check if product is out of stock
    const isOutOfStock = () => {
        if (variant && variant.stock !== undefined) {
            return variant.stock <= 0;
        }
        if (product.stock !== undefined) {
            return product.stock <= 0;
        }
        return false;
    };

    // Render variant attributes if available
    const renderVariantInfo = () => {
        if (!variant) return null;
        
        // Prepare display elements
        const elements = [];
        
        // Add variant name if available
        if (variant.name) {
            elements.push(
                <span key="name" className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {variant.name}
                </span>
            );
        }
        
        // Get variant attributes from either Map or object
        const attributes = variant.attributes instanceof Map 
            ? Object.fromEntries(variant.attributes) 
            : variant.attributes;
        
        // Add attributes if available
        if (attributes && Object.keys(attributes).length > 0) {
            elements.push(
                <div key="attrs" className="text-xs text-gray-600 flex flex-wrap gap-1 mt-1">
                    {Object.entries(attributes).map(([key, value]) => (
                        <span key={key} className="bg-gray-100 px-1 py-0.5 rounded">
                            <span className="capitalize">{key}</span>: <strong>{value}</strong>
                        </span>
                    ))}
                </div>
            );
        }
        
        // Add stock information if available
        if (variant.stock !== undefined) {
            elements.push(
                <div key="stock" className="text-xs mt-1">
                    {variant.stock > 0 ? (
                        <span className="text-green-600">In stock: {variant.stock}</span>
                    ) : (
                        <span className="text-red-600 font-bold">Out of stock</span>
                    )}
                </div>
            );
        } else if (product.stock !== undefined) {
            elements.push(
                <div key="stock" className="text-xs mt-1">
                    {product.stock > 0 ? (
                        <span className="text-green-600">In stock: {product.stock}</span>
                    ) : (
                        <span className="text-red-600 font-bold">Out of stock</span>
                    )}
                </div>
            );
        }
        
        return elements.length > 0 ? <div className="mt-1">{elements}</div> : null;
    };

    return (
        <div className={`flex items-center mb-4 ${isOutOfStock() ? 'bg-red-50 p-2 rounded' : ''}`}>
            <img
                src={productImage}
                alt={productName}
                className={`w-20 h-20 object-cover mr-4 rounded ${isOutOfStock() ? 'opacity-50' : ''}`}
                onError={(e) => { e.target.src = defaultImage }}
            />
            <div className="flex-grow">
                <h3 className="font-medium">
                    {productName}
                    {isOutOfStock() && (
                        <span className="text-red-600 text-xs ml-2 bg-red-100 px-2 py-1 rounded">
                            Out of Stock
                        </span>
                    )}
                </h3>
                {renderVariantInfo()}
                <p className="text-gray-600 mt-1">
                    {price.toLocaleString()}đ x {quantity}
                </p>
            </div>
            <div className="text-right font-semibold">
                {(price * quantity).toLocaleString()}đ
            </div>
        </div>
    );
};

export default CartItemPreview;