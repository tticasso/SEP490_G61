const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Route đăng ký tài khoản bằng email & password
router.post("/register", authController.register);

// Route đăng nhập bằng email & password
router.post("/login", authController.login);

// Route đăng nhập bằng Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Xử lý Google callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    authController.googleAuthCallback
);
module.exports = router;
