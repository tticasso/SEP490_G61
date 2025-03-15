const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    category_id: [{
        type: Schema.Types.ObjectId,
        ref: 'Categories', // Đảm bảo có model Category
        required: true
    }],
    brand_id: {
        type: Schema.Types.ObjectId,
        ref: 'Brand', // Đảm bảo có model Brand
        required: true
    },
    shop_id: {
        type: Schema.Types.ObjectId,
        ref: 'Shop', // Tham chiếu đến model Shop
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    detail: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String // Có thể lưu URL ảnh sản phẩm
    },
    rating: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    meta_title: {
        type: String,
        required: true
    },
    meta_keyword: {
        type: String,
        required: true
    },
    meta_description: {
        type: String,
        required: true
    },
    weight: {
        type: Number
    },
    condition: {
        type: String
    },
    sold: {
        type: Number,
        default: 0
    },
    is_hot: {
        type: Boolean,
        default: false
    },
    is_feature: {
        type: Boolean,
        default: false
    },
    is_delete: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
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
        ref: 'users' // Giả sử người tạo là User
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
