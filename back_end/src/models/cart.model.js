const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
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

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;