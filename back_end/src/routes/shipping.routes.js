const express = require('express')
const bodyParser = require('body-parser')
const { shippingController } = require('../controller')
const VerifyJwt = require('../middlewares/verifyJwt')

const shippingRouter = express.Router()
shippingRouter.use(bodyParser.json())

// Lấy tất cả phương thức vận chuyển
shippingRouter.get("/list", [VerifyJwt.verifyToken], shippingController.getAllShippings)

// Lấy phương thức vận chuyển theo ID
shippingRouter.get("/find/:id", [VerifyJwt.verifyToken], shippingController.getShippingById)

// Lấy phương thức vận chuyển theo user ID
shippingRouter.get("/user/:userId", [VerifyJwt.verifyToken], shippingController.getShippingByUserId)

// Tạo phương thức vận chuyển mới
shippingRouter.post("/create", [VerifyJwt.verifyToken], shippingController.createShipping)

// Cập nhật phương thức vận chuyển
shippingRouter.put("/edit/:id", [VerifyJwt.verifyToken], shippingController.updateShipping)

// Xóa phương thức vận chuyển
shippingRouter.delete("/delete/:id", [VerifyJwt.verifyToken], shippingController.deleteShipping)

module.exports = shippingRouter