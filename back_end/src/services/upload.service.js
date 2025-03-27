// services/upload.service.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const isVercel = process.env.VERCEL === '1';
// Create upload directories if they don't exist
const createDirs = () => {
    const dirs = [
        './uploads',
        './uploads/products',
        './uploads/variants'
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// Khởi tạo thư mục
createDirs();

// Cấu hình lưu trữ cho hình ảnh sản phẩm
const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

// Cấu hình lưu trữ cho hình ảnh biến thể
const variantStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/variants/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'variant-' + uniqueSuffix + ext);
    }
});

// Bộ lọc file - chỉ chấp nhận file hình ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
    }
};

// Tạo instance upload cho sản phẩm (một hình ảnh)
// Đổi từ 'thumbnail' sang 'image' để khớp với frontend
const uploadProductImage = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: fileFilter
}).single('image');

// Tạo instance upload cho sản phẩm với trường 'thumbnail' (để tương thích ngược)
const uploadProductThumbnail = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: fileFilter
}).single('thumbnail');

// Tạo instance upload cho biến thể (nhiều hình ảnh)
const uploadVariantImages = multer({
    storage: variantStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: fileFilter
}).array('images', 5); // Tối đa 5 hình ảnh cho mỗi biến thể

// Hàm trợ giúp để xóa file cũ
const removeFile = (filePath) => {
    // Skip file deletion on Vercel
    if (isVercel) {
        console.log('Skipping file deletion on Vercel:', filePath);
        return;
    }

    // Check if filePath is a URL (not local file)
    if (filePath && filePath.startsWith('http')) {
        return; // Bỏ qua việc xóa URL từ xa
    }

    // Chỉ cố gắng xóa nếu filePath hợp lệ và tồn tại
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = {
    uploadProductImage,
    uploadProductThumbnail,
    uploadVariantImages,
    removeFile
};