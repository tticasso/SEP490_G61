// SEP490_G61/front_end/src/chatbot/ChatBot.js
import React, { useState, useEffect } from 'react';
import ChatBotButton from './ChatBotButton';
import ChatWindow from './ChatWindow';

const ChatBot = () => {
  // Lấy trạng thái mở chat từ localStorage nếu có
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('chatbotOpen');
    return saved ? JSON.parse(saved) === true : false;
  });
  
  // Lưu trạng thái mở chat vào localStorage
  useEffect(() => {
    localStorage.setItem('chatbotOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Đóng chat khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      const chatWindow = document.getElementById('chat-window');
      const chatButton = document.getElementById('chat-button');
      
      if (isOpen && 
          chatWindow && 
          !chatWindow.contains(event.target) && 
          chatButton && 
          !chatButton.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Thêm sự kiện để đóng chat khi nhấn ESC
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <div id="chat-window">
        <ChatWindow isOpen={isOpen} />
      </div>
      <div id="chat-button">
        <ChatBotButton isOpen={isOpen} toggleChat={toggleChat} />
      </div>
    </>
  );
};

export default ChatBot;