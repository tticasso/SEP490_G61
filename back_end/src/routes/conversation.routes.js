const express = require('express');
const conversationController = require('../controller/conversation.controller');
const VerifyJwt = require('../middlewares/verifyJwt');

const conversationRouter = express.Router();

// Lấy tất cả cuộc trò chuyện của người dùng
conversationRouter.get(
    '/user',
    [VerifyJwt.verifyToken],
    conversationController.getUserConversations
);

// Tạo cuộc trò chuyện mới
conversationRouter.post(
    '/create',
    [VerifyJwt.verifyToken],
    conversationController.createConversation
);

// Lấy tin nhắn của một cuộc trò chuyện
conversationRouter.get(
    '/:conversationId/messages',
    [VerifyJwt.verifyToken],
    conversationController.getConversationMessages
);

// Gửi tin nhắn trong một cuộc trò chuyện
conversationRouter.post(
    '/send',
    [VerifyJwt.verifyToken],
    conversationController.sendMessage
);

// PUT /conversation/:conversationId/read - Đánh dấu tin nhắn là đã đọc
conversationRouter.put(
    '/:conversationId/read',
    [VerifyJwt.verifyToken],
    conversationController.markAsRead
);

module.exports = conversationRouter;