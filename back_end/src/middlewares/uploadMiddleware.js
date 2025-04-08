const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createHttpError = require('http-errors');
const { 
  uploadShopImage: cloudinaryUploadShopImage, 
  uploadProductImage,
  uploadProductThumbnail,
  uploadVariantImages,
  removeFile 
} = require('../services/upload.service');

// Chỉ giữ lại các cấu hình local storage cho backwards compatibility
// và các trường hợp chưa chuyển sang Cloudinary

// Tạo thư mục nếu chưa tồn tại
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

// Cấu hình lưu trữ cục bộ cho giấy tờ
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = createDirectory(path.join(__dirname, '../uploads/documents'));
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.userId;
    const documentType = req.body.documentType || 'identity';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${documentType}-${userId}-${timestamp}-${randomString}${fileExt}`);
  }
});

// Bộ lọc file - chỉ chấp nhận các file hình ảnh phổ biến
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createHttpError.BadRequest('Only image files are allowed (JPEG, JPG, PNG, GIF, WEBP)'), false);
  }
};

// Bộ lọc file cho giấy tờ - chấp nhận ảnh và PDF
const documentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png',
    'application/pdf'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createHttpError.BadRequest('Only image files (JPEG, JPG, PNG) or PDF are allowed'), false);
  }
};

// Cấu hình multer cho upload giấy tờ
const uploadDocumentConfig = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Middleware cho upload một giấy tờ
const uploadDocument = (req, res, next) => {
  uploadDocumentConfig.single('document')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(createHttpError.BadRequest('File size exceeds limit (10MB)'));
      }
      return next(createHttpError.BadRequest(`Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

// Middleware cho upload nhiều giấy tờ cùng lúc
const uploadMultipleDocuments = (req, res, next) => {
  const upload = uploadDocumentConfig.fields([
    { name: 'identityCardImage', maxCount: 2 }, // CCCD/CMND (mặt trước & sau)
    { name: 'businessLicense', maxCount: 1 }    // Giấy phép kinh doanh
  ]);

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(createHttpError.BadRequest('File size exceeds limit (10MB)'));
      }
      return next(createHttpError.BadRequest(`Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

// Middleware cho upload ảnh shop sử dụng Cloudinary
const uploadShopImage = (req, res, next) => {
  cloudinaryUploadShopImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(createHttpError.BadRequest('File size exceeds limit (5MB)'));
      }
      return next(createHttpError.BadRequest(`Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

// Middleware cho upload ảnh sản phẩm sử dụng Cloudinary
const handleProductImageUpload = (req, res, next) => {
  uploadProductThumbnail(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(createHttpError.BadRequest('File size exceeds limit (5MB)'));
      }
      return next(createHttpError.BadRequest(`Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

// Middleware cho upload nhiều ảnh biến thể sản phẩm
const handleVariantImagesUpload = (req, res, next) => {
  uploadVariantImages(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(createHttpError.BadRequest('File size exceeds limit (5MB)'));
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return next(createHttpError.BadRequest('Too many files. Maximum is 5 images.'));
      }
      return next(createHttpError.BadRequest(`Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = {
  uploadDocument,
  uploadMultipleDocuments,
  uploadShopImage,
  handleProductImageUpload,
  handleVariantImagesUpload
};