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

// Export trực tiếp model như cách làm với User
const Address = mongoose.model("addresses", addressSchema)
module.exports = Address