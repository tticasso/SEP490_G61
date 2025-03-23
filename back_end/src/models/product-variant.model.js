const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productVariantSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        unique: true,  // This ensures uniqueness
        required: true // Makes the field required
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    // Variant attributes (color, size, etc.)
    attributes: {
        type: Map,
        of: String
    },
    images: [{
        type: String
    }],
    is_default: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
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

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
module.exports = ProductVariant;