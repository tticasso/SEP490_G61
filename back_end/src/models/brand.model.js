const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const brandSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Categories'
    }]
});

const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
