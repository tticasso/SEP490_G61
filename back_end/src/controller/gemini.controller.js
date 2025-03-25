// SEP490_G61/back_end/src/controller/gemini.controller.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const db = require('../models');
const Product = db.product;
const Categories = db.categories;

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
  model: 'gemini-2.0-flash-lite',
  generationConfig: {
    temperature: 0.7, // 0-1, càng cao càng sáng tạo
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 500, // Giới hạn số tokens trong phản hồi
  }
};

// Hàm lấy dữ liệu sản phẩm
async function getProductsData() {
  try {
    // Lấy sản phẩm đang active (is_active = true, is_delete = false)
    const products = await Product.find({ 
      is_active: true,
      is_delete: false
    })
      .select('name description price category_id brand_id slug thumbnail condition')
      .populate("category_id", "name")
      .populate("brand_id", "name")
      .limit(100); // Giới hạn để tối ưu hiệu suất
    
    return products;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
    return [];
  }
}

// Hàm lấy dữ liệu danh mục
async function getCategoriesData() {
  try {
    const categories = await Categories.find()
      .select('name description')
      .limit(30);
    return categories;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu danh mục:", error);
    return [];
  }
}

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
    
    // Fetch product and category data
    const productsData = await getProductsData();
    const categoriesData = await getCategoriesData();
    
    console.log(`Đã lấy ${productsData.length} sản phẩm và ${categoriesData.length} danh mục`);
    
    // Convert to simplified format for the prompt
    const productsInfo = productsData.map(p => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      category: p.category_id && Array.isArray(p.category_id) && p.category_id.length > 0 
        ? p.category_id[0].name 
        : (p.category_id?.name || 'Không phân loại'),
      brand: p.brand_id?.name || 'Không thương hiệu',
      condition: p.condition || 'Không xác định',
      description: p.description?.substring(0, 100) + '...' || ''
    }));
    
    const categoriesInfo = categoriesData.map(c => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description || ''
    }));
    
    // System prompt cho AI
    const systemPrompt = `
    Bạn là trợ lý AI hỗ trợ khách hàng của cửa hàng bán đồ đã qua sử dụng TROOC2HAND. 
    Hãy trả lời ngắn gọn, thân thiện và hữu ích về các sản phẩm, dịch vụ, cách đặt hàng, vận chuyển, v.v.
    Đảm bảo phản hồi của bạn luôn mang tính chuyên nghiệp và bằng tiếng Việt.
    
    THÔNG TIN VỀ SẢN PHẨM HIỆN CÓ TRÊN HỆ THỐNG:
    ${JSON.stringify(productsInfo, null, 2)}
    
    DANH MỤC SẢN PHẨM:
    ${JSON.stringify(categoriesInfo, null, 2)}
    
    Ví dụ về các chủ đề mà bạn có thể trả lời:
    - Thông tin về các sản phẩm cụ thể có trong hệ thống và giới thiệu những mặt hàng phù hợp
    - Hướng dẫn đặt hàng và thanh toán: Người dùng có thể chọn sản phẩm để xem các biến thể, vì là đồ đã qua sử dụng nên kích cỡ, màu sắc đều đã được xác định sẵn
    - Chính sách đổi trả và vận chuyển
    - Khuyến mãi và sự kiện đặc biệt
    
    Khi người dùng hỏi về sản phẩm cụ thể, hãy trích dẫn thông tin từ dữ liệu sản phẩm được cung cấp ở trên.
    Khi người dùng muốn tìm sản phẩm theo danh mục, hãy giới thiệu những sản phẩm phù hợp từ danh mục đó.
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

// Làm mới dữ liệu sản phẩm
exports.refreshProductData = async (req, res) => {
  try {
    // Clear the cache to ensure fresh responses
    responseCache.clear();
    
    res.status(200).json({
      success: true,
      message: 'Dữ liệu sản phẩm đã được làm mới'
    });
  } catch (error) {
    console.error("Lỗi khi làm mới dữ liệu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi làm mới dữ liệu sản phẩm"
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