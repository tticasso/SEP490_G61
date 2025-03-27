// upload.routes.js - Hỗ trợ cả upload sản phẩm và shop
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const VerifyJwt = require('../middlewares/verifyJwt');

const UploadRouter = express.Router();

// Đảm bảo thư mục tồn tại
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  return directory;
};

// Cấu hình storage cho hình ảnh sản phẩm
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = ensureDirectoryExists(path.join(__dirname, '../../uploads/products'));
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// Cấu hình storage cho hình ảnh shop
const shopStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = ensureDirectoryExists(path.join(__dirname, '../../uploads/shops'));
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Lấy loại ảnh từ request (logo, cover, identity, license)
    const imageType = req.body.type || 'general';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `shop-${imageType}-${uniqueSuffix}${ext}`);
  }
});

// Bộ lọc hình ảnh
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

// Cấu hình upload cho sản phẩm
const uploadProduct = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Cấu hình upload cho shop
const uploadShop = multer({
  storage: shopStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Endpoint tải lên hình ảnh sản phẩm
UploadRouter.post('/product-image', [VerifyJwt.verifyToken], (req, res) => {
  uploadProduct.single('image')(req, res, function(err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        message: 'Lỗi khi tải lên hình ảnh',
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Không có file nào được tải lên'
      });
    }

    // Đường dẫn tuyệt đối của file
    const filePath = req.file.path;
    
    // Đường dẫn tương đối để hiển thị/truy cập từ client
    const relativePath = filePath.split('uploads')[1]; // Lấy phần sau 'uploads'
    
    console.log("File path:", filePath);
    console.log("Relative path:", relativePath);
    
    res.status(200).json({
      url: '/uploads' + relativePath,  // Trả về đường dẫn tương đối
      message: 'Tải lên hình ảnh sản phẩm thành công'
    });
  });
});

// Endpoint tải lên hình ảnh shop
UploadRouter.post('/shop-image', [VerifyJwt.verifyToken], (req, res) => {
  uploadShop.single('image')(req, res, function(err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        message: 'Lỗi khi tải lên hình ảnh',
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Không có file nào được tải lên'
      });
    }

    // Đường dẫn tuyệt đối của file
    const filePath = req.file.path;
    
    // Đường dẫn tương đối để hiển thị/truy cập từ client
    const relativePath = filePath.split('uploads')[1]; // Lấy phần sau 'uploads'
    
    console.log("Shop image file path:", filePath);
    console.log("Shop image relative path:", relativePath);
    console.log("Image type:", req.body.type);
    
    res.status(200).json({
      url: '/uploads' + relativePath,  // Trả về đường dẫn tương đối
      message: 'Tải lên hình ảnh shop thành công'
    });
  });
});

module.exports = UploadRouter;