const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productReviewSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product', // Tham chiếu đến model Product
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users', // Tham chiếu đến model users
        required: true
    },
    seller_id: {
        type: Schema.Types.ObjectId,
        ref: 'users', // Tham chiếu đến model user (seller)
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String
    },
    // Thêm trường reply để lưu trữ phản hồi của seller
    reply: {
        text: {
            type: String
        },
        created_at: {
            type: Date
        },
        updated_at: {
            type: Date
        }
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

// Tạo index để tối ưu truy vấn
productReviewSchema.index({ product_id: 1, user_id: 1 });
productReviewSchema.index({ seller_id: 1 });

const ProductReview = mongoose.model('ProductReview', productReviewSchema);
module.exports = ProductReview;