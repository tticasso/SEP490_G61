const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    shop_id: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    last_message: {
        type: String,
        default: ''
    },
    last_message_time: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;