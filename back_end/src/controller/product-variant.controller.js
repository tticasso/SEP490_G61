const db = require("../models");
const ProductVariant = db.productVariant;
const Product = db.product;

// Lấy tất cả biến thể theo product
const getProductVariants = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variants = await ProductVariant.find({ product_id: productId });
    res.status(200).json(variants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy biến thể theo ID
const getProductVariantById = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    res.status(200).json(variant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo biến thể mới
const createProductVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { sku, color, size, quantity, price } = req.body;
    const variant = new ProductVariant({
      product_id: productId,
      sku,
      color,
      size,
      quantity,
      price,
      created_by: req.user.id,
    });
    await variant.save();
    res.status(201).json(variant);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "SKU already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật biến thể
const updateProductVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { color, size, quantity, price, is_active } = req.body;
    const variant = await ProductVariant.findByIdAndUpdate(
      variantId,
      {
        color,
        size,
        quantity,
        price,
        is_active,
        updated_at: Date.now(),
        updated_by: req.user.id,
      },
      { new: true }
    );
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    await variant.save();
    res.status(200).json(variant , { message: "Variant updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa biến thể
const deleteProductVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const variant = await ProductVariant.findByIdAndUpdate(
      variantId,
      {
        is_delete: true,
        updated_at: Date.now(),
        updated_by: req.user.id,
      },
      { new: true }
    );
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    await variant.save();
    res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const productVariantController = {
  getProductVariants,
  getProductVariantById,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
};

module.exports = productVariantController;
