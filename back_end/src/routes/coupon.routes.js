const express = require('express');
const bodyParser = require('body-parser');
const { couponController } = require('../controller');
const VerifyJwt = require('../middlewares/verifyJwt');

const couponRouter = express.Router();
couponRouter.use(bodyParser.json());

// Lấy tất cả mã giảm giá (phân trang, lọc) - Admin và Seller
couponRouter.get("/list", [VerifyJwt.verifyToken], couponController.getAllCoupons);

// Lấy mã giảm giá theo ID - Admin và Seller
couponRouter.get("/find/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], couponController.getCouponById);

// Lấy mã giảm giá theo mã - User
couponRouter.get("/code/:code", [VerifyJwt.verifyToken], couponController.getCouponByCode);

// Tạo mã giảm giá mới - Admin và Seller
couponRouter.post("/create", [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], couponController.createCoupon);

// Cập nhật mã giảm giá - Admin và Seller
couponRouter.put("/edit/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], couponController.updateCoupon);

// Xóa mã giảm giá (xóa mềm) - Admin và Seller
couponRouter.delete("/delete/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], couponController.deleteCoupon);

// Kiểm tra tính hợp lệ của mã giảm giá - User
couponRouter.post("/validate", [VerifyJwt.verifyToken], couponController.validateCoupon);

module.exports = couponRouter;