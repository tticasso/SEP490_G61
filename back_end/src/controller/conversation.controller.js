const db = require("../models");
const Conversation = db.conversation;
const Message = db.message;
const User = db.user;
const Shop = db.shop;

// Lấy tất cả cuộc trò chuyện của người dùng
const getUserConversations = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Tìm tất cả cuộc trò chuyện mà người dùng tham gia
        const conversations = await Conversation.find({
            participants: userId
        })
        .populate({
            path: 'shop_id',
            select: 'name logo'
        })
        .populate({
            path: 'participants',
            select: 'firstName lastName email'
        })
        .sort({ last_message_time: -1 });
        
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo cuộc trò chuyện mới
const createConversation = async (req, res) => {
    try {
        const { shop_id } = req.body;
        const userId = req.userId;
        
        // Kiểm tra xem shop có tồn tại không
        const shop = await Shop.findById(shop_id);
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }
        
        // Lấy ID của chủ shop
        const shopOwnerId = shop.user_id;
        
        // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, shopOwnerId] },
            shop_id: shop_id
        });
        
        // Nếu chưa có cuộc trò chuyện, tạo mới
        if (!conversation) {
            conversation = new Conversation({
                participants: [userId, shopOwnerId],
                shop_id: shop_id
            });
            
            await conversation.save();
        }
        
        res.status(201).json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy tin nhắn của một cuộc trò chuyện
const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.userId;
        
        // Kiểm tra xem người dùng có quyền truy cập cuộc trò chuyện này không
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
            return res.status(403).json({ message: "You don't have permission to access this conversation" });
        }
        
        // Lấy tin nhắn của cuộc trò chuyện
        const messages = await Message.find({
            conversation_id: conversationId
        }).sort({ created_at: 1 });
        
        // Đánh dấu tất cả tin nhắn là đã đọc (cho người dùng hiện tại)
        await Message.updateMany(
            { 
                conversation_id: conversationId,
                sender_id: { $ne: userId },
                is_read: false
            },
            { is_read: true }
        );
        
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Gửi tin nhắn trong một cuộc trò chuyện
const sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const userId = req.userId;
        
        // Kiểm tra xem người dùng có quyền truy cập cuộc trò chuyện này không
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
            return res.status(403).json({ message: "You don't have permission to access this conversation" });
        }
        
        // Tạo tin nhắn mới
        const newMessage = new Message({
            conversation_id: conversationId,
            sender_id: userId,
            content
        });
        
        await newMessage.save();
        
        // Cập nhật last_message và last_message_time trong conversation
        conversation.last_message = content;
        conversation.last_message_time = Date.now();
        await conversation.save();
        
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.userId;
        
        // Kiểm tra xem người dùng có quyền truy cập cuộc trò chuyện này không
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
            return res.status(403).json({ message: "You don't have permission to access this conversation" });
        }
        
        // Đánh dấu tất cả tin nhắn là đã đọc (ngoại trừ tin nhắn do người dùng gửi)
        await Message.updateMany(
            { 
                conversation_id: conversationId,
                sender_id: { $ne: userId },
                is_read: false
            },
            { is_read: true }
        );
        
        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const conversationController = {
    getUserConversations,
    createConversation,
    getConversationMessages,
    sendMessage,
    markAsRead
};

module.exports = conversationController;