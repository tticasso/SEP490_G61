const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const key_tokens_schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId
  },
  public_key: {
    type: String
  },
  private_key: {
    type: String
  },
  refresh_token: {
    type: String
  }
});

const key_tokens = mongoose.model('Key_Tokens', key_tokens_schema);

module.exports = key_tokens;