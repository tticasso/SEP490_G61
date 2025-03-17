const db = require("../models");
const Shipping = db.shipping;

// Lấy tất cả phương thức vận chuyển
const getAllShippings = async (req, res) => {
    try {
        const shippings = await Shipping.find();
        res.status(200).json(shippings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy phương thức vận chuyển theo ID
const getShippingById = async (req, res) => {
    try {
        const shipping = await Shipping.findById(req.params.id);
        if (!shipping) {
            return res.status(404).json({ message: "Shipping not found" });
        }
        res.status(200).json(shipping);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy phương thức vận chuyển theo user ID
const getShippingByUserId = async (req, res) => {
    try {
        const shipping = await Shipping.find({ user_id: req.params.userId });
        res.status(200).json(shipping);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo phương thức vận chuyển mới
const createShipping = async (req, res) => {
    try {
        const { name, price, description, estimate_time } = req.body;

        // Tạo ID cho phương thức vận chuyển
        const shippingId = `SHP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Tạo phương thức vận chuyển mới
        const newShipping = new Shipping({
            id: shippingId,
            price,
            name,
            description,
            created_by: req.userId, // Từ middleware verifyToken
            updated_by: req.userId, // Từ middleware verifyToken
            estimate_time,
            is_active: true
        });

        const savedShipping = await newShipping.save();
        res.status(201).json(savedShipping);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật phương thức vận chuyển
const updateShipping = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Cập nhật thông tin updated_by và updated_at
        updateData.updated_by = req.userId; // Từ middleware verifyToken
        updateData.updated_at = new Date();

        const updatedShipping = await Shipping.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedShipping) {
            return res.status(404).json({ message: "Shipping not found" });
        }

        res.status(200).json(updatedShipping);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa phương thức vận chuyển
const deleteShipping = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedShipping = await Shipping.findByIdAndDelete(id);
        if (!deletedShipping) {
            return res.status(404).json({ message: "Shipping not found" });
        }

        res.status(200).json({ message: "Shipping deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const shippingController = {
    getAllShippings,
    getShippingById,
    getShippingByUserId,
    createShipping,
    updateShipping,
    deleteShipping
};

module.exports = shippingController;