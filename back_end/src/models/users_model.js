const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const users_schema = new Schema({
  role_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String
  },
  phone: {
    type: Number
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  created_at: {
    type: String
  },
  addresses: [{
    address_line1: {
      type: String
    },
    address_line2: {
      type: String
    },
    city: {
      type: String
    },
    country: {
      type: String
    }
  }]
});

const users = mongoose.model('Users', users_schema);

module.exports = users;