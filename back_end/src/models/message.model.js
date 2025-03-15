const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    conversation_id: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    is_read: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;