const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    min_order_value: {
        type: Number,
        default: 0
    },
    max_discount_value: {
        type: Number,
        default: null
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_delete: {
        type: Boolean,
        default: false
    },
    max_uses: {
        type: Number,
        default: 0  // 0 means unlimited
    },
    max_uses_per_user: {
        type: Number,
        default: 1
    },
    // Store usage history as a map of user IDs to count
    history: {
        type: Map,
        of: Number,
        default: {}
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    // For product-specific coupons (optional)
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    // For category-specific coupons (optional)
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'Categories',
        default: null
    }
});


const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;