const db = require("../models");
const Coupon = db.coupon;
const Product = db.product;
const Category = db.categories;

// Lấy tất cả coupon (có phân trang và lọc)
const getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 10, active, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Xây dựng bộ lọc
        const filter = { is_delete: false };

        // Lọc theo trạng thái kích hoạt
        if (active !== undefined) {
            filter.is_active = active === 'true';
        }

        // Tìm kiếm theo mã hoặc mô tả
        if (search) {
            filter.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Thực hiện truy vấn với bộ lọc
        const coupons = await Coupon.find(filter)
            .populate('created_by', 'name')
            .populate('updated_by', 'name')
            .populate('product_id', 'name')
            .populate('category_id', 'name')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Đếm tổng số coupon thỏa mãn điều kiện
        const total = await Coupon.countDocuments(filter);

        res.status(200).json({
            coupons,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            totalItems: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy coupon theo ID
const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id)
            .populate('created_by', 'name')
            .populate('updated_by', 'name')
            .populate('product_id', 'name')
            .populate('category_id', 'name');

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy coupon theo mã
const getCouponByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            is_delete: false,
            is_active: true,
            start_date: { $lte: new Date() },
            end_date: { $gte: new Date() }
        });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found or expired" });
        }

        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo coupon mới
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            value,
            type,
            min_order_value,
            max_discount_value,
            start_date,
            end_date,
            is_active,
            max_uses,
            max_uses_per_user,
            product_id,
            category_id,
            created_by
        } = req.body;

        // Kiểm tra mã đã tồn tại chưa
        const existingCoupon = await Coupon.findOne({
            code: code.toUpperCase(),
            is_delete: false
        });

        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }

        // Kiểm tra product_id nếu có
        if (product_id) {
            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(400).json({ message: "Invalid product ID" });
            }
        }

        // Kiểm tra category_id nếu có
        if (category_id) {
            const category = await Category.findById(category_id);
            if (!category) {
                return res.status(400).json({ message: "Invalid category ID" });
            }
        }

        // Tạo coupon mới
        const newCoupon = new Coupon({
            code: code.toUpperCase(),
            description,
            value,
            type,
            min_order_value: min_order_value || 0,
            max_discount_value: max_discount_value || null,
            start_date,
            end_date,
            is_active: is_active !== undefined ? is_active : true,
            max_uses: max_uses || 0,
            max_uses_per_user: max_uses_per_user || 1,
            product_id: product_id || null,
            category_id: category_id || null,
            created_by,
            updated_by: created_by
        });

        const savedCoupon = await newCoupon.save();

        res.status(201).json({
            message: "Coupon created successfully",
            coupon: savedCoupon
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật coupon
const updateCoupon = async (req, res) => {
    try {
        const {
            description,
            value,
            type,
            min_order_value,
            max_discount_value,
            start_date,
            end_date,
            is_active,
            max_uses,
            max_uses_per_user,
            product_id,
            category_id,
            updated_by
        } = req.body;

        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        // Kiểm tra product_id nếu có
        if (product_id) {
            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(400).json({ message: "Invalid product ID" });
            }
        }

        // Kiểm tra category_id nếu có
        if (category_id) {
            const category = await Category.findById(category_id);
            if (!category) {
                return res.status(400).json({ message: "Invalid category ID" });
            }
        }

        // Cập nhật thông tin
        coupon.description = description || coupon.description;
        coupon.value = value || coupon.value;
        coupon.type = type || coupon.type;
        coupon.min_order_value = min_order_value !== undefined ? min_order_value : coupon.min_order_value;
        coupon.max_discount_value = max_discount_value !== undefined ? max_discount_value : coupon.max_discount_value;
        coupon.start_date = start_date || coupon.start_date;
        coupon.end_date = end_date || coupon.end_date;
        coupon.is_active = is_active !== undefined ? is_active : coupon.is_active;
        coupon.max_uses = max_uses !== undefined ? max_uses : coupon.max_uses;
        coupon.max_uses_per_user = max_uses_per_user !== undefined ? max_uses_per_user : coupon.max_uses_per_user;
        coupon.product_id = product_id !== undefined ? product_id : coupon.product_id;
        coupon.category_id = category_id !== undefined ? category_id : coupon.category_id;
        coupon.updated_by = updated_by;
        coupon.updated_at = Date.now();

        const updatedCoupon = await coupon.save();

        res.status(200).json({
            message: "Coupon updated successfully",
            coupon: updatedCoupon
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa coupon (xóa mềm)
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        // Xóa mềm
        coupon.is_delete = true;
        coupon.is_active = false;
        coupon.updated_at = Date.now();
        coupon.updated_by = req.body.updated_by;

        await coupon.save();

        res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kiểm tra tính hợp lệ của mã giảm giá
const validateCoupon = async (req, res) => {
    try {
        const { code, userId, cartTotal, productIds, categoryIds } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" });
        }

        // Tìm mã giảm giá
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            is_delete: false,
            is_active: true,
            start_date: { $lte: new Date() },
            end_date: { $gte: new Date() }
        });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found or expired" });
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        if (cartTotal < coupon.min_order_value) {
            return res.status(400).json({
                valid: false,
                message: `Minimum order value required: ${coupon.min_order_value}`
            });
        }

        // Kiểm tra giới hạn sử dụng
        if (coupon.max_uses > 0) {
            const totalUsed = Array.from(coupon.history.values()).reduce((sum, count) => sum + count, 0);
            if (totalUsed >= coupon.max_uses) {
                return res.status(400).json({
                    valid: false,
                    message: "This coupon has reached its maximum usage limit"
                });
            }
        }

        // Kiểm tra giới hạn sử dụng mỗi người dùng
        if (userId && coupon.max_uses_per_user > 0) {
            const userUsage = coupon.history.get(userId.toString()) || 0;
            if (userUsage >= coupon.max_uses_per_user) {
                return res.status(400).json({
                    valid: false,
                    message: "You have reached the maximum usage limit for this coupon"
                });
            }
        }

        // Kiểm tra áp dụng cho sản phẩm cụ thể
        if (coupon.product_id && productIds) {
            const matchProduct = productIds.includes(coupon.product_id.toString());
            if (!matchProduct) {
                return res.status(400).json({
                    valid: false,
                    message: "This coupon only applies to specific products"
                });
            }
        }

        // Kiểm tra áp dụng cho danh mục cụ thể
        if (coupon.category_id && categoryIds) {
            const matchCategory = categoryIds.includes(coupon.category_id.toString());
            if (!matchCategory) {
                return res.status(400).json({
                    valid: false,
                    message: "This coupon only applies to specific categories"
                });
            }
        }

        // Tính toán giá trị giảm giá
        let discountAmount;
        if (coupon.type === 'fixed') {
            discountAmount = coupon.value;
        } else {
            // Percentage
            discountAmount = (cartTotal * coupon.value) / 100;
            // Giới hạn tối đa nếu có
            if (coupon.max_discount_value && discountAmount > coupon.max_discount_value) {
                discountAmount = coupon.max_discount_value;
            }
        }

        res.status(200).json({
            valid: true,
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                value: coupon.value,
                type: coupon.type
            },
            discountAmount,
            message: "Coupon is valid"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export controller
const couponController = {
    getAllCoupons,
    getCouponById,
    getCouponByCode,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
};

module.exports = couponController;