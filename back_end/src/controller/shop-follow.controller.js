const db = require("../models");
const ShopFollow = require("../models/shop-follow.model");
const Shop = db.shop;
const User = db.user;

// Follow a shop
const followShop = async (req, res) => {
    try {
        const { shop_id } = req.body;
        const user_id = req.userId; // From JWT middleware

        // Check if shop exists and is active
        const shop = await Shop.findOne({ _id: shop_id, is_active: 1 });
        if (!shop) {
            return res.status(404).json({ message: "Shop not found or inactive" });
        }

        // Check if user already follows this shop
        const existingFollow = await ShopFollow.findOne({ user_id, shop_id });
        if (existingFollow) {
            return res.status(400).json({ message: "You are already following this shop" });
        }

        // Create new follow record
        const follow = new ShopFollow({
            user_id,
            shop_id
        });

        await follow.save();

        // Increment follower count in shop document
        await Shop.findByIdAndUpdate(
            shop_id, 
            { $inc: { follower: 1 } }
        );

        res.status(201).json({ message: "Shop followed successfully" });
    } catch (error) {
        console.error("Error following shop:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Unfollow a shop
const unfollowShop = async (req, res) => {
    try {
        const { shop_id } = req.params;
        const user_id = req.userId; // From JWT middleware

        // Check if follow relationship exists
        const follow = await ShopFollow.findOne({ user_id, shop_id });
        if (!follow) {
            return res.status(404).json({ message: "You are not following this shop" });
        }

        // Delete follow record
        await ShopFollow.findByIdAndDelete(follow._id);

        // Decrement follower count in shop document
        await Shop.findByIdAndUpdate(
            shop_id, 
            { $inc: { follower: -1 } }
        );

        res.status(200).json({ message: "Shop unfollowed successfully" });
    } catch (error) {
        console.error("Error unfollowing shop:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get all shops followed by user
const getFollowedShops = async (req, res) => {
    try {
        const user_id = req.userId; // From JWT middleware

        // Find all follow relationships for this user
        const follows = await ShopFollow.find({ user_id }).populate('shop_id');

        // Extract shop details
        const shops = follows.map(follow => follow.shop_id);

        res.status(200).json(shops);
    } catch (error) {
        console.error("Error getting followed shops:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Check if a user follows a specific shop
const checkFollowStatus = async (req, res) => {
    try {
        const { shop_id } = req.params;
        const user_id = req.userId; // From JWT middleware

        const follow = await ShopFollow.findOne({ user_id, shop_id });
        
        res.status(200).json({ 
            isFollowing: !!follow 
        });
    } catch (error) {
        console.error("Error checking follow status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get followers of a shop
const getShopFollowers = async (req, res) => {
    try {
        const { shop_id } = req.params;
        
        // Check if shop exists and is active
        const shop = await Shop.findOne({ _id: shop_id, is_active: 1 });
        if (!shop) {
            return res.status(404).json({ message: "Shop not found or inactive" });
        }

        // Find all users following this shop
        const follows = await ShopFollow.find({ shop_id }).populate({
            path: 'user_id',
            select: 'firstName lastName email' // Only return non-sensitive user data
        });

        // Extract user details
        const followers = follows.map(follow => follow.user_id);

        res.status(200).json(followers);
    } catch (error) {
        console.error("Error getting shop followers:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const shopFollowController = {
    followShop,
    unfollowShop,
    getFollowedShops,
    checkFollowStatus,
    getShopFollowers
};

module.exports = shopFollowController;