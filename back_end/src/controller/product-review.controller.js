const db = require("../models");
const ProductReview = db.productReview;
const mongoose = require("mongoose");
// Lấy tất cả đánh giá sản phẩm
const getAllProductReviews = async (req, res) => {
    try {
        const productReviews = await ProductReview.find()
            .populate('product_id', 'name slug thumbnail')
            .populate('user_id', 'lastName email')
            .populate('seller_id', 'lastName email');
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
            .populate('user_id', 'lastName email')
            .populate('seller_id', 'lastName email');
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
            .populate('user_id', 'lastName email')
            .populate('seller_id', 'lastName email');
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
            .populate('user_id', 'lastName email');

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
        const { product_id, user_id, seller_id, rating, comment } = req.body;

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
        const updatedProductReview = await ProductReview.findByIdAndUpdate(
            req.params.id,
            {
                rating,
                comment,
                updated_at: Date.now()
            },
            { new: true }
        );

        if (!updatedProductReview) {
            return res.status(404).json({ message: "Review not found" });
        }

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
        const productReview = await ProductReview.findById(req.params.id);
        if (!productReview) {
            return res.status(404).json({ message: "Review not found" });
        }

        const product_id = productReview.product_id;

        await ProductReview.findByIdAndDelete(req.params.id);

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

const productReviewController = {
    getAllProductReviews,
    getProductReviewById,
    getProductReviewsByProductId,
    getProductReviewsBySellerId,
    createProductReview,
    updateProductReview,
    deleteProductReview
};

module.exports = productReviewController;