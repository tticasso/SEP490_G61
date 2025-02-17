const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const coupons_schema = new Schema({
  code: {
    type: String
  },
  description: {
    type: String
  },
  value: {
    type: Number
  },
  type: {
    type: String
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  },
  product: [{
    type: String,
    required: true
  }]
});

const coupon = mongoose.model('Coupon', coupons_schema);

module.exports = coupon;