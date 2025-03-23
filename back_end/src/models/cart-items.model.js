const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    cart_id: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    variant_id: {
        type: Schema.Types.ObjectId,
        ref: 'ProductVariant'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    discount_id: {
        type: Schema.Types.ObjectId,
        ref: 'Discount'
    },
    code: {
        type: String,
        maxlength: 100
    }
});

const CartItem = mongoose.model('CartItem', cartItemSchema);
module.exports = CartItem;