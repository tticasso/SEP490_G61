const express = require('express')
const bodyParser = require('body-parser')
const { productVariantController } = require('../controller')

const ProductVariantRouter = express.Router()
ProductVariantRouter.use(bodyParser.json())

// Lấy danh sách các biến thể của một sản phẩm
ProductVariantRouter.get('/products/:productId/variants', productVariantController.getProductVariants);

// Tạo mới một biến thể sản phẩm
ProductVariantRouter.post('/products/:productId/variants', productVariantController.createProductVariant);

// Cập nhật thông tin một biến thể sản phẩm
ProductVariantRouter.put('/variants/:variantId', productVariantController.updateProductVariant);

// Xóa một biến thể sản phẩm
ProductVariantRouter.delete('/variants/:variantId', productVariantController.deleteProductVariant);

module.exports = ProductVariantRouter