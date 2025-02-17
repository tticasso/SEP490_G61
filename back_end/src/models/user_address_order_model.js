const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const user_address_orders_schema = new Schema({
  province_id: {
    type: Schema.Types.ObjectId
  },
  nation_id: {
    type: Schema.Types.ObjectId
  },
  address_detail: {
    type: String
  },
  user_id: {
    type: Schema.Types.ObjectId
  },
  name: {
    type: String
  },
  phone: {
    type: String
  },
  is_default: {
    type: Boolean
  }
});

const user_address_order = mongoose.model('UserAddressOrder', user_address_orders_schema);

module.exports = user_address_order;