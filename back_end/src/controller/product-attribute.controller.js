const db = require("../models");
const ProductAttribute = db.productAttribute;

// Lấy tất cả thuộc tính sản phẩm
const getAllAttributes = async (req, res) => {
    try {
        const attributes = await ProductAttribute.find({ is_delete: false });
        res.status(200).json(attributes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thuộc tính theo ID
const getAttributeById = async (req, res) => {
    try {
        const attribute = await ProductAttribute.findById(req.params.id);

        if (!attribute || attribute.is_delete) {
            return res.status(404).json({ message: "Attribute not found" });
        }

        res.status(200).json(attribute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo thuộc tính mới
const createAttribute = async (req, res) => {
    try {
        const { name, display_name, values } = req.body;

        // Kiểm tra tên thuộc tính đã tồn tại chưa
        const existingAttribute = await ProductAttribute.findOne({
            name: name.toLowerCase(),
            is_delete: false
        });

        if (existingAttribute) {
            return res.status(400).json({ message: "Attribute name already exists" });
        }

        // Tạo mới thuộc tính
        const newAttribute = new ProductAttribute({
            name: name.toLowerCase(),
            display_name,
            values: values || []
        });

        await newAttribute.save();
        res.status(201).json(newAttribute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật thuộc tính
const updateAttribute = async (req, res) => {
    try {
        const { id } = req.params;
        const { display_name, values, is_active } = req.body;

        const attribute = await ProductAttribute.findById(id);

        if (!attribute || attribute.is_delete) {
            return res.status(404).json({ message: "Attribute not found" });
        }

        // Cập nhật thuộc tính
        const updatedAttribute = await ProductAttribute.findByIdAndUpdate(
            id,
            {
                ...(display_name && { display_name }),
                ...(values && { values }),
                ...(is_active !== undefined && { is_active }),
                updated_at: Date.now()
            },
            { new: true }
        );

        res.status(200).json(updatedAttribute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm giá trị vào thuộc tính
const addAttributeValue = async (req, res) => {
    try {
        const { id } = req.params;
        const { value, display_value } = req.body;

        if (!value || !display_value) {
            return res.status(400).json({ message: "Value and display value are required" });
        }

        const attribute = await ProductAttribute.findById(id);

        if (!attribute || attribute.is_delete) {
            return res.status(404).json({ message: "Attribute not found" });
        }

        // Kiểm tra giá trị đã tồn tại chưa
        const valueExists = attribute.values.some(v => v.value === value);
        if (valueExists) {
            return res.status(400).json({ message: "Value already exists in this attribute" });
        }

        // Thêm giá trị mới
        attribute.values.push({ value, display_value });
        attribute.updated_at = Date.now();

        await attribute.save();
        res.status(200).json(attribute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa giá trị khỏi thuộc tính
const removeAttributeValue = async (req, res) => {
    try {
        const { id, value } = req.params;

        const attribute = await ProductAttribute.findById(id);

        if (!attribute || attribute.is_delete) {
            return res.status(404).json({ message: "Attribute not found" });
        }

        // Xóa giá trị khỏi mảng
        const initialLength = attribute.values.length;
        attribute.values = attribute.values.filter(v => v.value !== value);

        if (initialLength === attribute.values.length) {
            return res.status(404).json({ message: "Value not found in this attribute" });
        }

        attribute.updated_at = Date.now();
        await attribute.save();

        res.status(200).json(attribute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa thuộc tính (xóa mềm)
const deleteAttribute = async (req, res) => {
    try {
        const { id } = req.params;

        const attribute = await ProductAttribute.findById(id);

        if (!attribute || attribute.is_delete) {
            return res.status(404).json({ message: "Attribute not found" });
        }

        // Xóa mềm
        attribute.is_delete = true;
        await attribute.save();

        res.status(200).json({ message: "Attribute deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const productAttributeController = {
    getAllAttributes,
    getAttributeById,
    createAttribute,
    updateAttribute,
    addAttributeValue,
    removeAttributeValue,
    deleteAttribute
};

module.exports = productAttributeController;