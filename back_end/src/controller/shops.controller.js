const createHttpError = require("http-errors");
const db = require("../models");
const Shop = db.shop;
const User = db.user;
const nodemailer = require('nodemailer');
require('dotenv').config();
const { cloudinary, removeFile } = require("../services/upload.service");

// Lấy tất cả cửa hàng
const getAllShops = async (req, res, next) => {
    try {
        const shops = await Shop.find({});
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
            province_id,
            logo,
            image_cover,
            identity_card_image_front,  // Thêm trường cho mặt trước CCCD
            identity_card_image_back,   // Thêm trường cho mặt sau CCCD
            business_license           // Thêm trường mới
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
            logo: logo || null,
            image_cover: image_cover || null,
            identity_card_image_front: identity_card_image_front || null,  // Thêm trường cho mặt trước
            identity_card_image_back: identity_card_image_back || null,    // Thêm trường cho mặt sau
            business_license: business_license || null                    // Thêm trường mới
        });

        const savedShop = await newShop.save();

        // Thêm quyền SELLER cho người dùng
        const sellerRole = await db.role.findOne({ name: "SELLER" });
        if (sellerRole) {
            // Kiểm tra xem user đã có role SELLER chưa
            const hasSellerRole = userExists.roles.some(roleId =>
                roleId.toString() === sellerRole._id.toString()
            );

            // Nếu chưa có role SELLER, thêm vào
            if (!hasSellerRole) {
                userExists.roles.push(sellerRole._id);
                await userExists.save();
            }
        }

        res.status(201).json({
            message: "Shop registered successfully and user role updated to SELLER",
            shop: savedShop
        });
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

        // Xóa logo và image_cover từ Cloudinary nếu có
        if (shop.logo && shop.logo.includes('cloudinary')) {
            await removeFile(shop.logo);
        }

        if (shop.image_cover && shop.image_cover.includes('cloudinary')) {
            await removeFile(shop.image_cover);
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
            throw createHttpError.NotFound("Không tìm thấy cửa hàng");
        }

        shop.status = "active";
        shop.updated_at = Date.now();
        await shop.save();

        // Gửi email thông báo chấp nhận
        try {
            // Tạo transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SERVICE_EMAIL,
                    pass: process.env.SERVICE_PASSWORD
                }
            });

            // Tạo nội dung email
            const mailOptions = {
                from: process.env.SERVICE_EMAIL,
                to: shop.email,
                subject: 'Đăng ký cửa hàng của bạn đã được phê duyệt',
                html: `
                    <h1>Chúc mừng! Cửa hàng của bạn đã được phê duyệt</h1>
                    <p>Kính gửi ${shop.name},</p>
                    <p>Chúng tôi rất vui mừng thông báo rằng đăng ký cửa hàng của bạn đã được phê duyệt. Bạn có thể bắt đầu bán hàng trên nền tảng của chúng tôi ngay bây giờ.</p>
                    <p>Thông tin cửa hàng:</p>
                    <ul>
                        <li><strong>Tên cửa hàng:</strong> ${shop.name}</li>
                        <li><strong>Tên đăng nhập:</strong> ${shop.username}</li>
                        <li><strong>Email:</strong> ${shop.email}</li>
                    </ul>
                    <p>Cảm ơn bạn đã lựa chọn nền tảng của chúng tôi.</p>
                    <p>Trân trọng,<br>Đội ngũ Quản trị</p>
                `
            };

            // Gửi email
            await transporter.sendMail(mailOptions);
            console.log(`Email thông báo phê duyệt đã gửi đến ${shop.email}`);

        } catch (emailError) {
            // Ghi log lỗi nhưng không làm fail request
            console.error("Không thể gửi email thông báo phê duyệt:", emailError);
        }

        res.status(200).json({ message: "Phê duyệt cửa hàng thành công", shop });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(createHttpError.BadRequest("ID cửa hàng không hợp lệ"));
        }
        next(error);
    }
};

// Từ chối duyệt cửa hàng (chỉ admin)
const rejectShop = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const rejectionReason = reason || "Không đáp ứng yêu cầu của chúng tôi";

        const shop = await Shop.findById(req.params.id);
        if (!shop || shop.is_active === 0) {
            throw createHttpError.NotFound("Không tìm thấy cửa hàng");
        }

        shop.status = "rejected";
        shop.reject_reason = rejectionReason;
        shop.updated_at = Date.now();
        await shop.save();

        // Gửi email thông báo từ chối
        try {
            // Tạo transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SERVICE_EMAIL,
                    pass: process.env.SERVICE_PASSWORD
                }
            });

            // Tạo nội dung email
            const mailOptions = {
                from: process.env.SERVICE_EMAIL,
                to: shop.email,
                subject: 'Cập nhật trạng thái đăng ký cửa hàng của bạn',
                html: `
                    <h1>Cập nhật trạng thái đăng ký cửa hàng</h1>
                    <p>Kính gửi ${shop.name},</p>
                    <p>Cảm ơn bạn đã quan tâm đến việc bán hàng trên nền tảng của chúng tôi. Rất tiếc, chúng tôi không thể phê duyệt đăng ký cửa hàng của bạn tại thời điểm này.</p>
                    <p><strong>Lý do từ chối:</strong> ${rejectionReason}</p>
                    <p>Thông tin cửa hàng:</p>
                    <ul>
                        <li><strong>Tên cửa hàng:</strong> ${shop.name}</li>
                        <li><strong>Tên đăng nhập:</strong> ${shop.username}</li>
                        <li><strong>Email:</strong> ${shop.email}</li>
                    </ul>
                    <p>Bạn có thể khắc phục các vấn đề đã nêu và gửi đơn đăng ký mới trong tương lai.</p>
                    <p>Nếu bạn có bất kỳ câu hỏi hoặc cần làm rõ thêm, vui lòng trả lời email này.</p>
                    <p>Trân trọng,<br>Đội ngũ Quản trị</p>
                `
            };

            // Gửi email
            await transporter.sendMail(mailOptions);
            console.log(`Email thông báo từ chối đã gửi đến ${shop.email}`);

        } catch (emailError) {
            // Ghi log lỗi nhưng không làm fail request
            console.error("Không thể gửi email thông báo từ chối:", emailError);
        }

        res.status(200).json({ message: "Từ chối cửa hàng", shop });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(createHttpError.BadRequest("ID cửa hàng không hợp lệ"));
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
        const field = req.body.field; // 'logo', 'image_cover', 'identity_card_image_front', 'identity_card_image_back', 'business_license'

        // Cập nhật để chấp nhận các trường mới
        const validFields = [
            'logo',
            'image_cover',
            'identity_card_image_front',
            'identity_card_image_back',
            'business_license'
        ];

        if (!field || !validFields.includes(field)) {
            throw createHttpError.BadRequest(`Invalid field specified. Must be one of: ${validFields.join(', ')}`);
        }

        const shop = await Shop.findById(shopId);
        if (!shop || shop.is_active === 0) {
            // Xóa file vừa upload nếu shop không tồn tại
            if (req.file.path) {
                await removeFile(req.file.path);
            }
            throw createHttpError.NotFound("Shop not found");
        }

        // Xóa file cũ trên Cloudinary nếu đã tồn tại
        if (shop[field] && shop[field].includes('cloudinary')) {
            await removeFile(shop[field]);
        }

        // Lấy URL đầy đủ từ Cloudinary
        const cloudinaryUrl = req.file.path;

        // Cập nhật shop với URL Cloudinary
        shop[field] = cloudinaryUrl;
        shop.updated_at = Date.now();
        await shop.save();

        res.status(200).json({
            message: "Image uploaded successfully",
            [field]: cloudinaryUrl
        });
    } catch (error) {
        // Xóa file vừa upload nếu có lỗi
        if (req.file && req.file.path) {
            await removeFile(req.file.path);
        }
        next(error);
    }
};

const unlockShop = async (req, res, next) => {
    try {
        // Use findById without checking is_active status
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            throw createHttpError.NotFound("Shop not found");
        }

        // Set is_active to 1 (unlocked)
        shop.is_active = 1;
        shop.updated_at = Date.now();
        await shop.save();

        res.status(200).json({
            message: "Shop unlocked successfully",
            shop
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(createHttpError.BadRequest("Invalid shop ID"));
        }
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
    uploadShopImage,
    unlockShop
};

module.exports = shopController;