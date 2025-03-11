const express = require('express')
const bodyParser = require('body-parser')
const { productVariantController } = require('../controller')

const ProductVariantRouter = express.Router()
ProductVariantRouter.use(bodyParser.json())

// Lấy danh sách các biến thể của một sản phẩm
ProductVariantRouter.get("/", productVariantController.getProductVariants);

// Tạo mới một biến thể sản phẩm
ProductVariantRouter.post("/create", productVariantController.createProductVariant);

// Cập nhật thông tin một biến thể sản phẩm
ProductVariantRouter.put("/edit/:variantId", productVariantController.updateProductVariant);

// Xóa một biến thể sản phẩm
ProductVariantRouter.delete("/delete/:variantId", productVariantController.deleteProductVariant);

module.exports = ProductVariantRouter