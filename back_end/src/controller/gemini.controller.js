// SEP490_G61/back_end/src/controller/gemini.controller.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Khởi tạo Google Generative AI với API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache kết quả để giảm số lượng API calls
const responseCache = new Map();

// Theo dõi số lượng request để tránh vượt quá giới hạn
const requestTracker = {
  count: 0,
  resetTime: Date.now() + 60000, // Reset mỗi phút
  limit: 60 // 60 requests mỗi phút
};

// Cấu hình mô hình
const MODEL_CONFIG = {
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.7, // 0-1, càng cao càng sáng tạo
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 500, // Giới hạn số tokens trong phản hồi
  }
};

// Reset bộ đếm request
function checkAndResetTracker() {
  const now = Date.now();
  if (now > requestTracker.resetTime) {
    requestTracker.count = 0;
    requestTracker.resetTime = now + 60000;
    return true;
  }
  return requestTracker.count < requestTracker.limit;
}

// Controller chính để xử lý tin nhắn chat
exports.chatCompletion = async (req, res) => {
  try {
    // Kiểm tra giới hạn request
    if (!checkAndResetTracker()) {
      return res.status(429).json({
        success: false,
        message: 'Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.'
      });
    }
    
    // Tăng số lượng request
    requestTracker.count++;
    
    const { messages } = req.body;
    
    // Đảm bảo messages không rỗng
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tin nhắn không hợp lệ' 
      });
    }
    
    // Lấy tin nhắn cuối cùng từ người dùng làm key cache
    const lastUserMessage = messages.filter(msg => msg.sender === 'user').pop()?.text || '';
    const cacheKey = lastUserMessage.toLowerCase().trim();
    
    // Kiểm tra cache
    if (responseCache.has(cacheKey)) {
      console.log('Phản hồi từ cache cho:', cacheKey);
      return res.status(200).json({
        success: true,
        message: responseCache.get(cacheKey)
      });
    }
    
    // Khởi tạo model
    const model = genAI.getGenerativeModel(MODEL_CONFIG);
    
    // System prompt cho AI
    const systemPrompt = `
    Bạn là trợ lý AI hỗ trợ khách hàng của cửa hàng bán đồ đã qua sử dụng (Secondhand). 
    Hãy trả lời ngắn gọn, thân thiện và hữu ích về các sản phẩm, dịch vụ, cách đặt hàng, vận chuyển, v.v.
    Đảm bảo phản hồi của bạn luôn mang tính chuyên nghiệp và bằng tiếng Việt.
    
    Ví dụ về các chủ đề mà bạn có thể trả lời:
    - Thông tin về các sản phẩm
    - Hướng dẫn đặt hàng và thanh toán: Người dùng có thể chọn sản phẩm để xem các biến thể, vì là đồ đã qua sử dụng nên kích cỡ, màu sắc đều đã được xác định sẵn
    - Chính sách đổi trả và vận chuyển
    - Khuyến mãi và sự kiện đặc biệt
    `;
    
    // Khởi tạo chat
    const chat = model.startChat({
      history: [],
      generationConfig: MODEL_CONFIG.generationConfig,
    });
    
    // Thêm system prompt
    await chat.sendMessage(systemPrompt);
    
    // Kết hợp lịch sử tin nhắn
    console.log(`Xử lý ${messages.length} tin nhắn từ người dùng`);
    
    // Thêm lịch sử tin nhắn vào cuộc hội thoại (tối đa 10 tin nhắn gần nhất)
    const recentMessages = messages.slice(-10);
    for (let i = 0; i < recentMessages.length - 1; i++) {
      const msg = recentMessages[i];
      try {
        await chat.sendMessage(msg.text);
      } catch (error) {
        console.warn(`Bỏ qua tin nhắn lỗi từ lịch sử: ${error.message}`);
        // Tiếp tục với tin nhắn tiếp theo nếu có lỗi
      }
    }
    
    // Gửi tin nhắn cuối cùng và lấy phản hồi
    console.log('Gửi tin nhắn cuối cùng từ người dùng đến Gemini API');
    const lastMessage = recentMessages[recentMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.text);
    const botResponse = result.response.text();
    
    console.log('Đã nhận phản hồi từ Gemini API');
    
    // Lưu vào cache
    if (cacheKey && botResponse) {
      responseCache.set(cacheKey, botResponse);
      
      // Giới hạn kích thước cache
      if (responseCache.size > 100) {
        const oldestKey = responseCache.keys().next().value;
        responseCache.delete(oldestKey);
      }
    }

    // Trả về phản hồi
    res.status(200).json({
      success: true,
      message: botResponse
    });
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    
    res.status(error.status || 500).json({
      success: false,
      message: "Lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Endpoint xóa cache
exports.clearCache = (req, res) => {
  responseCache.clear();
  res.status(200).json({
    success: true,
    message: 'Đã xóa cache thành công'
  });
};

// Endpoint kiểm tra tình trạng API
exports.status = (req, res) => {
  res.status(200).json({
    success: true,
    model: MODEL_CONFIG.model,
    requestsThisMinute: requestTracker.count,
    requestLimit: requestTracker.limit,
    cacheSize: responseCache.size
  });
};