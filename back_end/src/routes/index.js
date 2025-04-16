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
const CouponRouter = require('./coupon.routes') // Add coupon routes
const OrderRouter = require('./order.routes')
const ShippingRouter = require('./shipping.routes')
const PaymentRouter = require('./payment.routes')
const ShopRouter = require('./shops.routes')
const DocumentRouter = require('./document.routes')
const ShopFollowRouter = require('./shop-follow.routes')
const ConversationRouter = require('./conversation.routes')
const UserStatusRouter = require('./user-status.routes')
const ProductVariantRouter = require('./product-variant.routes');
const ProductAttributeRouter = require('./product-attribute.routes');
const GeminiRouter = require('./gemini.routes');
const BankAccountRouter = require('./bank-account.routes')
const PayOsRouter = require('./payos.routes')
const ShopRevenueRouter = require('./shop-revenue.routes');
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
    CouponRouter, // Add coupon routes to exports
    OrderRouter,
    ShippingRouter,
    PaymentRouter,
    ShopRouter,
    DocumentRouter,
    ShopFollowRouter,
    ConversationRouter,
    UserStatusRouter,
    ProductVariantRouter,
    ProductAttributeRouter,
    GeminiRouter,
    PayOsRouter ,
    ShopRevenueRouter,
    BankAccountRouter
}
