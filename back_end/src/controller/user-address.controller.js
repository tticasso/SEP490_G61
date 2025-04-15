const db = require("../models")
const Address = db.address
const User = db.user
const mongoose = require("mongoose")

// Updated to handle international phone numbers
function formatPhoneNumber(phone) {
    if (!phone) return phone;
    
    // Remove any non-digit characters (like +, spaces, or dashes)
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Handle Vietnamese numbers specifically (local format starting with 0)
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 10 && cleanPhone.length <= 11) {
        return '84' + cleanPhone.substring(1);
    }
    
    // For all other numbers, ensure they start with a valid country code
    // If phone doesn't start with a valid country code digit (1-9), default to Vietnam country code
    if (!/^[1-9]/.test(cleanPhone)) {
        return '84' + cleanPhone;
    }
    
    return cleanPhone;
}

async function create(req, res, next) {
    try {
        const { user_id, address_line1, address_line2, city, country, phone } = req.body

        // Debug - kiểm tra db.address có tồn tại không
        console.log("Address model:", typeof Address);
        if (!Address) {
            return res.status(500).json({ success: false, message: 'Address model not defined' });
        }

        // Validate if user exists
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' })
        }

        const userExists = await User.findById(user_id)
        if (!userExists) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // Create new address
        const newAddress = new Address({
            user_id,
            address_line1,
            address_line2,
            city,
            country,
            phone: formatPhoneNumber(phone),
        })

        await newAddress.save()
            .then(newDoc => res.status(201).json(newDoc))
            .catch(error => next(error))
    } catch (error) {
        next(error)
    }
}

async function getAllAddresses(req, res, next) {
    try {
        await Address.find()
            .populate('user_id', 'firstName lastName email')
            .then(allDoc => res.status(200).json(allDoc))
            .catch(error => next(error))
    } catch (error) {
        next(error)
    }
}

async function getUserAddresses(req, res, next) {
    try {
        const { userId } = req.params

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' })
        }

        await Address.find({ user_id: userId })
            .then(addresses => {
                if (!addresses.length) {
                    return res.status(404).json({ success: false, message: 'No addresses found for this user' })
                }
                res.status(200).json(addresses)
            })
            .catch(error => next(error))
    } catch (error) {
        next(error)
    }
}

async function getAddressById(req, res, next) {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid address ID format' })
        }

        await Address.findById(id)
            .populate('user_id', 'firstName lastName email')
            .then(address => {
                if (!address) {
                    return res.status(404).json({ success: false, message: 'Address not found' })
                }
                res.status(200).json(address)
            })
            .catch(error => next(error))
    } catch (error) {
        next(error)
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params
        const { address_line1, address_line2, city, country, status, phone } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid address ID format' })
        }

        const updateAddress = {
            ...(address_line1 !== undefined && { address_line1 }),
            ...(address_line2 !== undefined && { address_line2 }),
            ...(city !== undefined && { city }),
            ...(country !== undefined && { country }),
            ...(status !== undefined && { status }),
            ...(phone !== undefined && { phone: formatPhoneNumber(phone) })
        }

        await Address.findByIdAndUpdate(
            id,
            { $set: updateAddress },
            { new: true, runValidators: true }
        )
            .then(updateDoc => {
                if (!updateDoc) {
                    return res.status(404).json({ success: false, message: 'Address not found' })
                }
                res.status(200).json(updateDoc)
            })
            .catch(error => next(error))
    } catch (error) {
        next(error)
    }
}

async function deleteAddress(req, res, next) {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid address ID format' })
        }

        await Address.findByIdAndDelete(id)
            .then(deleteDoc => {
                if (!deleteDoc) {
                    return res.status(404).json({ success: false, message: 'Address not found' })
                }
                res.status(200).json({
                    "message": "Delete successful",
                    deleteDoc
                })
            })
            .catch(error => next(error))
    } catch (error) {
        next(error)
    }
}

const addressController = {
    create,
    getAllAddresses,
    getUserAddresses,
    getAddressById,
    update,
    deleteAddress
}

module.exports = addressController