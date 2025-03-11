const db = require("../models");
const Shop = db.shop;
const User = db.user;   

// Lấy tất cả cửa hàng
const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find({ is_active: 1 }); 
        res.status(200).json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy cửa hàng theo ID
const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop || shop.is_active === 0) {
            return res.status(404).json({ message: "Shop not found" });
        }
        res.status(200).json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo cửa hàng mới
const createShop = async (req, res) => {
    try {
        const { name, username, phone, email, CCCD, address, user_id } = req.body;

        if (!name || !username || !email || !CCCD || !address || !user_id) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findById(user_id);
        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const newShop = new Shop({
            name,
            username,
            phone,
            email,
            CCCD,
            address,
            user_id,
        });

        const savedShop = await newShop.save();
        res.status(201).json({ message: "Shop created successfully", shop: savedShop });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật thông tin cửa hàng
const updateShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop || shop.is_active === 0) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Update fields
        Object.assign(shop, req.body, { updated_at: Date.now() });
        await shop.save();
        res.status(200).json({ message: "Shop updated successfully", shop });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa cửa hàng (xóa mềm)
const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop || shop.is_active === 0) {
            return res.status(404).json({ message: "Shop not found" });
        }

        shop.is_active = 0; // Thay đổi trạng thái thành không hoạt động
        await shop.save();
        res.status(200).json({ message: "Shop deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thống kê cửa hàng
const getShopStatistics = async (req, res) => {
    try {
        const totalShops = await Shop.countDocuments({ is_active: 1 });

        res.status(200).json({ totalShops });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const shopController = {
    getAllShops,
    getShopById,
    createShop,
    updateShop,
    deleteShop,
    getShopStatistics
};

module.exports = shopController;
