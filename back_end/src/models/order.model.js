const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    id: {
        type: String,
        default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    },
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    shipping_id: {
        type: Schema.Types.ObjectId,
        ref: 'Shipping'
    },
    payment_id: {
        type: Schema.Types.ObjectId,
        ref: 'Payment'
    },
    // ID của giao dịch thanh toán (từ bên thứ 3)
    order_payment_id: {
        type: String
    },
    status_id: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    // Giá gốc trước khi áp dụng giảm giá
    original_price: {
        type: Number,
        required: true,
        default: 0
    },
    // Giá cuối cùng sau khi áp dụng giảm giá
    total_price: {
        type: Number,
        required: true,
        default: 0
    },
    // Mã giảm giá (discount)
    discount_id: {
        type: Schema.Types.ObjectId,
        ref: 'Discount'
    },
    // Số tiền giảm từ discount
    discount_amount: {
        type: Number,
        default: 0
    },
    // Mã coupon
    coupon_id: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    // Số tiền giảm từ coupon
    coupon_amount: {
        type: Number,
        default: 0
    },
    // Địa chỉ giao hàng
    user_address_id: {
        type: Schema.Types.ObjectId,
        ref: 'Address'
    },
    // Phương thức thanh toán (text)
    payment_method: {
        type: String
    },
    // Thời gian tạo đơn hàng
    created_at: {
        type: Date,
        default: Date.now
    },
    // Thời gian cập nhật đơn hàng
    updated_at: {
        type: Date,
        default: Date.now
    },
    // Thời gian đã giao hàng
    order_delivered_at: {
        type: Date
    },
    // Cờ xóa (xóa mềm)
    is_delete: {
        type: Boolean,
        default: false
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;