const express = require('express');
const bodyParser = require('body-parser');
const { cartController } = require('../controller');

const CartRouter = express.Router();
CartRouter.use(bodyParser.json());

// Tạo giỏ hàng mới
CartRouter.post("/create", cartController.createCart);

// Lấy giỏ hàng của người dùng
CartRouter.get("/user/:userId", cartController.getCartByUserId);

// Thêm sản phẩm vào giỏ hàng
CartRouter.post("/add-item", cartController.addItemToCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
CartRouter.put("/update-item", cartController.updateCartItem);

// Xóa sản phẩm khỏi giỏ hàng
CartRouter.delete("/remove-item/:id", cartController.removeCartItem);

// Xóa tất cả sản phẩm khỏi giỏ hàng
CartRouter.delete("/clear/:id", cartController.clearCart);

module.exports = CartRouter;