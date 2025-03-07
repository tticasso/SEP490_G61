const authController = require('./auth.controller')
const userController = require('./user.controller')
const roleController = require('./role.controller')
const categoriesController = require('./categories.controller')
const brandController = require('./brand.controller')
const productController = require('./product.controller')
const productReviewController = require('./product-review.controller')
module.exports = {
    authController,
    userController,
    roleController,
    categoriesController,
    brandController,
    productController,
    productReviewController
}