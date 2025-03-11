const express = require('express')
const bodyParser = require('body-parser')
const { shopOwnerController } = require('../controller')

const ShopOwnerRouter = express.Router()
ShopOwnerRouter.use(bodyParser.json())

// Lấy tất cả shop owners
router.get("/", shopOwnerController.getAllShopOwners);

// Lấy thông tin shop owner theo ID
router.get("/:id", shopOwnerController.getShopOwnerById);

// Tạo shop owner mới
router.post("/create", shopOwnerController.createShopOwner);

// Cập nhật thông tin shop owner
router.put("/edit", shopOwnerController.updateShopOwner);

// Xóa shop owner
router.delete("delete/:id", shopOwnerController.deleteShopOwner);

module.exports = ShopOwnerRouter