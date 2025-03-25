// src/models/shop-revenue.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shopRevenueSchema = new Schema({
    shop_id: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    order_id: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true // Each order should only create one revenue record
    },
    total_amount: {
        type: Number,
        required: true,
        min: 0
    },
    commission_rate: {
        type: Number,
        required: true,
        default: 0.1, // 10% commission
        min: 0,
        max: 1
    },
    commission_amount: {
        type: Number,
        required: true,
        min: 0
    },
    shop_earning: {
        type: Number,
        required: true,
        min: 0
    },
    is_paid: {
        type: Boolean,
        default: false
    },
    payment_date: {
        type: Date,
        default: null
    },
    payment_id: {
        type: String,
        default: null
    },
    payment_batch: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    transaction_date: {
        type: Date,
        required: true
    }
});

// Index for efficient queries by shop and date
shopRevenueSchema.index({ shop_id: 1, transaction_date: 1 });
shopRevenueSchema.index({ is_paid: 1, shop_id: 1 });
shopRevenueSchema.index({ payment_batch: 1 });

const ShopRevenue = mongoose.model('ShopRevenue', shopRevenueSchema);
module.exports = ShopRevenue;