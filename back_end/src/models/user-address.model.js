// user-address.model.js - Updated model registration
const mongoose = require('mongoose')
const { Schema } = mongoose

const addressSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, "User ID is required"]
    },
    address_line1: {
        type: String,
        required: [true, "Address line 1 is required"]
    },
    address_line2: {
        type: String
    },
    city: {
        type: String
    },
    country: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
    phone: {
        type: String,
        validate: {
            validator: function (v) {
                return /^(84|0[3-9])[0-9]{8,9}$/.test(v); // Hỗ trợ cả số 9 và 10 chữ số
            },
            message: props => `${props.value} is not a valid phone number`
        },
        required: [true, "Phone number is required"]
    }
}, {
    timestamps: true
})

// Change model registration to match the ref in order.model.js
const Address = mongoose.model("Address", addressSchema)
module.exports = Address