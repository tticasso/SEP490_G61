const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users_model");
const Role = require("../models/roles_model");

// Đăng ký người dùng
exports.register = async (req, res) => {
    const { name, phone, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email đã tồn tại" });

        // Lấy role_id của vai trò "user"
        // const userRole = await Role.findOne({ name: "user" });
        // if (!userRole) return res.status(500).json({ message: "Không tìm thấy vai trò user" });
        console.log("đã chạy đến đây");

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("đã chạy đến đây 2");
        const newUser = new User({
            // role_id: userRole._id, // Gán role_id mặc định là "user"
            name,
            phone,
            email,
            password: hashedPassword
        });
        console.log("đã chạy đến đây 3");
        await newUser.save();

        res.status(201).json({ message: "Đăng ký thành công, vui lòng kích hoạt tài khoản" });
    } catch (err) {
        console.error("Lỗi khi lưu user:", err);  // In ra lỗi chi tiết
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }

};

// Đăng nhập người dùng
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng" });

        const token = jwt.sign({ id: user._id, role_id: user.role_id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Xử lý đăng nhập bằng Google
exports.googleAuthCallback = async (req, res) => {
    try {
        const token = jwt.sign(
            { id: req.user._id, role_id: req.user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Chuyển hướng về frontend với token hoặc trả về JSON
        res.redirect(`/auth/success?token=${token}`);
    } catch (err) {
        res.status(500).json({ message: "Lỗi xác thực Google" });
    }
};
