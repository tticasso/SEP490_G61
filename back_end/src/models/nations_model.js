const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const nations_schema = new Schema({
  name: {
    type: String
  },
  created_at: {
    type: String
  },
  provinces: [{
    nation_id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String
    },
    created_at: {
      type: String
    }
  }]
});

const nations = mongoose.model('Nations', nations_schema);

module.exports = nations;