// userStatus.routes.js
const express = require('express');
const userStatusController = require('../controller/user-status.controller');
const VerifyJwt = require('../middlewares/verifyJwt');

const userStatusRouter = express.Router();

// Lấy trạng thái hoạt động của người dùng
userStatusRouter.get(
    '/:userId',
    userStatusController.getUserStatus
);

// Cập nhật trạng thái hoạt động (chỉ chủ sở hữu hoặc admin)
userStatusRouter.put(
    '/:userId',
    [VerifyJwt.verifyToken],
    userStatusController.updateUserStatus
);

// Lấy thông tin chi tiết người tham gia
userStatusRouter.get(
    '/participant/:userId',
    userStatusController.getConversationParticipantDetails
);

module.exports = userStatusRouter;