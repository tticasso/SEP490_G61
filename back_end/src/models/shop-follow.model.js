const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shopFollowSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    shop_id: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure a user can only follow a shop once
shopFollowSchema.index({ user_id: 1, shop_id: 1 }, { unique: true });

const ShopFollow = mongoose.model('ShopFollow', shopFollowSchema);
module.exports = ShopFollow;