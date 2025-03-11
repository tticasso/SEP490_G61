const db = require("../models");
const Payment = db.payment;

// Lấy tất cả phương thức thanh toán
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ is_delete: false });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy phương thức thanh toán theo ID
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.is_delete) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo phương thức thanh toán mới
const createPayment = async (req, res) => {
    try {
        const { name } = req.body;

        // Kiểm tra xem phương thức thanh toán đã tồn tại chưa
        const existingPayment = await Payment.findOne({ name, is_delete: false });
        if (existingPayment) {
            return res.status(400).json({ message: "Payment method already exists" });
        }

        // Tạo ID cho phương thức thanh toán
        const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Tạo phương thức thanh toán mới
        const newPayment = new Payment({
            id: paymentId,
            name
        });

        const savedPayment = await newPayment.save();
        res.status(201).json(savedPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật phương thức thanh toán
const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Kiểm tra xem phương thức thanh toán đã tồn tại chưa
        if (name) {
            const existingPayment = await Payment.findOne({
                name,
                _id: { $ne: id },
                is_delete: false
            });

            if (existingPayment) {
                return res.status(400).json({ message: "Payment method already exists" });
            }
        }

        // Cập nhật thông tin
        const updateData = {
            ...req.body,
            updated_at: new Date()
        };

        const updatedPayment = await Payment.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedPayment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json(updatedPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa phương thức thanh toán (soft delete)
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Xóa mềm
        payment.is_delete = true;
        payment.is_active = false;
        await payment.save();

        res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kích hoạt/vô hiệu hóa phương thức thanh toán
const togglePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.is_delete) {
            return res.status(400).json({ message: "Cannot toggle status of deleted payment" });
        }

        payment.is_active = !payment.is_active;
        payment.updated_at = new Date();
        await payment.save();

        const status = payment.is_active ? "activated" : "deactivated";
        res.status(200).json({ message: `Payment ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const paymentController = {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    togglePaymentStatus
};

module.exports = paymentController;