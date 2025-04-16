const db = require("../models")
const BankAccount = db.bankAccount
const Shop = db.shop

// Lấy tất cả tài khoản ngân hàng của một shop
const getShopBankAccounts = async (req, res) => {
    try {
        const shopId = req.params.shopId;
        const bankAccounts = await BankAccount.find({ shop_id: shopId });
        res.status(200).json(bankAccounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy tài khoản ngân hàng theo ID
const getBankAccountById = async (req, res) => {
    try {
        const bankAccount = await BankAccount.findById(req.params.id);
        if (!bankAccount) {
            return res.status(404).json({ message: "Bank account not found" });
        }
        res.status(200).json(bankAccount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm tài khoản ngân hàng mới
const createBankAccount = async (req, res) => {
    try {
        const { shop_id, bank_name, account_number, account_holder, branch, is_default } = req.body;

        // Kiểm tra xem shop có tồn tại không
        const shop = await Shop.findById(shop_id);
        if (!shop) {
            return res.status(400).json({ message: "Shop not found" });
        }

        // Nếu tài khoản mới được đánh dấu là mặc định
        if (is_default) {
            // Cập nhật tất cả tài khoản hiện có của shop này thành không mặc định
            await BankAccount.updateMany(
                { shop_id: shop_id },
                { is_default: false }
            );
        }

        const newBankAccount = new BankAccount({
            shop_id,
            bank_name,
            account_number,
            account_holder,
            branch,
            is_default: is_default || false
        });

        await newBankAccount.save();
        res.status(201).json(newBankAccount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật tài khoản ngân hàng
const updateBankAccount = async (req, res) => {
    try {
        const { bank_name, account_number, account_holder, branch, is_default } = req.body;
        const bankAccountId = req.params.id;

        // Lấy thông tin tài khoản hiện tại để biết shop_id
        const currentBankAccount = await BankAccount.findById(bankAccountId);
        if (!currentBankAccount) {
            return res.status(404).json({ message: "Bank account not found" });
        }

        // Nếu tài khoản được cập nhật là mặc định
        if (is_default) {
            // Cập nhật tất cả tài khoản hiện có của shop này thành không mặc định
            await BankAccount.updateMany(
                { shop_id: currentBankAccount.shop_id },
                { is_default: false }
            );
        }

        const updatedBankAccount = await BankAccount.findByIdAndUpdate(
            bankAccountId,
            {
                bank_name,
                account_number,
                account_holder,
                branch,
                is_default: is_default || false,
                updated_at: Date.now()
            },
            { new: true }
        );

        res.status(200).json(updatedBankAccount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa tài khoản ngân hàng
const deleteBankAccount = async (req, res) => {
    try {
        const deletedBankAccount = await BankAccount.findByIdAndDelete(req.params.id);
        if (!deletedBankAccount) {
            return res.status(404).json({ message: "Bank account not found" });
        }
        res.status(200).json({ message: "Bank account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const bankAccountController = {
    getShopBankAccounts,
    getBankAccountById,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount
};

module.exports = bankAccountController;