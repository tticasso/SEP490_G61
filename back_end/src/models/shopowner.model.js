const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shopOwnerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  shop_name: {
    type: String,
    required: true
  },
  shop_description: {
    type: String
  },
  shop_address: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true
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
  }
});

const ShopOwner = mongoose.model('ShopOwner', shopOwnerSchema);

module.exports = ShopOwner;
