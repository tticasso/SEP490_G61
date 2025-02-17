const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const product_inventories_schema = new Schema({
  inventory_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  product_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  quantity: {
    type: Number
  },
  import_price: {
    type: Number
  },
  code: {
    type: String
  },
  amount: {
    type: Number
  }
});

const product_inventories = mongoose.model('Product_Inventories', product_inventories_schema);

module.exports = product_inventories;