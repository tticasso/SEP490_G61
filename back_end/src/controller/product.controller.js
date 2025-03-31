const db = require("../models");
const mongoose = require('mongoose');
const Product = db.product;
const Category = db.categories;
const Brand = db.brand;
const Shop = db.shop;
const { uploadProductThumbnail, removeFile } = require("../services/upload.service");

// Middleware to handle file upload for product
const handleProductImageUpload = (req, res, next) => {
    uploadProductThumbnail(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                message: "Tải lên hình ảnh thất bại",
                error: err.message
            });
        }
        // File đã được tải lên thành công, tiếp tục
        next();
    });
};

// Lấy tất cả sản phẩm (có kèm danh mục, thương hiệu & cửa hàng)
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("category_id", "name")
            .populate("brand_id", "name")
            .populate("shop_id", "name");
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category_id", "name")
            .populate("brand_id", "name")
            .populate("shop_id", "name");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function getProductsByUserId(req, res, next) {
    try {
        const { userId } = req.params;
        const products = await Product.find({
            created_by: userId,
            is_active: true,
            is_delete: false,
            is_hot: true,
            is_feature: true
        });
        res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}

// Lấy sản phẩm theo shop ID
const getProductsByShopId = async (req, res) => {
    try {
        const { shopId } = req.params;

        console.log(`Looking for products with shop_id: ${shopId}`);

        // First, try to find products where shop_id is stored as an ObjectId
        let products = [];
        if (mongoose.Types.ObjectId.isValid(shopId)) {
            const objectIdShopId = new mongoose.Types.ObjectId(shopId);
            products = await Product.find({
                shop_id: objectIdShopId,
                is_active: true,
                is_delete: false
            })
                .populate("category_id", "name")
                .populate("brand_id", "name");
        }

        // If no products found and shop_id might be stored as a string, try string comparison
        if (products.length === 0) {
            console.log("No products found with ObjectId, trying string comparison");
            products = await Product.find({
                shop_id: shopId, // Try with string value
                is_active: true,
                is_delete: false
            })
                .populate("category_id", "name")
                .populate("brand_id", "name");
        }

        console.log(`Found ${products.length} products for shop ${shopId}`);

        res.status(200).json(products);
    } catch (error) {
        console.error("Error in getProductsByShopId:", error);
        res.status(500).json({ message: error.message });
    }
};

// Thêm sản phẩm mới
const createProduct = async (req, res) => {
    try {
        const {
            category_id,
            brand_id,
            shop_id,
            name,
            slug,
            description,
            detail,
            price,
            meta_title,
            meta_keyword,
            meta_description,
            weight,
            condition,
            sold,
            is_hot,
            is_feature,
            is_delete,
            is_active,
            created_by,
            updated_by,
            thumbnail
        } = req.body;

        console.log("Received request body:", req.body);


        // Sử dụng URL Cloudinary từ request.file.path
        // Lưu ý: Trong trường hợp upload qua middleware Cloudinary, file.path sẽ chứa URL đầy đủ
        const cloudinaryThumbnail = req.file ? req.file.path : thumbnail;

        // Kiểm tra xem danh mục và thương hiệu có tồn tại không
        const categoryExists = await Category.find({ _id: { $in: category_id } });
        if (categoryExists.length !== category_id.length) {
            // Nếu upload thất bại, xóa file đã upload
            if (cloudinaryThumbnail && req.file) removeFile(cloudinaryThumbnail);
            return res.status(400).json({ message: "One or more category IDs are invalid" });
        }

        const brandExists = await Brand.findById(brand_id);
        if (!brandExists) {
            if (cloudinaryThumbnail && req.file) removeFile(cloudinaryThumbnail);
            return res.status(400).json({ message: "Invalid brand ID" });
        }

        // Kiểm tra xem cửa hàng có tồn tại không
        const shopExists = await Shop.findById(shop_id);
        if (!shopExists) {
            if (cloudinaryThumbnail && req.file) removeFile(cloudinaryThumbnail);
            return res.status(400).json({ message: "Invalid shop ID" });
        }

        // Kiểm tra xem người dùng có quyền với cửa hàng này không
        if (req.userId && shopExists.user_id.toString() !== req.userId.toString() && !req.isAdmin) {
            if (cloudinaryThumbnail && req.file) removeFile(cloudinaryThumbnail);
            return res.status(403).json({ message: "You don't have permission to add products to this shop" });
        }

        // Tạo sản phẩm mới
        const newProduct = new Product({
            category_id,
            brand_id,
            shop_id,
            name,
            slug,
            description,
            detail,
            price,
            thumbnail: cloudinaryThumbnail, // Lưu URL Cloudinary
            meta_title,
            meta_keyword,
            meta_description,
            weight,
            condition,
            sold,
            is_hot,
            is_feature,
            is_delete,
            is_active,
            created_at: Date.now(),
            updated_at: Date.now(),
            created_by,
            updated_by
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        // Nếu có lỗi, xóa bất kỳ file đã upload
        if (req.file) {
            removeFile(req.file.path);
        }
        res.status(500).json({ message: error.message });
    }
};

// Xóa mềm sản phẩm (đưa vào thùng rác)
const softDeleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Kiểm tra quyền xóa (chỉ chủ shop hoặc admin)
        const shop = await Shop.findById(product.shop_id);

        // Kiểm tra nếu shop không tồn tại hoặc không có user_id
        if (!shop) {
            return res.status(404).json({ message: "Shop not found for this product" });
        }

        if (!shop.user_id) {
            return res.status(400).json({ message: "Shop owner information is missing" });
        }

        // Nếu người dùng là admin, cho phép thao tác
        if (req.isAdmin) {
            product.is_delete = true;
            product.updated_at = Date.now();
            if (req.userId) {
                product.updated_by = req.userId;
            }

            await product.save();
            return res.status(200).json({ message: "Product moved to trash successfully", product });
        }

        // Kiểm tra quyền (nếu không phải admin)
        if (shop.user_id.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "You don't have permission to modify this product" });
        }

        // Cập nhật trạng thái is_delete
        product.is_delete = true;
        product.updated_at = Date.now();
        if (req.userId) {
            product.updated_by = req.userId;
        }

        await product.save();
        res.status(200).json({ message: "Product moved to trash successfully", product });
    } catch (error) {
        console.error("Soft delete error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Khôi phục sản phẩm từ thùng rác
const restoreProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Kiểm tra quyền khôi phục (chỉ chủ shop hoặc admin)
        const shop = await Shop.findById(product.shop_id);

        // Kiểm tra nếu shop không tồn tại
        if (!shop) {
            return res.status(404).json({ message: "Shop not found for this product" });
        }

        // Kiểm tra quyền (nếu là admin thì bỏ qua kiểm tra)
        if (!req.isAdmin && shop.user_id.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "You don't have permission to modify this product" });
        }

        // Cập nhật trạng thái is_delete
        product.is_delete = false;
        product.updated_at = Date.now();
        if (req.userId) {
            product.updated_by = req.userId;
        }

        await product.save();
        res.status(200).json({ message: "Product restored successfully", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bulk soft delete products
const bulkSoftDeleteProducts = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: "No product IDs provided" });
        }

        const results = [];
        const errors = [];

        // Process products one by one to validate permissions
        for (const productId of productIds) {
            try {
                const product = await Product.findById(productId);
                if (!product) {
                    errors.push({ id: productId, error: "Product not found" });
                    continue;
                }

                // Kiểm tra quyền
                const shop = await Shop.findById(product.shop_id);
                if (!shop) {
                    errors.push({ id: productId, error: "Shop not found" });
                    continue;
                }

                // Nếu không phải admin và không phải chủ shop thì không có quyền
                if (!req.isAdmin && shop.user_id.toString() !== req.userId.toString()) {
                    errors.push({ id: productId, error: "Permission denied" });
                    continue;
                }

                // Cập nhật sản phẩm
                product.is_delete = true;
                product.updated_at = Date.now();
                if (req.userId) {
                    product.updated_by = req.userId;
                }

                await product.save();
                results.push(productId);
            } catch (error) {
                errors.push({ id: productId, error: error.message });
            }
        }

        res.status(200).json({
            message: `Processed ${results.length} products successfully`,
            success: results,
            errors: errors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bulk restore products
const bulkRestoreProducts = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: "No product IDs provided" });
        }

        const results = [];
        const errors = [];

        // Process products one by one to validate permissions
        for (const productId of productIds) {
            try {
                const product = await Product.findById(productId);
                if (!product) {
                    errors.push({ id: productId, error: "Product not found" });
                    continue;
                }

                // Kiểm tra quyền
                const shop = await Shop.findById(product.shop_id);
                if (!shop) {
                    errors.push({ id: productId, error: "Shop not found" });
                    continue;
                }

                // Nếu không phải admin và không phải chủ shop thì không có quyền
                if (!req.isAdmin && shop.user_id.toString() !== req.userId.toString()) {
                    errors.push({ id: productId, error: "Permission denied" });
                    continue;
                }

                // Cập nhật sản phẩm
                product.is_delete = false;
                product.updated_at = Date.now();
                if (req.userId) {
                    product.updated_by = req.userId;
                }

                await product.save();
                results.push(productId);
            } catch (error) {
                errors.push({ id: productId, error: error.message });
            }
        }

        res.status(200).json({
            message: `Processed ${results.length} products successfully`,
            success: results,
            errors: errors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
    try {
        const {
            category_id,
            brand_id,
            shop_id,
            name,
            slug,
            description,
            detail,
            price,
            meta_title,
            meta_keyword,
            meta_description
        } = req.body;

        // Lấy thumbnail từ file upload nếu tồn tại (URL Cloudinary)
        const newThumbnail = req.file ? req.file.path : null;

        // Lấy thông tin sản phẩm hiện tại
        const currentProduct = await Product.findById(req.params.id);
        if (!currentProduct) {
            if (newThumbnail) removeFile(newThumbnail);
            return res.status(404).json({ message: "Product not found" });
        }

        // Kiểm tra quyền cập nhật (chỉ chủ shop hoặc admin)
        const shopToCheck = shop_id || currentProduct.shop_id;
        const shop = await Shop.findById(shopToCheck);

        if (req.userId && shop.user_id.toString() !== req.userId.toString() && !req.isAdmin) {
            if (newThumbnail) removeFile(newThumbnail);
            return res.status(403).json({ message: "You don't have permission to update this product" });
        }

        // Kiểm tra xem danh mục & thương hiệu có tồn tại không
        if (category_id) {
            const categoryExists = await Category.find({ _id: { $in: category_id } });
            if (categoryExists.length !== category_id.length) {
                if (newThumbnail) removeFile(newThumbnail);
                return res.status(400).json({ message: "One or more category IDs are invalid" });
            }
        }

        if (brand_id) {
            const brandExists = await Brand.findById(brand_id);
            if (!brandExists) {
                if (newThumbnail) removeFile(newThumbnail);
                return res.status(400).json({ message: "Invalid brand ID" });
            }
        }

        // Kiểm tra shop mới nếu có thay đổi
        if (shop_id && shop_id !== currentProduct.shop_id.toString()) {
            const shopExists = await Shop.findById(shop_id);
            if (!shopExists) {
                if (newThumbnail) removeFile(newThumbnail);
                return res.status(400).json({ message: "Invalid shop ID" });
            }

            // Chỉ admin mới được chuyển sản phẩm sang shop khác
            if (!req.isAdmin) {
                if (newThumbnail) removeFile(newThumbnail);
                return res.status(403).json({ message: "Only admin can transfer products between shops" });
            }
        }

        // Nếu có thumbnail mới, xóa thumbnail cũ trên Cloudinary
        if (newThumbnail && currentProduct.thumbnail) {
            await removeFile(currentProduct.thumbnail);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ...(category_id && { category_id }),
                ...(brand_id && { brand_id }),
                ...(shop_id && { shop_id }),
                ...(name && { name }),
                ...(slug && { slug }),
                ...(description && { description }),
                ...(detail && { detail }),
                ...(price && { price }),
                ...(newThumbnail && { thumbnail: newThumbnail }), // Cập nhật URL thumbnail từ Cloudinary
                ...(meta_title && { meta_title }),
                ...(meta_keyword && { meta_keyword }),
                ...(meta_description && { meta_description }),
                updated_at: Date.now(),
                ...(req.userId && { updated_by: req.userId })
            },
            { new: true }
        )
            .populate("category_id", "name")
            .populate("brand_id", "name")
            .populate("shop_id", "name");

        res.status(200).json(updatedProduct);
    } catch (error) {
        // Nếu có lỗi, xóa bất kỳ file đã upload
        if (req.file) {
            removeFile(req.file.path);
        }
        res.status(500).json({ message: error.message });
    }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Kiểm tra quyền xóa (chỉ chủ shop hoặc admin)
        const shop = await Shop.findById(product.shop_id);
        if (req.userId && shop.user_id.toString() !== req.userId.toString() && !req.isAdmin) {
            return res.status(403).json({ message: "You don't have permission to delete this product" });
        }

        // Xóa file thumbnail từ Cloudinary nếu tồn tại
        if (product.thumbnail) {
            await removeFile(product.thumbnail);
        }

        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductWithVariants = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate("category_id", "name")
            .populate("brand_id", "name")
            .populate("shop_id", "name");

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Get variants
        const variants = await db.productVariant.find({
            product_id: id,
            is_delete: false
        });

        res.status(200).json({
            product,
            variants
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Toggle product status (active/inactive)
const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined) {
            return res.status(400).json({ message: "is_active status is required" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check permissions (only shop owner or admin)
        const shop = await Shop.findById(product.shop_id);
        if (!shop) {
            return res.status(404).json({ message: "Shop not found for this product" });
        }

        if (!req.isAdmin && shop.user_id.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "You don't have permission to update this product" });
        }

        // Update the product status
        product.is_active = is_active;
        product.updated_at = Date.now();
        if (req.userId) {
            product.updated_by = req.userId;
        }

        await product.save();

        res.status(200).json({
            message: `Product status updated to ${is_active ? 'active' : 'inactive'}`,
            product
        });
    } catch (error) {
        console.error("Error toggling product status:", error);
        res.status(500).json({ message: error.message });
    }
};
const productController = {
    getAllProducts,
    getProductById,
    getProductsByShopId,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByUserId,
    getProductWithVariants,
    softDeleteProduct,
    restoreProduct,
    bulkSoftDeleteProducts,
    bulkRestoreProducts,
    toggleProductStatus,
    handleProductImageUpload // Export the middleware for routes
};

module.exports = productController;