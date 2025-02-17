const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roles_schema = new Schema({
  name: {
    type: String
  },
  permissions: {
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

const roles_model = mongoose.model('roles', roles_schema);

module.exports = roles_model;