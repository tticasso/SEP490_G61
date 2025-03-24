const db = require("../models");
const mongoose = require('mongoose');
const ProductVariant = db.productVariant;
const Product = db.product;
const Shop = db.shop;
const { uploadVariantImages, removeFile } = require("../services/upload.service");

// Middleware to handle file upload for variant images
const handleVariantImagesUpload = (req, res, next) => {
    uploadVariantImages(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                message: "Images upload failed",
                error: err.message
            });
        }
        // Files uploaded successfully, continue
        next();
    });
};

// Lấy tất cả biến thể của sản phẩm
const getVariantsByProductId = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const variants = await ProductVariant.find({
            product_id: productId,
            is_delete: false
        });

        res.status(200).json(variants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy biến thể theo ID
const getVariantById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid variant ID format" });
        }

        const variant = await ProductVariant.findById(id);

        if (!variant || variant.is_delete) {
            return res.status(404).json({ message: "Variant not found" });
        }

        res.status(200).json(variant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo biến thể mới
const createVariant = async (req, res) => {
    try {
        const {
            product_id,
            name,
            price,
            stock,
            attributes,
            is_default,
            sku
        } = req.body;

        // Parse attributes if sent as JSON string
        let parsedAttributes = attributes;
        if (typeof attributes === 'string') {
            try {
                parsedAttributes = JSON.parse(attributes);
            } catch (e) {
                return res.status(400).json({ message: "Invalid attributes format" });
            }
        }

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(product_id);
        if (!product || product.is_delete) {
            // Clean up uploaded files if any
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => removeFile(file.path));
            }
            return res.status(404).json({ message: "Product not found" });
        }

        // Kiểm tra quyền (chỉ chủ shop hoặc admin)
        const shop = await Shop.findById(product.shop_id);
        if (req.userId && shop.user_id.toString() !== req.userId.toString() && !req.isAdmin) {
            // Clean up uploaded files if any
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => removeFile(file.path));
            }
            return res.status(403).json({ message: "You don't have permission to add variants to this product" });
        }

        // Nếu đây là biến thể mặc định, đổi tất cả các biến thể khác thành không mặc định
        if (is_default) {
            await ProductVariant.updateMany(
                { product_id, is_default: true },
                { is_default: false }
            );
        }

        // Tạo SKU nếu không được cung cấp
        const generatedSku = sku || generateSku(product.name, parsedAttributes);

        // Get image paths from uploaded files
        const imagePaths = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];

        // Tạo biến thể mới
        const newVariant = new ProductVariant({
            product_id,
            name,
            price,
            stock,
            sku: generatedSku,
            attributes: new Map(Object.entries(parsedAttributes || {})),
            images: imagePaths, // Save the file paths
            is_default: is_default || false,
        });

        await newVariant.save();

        res.status(201).json(newVariant);
    } catch (error) {
        // Clean up uploaded files if any
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => removeFile(file.path));
        }
        res.status(500).json({ message: error.message });
    }
};

// Helper function to generate a SKU
function generateSku(productName, attributes) {
    // Create a base from product name (first 2 characters)
    const base = productName.replace(/\s+/g, '').substring(0, 2).toUpperCase();

    // Get attributes if they exist
    let attributePart = '';
    if (attributes) {
        if (attributes.color) {
            attributePart += attributes.color.substring(0, 3).toUpperCase();
        }
        if (attributes.size) {
            attributePart += '-' + attributes.size;
        }
    }

    // Add a timestamp for uniqueness
    const timestamp = Date.now().toString().slice(-6);

    return `${base}-${attributePart}-${timestamp}`;
}

// Cập nhật biến thể
const updateVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            price,
            stock,
            attributes,
            is_default,
            is_active
        } = req.body;

        // Parse attributes if sent as JSON string
        let parsedAttributes = attributes;
        if (typeof attributes === 'string') {
            try {
                parsedAttributes = JSON.parse(attributes);
            } catch (e) {
                // Clean up uploaded files if any
                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => removeFile(file.path));
                }
                return res.status(400).json({ message: "Invalid attributes format" });
            }
        }

        // Tìm biến thể hiện tại
        const variant = await ProductVariant.findById(id);
        if (!variant || variant.is_delete) {
            // Clean up uploaded files if any
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => removeFile(file.path));
            }
            return res.status(404).json({ message: "Variant not found" });
        }

        // Kiểm tra quyền (chỉ chủ shop hoặc admin)
        const product = await Product.findById(variant.product_id);
        const shop = await Shop.findById(product.shop_id);

        if (req.userId && shop.user_id.toString() !== req.userId.toString() && !req.isAdmin) {
            // Clean up uploaded files if any
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => removeFile(file.path));
            }
            return res.status(403).json({ message: "You don't have permission to update this variant" });
        }

        // Nếu đặt là biến thể mặc định, đổi tất cả các biến thể khác thành không mặc định
        if (is_default) {
            await ProductVariant.updateMany(
                { product_id: variant.product_id, is_default: true, _id: { $ne: id } },
                { is_default: false }
            );
        }

        // Get image paths from uploaded files
        let newImages = [];
        if (req.files && req.files.length > 0) {
            newImages = req.files.map(file => file.path.replace(/\\/g, '/'));

            // Delete old images if new ones are uploaded
            if (variant.images && variant.images.length > 0) {
                variant.images.forEach(imagePath => removeFile(imagePath));
            }
        }

        // If we have new images, use them, otherwise keep the existing ones
        const images = newImages.length > 0 ? newImages : variant.images;

        // Cập nhật biến thể
        const updatedVariant = await ProductVariant.findByIdAndUpdate(
            id,
            {
                ...(name && { name }),
                ...(price && { price }),
                ...(stock !== undefined && { stock }),
                ...(parsedAttributes && { attributes: new Map(Object.entries(parsedAttributes)) }),
                ...(newImages.length > 0 && { images }),
                ...(is_default !== undefined && { is_default }),
                ...(is_active !== undefined && { is_active }),
                updated_at: Date.now()
            },
            { new: true }
        );

        res.status(200).json(updatedVariant);
    } catch (error) {
        // Clean up uploaded files if any
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => removeFile(file.path));
        }
        res.status(500).json({ message: error.message });
    }
};

// Xóa biến thể (xóa mềm)
const deleteVariant = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm biến thể hiện tại
        const variant = await ProductVariant.findById(id);
        if (!variant || variant.is_delete) {
            return res.status(404).json({ message: "Variant not found" });
        }

        // Kiểm tra quyền (chỉ chủ shop hoặc admin)
        const product = await Product.findById(variant.product_id);
        const shop = await Shop.findById(product.shop_id);

        if (req.userId && shop.user_id.toString() !== req.userId.toString() && !req.isAdmin) {
            return res.status(403).json({ message: "You don't have permission to delete this variant" });
        }

        // Không cho phép xóa biến thể mặc định nếu có nhiều biến thể
        if (variant.is_default) {
            const variantCount = await ProductVariant.countDocuments({
                product_id: variant.product_id,
                is_delete: false
            });

            if (variantCount > 1) {
                return res.status(400).json({
                    message: "Cannot delete default variant. Please set another variant as default first."
                });
            }
        }

        // Xóa mềm
        variant.is_delete = true;
        await variant.save();

        res.status(200).json({ message: "Variant deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật tồn kho biến thể
const updateVariantStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined || stock < 0) {
            return res.status(400).json({ message: "Invalid stock value" });
        }

        // Tìm biến thể hiện tại
        const variant = await ProductVariant.findById(id);
        if (!variant || variant.is_delete) {
            return res.status(404).json({ message: "Variant not found" });
        }

        // Kiểm tra quyền (chỉ chủ shop hoặc admin)
        const product = await Product.findById(variant.product_id);
        const shop = await Shop.findById(product.shop_id);

        if (req.userId && shop.user_id.toString() !== req.userId.toString() && !req.isAdmin) {
            return res.status(403).json({ message: "You don't have permission to update this variant" });
        }

        // Cập nhật tồn kho
        variant.stock = stock;
        variant.updated_at = Date.now();
        await variant.save();

        res.status(200).json(variant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đổi biến thể mặc định
const setDefaultVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.params;

        // Kiểm tra biến thể có tồn tại không
        const variant = await ProductVariant.findById(variantId);
        if (!variant || variant.is_delete || variant.product_id.toString() !== productId) {
            return res.status(404).json({ message: "Variant not found for this product" });
        }

        // Kiểm tra quyền (chỉ chủ shop hoặc admin)
        const product = await Product.findById(productId);
        const shop = await Shop.findById(product.shop_id);

        if (req.userId && shop.user_id.toString() !== req.userId.toString() && !req.isAdmin) {
            return res.status(403).json({ message: "You don't have permission to update this product" });
        }

        // Đổi tất cả biến thể thành không mặc định
        await ProductVariant.updateMany(
            { product_id: productId },
            { is_default: false }
        );

        // Đặt biến thể hiện tại thành mặc định
        variant.is_default = true;
        variant.updated_at = Date.now();
        await variant.save();

        res.status(200).json({ message: "Default variant updated successfully", variant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const productVariantController = {
    getVariantsByProductId,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    updateVariantStock,
    setDefaultVariant,
    handleVariantImagesUpload // Export the middleware for routes
};

module.exports = productVariantController;