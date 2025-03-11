const mongoose = require('mongoose')
const User = require('./user.model')
const Role = require('./role.model')
const Categories = require('./categories.model')
const Brand = require('./brand.model')
const Product = require('./product.model')
const ProductReview = require('./product-review.model')
const Address = require('./user-address.model')
const Cart = require('./cart.model')
const CartItem = require('./cart-items.model')
const Discount = require('./discount.model')
const Order = require('./order.model')
const OrderDetail = require('./order-detail.model')
const Shipping = require('./shipping.model')
const Payment = require('./payment.model')
const ShopOwner = require('./shopowner.model')
const ProductVariant = require('./product-variant.model')
// Cau hinh mongoose dang global
mongoose.Promise = global.Promise
// Dinh nghia doi tuong DB

const db = {}
db.mongoose = mongoose

// Bo sung cac thuoc tinh cho DB
db.user = User
db.role = Role
db.ROLES = ["MEMBER", "SELLER", "ADMIN"]
db.categories = Categories
db.brand = Brand
db.product = Product
db.productReview = ProductReview
db.address = Address
db.cart = Cart
db.cartItem = CartItem
db.discount = Discount
db.order = Order
db.orderDetail = OrderDetail
db.shipping = Shipping
db.payment = Payment
db.shopowner = ShopOwner
db.productvariant = ProductVariant
// Thuoc tinh tham chieu toi action ket noi CSDL
db.connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        dbName: process.env.DB_NAME
    })
        .then(() => console.log("Connect to MongoDB success"))
        .catch(error => {
            console.error(error.message);
            process.exit()
        })
}

module.exports = db