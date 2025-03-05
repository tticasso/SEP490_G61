const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcrypt')
const e = require('express')
const userSchema = new Schema({
    firstName: {
        type: String,
        require: [true, "First name is required"]
    },
    lastName: {
        type: String,
        require: [true, "Last name is required"]
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
    },
    email: {
        type: String,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
            },
            message: props => `${props.value} is not a valid email`
        },
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        validate: {
            validator: function (v) {
                return /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(v)
            },
            message: props => `${props.value} is supported`
        },
        require: [true, "Password is required"]
    },
    status: {
        type: Boolean,
        default: true
    },
    roles: [{
        type: Schema.Types.ObjectId,
        ref: 'Role'
    }],
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date }
}, {
    timestamps: true
})


const User = mongoose.model("users", userSchema)
module.exports = User