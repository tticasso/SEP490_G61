const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discountSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 255
    },
    description: {
        type: String,
        maxlength: 255
    },
    type_price: {
        type: String,
        required: true,
        enum: ['fixed', 'percentage'],
        default: 'percentage'
    },
    type: {
        type: String,
        required: true,
        maxlength: 100
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    code: {
        type: String,
        required: true,
        maxlength: 10,
        unique: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    max_uses: {
        type: Number,
        default: 0
    },
    max_uses_per_user: {
        type: Number,
        default: 0
    },
    history: {
        type: Schema.Types.Mixed,
        default: {}
    },
    min_order_value: {
        type: Number,
        default: 0
    },
    shop_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    is_active: {
        type: Boolean,
        default: true
    },
    applies_to: {
        type: String,
        maxlength: 50
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    is_delete: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        maxlength: 50
    }
});

const Discount = mongoose.model('Discount', discountSchema);
module.exports = Discount;