const express = require('express')
const bodyParser = require('body-parser')
const { paymentController } = require('../controller')
const VerifyJwt = require('../middlewares/verifyJwt')

const paymentRouter = express.Router()
paymentRouter.use(bodyParser.json())

// Lấy tất cả phương thức thanh toán
paymentRouter.get("/list", [VerifyJwt.verifyToken], paymentController.getAllPayments)

// Lấy phương thức thanh toán theo ID
paymentRouter.get("/find/:id", [VerifyJwt.verifyToken], paymentController.getPaymentById)

// Tạo phương thức thanh toán mới (chỉ admin có quyền)
paymentRouter.post("/create", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], paymentController.createPayment)

// Cập nhật phương thức thanh toán (chỉ admin có quyền)
paymentRouter.put("/edit/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], paymentController.updatePayment)

// Xóa phương thức thanh toán (chỉ admin có quyền)
paymentRouter.delete("/delete/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], paymentController.deletePayment)

// Kích hoạt/vô hiệu hóa phương thức thanh toán (chỉ admin có quyền)
paymentRouter.put("/toggle-status/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], paymentController.togglePaymentStatus)

module.exports = paymentRouter