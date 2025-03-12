const createHttpError = require("http-errors");
const db = require("../models");
const Shop = db.shop;
const User = db.user;   

// Lấy tất cả cửa hàng
const getAllShops = async (req, res, next) => {
    try {
        const shops = await Shop.find({ is_active: 1 }); 
        res.status(200).json(shops);
    } catch (error) {
        next(createHttpError.InternalServerError("Error fetching shops"));
    }
};

// Lấy cửa hàng theo ID
const getShopById = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop || shop.is_active === 0) {
            throw createHttpError.NotFound("Shop not found");
        }
        res.status(200).json(shop);
    } catch (error) {
        if (error.name === 'CastError') {
            return next(createHttpError.BadRequest("Invalid shop ID"));
        }
        next(error);
    }
};

// Tạo cửa hàng mới
const createShop = async (req, res, next) => {
    try {
        const { 
            name, 
            username, 
            phone, 
            email, 
            CCCD, 
            address, 
            user_id,
            description,
            website,
            nation_id,
            province_id 
        } = req.body;

        // Xác thực các trường bắt buộc
        if (!name || !username || !email || !CCCD || !address) {
            throw createHttpError.BadRequest("Required fields missing");
        }

        // Lấy user_id từ token nếu không được cung cấp
        const userId = user_id || req.userId;

        // Kiểm tra người dùng tồn tại
        const userExists = await User.findById(userId);
        if (!userExists) {
            throw createHttpError.BadRequest("Invalid user ID");
        }

        // Kiểm tra xem username và email đã tồn tại chưa
        const usernameExists = await Shop.findOne({ username, is_active: 1 });
        if (usernameExists) {
            throw createHttpError.Conflict("Username already in use");
        }

        const emailExists = await Shop.findOne({ email, is_active: 1 });
        if (emailExists) {
            throw createHttpError.Conflict("Email already in use");
        }

        // Tạo shop mới
        const newShop = new Shop({
            name,
            username,
            phone,
            email,
            CCCD,
            address,
            user_id: userId,
            description: description || null,
            website: website || null,
            nation_id: nation_id || null,
            province_id: province_id || null,
            status: "pending", // Mặc định là pending để admin duyệt
        });

        const savedShop = await newShop.save();
        res.status(201).json({ message: "Shop registered successfully", shop: savedShop });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(createHttpError.BadRequest(error.message));
        }
        next(error);
    }
};

// Cập nhật thông tin cửa hàng
const updateShop = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop || shop.is_active === 0) {
            throw createHttpError.NotFound("Shop not found");
        }

        // Username và email phải là duy nhất
        if (req.body.username && req.body.username !== shop.username) {
            const usernameExists = await Shop.findOne({ 
                username: req.body.username, 
                is_active: 1,
                _id: { $ne: shop._id } 
            });
            if (usernameExists) {
                throw createHttpError.Conflict("Username already in use");
            }
        }

        if (req.body.email && req.body.email !== shop.email) {
            const emailExists = await Shop.findOne({ 
                email: req.body.email, 
                is_active: 1,
                _id: { $ne: shop._id } 
            });
            if (emailExists) {
                throw createHttpError.Conflict("Email already in use");
            }
        }

        // Update fields
        Object.assign(shop, req.body, { updated_at: Date.now() });
        await shop.save();
        res.status(200).json({ message: "Shop updated successfully", shop });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(createHttpError.BadRequest("Invalid shop ID"));
        }
        if (error.name === 'ValidationError') {
            return next(createHttpError.BadRequest(error.message));
        }
        next(error);
    }
};

// Xóa cửa hàng (xóa mềm)
const deleteShop = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop || shop.is_active === 0) {
            throw createHttpError.NotFound("Shop not found");
        }

        shop.is_active = 0; // Thay đổi trạng thái thành không hoạt động
        await shop.save();
        res.status(200).json({ message: "Shop deleted successfully" });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(createHttpError.BadRequest("Invalid shop ID"));
        }
        next(error);
    }
};

// Thống kê cửa hàng
const getShopStatistics = async (req, res, next) => {
    try {
        const totalShops = await Shop.countDocuments({ is_active: 1 });
        const pendingShops = await Shop.countDocuments({ status: "pending", is_active: 1 });
        const activeShops = await Shop.countDocuments({ status: "active", is_active: 1 });

        res.status(200).json({ 
            totalShops,
            pendingShops,
            activeShops
        });
    } catch (error) {
        next(createHttpError.InternalServerError("Error fetching shop statistics"));
    }
};

// Duyệt cửa hàng (chỉ admin)
const approveShop = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop || shop.is_active === 0) {
            throw createHttpError.NotFound("Shop not found");
        }

        shop.status = "active";
        shop.updated_at = Date.now();
        await shop.save();
        res.status(200).json({ message: "Shop approved successfully", shop });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(createHttpError.BadRequest("Invalid shop ID"));
        }
        next(error);
    }
};

// Từ chối duyệt cửa hàng (chỉ admin)
const rejectShop = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const shop = await Shop.findById(req.params.id);
        if (!shop || shop.is_active === 0) {
            throw createHttpError.NotFound("Shop not found");
        }

        shop.status = "rejected";
        shop.reject_reason = reason || "Does not meet requirements";
        shop.updated_at = Date.now();
        await shop.save();
        res.status(200).json({ message: "Shop rejected", shop });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(createHttpError.BadRequest("Invalid shop ID"));
        }
        next(error);
    }
};

// Lấy cửa hàng theo user ID
const getShopByUserId = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.userId;
        const shop = await Shop.findOne({ user_id: userId, is_active: 1 });
        
        if (!shop) {
            throw createHttpError.NotFound("No shop found for this user");
        }
        
        res.status(200).json(shop);
    } catch (error) {
        next(error);
    }
};

// Upload hình ảnh cho shop (sau khi middleware xử lý file)
const uploadShopImage = async (req, res, next) => {
    try {
        if (!req.file) {
            throw createHttpError.BadRequest("No file uploaded");
        }

        const shopId = req.params.id;
        const field = req.body.field; // 'logo' hoặc 'image_cover'
        
        if (!field || (field !== 'logo' && field !== 'image_cover')) {
            throw createHttpError.BadRequest("Invalid field specified");
        }
        
        const shop = await Shop.findById(shopId);
        if (!shop || shop.is_active === 0) {
            throw createHttpError.NotFound("Shop not found");
        }
        
        // Lấy đường dẫn tương đối của file
        const filePath = `/uploads/shops/${req.file.filename}`;
        
        // Cập nhật shop với đường dẫn file
        shop[field] = filePath;
        shop.updated_at = Date.now();
        await shop.save();
        
        res.status(200).json({ 
            message: "Image uploaded successfully", 
            [field]: filePath
        });
    } catch (error) {
        next(error);
    }
};

const shopController = {
    getAllShops,
    getShopById,
    createShop,
    updateShop,
    deleteShop,
    getShopStatistics,
    approveShop,
    rejectShop,
    getShopByUserId,
    uploadShopImage
};

module.exports = shopController;