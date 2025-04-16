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
        enum: ['pending', "paid"],
        default: 'pending'
    },
    order_status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    // Trường để đánh dấu cần hoàn tiền
    need_pay_back: {
        type: Boolean,
        default: false
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
    // Chi tiết thanh toán từ PayOS
    payment_details: {
        type: {
            bin: { type: String },                  // Mã ngân hàng (bin)
            accountNumber: { type: String },        // Số tài khoản thanh toán
            accountName: { type: String },          // Tên người thanh toán
            amount: { type: Number },               // Số tiền thanh toán
            description: { type: String },          // Mô tả giao dịch
            orderCode: { type: Number },            // Mã đơn hàng từ PayOS
            currency: { type: String, default: 'VND' }, // Đơn vị tiền tệ
            paymentLinkId: { type: String },        // ID của payment link
            status: { type: String },               // Trạng thái thanh toán
            transactionTime: { type: Date },        // Thời gian giao dịch 
            paymentReference: { type: String },     // Mã tham chiếu thanh toán
            payerName: { type: String },            // Tên người thanh toán (thay thế cho accountName)
            qrCode: { type: String }                // Mã QR thanh toán
        },
        default: {}
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