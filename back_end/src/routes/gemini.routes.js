// SEP490_G61/back_end/src/routes/gemini.routes.js

const express = require('express');
const router = express.Router();
const geminiController = require('../controller/gemini.controller');
const { verifyToken } = require('../middlewares/verifyJwt');

// Route kiểm tra kết nối
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Gemini API route đang hoạt động!',
    provider: 'Google Gemini'
  });
});

// Route để xử lý yêu cầu chat
router.post('/chat', geminiController.chatCompletion);

// Route để xóa cache (nên bảo vệ bằng middleware xác thực)
router.post('/clear-cache', verifyToken, geminiController.clearCache);

// Route để kiểm tra tình trạng API
router.get('/status', geminiController.status);

router.post('/refresh-data', verifyToken, geminiController.refreshProductData);

// Đổi thành module.exports = router để đúng cú pháp
module.exports = router;