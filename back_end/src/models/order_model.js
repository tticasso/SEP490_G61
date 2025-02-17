const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orders_schema = new Schema({
  customer_id: {
    type: Schema.Types.ObjectId
  },
  shipping_id: {
    type: Schema.Types.ObjectId
  },
  status: {
    type: String
  },
  payment_id: {
    type: Schema.Types.ObjectId
  },
  created_at: {
    type: String
  },
  items: [{
    product_id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    variant_id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    quantity: {
      type: Number
    },
    price: {
      type: Number
    }
  }],
  user_address_order_id: {
    type: Schema.Types.ObjectId
  }
});

const order = mongoose.model('Order', orders_schema);

module.exports = order;