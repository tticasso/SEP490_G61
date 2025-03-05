const db = require("../models");
const Product = db.product;
const Category = db.categories;
const Brand = db.brand;

// Lấy tất cả sản phẩm (có kèm danh mục & thương hiệu)
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("category_id", "name")
            .populate("brand_id", "name");
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
            .populate("brand_id", "name");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm sản phẩm mới
const createProduct = async (req, res) => {
    try {
        const {
            category_id,
            brand_id,
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

        // Tạo sản phẩm mới
        const newProduct = new Product({
            category_id,
            brand_id,
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
        const { category_id, brand_id, name, slug, description, detail, price, thumbnail } = req.body;

        // Kiểm tra xem danh mục & thương hiệu có tồn tại không
        const categoryExists = await Category.findById(category_id);
        const brandExists = await Brand.findById(brand_id);
        if (!categoryExists) {
            return res.status(400).json({ message: "Invalid category ID" });
        }
        if (!brandExists) {
            return res.status(400).json({ message: "Invalid brand ID" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                category_id,
                brand_id,
                name,
                slug,
                description,
                detail,
                price,
                thumbnail,
                updated_at: Date.now()
            },
            { new: true }
        ).populate("category_id", "name").populate("brand_id", "name");

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const productController = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};

module.exports = productController;
