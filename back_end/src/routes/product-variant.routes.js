const express = require('express');
const bodyParser = require('body-parser');
const { productVariantController } = require('../controller');
const { VerifyJwt } = require('../middleware/VerifyJwt');

const ProductVariantRouter = express.Router();
ProductVariantRouter.use(bodyParser.json());

// Lấy danh sách các biến thể của một sản phẩm (chỉ người bán hàng có quyền)
ProductVariantRouter.get("/", [VerifyJwt.verifyToken, VerifyJwt.isSeller], productVariantController.getProductVariants);

// Tạo mới một biến thể sản phẩm (chỉ người bán hàng có quyền)
ProductVariantRouter.post("/create", [VerifyJwt.verifyToken, VerifyJwt.isSeller], productVariantController.createProductVariant);

// Cập nhật thông tin một biến thể sản phẩm (chỉ người bán hàng có quyền)
ProductVariantRouter.put("/edit/:variantId", [VerifyJwt.verifyToken, VerifyJwt.isSeller], productVariantController.updateProductVariant);

// Xóa một biến thể sản phẩm (chỉ người bán hàng có quyền)
ProductVariantRouter.delete("/delete/:variantId", [VerifyJwt.verifyToken, VerifyJwt.isSeller], productVariantController.deleteProductVariant);

module.exports = ProductVariantRouter;