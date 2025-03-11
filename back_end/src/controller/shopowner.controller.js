const db = require("../models")
const User = db.user;
const Role = db.role;
const ShopOwner = db.shopowner

const shopOwnerController = {
  // Lấy tất cả shop owners (chỉ người bán hàng có quyền)
  getAllShopOwners: async (req, res) => {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Cấm truy cập' });
      }
      const shopOwners = await ShopOwner.find();
      res.status(200).json(shopOwners);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy thông tin shop owner theo ID (chỉ người bán hàng có quyền)
  getShopOwnerById: async (req, res) => {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Cấm truy cập' });
      }
      const shopOwner = await ShopOwner.findById(req.params.id);
      if (!shopOwner) {
        return res.status(404).json({ message: 'Shop owner not found' });
      }
      res.status(200).json(shopOwner);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Tạo shop owner mới (chỉ người bán hàng có quyền)
  createShopOwner: async (req, res) => {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Cấm truy cập' });
      }
      const { name, email, password, shop_name, shop_description, shop_address, phone_number } = req.body;
      const shopOwner = new ShopOwner({
        name,
        email,
        password,
        shop_name,
        shop_description,
        shop_address,
        phone_number
      });
      await shopOwner.save();
      res.status(201).json(shopOwner);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật thông tin shop owner (chỉ người bán hàng có quyền)
  updateShopOwner: async (req, res) => {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Cấm truy cập' });
      }
      const { name, shop_name, shop_description, shop_address, phone_number } = req.body;
      const shopOwner = await ShopOwner.findByIdAndUpdate(
        req.params.id,
        {
          name,
          shop_name,
          shop_description,
          shop_address,
          phone_number,
          updated_at: Date.now()
        },
        { new: true }
      );
      if (!shopOwner) {
        return res.status(404).json({ message: 'Shop owner not found' });
      }
      res.status(200).json(shopOwner);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Xóa shop owner (chỉ người bán hàng có quyền)
  deleteShopOwner: async (req, res) => {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Cấm truy cập' });
      }
      const shopOwner = await ShopOwner.findByIdAndDelete(req.params.id);
      if (!shopOwner) {
        return res.status(404).json({ message: 'Shop owner not found' });
      }
      res.status(200).json({ message: 'Shop owner deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = shopOwnerController;
