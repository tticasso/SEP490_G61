const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    shipping_id: {
        type: Schema.Types.ObjectId,
        ref: 'Shipping',
        required: true
    },
    payment_id: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    order_payment_id: {
        type: String  // ID thanh toán từ cổng thanh toán
    },
    discount_id: {
        type: Schema.Types.ObjectId,
        ref: 'Discount'
    },
    user_address_id: {
        type: Schema.Types.ObjectId,
        ref: 'addresses',
        required: true
    },
    total_price: {
        type: Number,
        required: true
    },
    status_id: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    order_delivered_at: {
        type: Date
    },
    is_delete: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;