const express = require('express');
const bodyParser = require('body-parser');
const shopOwnerController  = require('../controller/shopowner.controller');
const VerifyJwt = require('../middlewares/verifyJwt');

const ShopOwnerRouter = express.Router()
ShopOwnerRouter.use(bodyParser.json())

// Lấy tất cả shop owners (chỉ admin có quyền)
ShopOwnerRouter.get("/", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], shopOwnerController.getAllShopOwners);

// Lấy thông tin shop owner theo ID (chỉ admin có quyền)
ShopOwnerRouter.get("/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], shopOwnerController.getShopOwnerById);

// Tạo shop owner mới (bất kỳ ai có quyền)
ShopOwnerRouter.post("/create", [VerifyJwt.verifyToken], shopOwnerController.createShopOwner);

// Cập nhật thông tin shop owner (chỉ seller có quyền)
ShopOwnerRouter.put("/edit", [VerifyJwt.verifyToken, VerifyJwt.isSeller], shopOwnerController.updateShopOwner);

// Xóa shop owner (chỉ admin có quyền)
ShopOwnerRouter.delete("/delete/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], shopOwnerController.deleteShopOwner);

module.exports = ShopOwnerRouter
