const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productAttributeSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    display_name: {
        type: String,
        required: true,
        trim: true
    },
    values: [{
        value: {
            type: String,
            required: true,
            trim: true
        },
        display_value: {
            type: String,
            required: true,
            trim: true
        }
    }],
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

// Ensure uniqueness of attribute names
productAttributeSchema.index({ name: 1 }, { unique: true });

const ProductAttribute = mongoose.model('ProductAttribute', productAttributeSchema);
module.exports = ProductAttribute;