const AuthRouter = require('./auth.routes')
const UserRouter = require('./user.routes')
const RoleRouter = require('./role.routes')
const CategoriesRouter = require('./categories.routes')
const BrandRouter = require('./brand.routes')
const ProductRouter = require('./product.routes')
const ProductReviewRouter = require('./product-review.routes')
const AddressRouter = require('./user-address.routes')
module.exports = {
    AuthRouter,
    UserRouter,
    RoleRouter,
    CategoriesRouter,
    BrandRouter,
    ProductRouter,
    ProductReviewRouter,
    AddressRouter
}