const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderDetailSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    order_id: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variant_id: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    discount_id: {
        type: Schema.Types.ObjectId,
        ref: 'Discount'
    },
    cart_id: {
        type: Schema.Types.ObjectId,
        ref: 'Cart'
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

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema);
module.exports = OrderDetail;