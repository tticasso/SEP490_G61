// Update the OrderTotals component
import React from 'react';
import { X } from 'lucide-react';

/**
 * OrderTotals Component
 * 
 * Displays the price breakdown for the order including
 * subtotal, discount, shipping cost, and total.
 * Also shows applied coupon information.
 * 
 * @param {number} subtotal - Cart subtotal (properly calculated with variants)
 * @param {number} discount - Discount amount
 * @param {number} shippingCost - Shipping cost
 * @param {Object} appliedCoupon - Applied coupon information
 * @param {Function} onRemoveCoupon - Function to call when removing coupon
 * @param {number} total - Total order amount
 */
const OrderTotals = ({
    subtotal,
    discount,
    shippingCost,
    appliedCoupon,
    onRemoveCoupon,
    total
}) => {
    const renderCouponDetails = () => {
        if (!appliedCoupon) return null;
        
        let couponDescription = '';
        
        if (appliedCoupon.type === 'percentage') {
            couponDescription = `${appliedCoupon.value}% off`;
            if (appliedCoupon.max_discount_value) {
                couponDescription += ` (max ${appliedCoupon.max_discount_value.toLocaleString()}đ)`;
            }
        } else if (appliedCoupon.type === 'fixed') {
            couponDescription = `${appliedCoupon.value.toLocaleString()}đ off`;
        }
        
        return (
            <div className="ml-2 bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs flex items-center">
                <span className="mr-1" title={couponDescription}>{appliedCoupon.code}</span>
                <button 
                    onClick={onRemoveCoupon}
                    className="hover:text-red-500"
                    aria-label="Remove coupon"
                >
                    <X size={14} />
                </button>
            </div>
        );
    };
    
    return (
        <div>
            {/* Divider */}
            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
            
            {/* Order Subtotal */}
            <div className="flex justify-between mt-4">
                <span>Tổng giá tiền các sản phẩm</span>
                <span>{subtotal.toLocaleString()}đ</span>
            </div>
            
            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
            
            {/* Coupon Discount */}
            <div className="flex justify-between mt-4">
                <div className="flex items-center">
                    <span>Mã Giảm giá đã áp dụng</span>
                    {renderCouponDetails()}
                </div>
                <span className="text-red-500">-{discount.toLocaleString()}đ</span>
            </div>
            
            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
            
            {/* Shipping Cost */}
            <div className="flex justify-between mt-4">
                <span>Phí vận chuyển</span>
                <span>
                    {shippingCost.toLocaleString()}đ
                </span>
            </div>
            
            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
            
            {/* Order Total */}
            <div className="flex justify-between font-bold text-lg pt-2">
                <span>Tổng thanh toán</span>
                <span className="text-purple-600">{total.toLocaleString()}đ</span>
            </div>
        </div>
    );
};

export default OrderTotals;