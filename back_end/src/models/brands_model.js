const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const brands_schema = new Schema({
  name: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  },
  category_id: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

const brand = mongoose.model('Brand', brands_schema);

module.exports = brand;