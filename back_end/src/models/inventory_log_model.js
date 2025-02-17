const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const inventory_logs_schema = new Schema({
  quantity: {
    type: Number
  },
  created_at: {
    type: String
  },
  note: {
    type: String
  },
  total: {
    type: Number
  },
  shop_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  type: {
    type: String
  }
});

const inventory_logs = mongoose.model('Inventory_Logs', inventory_logs_schema);

module.exports = inventory_logs;