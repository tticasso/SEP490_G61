const db = require("../models")
const User = db.user

async function create(req, res, next){
    try {
        const newUser = new User({
            email: req.body.email,
            password: req.body.password,
            type: req.body.type,
            roles: req.body.roles
        })

        // Save into DB
        await newUser.save()
            .then(newDoc => res.status(201).json(newDoc))
            .catch(error => next(error))        
    } catch (error) {
        next(error)
    }
}

async function accessAll(req, res, next){
    res.send("All users access")
}

async function accessByMember(req, res, next){
    res.send("Member access")
}

async function accessBySeller(req, res, next){
    res.send("Seller access")
}

async function accessByAdmin(req, res, next){
    res.send("Admin access")
}
async function getAllUser(req, res, next){
    try {
        await User.find()
            .then(allDoc => res.status(200).json(allDoc))
            .catch(error => next(error))
    } catch (error) {
        next(error)
    }
}

async function update(req, res, next){
    try {
        const {id} = req.params
        const updateUser = {
            email: req.body.email,
            password: req.body.password,
            type: req.body.type,
            classes: []
        }
        await User.findByIdAndUpdate(
            id,
            {$set: updateUser},
            {new: true}
        )
            .then(updateDoc => res.status(200).json(updateDoc))
            .catch(error => next(error))
    } catch (error) {
        next(error)
    }
}

async function deleteUser(req, res, next){
    try {
        const {id} = req.params
        await User.findByIdAndDelete(id)
            .then(deleteDoc => res.status(200).json({
                "message": "Delete successful",
                deleteDoc
            }))
            .catch(error => next(error))
    } catch (error) {
        next(error)
    }
}

async function existedUser(req, res, next){
    try {
        const {email} = req.params
        await User.findOne({email: email})
            .then(exitsDoc => res.status(200).json(exitsDoc))
            .catch(error => next(error))
    } catch (error) {
        next(error)
    }
}
const userController = {
    create,
    getAllUser,
    update,
    deleteUser,
    existedUser,
    accessAll,
    accessByMember,
    accessByAdmin,
    accessBySeller
}

module.exports = userController
