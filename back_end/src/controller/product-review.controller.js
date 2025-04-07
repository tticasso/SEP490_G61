const db = require("../models");
const ProductReview = db.productReview;
const mongoose = require("mongoose");

// [Keeping all existing functions from product-review.controller.js]

// Lấy tất cả đánh giá sản phẩm
const getAllProductReviews = async (req, res) => {
    try {
        const productReviews = await ProductReview.find()
            .populate('product_id', 'name slug thumbnail')
            .populate('user_id', 'firstName lastName email')
            .populate('seller_id', 'firstName lastName email');
        res.status(200).json(productReviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy đánh giá theo ID
const getProductReviewById = async (req, res) => {
    try {
        const productReview = await ProductReview.findById(req.params.id)
            .populate('product_id', 'name slug thumbnail')
            .populate('user_id', 'firstName lastName email')
            .populate('seller_id', 'firstName lastName email');
        if (!productReview) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.status(200).json(productReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy đánh giá theo product_id
const getProductReviewsByProductId = async (req, res) => {
    try {
        const productReviews = await ProductReview.find({ product_id: req.params.productId })
            .populate('user_id', 'firstName lastName email')
            .populate('seller_id', 'firstName lastName email');
        res.status(200).json(productReviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy đánh giá theo seller_id
const getProductReviewsBySellerId = async (req, res) => {
    try {
        const sellerReviews = await ProductReview.find({ seller_id: req.params.sellerId })
            .populate('product_id', 'name slug thumbnail')
            .populate('user_id', 'firstName lastName email');

        // Tính toán rating trung bình của seller
        const sellerRating = await ProductReview.aggregate([
            { $match: { seller_id: new mongoose.Types.ObjectId(req.params.sellerId) } },
            { $group: { _id: "$seller_id", averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);

        const result = {
            reviews: sellerReviews,
            stats: {
                totalReviews: sellerReviews.length,
                averageRating: sellerRating.length > 0 ? sellerRating[0].averageRating : 0,
                reviewCount: sellerRating.length > 0 ? sellerRating[0].count : 0
            }
        };

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm đánh giá mới
const createProductReview = async (req, res) => {
    try {
        const { product_id, seller_id, rating, comment } = req.body;
        const user_id = req.userId; // Lấy user_id từ token đã được xác thực

        // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
        const existingReview = await ProductReview.findOne({ product_id, user_id });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        const newProductReview = new ProductReview({
            product_id,
            user_id,
            seller_id,
            rating,
            comment
        });

        await newProductReview.save();

        // Cập nhật rating trung bình cho sản phẩm
        await updateProductAverageRating(product_id);

        res.status(201).json(newProductReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật đánh giá
const updateProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const reviewId = req.params.id;
        const userId = req.userId; // Lấy user_id từ token

        // Tìm đánh giá 
        const review = await ProductReview.findById(reviewId);
        
        // Kiểm tra xem đánh giá có tồn tại không
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        
        // Kiểm tra xem người dùng có phải là chủ sở hữu của đánh giá không
        if (review.user_id.toString() !== userId) {
            return res.status(403).json({ message: "You can only update your own reviews" });
        }

        // Cập nhật đánh giá
        const updatedProductReview = await ProductReview.findByIdAndUpdate(
            reviewId,
            {
                rating,
                comment,
                updated_at: Date.now()
            },
            { new: true }
        );

        // Cập nhật rating trung bình cho sản phẩm
        await updateProductAverageRating(updatedProductReview.product_id);

        res.status(200).json(updatedProductReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa đánh giá
const deleteProductReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.userId; // Lấy user_id từ token
        
        // Tìm đánh giá
        const review = await ProductReview.findById(reviewId);
        
        // Kiểm tra xem đánh giá có tồn tại không
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        
        // Kiểm tra nếu người dùng là chủ sở hữu của đánh giá hoặc là admin
        if (review.user_id.toString() !== userId && !req.isAdmin) {
            return res.status(403).json({ message: "You can only delete your own reviews" });
        }

        const product_id = review.product_id;

        // Xóa đánh giá
        await ProductReview.findByIdAndDelete(reviewId);

        // Cập nhật rating trung bình cho sản phẩm
        await updateProductAverageRating(product_id);

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hàm phụ trợ cập nhật rating trung bình cho sản phẩm
const updateProductAverageRating = async (productId) => {
    try {
        const Product = db.product;

        // Tính rating trung bình
        const result = await ProductReview.aggregate([
            { $match: { product_id: new mongoose.Types.ObjectId(productId) } },
            { $group: { _id: "$product_id", averageRating: { $avg: "$rating" } } }
        ]);

        const averageRating = result.length > 0 ? result[0].averageRating : 0;

        // Cập nhật rating cho sản phẩm
        await Product.findByIdAndUpdate(
            productId,
            { rating: averageRating }
        );
    } catch (error) {
        console.error("Error updating product average rating:", error);
    }
};

// MỚI: Thêm phản hồi đánh giá (từ seller)
const addReviewReply = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { replyText } = req.body;
        const sellerId = req.userId; // Lấy seller_id từ token đã được xác thực

        // Tìm đánh giá
        const review = await ProductReview.findById(reviewId);

        // Kiểm tra xem đánh giá có tồn tại không
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Kiểm tra xem người dùng hiện tại có phải là seller của sản phẩm trong đánh giá này không
        if (review.seller_id.toString() !== sellerId) {
            return res.status(403).json({ message: "You can only reply to reviews of your products" });
        }

        // Cập nhật đánh giá với phản hồi
        const updatedReview = await ProductReview.findByIdAndUpdate(
            reviewId,
            {
                reply: {
                    text: replyText,
                    created_at: Date.now(),
                    updated_at: Date.now()
                },
                updated_at: Date.now()
            },
            { new: true }
        );

        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// MỚI: Cập nhật phản hồi đánh giá
const updateReviewReply = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { replyText } = req.body;
        const sellerId = req.userId; // Lấy seller_id từ token đã được xác thực

        // Tìm đánh giá
        const review = await ProductReview.findById(reviewId);

        // Kiểm tra xem đánh giá có tồn tại không
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Kiểm tra xem phản hồi có tồn tại không
        if (!review.reply || !review.reply.text) {
            return res.status(404).json({ message: "Reply not found" });
        }

        // Kiểm tra xem người dùng hiện tại có phải là seller của sản phẩm trong đánh giá này không
        if (review.seller_id.toString() !== sellerId) {
            return res.status(403).json({ message: "You can only update replies to reviews of your products" });
        }

        // Cập nhật đánh giá với phản hồi đã chỉnh sửa
        const updatedReview = await ProductReview.findByIdAndUpdate(
            reviewId,
            {
                'reply.text': replyText,
                'reply.updated_at': Date.now(),
                updated_at: Date.now()
            },
            { new: true }
        );

        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// MỚI: Xóa phản hồi đánh giá
const deleteReviewReply = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const sellerId = req.userId; // Lấy seller_id từ token đã được xác thực

        // Tìm đánh giá
        const review = await ProductReview.findById(reviewId);

        // Kiểm tra xem đánh giá có tồn tại không
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Kiểm tra xem phản hồi có tồn tại không
        if (!review.reply || !review.reply.text) {
            return res.status(404).json({ message: "Reply not found" });
        }

        // Kiểm tra xem người dùng hiện tại có phải là seller của sản phẩm trong đánh giá này không
        if (review.seller_id.toString() !== sellerId && !req.isAdmin) {
            return res.status(403).json({ message: "You can only delete replies to reviews of your products" });
        }

        // Cập nhật đánh giá, xóa phản hồi
        const updatedReview = await ProductReview.findByIdAndUpdate(
            reviewId,
            {
                $unset: { reply: 1 },
                updated_at: Date.now()
            },
            { new: true }
        );

        res.status(200).json({ message: "Reply deleted successfully", review: updatedReview });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const productReviewController = {
    getAllProductReviews,
    getProductReviewById,
    getProductReviewsByProductId,
    getProductReviewsBySellerId,
    createProductReview,
    updateProductReview,
    deleteProductReview,
    // Thêm các hàm mới vào Controller
    addReviewReply,
    updateReviewReply,
    deleteReviewReply
};

module.exports = productReviewController;