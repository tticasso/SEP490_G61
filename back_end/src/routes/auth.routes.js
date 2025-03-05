const express = require('express')
const bodyParser = require('body-parser')
const { authController } = require('../controller')
const VerifySignUp = require('../middlewares/verifySignUp')

const AuthRouter = express.Router()
AuthRouter.use(bodyParser.json())

AuthRouter.post("/signup", [VerifySignUp.checkExistUser, VerifySignUp.checkExistRoles] ,authController.signUp)
AuthRouter.post("/signin", authController.signIn)
AuthRouter.get('/google', authController.googleAuth);
AuthRouter.get('/google/callback', authController.googleAuthCallback);
module.exports = AuthRouter