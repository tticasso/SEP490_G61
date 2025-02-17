const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reviews_schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  product_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Number
  },
  comment: {
    type: String
  },
  created_at: {
    type: String
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

const reviews = mongoose.model('Reviews', reviews_schema);

module.exports = reviews;