const express = require('express');
const bodyParser = require('body-parser');
const { couponController } = require('../controller');
const VerifyJwt = require('../middlewares/verifyJwt');

const couponRouter = express.Router();
couponRouter.use(bodyParser.json());

// Lấy tất cả mã giảm giá (phân trang, lọc) - Admin
couponRouter.get("/list", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], couponController.getAllCoupons);

// Lấy mã giảm giá theo ID - Admin
couponRouter.get("/find/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], couponController.getCouponById);

// Lấy mã giảm giá theo mã - User
couponRouter.get("/code/:code", [VerifyJwt.verifyToken], couponController.getCouponByCode);

// Tạo mã giảm giá mới - Admin
couponRouter.post("/create", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], couponController.createCoupon);

// Cập nhật mã giảm giá - Admin
couponRouter.put("/edit/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], couponController.updateCoupon);

// Xóa mã giảm giá (xóa mềm) - Admin
couponRouter.delete("/delete/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], couponController.deleteCoupon);

// Kiểm tra tính hợp lệ của mã giảm giá - User
couponRouter.post("/validate", [VerifyJwt.verifyToken], couponController.validateCoupon);

module.exports = couponRouter;