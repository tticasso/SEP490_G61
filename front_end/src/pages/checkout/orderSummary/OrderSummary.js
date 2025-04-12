import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import CartItemPreview from './CartItemPreview';
import OrderTotals from './OrderTotals';

/**
 * OrderSummary Component
 * 
 * Displays the order summary section of the checkout page.
 * Shows cart items, price calculations, discount info, and the checkout button.
 */
const OrderSummary = ({
    cartItems,
    cartTotal,
    appliedCoupon,
    discountAmount,
    deliveryMethods,
    deliveryMethod,
    handleRemoveCoupon,
    calculateTotal,
    handlePlaceOrder,
    selectedAddress,
    paymentMethod
}) => {
    // Get shipping cost from selected delivery method
    const getShippingCost = () => {
        const selectedShippingMethod = deliveryMethods.find(method => method.id === deliveryMethod);
        return selectedShippingMethod ? selectedShippingMethod.price : 0;
    };

    // Check if any product is out of stock
    const checkOutOfStockItems = () => {
        const outOfStockItems = cartItems.filter(item => {
            // Check variant stock first if available
            if (item.variant_id && typeof item.variant_id === 'object') {
                return item.variant_id.stock !== undefined && item.variant_id.stock <= 0;
            }
            // Otherwise check product stock
            if (item.product_id && typeof item.product_id === 'object') {
                return item.product_id.stock !== undefined && item.product_id.stock <= 0;
            }
            return false;
        });
        return outOfStockItems;
    };

    // Get out of stock items
    const outOfStockItems = checkOutOfStockItems();
    const hasOutOfStockItems = outOfStockItems.length > 0;

    // Get out of stock product names for display
    const getOutOfStockNames = () => {
        return outOfStockItems.map(item => {
            const product = item.product_id || {};
            const productName = product.name || "Product";
            
            // Get variant name if available
            const variant = item.variant_id && typeof item.variant_id === 'object' ? item.variant_id : null;
            const variantName = variant && variant.name ? ` (${variant.name})` : '';
            
            return `${productName}${variantName}`;
        });
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            {/* Cart Items List */}
            {cartItems.length > 0 ? (
                <div className="mb-4">
                    {cartItems.map((item) => (
                        <CartItemPreview key={item._id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-4 text-gray-500 mb-4">Giỏ hàng của bạn đang trống</div>
            )}

            {/* Out of Stock Warning */}
            {hasOutOfStockItems && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
                    <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Sản phẩm đã hết hàng</p>
                        <ul className="mt-1 list-disc list-inside text-sm">
                            {getOutOfStockNames().map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ul>
                        <p className="text-sm mt-1">Xin hãy xóa những sản phẩm đó để có thể thực hiện thanh toán</p>
                    </div>
                </div>
            )}

            {/* Price Summary */}
            <OrderTotals 
                subtotal={cartTotal}
                discount={discountAmount}
                shippingCost={getShippingCost()}
                appliedCoupon={appliedCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                total={calculateTotal()}
            />

            {/* Checkout Button */}
            <button
                className={`w-full py-3 rounded-lg mt-4 ${
                    !selectedAddress || !paymentMethod || cartItems.length === 0 || hasOutOfStockItems
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
                disabled={!selectedAddress || !paymentMethod || cartItems.length === 0 || hasOutOfStockItems}
                onClick={handlePlaceOrder}
            >
                {!selectedAddress
                    ? 'Hãy chọn địa chỉ nhận hàng'
                    : !paymentMethod
                        ? 'Hãy chọn phương thức thanh toán'
                        : cartItems.length === 0
                            ? 'Giỏ hàng đang trống'
                            : hasOutOfStockItems
                                ? 'Hãy xóa những sản phẩm đã hết hàng'
                                : 'Thanh toán'}
            </button>

            {/* Return to Cart Link */}
            <p className="text-center text-sm text-gray-600 mt-2">
                Bạn muốn thay đổi mã giảm giá hoặc số lượng sản phẩm?{' '}
                <a href="/cart" className="text-purple-600">Quay trở lại giỏ hàng</a>
            </p>
        </div>
    );
};

export default OrderSummary;