const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const favourites_schema = new Schema({
  user_id: {
    type: String
  },
  created_at: {
    type: String
  },
  updated_at: {
    type: String
  },
  items: [{
    product_id: {
      type: Schema.Types.ObjectId
    },
    created_at: {
      type: String
    }
  }]
});

const favourites = mongoose.model('Favourites', favourites_schema);

module.exports = favourites;