// userStatus.controller.js
const db = require("../models");
const UserStatus = require("../models/user-status.model");
const User = db.user;
const Shop = db.shop;
const Role = db.role;

// Lấy trạng thái hoạt động của một người dùng
const getUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Tìm trạng thái hoạt động của người dùng
        let userStatus = await UserStatus.findOne({ user_id: userId });
        
        // Nếu không có, tạo một bản ghi mới
        if (!userStatus) {
            userStatus = new UserStatus({
                user_id: userId,
                is_online: false,
                last_active: new Date()
            });
            await userStatus.save();
        }
        
        // Tính thời gian hoạt động gần nhất
        const lastActive = userStatus.last_active;
        const now = new Date();
        const diffMinutes = Math.floor((now - lastActive) / (1000 * 60));
        
        let status = "offline";
        if (userStatus.is_online) {
            status = "online";
        } else if (diffMinutes < 5) {
            status = "recently"; // Vừa hoạt động (dưới 5 phút)
        }
        
        res.status(200).json({
            user_id: userId,
            status: status,
            last_active: userStatus.last_active
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái hoạt động của người dùng
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { is_online } = req.body;
        
        let userStatus = await UserStatus.findOne({ user_id: userId });
        
        if (!userStatus) {
            userStatus = new UserStatus({
                user_id: userId,
                is_online: is_online,
                last_active: new Date()
            });
        } else {
            userStatus.is_online = is_online;
            userStatus.last_active = new Date();
        }
        
        await userStatus.save();
        
        res.status(200).json({
            user_id: userId,
            status: is_online ? "online" : "offline",
            last_active: userStatus.last_active
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thông tin chi tiết người tham gia trong cuộc trò chuyện
const getConversationParticipantDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find user info
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Get user roles
        const userRoles = await Role.find({ _id: { $in: user.roles } });
        const isSeller = userRoles.some(role => role.name === "SELLER");
        
        // Find shop if the user is a seller
        let shop = null;
        if (isSeller) {
            shop = await Shop.findOne({ user_id: userId });
        }
        
        // Get online status
        let userStatus = await UserStatus.findOne({ user_id: userId });
        if (!userStatus) {
            userStatus = new UserStatus({
                user_id: userId,
                is_online: false,
                last_active: new Date()
            });
            await userStatus.save();
        }
        
        // Calculate status
        const lastActive = userStatus.last_active;
        const now = new Date();
        const diffMinutes = Math.floor((now - lastActive) / (1000 * 60));
        
        let status = "offline";
        if (userStatus.is_online) {
            status = "online";
        } else if (diffMinutes < 5) {
            status = "recently"; // Recently active (less than 5 minutes)
        }
        
        // Return detailed user info including correct name fields
        res.status(200).json({
            user_id: userId,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email,
            isSeller: isSeller,
            shop: shop ? {
                id: shop._id,
                name: shop.name,
                logo: shop.logo
            } : null,
            status: status,
            last_active: userStatus.last_active
        });
    } catch (error) {
        console.error("Error fetching participant details:", error);
        res.status(500).json({ message: error.message });
    }
};

const userStatusController = {
    getUserStatus,
    updateUserStatus,
    getConversationParticipantDetails
};

module.exports = userStatusController;