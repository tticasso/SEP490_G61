const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const httpErrors = require('http-errors');
const db = require('./src/models');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./src/config/auth.config');
require('dotenv').config();


const { AuthRouter,
    UserRouter,
    RoleRouter,
    CategoriesRouter,
    BrandRouter,
    ProductRouter,
    ProductReviewRouter,
    AddressRouter,
    CartRouter,
    DiscountRouter,
    CouponRouter, // Add coupon router
    OrderRouter,
    ShippingRouter,
    PaymentRouter,
    ShopRouter,
    DocumentRouter,
    ShopFollowRouter,
    ConversationRouter,
    UserStatusRouter,
    ProductVariantRouter,
    ProductAttributeRouter
} = require('./src/routes');

const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Khởi tạo Express trước khi dùng app.use()
const app = express();

// Cấu hình session và passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
    origin: 'http://localhost:3000', // Thay đổi thành domain frontend của bạn
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// Bổ sung middleware kiểm soát hoạt động của Web server
app.use(bodyParser.json());
app.use(morgan("dev"));

// Cấu hình static files cho uploads - đặt trước các routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Đảm bảo thư mục uploads tồn tại
const uploadDirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/shops'),
    path.join(__dirname, 'uploads/documents')
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Định tuyến cho root router
app.get("/", (req, res, next) => {
    res.status(200).json({
        message: "Welcome to RESTFul API - NodeJS"
    });
});

// Đăng ký tất cả các routes
app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);
app.use('/api/role', RoleRouter);
app.use('/api/categories', CategoriesRouter);
app.use('/api/brand', BrandRouter);
app.use('/api/product', ProductRouter);
app.use('/api/product-review', ProductReviewRouter);
app.use('/api/address', AddressRouter);
app.use('/api/shops', ShopRouter);
app.use('/api/shop-follow', ShopFollowRouter);
app.use('/api/cart', CartRouter);
app.use('/api/discount', DiscountRouter);
app.use('/api/coupon', CouponRouter); // Add coupon routes
app.use('/api/order', OrderRouter);
app.use('/api/shipping', ShippingRouter);
app.use('/api/payment', PaymentRouter);
app.use('/api/documents', DocumentRouter);
app.use('/api/user-status', UserStatusRouter);
app.use('/api/product-variant', ProductVariantRouter);
app.use('/api/product-attribute', ProductAttributeRouter);
// Thêm route mới
app.use('/api/conversation', ConversationRouter);
// Kiểm soát các lỗi trong Express web server
app.use(async (req, res, next) => {
    next(httpErrors.NotFound());
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        "error": {
            "status": err.status || 500,
            "message": err.message
        }
    });
});

// Tạo server HTTP từ ứng dụng Express
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000', // Đảm bảo đây là domain của frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
    credentials: true
  }
});



// Socket.IO - Xử lý kết nối từ client
// Thêm UserStatus model cho trạng thái online
const UserStatus = require('./src/models/user-status.model');

// Cập nhật phần Socket.IO trong server.js
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Authenticate user using token from query params
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.disconnect();
      return console.log('User not authenticated');
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.secret);
      socket.userId = decoded.id;
      console.log('Authenticated user:', socket.userId);
      
      // Join user to their room
      socket.join(`user-${socket.userId}`);
      
      // Cập nhật trạng thái thành online
      updateUserOnlineStatus(socket.userId, true);
      
      // Handle conversation joining
      socket.on('join-conversation', (conversationId) => {
        socket.join(`conversation-${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      });
      
      // Handle new message
      socket.on('send-message', async (data) => {
        try {
          const { conversationId, content } = data;
          
          // Save message to database
          const newMessage = new db.message({
            conversation_id: conversationId,
            sender_id: socket.userId,
            content: content,
            created_at: new Date()
          });
          
          await newMessage.save();
          
          // Update conversation last message
          await db.conversation.findByIdAndUpdate(
            conversationId,
            { 
              last_message: content,
              last_message_time: new Date()
            }
          );
          
          // Broadcast message to all users in this conversation
          io.to(`conversation-${conversationId}`).emit('new-message', {
            _id: newMessage._id,
            conversation_id: conversationId,
            sender_id: socket.userId,
            content: content,
            created_at: newMessage.created_at,
            is_read: false
          });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });
      
      // Handle typing status
      socket.on('typing', ({ conversationId, isTyping }) => {
        socket.to(`conversation-${conversationId}`).emit('user-typing', {
          userId: socket.userId,
          conversationId,
          isTyping
        });
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Cập nhật trạng thái thành offline
        updateUserOnlineStatus(socket.userId, false);
      });
      
    } catch (error) {
      console.error('Token verification failed:', error);
      socket.disconnect();
    }
});

// Hàm cập nhật trạng thái người dùng
async function updateUserOnlineStatus(userId, isOnline) {
  try {
      let userStatus = await UserStatus.findOne({ user_id: userId });
      
      if (!userStatus) {
          userStatus = new UserStatus({
              user_id: userId,
              is_online: isOnline,
              last_active: new Date()
          });
      } else {
          userStatus.is_online = isOnline;
          userStatus.last_active = new Date();
      }
      
      await userStatus.save();
      
      // Calculate status including "recently" logic
      const now = new Date();
      const diffMinutes = Math.floor((now - userStatus.last_active) / (1000 * 60));
      
      let status;
      if (isOnline) {
          status = 'online';
      } else if (diffMinutes < 5) {
          status = 'recently'; // Recently active (less than 5 minutes)
      } else {
          status = 'offline';
      }
      
      // Broadcast status with proper value
      io.emit('user-status-changed', {
          userId: userId,
          status: status
      });
      
  } catch (error) {
      console.error('Error updating user status:', error);
  }
}
  
  // Thay đổi app.listen thành server.listen
  server.listen(process.env.PORT || 9999, process.env.HOST_NAME || 'localhost', () => {
    console.log(`Server is running at: http://${process.env.HOST_NAME || 'localhost'}:${process.env.PORT || 9999}`);
    db.connectDB();
  });