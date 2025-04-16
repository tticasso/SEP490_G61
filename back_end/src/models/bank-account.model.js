const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bankAccountSchema = new Schema({
    shop_id: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    bank_name: {
        type: String,
        required: true
    },
    account_number: {
        type: String,
        required: true
    },
    account_holder: {
        type: String,
        required: true
    },
    branch: {
        type: String
    },
    is_default: {
        type: Boolean,
        default: false
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

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
module.exports = BankAccount;