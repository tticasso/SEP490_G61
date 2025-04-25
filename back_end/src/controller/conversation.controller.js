// Updated conversation.controller.js
const db = require("../models");
const Conversation = db.conversation;
const Message = db.message;
const User = db.user;
const Shop = db.shop;

// Lấy tất cả cuộc trò chuyện của người dùng
const getUserConversations = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Đảm bảo userId là giá trị hợp lệ
        if (!userId) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        
        // Tìm tất cả cuộc trò chuyện mà người dùng tham gia
        const conversations = await Conversation.find({
            participants: userId
        })
        .populate({
            path: 'shop_id',
            select: 'name logo user_id' // Đảm bảo lấy user_id để xác định chủ shop
        })
        .populate({
            path: 'participants',
            select: 'firstName lastName email'
        })
        .sort({ last_message_time: -1 });
        
        // Xử lý từng cuộc trò chuyện để thêm metadata
        const conversationsWithMetadata = await Promise.all(
            conversations.map(async (conv) => {
                // Sử dụng toObject để chuyển document Mongoose thành plain JavaScript object
                // Thêm kiểm tra null cho con
                const convObj = conv && typeof conv.toObject === 'function' ? conv.toObject() : conv || {};
                
                // Đếm số tin nhắn chưa đọc
                try {
                    const unreadCount = await Message.countDocuments({
                        conversation_id: conv._id,
                        sender_id: { $ne: userId },
                        is_read: false
                    });
                    
                    convObj.unread_count = unreadCount;
                } catch (countError) {
                    console.error('Error counting unread messages:', countError);
                    convObj.unread_count = 0;
                }
                
                // Kiểm tra người dùng có phải là chủ shop không (an toàn với null)
                if (convObj.shop_id && convObj.shop_id.user_id) {
                    try {
                        // Chuyển đổi sang string để so sánh an toàn
                        const shopOwnerId = String(convObj.shop_id.user_id || '');
                        const currentUserId = String(userId || '');
                        
                        convObj.isShopOwner = shopOwnerId && currentUserId && shopOwnerId === currentUserId;
                    } catch (error) {
                        console.error('Error checking shop owner:', error);
                        convObj.isShopOwner = false;
                    }
                } else {
                    convObj.isShopOwner = false;
                }
                
                return convObj;
            })
        );
        
        res.status(200).json(conversationsWithMetadata);
    } catch (error) {
        console.error('Error in getUserConversations:', error);
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