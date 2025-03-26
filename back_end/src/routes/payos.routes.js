const express = require('express');
const { payosController } = require('../controller');
// const { authJwt } = require('../middleware');

const router = express.Router();

// Tạo link thanh toán - Cần đăng nhập
router.post('/create-payment',  payosController.createPayment);

// Kiểm tra trạng thái thanh toán - Cần đăng nhập
router.get('/check-status/:transactionCode', payosController.checkPaymentStatus);

// Webhook từ PayOs - không cần xác thực JWT
router.post('/webhook', payosController.handleWebhook);

module.exports = router;