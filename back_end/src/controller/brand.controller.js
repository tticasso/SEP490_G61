const db = require("../models")
const Brand = db.brand
const Categories = db.categories

// Lấy tất cả thương hiệu (có kèm danh mục)
const getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find().populate('categories'); // Lấy chi tiết danh mục
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thương hiệu theo ID
const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id).populate('categories');
        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }
        res.status(200).json(brand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm thương hiệu mới
const createBrand = async (req, res) => {
    try {
        const { name, description, categories } = req.body;

        // Kiểm tra xem danh mục có tồn tại không
        const existingCategories = await Categories.find({ _id: { $in: categories } });
        if (existingCategories.length !== categories.length) {
            return res.status(400).json({ message: "One or more categories are invalid" });
        }

        const newBrand = new Brand({ name, description, categories });
        await newBrand.save();

        res.status(201).json(newBrand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật thương hiệu
const updateBrand = async (req, res) => {
    try {
        const { name, description, categories } = req.body;

        // Kiểm tra danh mục có hợp lệ không
        const existingCategories = await Categories.find({ _id: { $in: categories } });
        if (existingCategories.length !== categories.length) {
            return res.status(400).json({ message: "One or more categories are invalid" });
        }

        const updatedBrand = await Brand.findByIdAndUpdate(
            req.params.id,
            { name, description, categories, updated_at: Date.now() },
            { new: true }
        ).populate('categories');

        if (!updatedBrand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        res.status(200).json(updatedBrand);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa thương hiệu
const deleteBrand = async (req, res) => {
    try {
        const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
        if (!deletedBrand) {
            return res.status(404).json({ message: "Brand not found" });
        }
        res.status(200).json({ message: "Brand deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const brandController = {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
module.exports = brandController
