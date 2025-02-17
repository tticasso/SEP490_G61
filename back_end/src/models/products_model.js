const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const products_schema = new Schema({
  category_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  brand_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  detail: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  rating: {
    type: Number
  },
  price: {
    type: Number,
    required: true
  },
  weight: {
    type: Number
  },
  condition: {
    type: String,
    required: true
  },
  sold: {
    type: Number
  },
  created_at: {
    type: String
  },
  updatedAt: {
    type: String
  },
  variant: [{
    name: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    variant_values: [{
      variant_id: {
        type: Schema.Types.ObjectId,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }]
  }],
  image_path: {
    type: String
  },
  promotion: [{
    name: {
      type: String
    },
    start_date: {
      type: Date
    },
    end_date: {
      type: Date
    },
    price_sale: {
      type: Number
    },
    type_price: {
      type: String
    },
    is_active: {
      type: Boolean
    },
    status: {
      type: String
    }
  }],
  discount_id: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

const product = mongoose.model('Product', products_schema);

module.exports = product;