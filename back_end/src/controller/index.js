const authController = require('./auth.controller')
const userController = require('./user.controller')
const roleController = require('./role.controller')
const categoriesController = require('./categories.controller')
const brandController = require('./brand.controller')
const productController = require('./product.controller')
const productReviewController = require('./product-review.controller')
const addressController = require('./user-address.controller')
const cartController = require('./cart.controller')
const discountController = require('./discount.controller')
const orderController = require('./order.controller')
const shippingController = require('./shipping.controller')
const paymentController = require('./payment.controller')
const productVariantController = require('./product-variant.controller')
const shopController = require('./shops.controller')

module.exports = {
    authController,
    userController,
    roleController,
    categoriesController,
    brandController,
    productController,
    productReviewController,
    addressController,
    cartController,
    discountController,
    orderController,
    shippingController,
    paymentController,
    productVariantController,
    shopController
}