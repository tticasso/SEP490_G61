const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const discounts_schema = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  type_price: {
    type: String
  },
  type: {
    type: String
  },
  value: {
    type: String
  },
  code: {
    type: String
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  max_uses: {
    type: Number
  },
  uses_count: {
    type: Number
  },
  max_uses_per_user: {
    type: Number
  },
  history: {
    type: String
  },
  min_order_value: {
    type: Number
  },
  shop_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  is_active: {
    type: Boolean
  },
  applies_to: {
    type: String
  },
  status: {
    type: String
  },
  products: [{
    type: Schema.Types.ObjectId
  }] /* products have this discount */
});

const discounts = mongoose.model('Discounts', discounts_schema);

module.exports = discounts;