const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const payments_schema = new Schema({
  name: {
    type: String
  },
  created_at: {
    type: String
  }
});

const payment = mongoose.model('Payment', payments_schema);

module.exports = payment;