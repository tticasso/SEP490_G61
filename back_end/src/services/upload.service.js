// services/upload.service.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: 'dv1abtnj5',
    api_key: '754815476927242',
    api_secret: "qknWjrBcEbsCpdWWUX2Ris8s2O8"
});

// Cấu hình lưu trữ cho hình ảnh sản phẩm
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'trooc/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, crop: 'limit' }], // Giới hạn kích thước
        resource_type: 'auto'
    }
});

// Cấu hình lưu trữ cho hình ảnh biến thể
const variantStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'trooc/variants',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, crop: 'limit' }], // Giới hạn kích thước
        resource_type: 'auto'
    }
});
const shopStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'trooc/shops',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1000, crop: 'limit' }],
      resource_type: 'auto'
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

const uploadShopImage = multer({
    storage: shopStorage,
    limits: {
      fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: fileFilter
  }).single('image');

// Hàm trợ giúp để xóa file từ Cloudinary
const removeFile = async (fileUrl) => {
    if (!fileUrl) return;

    try {
        // Nếu là URL Cloudinary
        if (fileUrl.includes('cloudinary')) {
            // Trích xuất public_id từ URL
            const splitUrl = fileUrl.split('/');
            const folderWithFilename = splitUrl.slice(splitUrl.indexOf('trooc')).join('/');
            const publicId = folderWithFilename.split('.')[0]; // Loại bỏ phần mở rộng

            // Xóa file từ Cloudinary
            await cloudinary.uploader.destroy(publicId);
            console.log(`Đã xóa file từ Cloudinary: ${publicId}`);
        }
        // Nếu là file cục bộ (cho tương thích ngược)
        else if (fileUrl.startsWith('/uploads/') && fs.existsSync('.' + fileUrl)) {
            fs.unlinkSync('.' + fileUrl);
            console.log(`Đã xóa file cục bộ: ${fileUrl}`);
        }
    } catch (error) {
        console.error('Lỗi khi xóa file:', error);
    }
};

module.exports = {
    uploadProductImage,
    uploadProductThumbnail,
    uploadVariantImages,
    removeFile,
    uploadShopImage,
    cloudinary // Export cloudinary để có thể sử dụng ở nơi khác nếu cần
};