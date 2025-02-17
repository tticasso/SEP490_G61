const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const carts_schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  },
  items: [{
    product_id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    quantity: {
      type: Number
    },
    discount_id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    code: {
      type: String
    }
  }]
});

const carts = mongoose.model('Carts', carts_schema);

module.exports = carts;