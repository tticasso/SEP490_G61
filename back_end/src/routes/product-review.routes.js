const express = require('express');
const bodyParser = require('body-parser');
const { productReviewController } = require('../controller');
const VerifyJwt = require('../middlewares/verifyJwt')

const ProductReviewRouter = express.Router();
ProductReviewRouter.use(bodyParser.json());

// Lấy tất cả đánh giá sản phẩm
ProductReviewRouter.get('/', productReviewController.getAllProductReviews);

// Lấy đánh giá theo ID
ProductReviewRouter.get('/:id', productReviewController.getProductReviewById);

// Lấy đánh giá theo product_id
ProductReviewRouter.get('/product/:productId', productReviewController.getProductReviewsByProductId);

// Lấy đánh giá theo seller_id
ProductReviewRouter.get('/seller/:sellerId', productReviewController.getProductReviewsBySellerId);

// Thêm đánh giá mới (yêu cầu đăng nhập)
ProductReviewRouter.post('/create', [VerifyJwt.verifyToken], productReviewController.createProductReview);

// Cập nhật đánh giá (yêu cầu đăng nhập)
ProductReviewRouter.put('/edit/:id', [VerifyJwt.verifyToken], productReviewController.updateProductReview);

// Xóa đánh giá (yêu cầu đăng nhập)
ProductReviewRouter.delete('/delete/:id', [VerifyJwt.verifyToken], productReviewController.deleteProductReview);

// MỚI: Thêm phản hồi đánh giá (chỉ dành cho seller)
ProductReviewRouter.post('/reply/:id', [VerifyJwt.verifyToken, VerifyJwt.isSeller], productReviewController.addReviewReply);

// MỚI: Cập nhật phản hồi đánh giá (chỉ dành cho seller)
ProductReviewRouter.put('/reply/:id', [VerifyJwt.verifyToken, VerifyJwt.isSeller], productReviewController.updateReviewReply);

// MỚI: Xóa phản hồi đánh giá (chỉ dành cho seller hoặc admin)
ProductReviewRouter.delete('/reply/:id', [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller], productReviewController.deleteReviewReply);

module.exports = ProductReviewRouter;