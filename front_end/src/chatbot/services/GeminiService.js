// SEP490_G61/front_end/src/chatbot/services/GeminiService.js

import { BE_API_URL } from '../../config/config';

/**
 * Service để gọi API Gemini từ backend
 */
export const sendMessageToGemini = async (messageHistory) => {
    try {
      console.log('====== Gửi yêu cầu đến Gemini ======');
      
      // Thay đổi URL để gọi đúng backend API
      const apiUrl = `${BE_API_URL}/api/gemini/chat`;
      
      // In ra thông tin gửi đi để debug
      console.log("Gửi yêu cầu đến:", apiUrl);
      
      // Chỉ lấy 10 tin nhắn gần nhất để giảm kích thước request
      const recentMessages = messageHistory.slice(-10);
      console.log("Số lượng tin nhắn gửi đi:", recentMessages.length);
      
      // Gọi API backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: recentMessages }),
        credentials: 'include'
      });
      
      console.log("Trạng thái phản hồi:", response.status);
      
      // Xử lý lỗi HTTP
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Lỗi HTTP: ${response.status}`;
        } catch (e) {
          const errorText = await response.text();
          errorMessage = `Lỗi HTTP: ${response.status}. Phản hồi: ${errorText.substring(0, 100)}...`;
        }
        console.error("Lỗi API:", errorMessage);
        throw new Error(errorMessage);
      }
      
      // Xử lý phản hồi thành công - chỉ đọc response.json() một lần
      const data = await response.json();
      console.log("Phản hồi API:", data);
      
      if (data.success && data.message) {
        return data.message;
      } else {
        console.error("Định dạng phản hồi không đúng:", data);
        return "Xin lỗi, tôi không thể xử lý phản hồi từ máy chủ. Vui lòng thử lại sau.";
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      return "Xin lỗi, hiện tại tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
    }
  };