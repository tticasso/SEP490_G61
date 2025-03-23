import React from 'react';
import { X } from 'lucide-react';
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
                <div className="text-center p-4 text-gray-500 mb-4">Cart is empty</div>
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
                    !selectedAddress || !paymentMethod || cartItems.length === 0
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
                disabled={!selectedAddress || !paymentMethod || cartItems.length === 0}
                onClick={handlePlaceOrder}
            >
                {!selectedAddress
                    ? 'Please select a delivery address'
                    : !paymentMethod
                        ? 'Please select a payment method'
                        : cartItems.length === 0
                            ? 'Cart is empty'
                            : 'Checkout'}
            </button>

            {/* Return to Cart Link */}
            <p className="text-center text-sm text-gray-600 mt-2">
                Want to use a coupon or change product quantities?{' '}
                <a href="/cart" className="text-purple-600">Return to cart</a>
            </p>
        </div>
    );
};

export default OrderSummary;