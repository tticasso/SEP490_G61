const createHttpError = require("http-errors")
const config = require("../config/auth.config")
const db = require("../models")
const { user: User, role: Role } = db
const jwt = require('jsonwebtoken')

async function verifyToken(req, res, next) {
    try {
        const tokenRequest = req.headers["x-access-token"]
        if (!tokenRequest)
            throw createHttpError.BadRequest("No token provided")
        // Verify Token
        jwt.verify(tokenRequest, config.secret, (err, decode) => {
            if (err) {
                const message = err instanceof TokenExpiredError ? "This JWT token expried" : err.message
                throw createHttpError.Unauthorized
            }
            //Update request
            req.userId = decode.id
            next()
        })
    } catch (error) {
        next(error)
    }
}

async function isSeller(req, res, next) {
    try {
        const existUser = await User.findById({ id: req.userId }).exec()
        if (!existUser)
            throw createHttpError.Forbidden("User not found")
        const roles = await Role.find({ _id: { $in: existUser.roles } })
        if (!roles)
            throw createHttpError.Forbidden("Forbidden access")
        for (let i = 0; i < existUser.roles.length; i++) {
            if (roles[i].name == "MOD")
                next()
        }
        throw createHttpError.Unauthorized("Require Seller role!")
    } catch (error) {
        next(error)
    }
}

async function isAdmin(req, res, next) {
    try {
        const existUser = await User.findById({ id: req.userId }).exec()
        if (!existUser)
            throw createHttpError.Forbidden("User not found")
        const roles = await Role.find({ _id: { $in: existUser.roles } })
        if (!roles)
            throw createHttpError.Forbidden("Forbidden access")
        for (let i = 0; i < existUser.roles.length; i++) {
            if (roles[i].name == "ADMIN")
                next()
        }
        throw createHttpError.Unauthorized("Require Admin role!")
    } catch (error) {
        next(error)
    }
}

const VerifyJwt = {
    verifyToken,
    isSeller,
    isAdmin
}

module.exports = VerifyJwt