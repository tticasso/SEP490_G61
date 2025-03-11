const express = require('express');
const bodyParser = require('body-parser');
const { shopController } = require('../controller');
const VerifyJwt = require('../middlewares/verifyJwt');

const shopRouter = express.Router();
shopRouter.use(bodyParser.json());

// Lấy tất cả cửa hàng (chỉ admin có quyền)
shopRouter.get("/list", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], shopController.getAllShops);

// Lấy cửa hàng theo ID (chỉ admin có quyền)
shopRouter.get("/find/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], shopController.getShopById);

// Tạo cửa hàng mới (bất kỳ ai có quyền)
shopRouter.post("/create", VerifyJwt.verifyToken, shopController.createShop);

// Cập nhật thông tin cửa hàng (chỉ seller có quyền)
shopRouter.put("/edit/:id", [VerifyJwt.verifyToken, VerifyJwt.isSeller], shopController.updateShop);

// Xóa cửa hàng (chỉ admin có quyền)
shopRouter.delete("/delete/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdmin], shopController.deleteShop);

// Thống kê cửa hàng (cho cả admin và seller)
shopRouter.get("/statistics", [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], shopController.getShopStatistics);

module.exports = shopRouter;