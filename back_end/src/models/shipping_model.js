const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shippings_schema = new Schema({
  name: {
    type: String
  },
  price: {
    type: String
  },
  description: {
    type: String
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  }
});

const shipping = mongoose.model('Shipping', shippings_schema);

module.exports = shipping;