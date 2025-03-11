const db = require("../models");
const ProductVariant = db.productVariant;
const Product = db.product;

// Lấy tất cả biến thể theo product (chỉ người bán hàng có quyền)
const getProductVariants = async (req, res, next) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Cấm truy cập' });
    }
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
      return res.status(404).json({ message: "Không tìm thấy biến thể" });
    }
    res.status(200).json(variant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo biến thể mới (chỉ người bán hàng có quyền)
const createProductVariant = async (req, res, next) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Cấm truy cập' });
    }
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
      return res.status(400).json({ message: "SKU đã tồn tại" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật biến thể (chỉ người bán hàng có quyền)
const updateProductVariant = async (req, res, next) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Cấm truy cập' });
    }
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
      return res.status(404).json({ message: "Không tìm thấy biến thể" });
    }
    await variant.save();
    res.status(200).json(variant, { message: "Cập nhật biến thể thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa biến thể (chỉ người bán hàng có quyền)
const deleteProductVariant = async (req, res, next) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Cấm truy cập' });
    }
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
      return res.status(404).json({ message: "Không tìm thấy biến thể" });
    }
    await variant.save();
    res.status(200).json({ message: "Xóa biến thể thành công" });
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
