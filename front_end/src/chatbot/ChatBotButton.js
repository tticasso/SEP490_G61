// SEP490_G61/front_end/src/chatbot/ChatBotButton.js
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, BotMessageSquare } from 'lucide-react';

const ChatBotButton = ({ isOpen, toggleChat }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Tạo hiệu ứng thông báo khi có tin nhắn mới
  useEffect(() => {
    // Kiểm tra nếu chatbot đang đóng thì hiển thị thông báo
    if (!isOpen) {
      const messages = localStorage.getItem('chatMessages');
      if (messages) {
        const parsedMessages = JSON.parse(messages);
        
        // Đếm số tin nhắn chưa đọc từ bot (những tin nhắn được gửi khi user không mở chat)
        const lastOpenTime = localStorage.getItem('lastChatOpenTime');
        const unreadMessages = parsedMessages.filter(
          msg => msg.sender === 'bot' && (!lastOpenTime || new Date(msg.time) > new Date(lastOpenTime))
        );
        
        // Cập nhật số tin nhắn chưa đọc
        setUnreadCount(unreadMessages.length);
        
        // Kích hoạt animation nếu có tin nhắn mới
        if (unreadMessages.length > 0) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 2000); // Dừng animation sau 2 giây
        }
      }
    } else {
      // Khi mở chat, đánh dấu tất cả tin nhắn là đã đọc
      setUnreadCount(0);
      localStorage.setItem('lastChatOpenTime', new Date().toISOString());
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'} text-white flex items-center justify-center shadow-lg transition-colors z-50 ${isAnimating ? 'animate-bounce' : ''}`}
        aria-label={isOpen ? "Đóng chat" : "Mở chat"}
      >
        {isOpen ? <X size={24} /> : <BotMessageSquare size={24} />}
      </button>
      
      {/* Hiển thị số tin nhắn chưa đọc */}
      {!isOpen && unreadCount > 0 && (
        <div className="absolute top-0 right-6 transform -translate-y-1/2 translate-x-1/2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full z-50">
          {unreadCount}
        </div>
      )}
    </div>
  );
};

export default ChatBotButton;