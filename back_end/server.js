const express = require("express");
const DBconnect = require("./src/config/db_config");
const bodyParser = require("body-parser");
const httpErrors = require("http-errors");
const morgan = require("morgan");
const session = require("express-session");
const passport = require("passport");
const authRoutes = require("./src/routes/authRoutes");

require("dotenv").config();
require("./src/config/passport"); // Khởi tạo Passport cấu hình Google OAuth

const app = express();

DBconnect();

// Middleware xử lý JSON và URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware log request
app.use(morgan("dev"));

// Cấu hình session (cần thiết cho Passport)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());

// Sử dụng routes authentication
app.use("/auth", authRoutes);

// Xử lý lỗi 404
app.use(async (req, res, next) => {
    next(httpErrors.NotFound());
});

// Xử lý lỗi server
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        "error": {
            "status": err.status || 500,
            "message": err.message
        }
    });
});

// Khởi động server
app.listen(process.env.PORT, process.env.HOST_NAME, () => {
    console.log(`Server is running at http://${process.env.HOST_NAME}:${process.env.PORT}`);
});
