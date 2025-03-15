const db = require("../models");
const mongoose = require('mongoose');
const Product = db.product;
const Category = db.categories;
const Brand = db.brand;
const Shop = db.shop;

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
            thumbnail,
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
            updated_by
        } = req.body;

        // Kiểm tra xem danh mục và thương hiệu có tồn tại không
        const categoryExists = await Category.find({ _id: { $in: category_id } });
        if (categoryExists.length !== category_id.length) {
            return res.status(400).json({ message: "One or more category IDs are invalid" });
        }

        const brandExists = await Brand.findById(brand_id);
        if (!brandExists) {
            return res.status(400).json({ message: "Invalid brand ID" });
        }

        // Kiểm tra xem cửa hàng có tồn tại không
        const shopExists = await Shop.findById(shop_id);
        if (!shopExists) {
            return res.status(400).json({ message: "Invalid shop ID" });
        }

        // Kiểm tra xem người dùng có quyền với cửa hàng này không
        if (req.userId && shopExists.user_id.toString() !== req.userId.toString() && !req.isAdmin) {
            return res.status(403).json({ message: "You don't have permission to add products to this shop" });
        }

        // Tạo sản phẩm mới
        const newProduct = new Product({
            category_id,
            brand_id,
            shop_id, // Add shop_id to the new product
            name,
            slug,
            description,
            detail,
            price,
            thumbnail,
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
            thumbnail 
        } = req.body;

        // Lấy thông tin sản phẩm hiện tại
        const currentProduct = await Product.findById(req.params.id);
        if (!currentProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Kiểm tra quyền cập nhật (chỉ chủ shop hoặc admin)
        const shopToCheck = shop_id || currentProduct.shop_id;
        const shop = await Shop.findById(shopToCheck);
        
        if (req.userId && shop.user_id.toString() !== req.userId.toString() && !req.isAdmin) {
            return res.status(403).json({ message: "You don't have permission to update this product" });
        }

        // Kiểm tra xem danh mục & thương hiệu có tồn tại không
        if (category_id) {
            const categoryExists = await Category.find({ _id: { $in: category_id } });
            if (categoryExists.length !== category_id.length) {
                return res.status(400).json({ message: "One or more category IDs are invalid" });
            }
        }

        if (brand_id) {
            const brandExists = await Brand.findById(brand_id);
            if (!brandExists) {
                return res.status(400).json({ message: "Invalid brand ID" });
            }
        }

        // Kiểm tra shop mới nếu có thay đổi
        if (shop_id && shop_id !== currentProduct.shop_id.toString()) {
            const shopExists = await Shop.findById(shop_id);
            if (!shopExists) {
                return res.status(400).json({ message: "Invalid shop ID" });
            }

            // Chỉ admin mới được chuyển sản phẩm sang shop khác
            if (!req.isAdmin) {
                return res.status(403).json({ message: "Only admin can transfer products between shops" });
            }
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
                ...(thumbnail && { thumbnail }),
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

        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
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
    getProductsByUserId
};

module.exports = productController;