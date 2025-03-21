const express = require('express');
const bodyParser = require('body-parser');
const { productAttributeController } = require('../controller');
const VerifyJwt = require('../middlewares/verifyJwt');

const ProductAttributeRouter = express.Router();
ProductAttributeRouter.use(bodyParser.json());

// Lấy tất cả thuộc tính
ProductAttributeRouter.get("/", productAttributeController.getAllAttributes);

// Lấy thuộc tính theo ID
ProductAttributeRouter.get("/:id", productAttributeController.getAttributeById);

// Chỉ admin mới có quyền thêm/sửa/xóa thuộc tính sản phẩm
ProductAttributeRouter.post("/create", [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], productAttributeController.createAttribute);
ProductAttributeRouter.put("/edit/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], productAttributeController.updateAttribute);
ProductAttributeRouter.delete("/delete/:id", [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], productAttributeController.deleteAttribute);

// Thêm/xóa giá trị thuộc tính
ProductAttributeRouter.post("/:id/value", [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], productAttributeController.addAttributeValue);
ProductAttributeRouter.delete("/:id/value/:value", [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], productAttributeController.removeAttributeValue);

module.exports = ProductAttributeRouter;