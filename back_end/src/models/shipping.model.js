const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shippingSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        maxlength: 255
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
        ref: 'User'
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    estimate_time: {
        type: Number,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
});

const Shipping = mongoose.model('Shipping', shippingSchema);
module.exports = Shipping;