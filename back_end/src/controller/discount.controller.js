const db = require("../models");
const Discount = db.discount;

// Lấy tất cả mã giảm giá
const getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find({ is_delete: false });
        res.status(200).json(discounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy mã giảm giá theo ID
const getDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) {
            return res.status(404).json({ message: "Discount not found" });
        }
        res.status(200).json(discount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy mã giảm giá theo code
const getDiscountByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const discount = await Discount.findOne({ code, is_delete: false, is_active: true });

        if (!discount) {
            return res.status(404).json({ message: "Discount code not found or inactive" });
        }

        // Kiểm tra thời hạn sử dụng
        const now = new Date();
        if (discount.start_date && new Date(discount.start_date) > now) {
            return res.status(400).json({ message: "Discount not active yet" });
        }
        if (discount.end_date && new Date(discount.end_date) < now) {
            return res.status(400).json({ message: "Discount expired" });
        }

        res.status(200).json(discount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo mã giảm giá mới
const createDiscount = async (req, res) => {
    try {
        const {
            name,
            description,
            type_price,
            type,
            value,
            code,
            start_date,
            end_date,
            max_uses,
            max_uses_per_user,
            min_order_value,
            shop_id,
            applies_to,
            is_active,
            status
        } = req.body;

        // Kiểm tra xem mã giảm giá đã tồn tại chưa
        const existingDiscount = await Discount.findOne({ code });
        if (existingDiscount) {
            return res.status(400).json({ message: "Discount code already exists" });
        }

        // Tạo mã giảm giá mới
        const newDiscount = new Discount({
            name,
            description,
            type_price,
            type,
            value,
            code,
            start_date,
            end_date,
            max_uses,
            max_uses_per_user,
            min_order_value,
            shop_id,
            applies_to,
            is_active,
            status
        });

        await newDiscount.save();
        res.status(201).json(newDiscount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật mã giảm giá
const updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Nếu có cập nhật code, kiểm tra xem code đã tồn tại chưa
        if (updateData.code) {
            const existingDiscount = await Discount.findOne({
                code: updateData.code,
                _id: { $ne: id }
            });
            if (existingDiscount) {
                return res.status(400).json({ message: "Discount code already exists" });
            }
        }

        const updatedDiscount = await Discount.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedDiscount) {
            return res.status(404).json({ message: "Discount not found" });
        }

        res.status(200).json(updatedDiscount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa mã giảm giá (xóa mềm)
const deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;

        const discount = await Discount.findById(id);
        if (!discount) {
            return res.status(404).json({ message: "Discount not found" });
        }

        // Xóa mềm
        discount.is_delete = true;
        discount.is_active = false;
        await discount.save();

        res.status(200).json({ message: "Discount deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa mã giảm giá vĩnh viễn
const permanentDeleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedDiscount = await Discount.findByIdAndDelete(id);
        if (!deletedDiscount) {
            return res.status(404).json({ message: "Discount not found" });
        }

        res.status(200).json({ message: "Discount permanently deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kích hoạt/vô hiệu hóa mã giảm giá
const toggleDiscountStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const discount = await Discount.findById(id);
        if (!discount) {
            return res.status(404).json({ message: "Discount not found" });
        }

        discount.is_active = !discount.is_active;
        await discount.save();

        const status = discount.is_active ? "activated" : "deactivated";
        res.status(200).json({ message: `Discount ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kiểm tra số lần sử dụng của mã giảm giá
const getDiscountUsage = async (req, res) => {
    try {
        const { id } = req.params;

        const discount = await Discount.findById(id);
        if (!discount) {
            return res.status(404).json({ message: "Discount not found" });
        }

        // Lấy lịch sử sử dụng từ history
        const usageHistory = discount.history || {};
        const totalUsed = Object.values(usageHistory).reduce((sum, current) => sum + current, 0);

        res.status(200).json({
            discount: discount.code,
            maxUses: discount.max_uses,
            totalUsed: totalUsed,
            usageByUser: usageHistory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const discountController = {
    getAllDiscounts,
    getDiscountById,
    getDiscountByCode,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    permanentDeleteDiscount,
    toggleDiscountStatus,
    getDiscountUsage
};

module.exports = discountController;