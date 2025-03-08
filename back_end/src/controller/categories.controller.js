const db = require("../models")
const Categories = db.categories

// Lấy tất cả danh mục
const getAllCategories = async (req, res) => {
    try {
        const categories = await Categories.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh mục theo ID
const getCategoryById = async (req, res) => {
    try {
        const category = await Categories.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm danh mục mới
const createCategory = async (req, res) => {
    try {
        const { name, description , image } = req.body;
        const newCategory = new Categories({ name, description ,image });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedCategory = await Categories.findByIdAndUpdate(
            req.params.id,
            { name, description, updated_at: Date.now() },
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Categories.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const categoriesController = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
module.exports = categoriesController