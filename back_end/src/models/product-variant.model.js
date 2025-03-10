const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productVariantSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      sku: {
        type: String,
        required: true,
        unique: true
      },
      color: {
        type: String,
        required: true
      },
      size: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
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
      }
});

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
module.exports = ProductVariant;