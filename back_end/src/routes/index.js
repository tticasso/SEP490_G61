const AuthRouter = require('./auth.routes')
const UserRouter = require('./user.routes')
const RoleRouter = require('./role.routes')
const CategoriesRouter = require('./categories.routes')
const BrandRouter = require('./brand.routes')
const ProductRouter = require('./product.routes')
const ProductReviewRouter = require('./product-review.routes')
const AddressRouter = require('./user-address.routes')
const CartRouter = require('./cart.routes')
const DiscountRouter = require('./discount.routes')
const OrderRouter = require('./order.routes')
const ShippingRouter = require('./shipping.routes')
const PaymentRouter = require('./payment.routes')
const ProductVariantRouter = require('./product-variant.routes')
const ShopRouter = require('./shops.routes')
const DocumentRouter = require('./document.routes') // Thêm mới
const ShopFollowRouter = require('./shop-follow.routes')

module.exports = {
    AuthRouter,
    UserRouter,
    RoleRouter,
    CategoriesRouter,
    BrandRouter,
    ProductRouter,
    ProductReviewRouter,
    AddressRouter,
    CartRouter,
    DiscountRouter,
    OrderRouter,
    ShippingRouter,
    PaymentRouter,
    ProductVariantRouter,
    ShopRouter,
    DocumentRouter, // Thêm mới,
    ShopFollowRouter
}