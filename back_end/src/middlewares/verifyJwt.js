const createHttpError = require("http-errors");
const config = require("../config/auth.config");
const db = require("../models");
const { user: User, role: Role } = db;
const jwt = require('jsonwebtoken');

async function verifyToken(req, res, next) {
    try {
        const tokenRequest = req.headers["x-access-token"];
        if (!tokenRequest) {
            throw createHttpError.BadRequest("No token provided");
        }

        // Verify Token
        jwt.verify(tokenRequest, config.secret, (err, decode) => {
            if (err) {
                const message = err instanceof jwt.TokenExpiredError ? "This JWT token expired" : err.message;
                throw createHttpError.Unauthorized(message);
            }
            // Update request
            req.userId = decode.id;
            next();
        });
    } catch (error) {
        next(error);
    }
}

async function isSeller(req, res, next) {
    try {
        const existUser = await User.findById(req.userId).exec();
        if (!existUser) {
            throw createHttpError.Forbidden("User not found");
        }
        const roles = await Role.find({ _id: { $in: existUser.roles } });
        if (!roles) {
            throw createHttpError.Forbidden("Forbidden access");
        }
        if (roles.some(role => role.name === "MOD")) {
            return next(); 
        }
        throw createHttpError.Unauthorized("Require Seller role!");
    } catch (error) {
        next(error);
    }
}

async function isAdmin(req, res, next) {
    try {
        const existUser = await User.findById(req.userId).exec();
        if (!existUser) {
            throw createHttpError.Forbidden("User not found");
        }
        const roles = await Role.find({ _id: { $in: existUser.roles } });
        if (!roles) {
            throw createHttpError.Forbidden("Forbidden access");
        }
        if (roles.some(role => role.name === "ADMIN")) {
            return next(); 
        }
        throw createHttpError.Unauthorized("Require Admin role!");
    } catch (error) {
        next(error);
    }
}

async function isAdminOrSeller(req, res, next) {
    try {
        const existUser = await User.findById(req.userId).exec();
        if (!existUser) {
            throw createHttpError.Forbidden("User not found");
        }
        const roles = await Role.find({ _id: { $in: existUser.roles } });
        if (!roles) {
            throw createHttpError.Forbidden("Forbidden access");
        }
        if (roles.some(role => role.name === "ADMIN") || roles.some(role => role.name === "MOD")) {
            return next(); 
        }
        throw createHttpError.Unauthorized("Require Admin or Seller role!");
    } catch (error) {
        next(error);
    }
}

const VerifyJwt = {
    verifyToken,
    isSeller,
    isAdmin,
    isAdminOrSeller
};

module.exports = VerifyJwt; 