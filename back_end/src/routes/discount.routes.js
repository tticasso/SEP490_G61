const express = require('express')
const bodyParser = require('body-parser')
const { discountController } = require('../controller')
const VerifyJwt = require('../middlewares/verifyJwt')

const discountRouter = express.Router()
discountRouter.use(bodyParser.json())

// Lấy tất cả mã giảm giá (chỉ admin có quyền)
discountRouter.get("/list", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], discountController.getAllDiscounts)

// Lấy mã giảm giá theo ID
discountRouter.get("/find/:id", [VerifyJwt.verifyToken], discountController.getDiscountById)

// Lấy mã giảm giá theo code
discountRouter.get("/code/:code", [VerifyJwt.verifyToken], discountController.getDiscountByCode)

// Tạo mã giảm giá mới
discountRouter.post("/create", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], discountController.createDiscount)

// Cập nhật mã giảm giá
discountRouter.put("/edit/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], discountController.updateDiscount)

// Xóa mã giảm giá (xóa mềm)
discountRouter.delete("/delete/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], discountController.deleteDiscount)

// Xóa mã giảm giá vĩnh viễn
discountRouter.delete("/permanent-delete/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], discountController.permanentDeleteDiscount)

// Kích hoạt/vô hiệu hóa mã giảm giá
discountRouter.patch("/toggle-status/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], discountController.toggleDiscountStatus)

// Kiểm tra số lần sử dụng của mã giảm giá
discountRouter.get("/usage/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], discountController.getDiscountUsage)

module.exports = discountRouter