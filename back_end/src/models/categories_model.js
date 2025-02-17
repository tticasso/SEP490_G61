const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const categories_schema = new Schema({
  name: {
    type: String
  },
  thumbnail: {
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

const category = mongoose.model('Category', categories_schema);

module.exports = category;