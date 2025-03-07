const express = require('express')
const bodyParser = require('body-parser')
const { addressController } = require('../controller')
const VerifyJwt = require('../middlewares/verifyJwt')

const AddressRouter = express.Router()
AddressRouter.use(bodyParser.json())

// Tạo địa chỉ mới
AddressRouter.post("/create", addressController.create)

// Lấy tất cả địa chỉ
AddressRouter.get("/list", addressController.getAllAddresses)

// Lấy tất cả địa chỉ của một user cụ thể
AddressRouter.get("/user/:userId", addressController.getUserAddresses)

// Lấy địa chỉ theo ID
AddressRouter.get("/find/:id", addressController.getAddressById)

// Cập nhật địa chỉ
AddressRouter.put("/edit/:id", addressController.update)

// Xóa địa chỉ
AddressRouter.delete("/delete/:id", addressController.deleteAddress)

module.exports = AddressRouter