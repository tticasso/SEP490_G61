const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const api_keys_schema = new Schema({
  key: {
    type: String
  },
  status: {
    type: Number
  },
  permission: {
    type: String
  }
});

const Api_keys = mongoose.model('Api_keys', api_keys_schema);

module.exports = Api_keys;