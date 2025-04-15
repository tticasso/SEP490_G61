const db = require("../models");
const Coupon = db.coupon;
const Product = db.product;
const Category = db.categories;
const User = db.users || db.user; // Đảm bảo lấy đúng model user tùy thuộc vào cấu trúc dự án

// Lấy tất cả coupon (có phân trang và lọc)
const getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 10, active, search, created_by } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Xây dựng bộ lọc
        const filter = { is_delete: false };

        // Lọc theo người tạo (seller ID) - chỉ áp dụng khi không phải admin
        if (created_by) {
            // Kiểm tra nếu user hiện tại là admin
            const user = await User.findById(created_by);

            // Nếu không phải admin, chỉ xem được coupon của chính họ
            if (user && user.role !== 'admin') {
                filter.created_by = created_by;
            }
            // Nếu là admin và có chỉ định created_by, vẫn lọc theo created_by đó
            else if (user && user.role === 'admin' && req.query.filter_by_creator) {
                filter.created_by = req.query.filter_by_creator;
            }
            // Admin không chỉ định lọc theo người tạo sẽ xem tất cả
        }

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
            .populate('created_by', 'name role')
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
            .populate('created_by', 'name role')
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

// Helper function to check admin role
const isAdmin = async (userId) => {
    try {
        if (!userId) return false;

        const user = await User.findById(userId);
        return user && user.role === 'admin';
    } catch (error) {
        console.error("Error checking admin role:", error);
        return false;
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

        // Kiểm tra quyền - chỉ admin hoặc người tạo coupon mới có thể cập nhật
        const admin = await isAdmin(updated_by);
        if (!admin && updated_by && coupon.created_by && coupon.created_by.toString() !== updated_by.toString()) {
            return res.status(403).json({ message: "You do not have permission to update this coupon" });
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

        // Kiểm tra quyền - chỉ admin hoặc người tạo coupon mới có thể xóa
        const admin = await isAdmin(req.body.updated_by);
        if (!admin && req.body.updated_by && coupon.created_by && coupon.created_by.toString() !== req.body.updated_by.toString()) {
            return res.status(403).json({ message: "You do not have permission to delete this coupon" });
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
async function validateCoupon(req, res) {
    try {
        const { code, userId, cartTotal, productIds, categoryIds, shopIds, variantIds } = req.body;

        if (!code) {
            return res.status(400).json({
                valid: false,
                message: "Mã giảm giá là bắt buộc"
            });
        }

        // Kiểm tra xem có sản phẩm nào được chọn không
        if (!productIds || productIds.length === 0) {
            return res.status(400).json({
                valid: false,
                message: "Vui lòng chọn ít nhất một sản phẩm để áp dụng mã giảm giá"
            });
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
            return res.status(400).json({
                valid: false,
                message: "Mã giảm giá không tồn tại hoặc đã hết hạn"
            });
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        if (cartTotal < coupon.min_order_value) {
            return res.status(400).json({
                valid: false,
                message: `Đơn hàng tối thiểu: ${coupon.min_order_value.toLocaleString()}đ`
            });
        }

        // Kiểm tra giới hạn sử dụng
        if (coupon.max_uses > 0) {
            const totalUsed = Array.from(coupon.history || {}).reduce((sum, [_, count]) => sum + count, 0);
            if (totalUsed >= coupon.max_uses) {
                return res.status(400).json({
                    valid: false,
                    message: "Mã giảm giá đã hết lượt sử dụng"
                });
            }
        }

        // Kiểm tra giới hạn sử dụng mỗi người dùng
        // Kiểm tra giới hạn sử dụng mỗi người dùng
        if (userId && coupon.max_uses_per_user > 0) {
            let userUsage = 0;

            // Kiểm tra cấu trúc history và lấy đúng số lần sử dụng
            if (coupon.history instanceof Map) {
                // Nếu history là Map (được định nghĩa trong model)
                userUsage = coupon.history.get(userId.toString()) || 0;
            } else if (coupon.history && typeof coupon.history === 'object') {
                // Kiểm tra nếu history được lưu dưới dạng object
                if (coupon.history[userId.toString()] !== undefined) {
                    userUsage = coupon.history[userId.toString()];
                } else if (coupon.history[userId] !== undefined) {
                    userUsage = coupon.history[userId];
                } else {
                    // Kiểm tra các trường hợp khác có thể xảy ra
                    const keys = Object.keys(coupon.history);
                    const matchKey = keys.find(k =>
                        k === userId.toString() ||
                        k === String(userId)
                    );

                    if (matchKey) {
                        userUsage = coupon.history[matchKey];
                    }
                }
            }

            // Ghi log để debug
            console.log(`[COUPON] User ${userId} has used coupon ${coupon.code} ${userUsage}/${coupon.max_uses_per_user} times`);

            if (userUsage >= coupon.max_uses_per_user) {
                return res.status(400).json({
                    valid: false,
                    message: "Bạn đã sử dụng hết lượt của mã giảm giá này"
                });
            }
        }

        // Kiểm tra xem có giới hạn sản phẩm hoặc danh mục không
        const isProductSpecific = coupon.product_id !== null && coupon.product_id !== undefined;
        const isCategorySpecific = coupon.category_id !== null && coupon.category_id !== undefined;
        const isShopSpecific = coupon.shop_id !== null && coupon.shop_id !== undefined;

        // Nếu mã giảm giá áp dụng cho sản phẩm cụ thể
        if (isProductSpecific) {
            // Kiểm tra từng sản phẩm trong giỏ hàng
            const eligibleProducts = productIds.filter(pid =>
                pid === coupon.product_id.toString()
            );

            // Nếu không có sản phẩm nào phù hợp
            if (eligibleProducts.length === 0) {
                return res.status(400).json({
                    valid: false,
                    message: "Mã giảm giá chỉ áp dụng cho sản phẩm cụ thể"
                });
            }

            // Nếu không phải tất cả sản phẩm đều phù hợp
            if (eligibleProducts.length !== productIds.length) {
                return res.status(400).json({
                    valid: false,
                    message: "Mã giảm giá không áp dụng cho tất cả sản phẩm đã chọn"
                });
            }
        }

        // Nếu mã giảm giá áp dụng cho danh mục cụ thể
        if (isCategorySpecific && categoryIds && categoryIds.length > 0) {
            // Cần tất cả sản phẩm đều thuộc danh mục được áp dụng
            const productsInCategory = categoryIds.filter(cid =>
                cid === coupon.category_id.toString()
            );

            // Nếu không có sản phẩm nào thuộc danh mục
            if (productsInCategory.length === 0) {
                return res.status(400).json({
                    valid: false,
                    message: "Mã giảm giá chỉ áp dụng cho danh mục sản phẩm cụ thể"
                });
            }

            // Nếu không phải tất cả sản phẩm đều thuộc danh mục
            if (productsInCategory.length !== categoryIds.length) {
                return res.status(400).json({
                    valid: false,
                    message: "Mã giảm giá không áp dụng cho tất cả sản phẩm đã chọn"
                });
            }
        }

        // Nếu mã giảm giá áp dụng cho shop cụ thể
        if (isShopSpecific && shopIds && shopIds.length > 0) {
            // Cần tất cả sản phẩm đều thuộc shop được áp dụng
            const productsInShop = shopIds.filter(sid =>
                sid === coupon.shop_id.toString()
            );

            // Nếu không có sản phẩm nào thuộc shop
            if (productsInShop.length === 0) {
                return res.status(400).json({
                    valid: false,
                    message: "Mã giảm giá chỉ áp dụng cho cửa hàng cụ thể"
                });
            }

            // Nếu không phải tất cả sản phẩm đều thuộc shop
            if (productsInShop.length !== shopIds.length) {
                return res.status(400).json({
                    valid: false,
                    message: "Mã giảm giá không áp dụng cho tất cả sản phẩm đã chọn"
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
                type: coupon.type,
                max_discount_value: coupon.max_discount_value
            },
            discountAmount,
            message: "Mã giảm giá hợp lệ"
        });
    } catch (error) {
        res.status(500).json({
            valid: false,
            message: error.message
        });
    }
}

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