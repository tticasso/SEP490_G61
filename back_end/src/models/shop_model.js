const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shops_schema = new Schema({
    name: {
        type: String
    },
    username: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    CCCD: {
        type: String
    },
    logo: {
        type: String
    },
    status: {
        type: String
    },
    rating: {
        type: Number
    },
    nation_id: {
        type: Schema.Types.ObjectId
    },
    province_id: {
        type: Schema.Types.ObjectId
    },
    address: {
        type: String
    },
    response_time: {
        type: String
    },
    created_at: {
        type: String
    },
    is_active: {
        type: Boolean
    },
    follower: {
        type: Number
    },
    user_id: {
        type: Schema.Types.ObjectId
    },
    description: {
        type: String
    },
    image_cover: {
        type: String
    }
});

const shop = mongoose.model('Shop', shops_schema);

module.exports = shop;