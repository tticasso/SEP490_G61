const bcrypt = require("bcrypt")
const db = require("../models")
const User = db.user
const Role = db.role
const jwt = require('jsonwebtoken')
const createHttpError = require('http-errors')
const config = require("../config/auth.config")
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

async function signUp(req, res, next) {
    try {
        const newUser = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, parseInt(process.env.PASSWORD_KEY)),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone
        })

        if (req.body.roles) {
            // Admin add new User
            const roles = await Role.find({ name: { $in: req.body.roles } }).exec()
            // Update newUser
            newUser.roles = roles.map(r => r._id)
            await User.create(newUser)
                .then(createdUser => res.status(201).json(createdUser))
        } else {
            // Visitor create new user
            const role = await Role.findOne({ name: "MEMBER" }).exec()
            newUser.roles = [role._id]
            await User.create(newUser)
                .then(createdUser => res.status(201).json(createdUser))
        }
    } catch (error) {
        next(error)
    }
}

async function signIn(req, res, next) {
    try {
        if (!req.body.email || !req.body.password)
            throw createHttpError.BadRequest("Email or password is required")
        const existUser = await User.findOne({ email: req.body.email }).populate("roles", '-__v')
        if (!await User.findOne({ email: req.body.email }))
            throw createHttpError.BadRequest(`Email ${req.body.email} not registered`)
        const isMatchPassword = bcrypt.compareSync(req.body.password, existUser.password)
        if (!isMatchPassword)
            throw createHttpError.BadRequest("Password incorrect")
        // Generate AccessToken - using JsonWebToken
        const token = jwt.sign({ id: existUser._id }, config.secret, {
            algorithm: "HS256",
            expiresIn: config.jwtExpiration
        })
        console.log(existUser.roles);

        const authorities = []
        for (let i = 0; i < existUser.roles.length; i++) {
            authorities.push("ROLE_" + existUser.roles[i].name)
        }

        res.status(200).json({
            id: existUser._id,
            email: existUser.email,
            accessToken: token,
            roles: authorities
        })

    } catch (error) {
        next(error)
    }
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
            // Tạo user mới nếu chưa tồn tại
            user = new User({
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                password: bcrypt.hashSync(Math.random().toString(36).slice(-8), 10), // Mật khẩu ngẫu nhiên
            });

            // Gán quyền mặc định
            const role = await Role.findOne({ name: "MEMBER" });
            user.roles = [role._id];

            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

// Controller xử lý đăng nhập bằng Google
function googleAuth(req, res, next) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
}

function googleAuthCallback(req, res, next) {
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err || !user) {
            return res.redirect('/login?error=true');
        }

        // Tạo token JWT
        const token = jwt.sign({ id: user._id }, config.secret, {
            algorithm: "HS256",
            expiresIn: config.jwtExpiration
        });

        res.redirect(`/dashboard?token=${token}`);
    })(req, res, next); 
}


const authController = {
    signUp,
    signIn,
    googleAuth,
    googleAuthCallback
}

module.exports = authController