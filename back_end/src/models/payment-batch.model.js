// src/models/payment-batch.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentBatchSchema = new Schema({
    batch_id: {
        type: String,
        required: true,
        unique: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    total_shops: {
        type: Number,
        default: 0
    },
    total_amount: {
        type: Number,
        default: 0
    },
    processed_count: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    processed_at: {
        type: Date,
        default: null
    },
    notes: {
        type: String
    }
});

const PaymentBatch = mongoose.model('PaymentBatch', paymentBatchSchema);
module.exports = PaymentBatch;