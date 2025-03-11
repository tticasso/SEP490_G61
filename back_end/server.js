const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const httpErrors = require('http-errors');
const db = require('./src/models');
require('dotenv').config();
const { AuthRouter, 
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
    ShopOwnerRouter
} = require('./src/routes');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

// Khởi tạo Express trước khi dùng app.use()
const app = express();

// Cấu hình session và passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
    origin: 'http://localhost:3000', // Thay đổi thành domain frontend của bạn
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));
// Bổ sung middleware kiểm soát hoạt động của Web server
app.use(bodyParser.json());
app.use(morgan("dev"));

// Định tuyến cho root router
app.get("/", (req, res, next) => {
    res.status(200).json({
        message: "Welcome to RESTFul API - NodeJS"
    });
});
app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);
app.use('/api/role', RoleRouter);
app.use('/api/categories', CategoriesRouter);
app.use('/api/brand', BrandRouter);
app.use('/api/product', ProductRouter);
app.use('/api/product-review', ProductReviewRouter);
app.use('/api/address', AddressRouter);
app.use('/api/cart', CartRouter);
app.use('/api/discount', DiscountRouter);
app.use('/api/order', OrderRouter);
app.use('/api/shipping', ShippingRouter);
app.use('/api/payment', PaymentRouter);
app.use('/api/product-variant',ProductVariantRouter);
app.use('/api/seller',ShopOwnerRouter);
// Kiểm soát các lỗi trong Express web server
app.use(async (req, res, next) => {
    next(httpErrors.NotFound());
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        "error": {
            "status": err.status || 500,
            "message": err.message
        }
    });
});

// Lắng nghe request từ client
app.listen(process.env.PORT || 9999, process.env.HOST_NAME || 'localhost', () => {
    console.log(`Server is running at: http://${process.env.HOST_NAME || 'localhost'}:${process.env.PORT || 9999}`);
    db.connectDB();
});
