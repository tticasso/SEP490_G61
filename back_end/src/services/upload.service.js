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

// Initialize directories
createDirs();

// Configure storage for product images
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

// Configure storage for variant images
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

// File filter - only accept image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create upload instance for product (single image)
const uploadProductImage = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
}).single('thumbnail');

// Create upload instance for variant (multiple images)
const uploadVariantImages = multer({
    storage: variantStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
}).array('images', 5); // Maximum 5 images per variant

// Helper to remove old file
const removeFile = (filePath) => {
    // Skip file deletion on Vercel
    if (isVercel) {
        console.log('Skipping file deletion on Vercel:', filePath);
        return;
    }

    // Check if filePath is a URL (not local file)
    if (filePath && filePath.startsWith('http')) {
        return; // Skip deleting remote URLs
    }

    // Only attempt to delete if filePath is valid and exists
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = {
    uploadProductImage,
    uploadVariantImages,
    removeFile
};