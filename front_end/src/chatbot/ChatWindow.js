// SEP490_G61/front_end/src/chatbot/ChatWindow.js
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
// Sửa đường dẫn import cho đúng với cấu trúc thư mục
import { sendMessageToGemini } from './services/GeminiService';
// Import ApiDebugTool (chỉ dùng trong lúc phát triển)
import ApiDebugTool from './ApiDebugTool';

const ChatWindow = ({ isOpen }) => {
  // Lưu trạng thái chat trong localStorage
  const [messages, setMessages] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 'guest';
    const chatKey = `chatMessages_${userId}`;
    
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      return parsedMessages.map(msg => ({
        ...msg,
        time: new Date(msg.time)
      }));
    } else {
      return [
        { id: 1, text: "Xin chào! Tôi là trợ lý AI hỗ trợ cửa hàng TROOC2HAND. Tôi có thể giúp gì cho bạn?", sender: 'bot', time: new Date() }
      ];
    }
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Thêm trạng thái "đang nhập"
  const [isError, setIsError] = useState(false);
  const [showDebugTool, setShowDebugTool] = useState(false); // Thêm công cụ debug
  const messagesEndRef = useRef(null);

  // Danh sách câu hỏi thường gặp
  const quickQuestions = [
    "Làm thế nào để đặt hàng?",
    "Chính sách đổi trả như thế nào?",
    "Thời gian giao hàng là bao lâu?",
    "Các phương thức thanh toán"
  ];

  // Lưu tin nhắn vào localStorage khi có thay đổi
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 'guest';
    const chatKey = `chatMessages_${userId}`;
    
    localStorage.setItem(chatKey, JSON.stringify(messages));
  }, [messages]);

  // Cuộn xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Hàm xử lý khi storage thay đổi
    const handleStorageChange = () => {
      const user = localStorage.getItem('user');
      if (!user) {
        // Nếu không có user (đã đăng xuất), reset tin nhắn về ban đầu
        setMessages([
          { id: 1, text: "Xin chào! Tôi là trợ lý AI hỗ trợ cửa hàng TROOC2HAND. Tôi có thể giúp gì cho bạn?", sender: 'bot', time: new Date() }
        ]);
      }
    };

    // Đăng ký lắng nghe sự kiện storage
    window.addEventListener('storage', handleStorageChange);

    // Kiểm tra ngay khi component mount
    handleStorageChange();

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setMessages]);

  // Xử lý khi người dùng gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    console.log("Gửi tin nhắn:", inputValue);

    // Thêm tin nhắn của người dùng vào danh sách
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      time: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue(''); // Xóa input

    // Hiển thị trạng thái "đang nhập"
    setIsTyping(true);
    setIsError(false);

    try {
      // Gọi API Gemini thay vì OpenAI
      console.log("Gọi sendMessageToGemini với", updatedMessages.length, "tin nhắn");
      const botResponse = await sendMessageToGemini(updatedMessages);

      console.log("Nhận phản hồi từ Gemini:", botResponse);

      // Thêm phản hồi từ Gemini vào danh sách tin nhắn
      const botMessage = {
        id: Date.now(),
        text: botResponse,
        sender: 'bot',
        time: new Date()
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setIsError(true);

      // Thêm tin nhắn lỗi
      const errorMessage = {
        id: Date.now(),
        text: "Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.",
        sender: 'bot',
        time: new Date()
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      // Tắt trạng thái "đang nhập"
      setIsTyping(false);
    }
  };

  // Xử lý khi chọn câu hỏi thường gặp
  const handleQuickQuestionClick = (question) => {
    setInputValue(question);
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Toggles công cụ debug (chỉ dùng khi phát triển)
  const toggleDebugTool = () => {
    setShowDebugTool(!showDebugTool);
  };

  return (
    <div
      className={`fixed bottom-24 right-6 w-80 md:w-96 h-[550px] bg-white rounded-lg shadow-xl flex flex-col z-40 transition-transform duration-300 ${isOpen ? 'transform translate-y-0' : 'transform translate-y-full opacity-0 pointer-events-none'
        }`}
    >
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">TROOC2HAND Bot</h3>
            <p className="text-xs opacity-80">Hỏi đáp thông tin về sản phẩm, đặt hàng và hỗ trợ 24/7</p>
          </div>
          <button
            onClick={() => {
              // Xóa tin nhắn và đặt lại tin nhắn chào mừng
              setMessages([
                { id: 1, text: "Xin chào! Tôi là trợ lý AI hỗ trợ cửa hàng TROOC2HAND. Tôi có thể giúp gì cho bạn?", sender: 'bot', time: new Date() }
              ]);
              localStorage.removeItem("chatMessages");
            }}
            className="text-xs px-2 py-1 bg-purple-800 rounded hover:bg-purple-900"
          >
            Xóa lịch sử
          </button>
        </div>
      </div>

      {/* Debug Tool - hidden by default */}
      {showDebugTool && <ApiDebugTool />}

      {/* Message area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 max-w-[80%] ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'
              }`}
          >
            <div
              className={`p-3 rounded-lg ${message.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
            >
              {message.text}
            </div>
            <div
              className={`text-xs mt-1 text-gray-500 ${message.sender === 'user' ? 'text-right' : 'text-left'
                }`}
            >
              {formatTime(message.time instanceof Date ? message.time : new Date(message.time))}
            </div>
          </div>
        ))}

        {/* Hiệu ứng "đang nhập" cho bot */}
        {isTyping && (
          <div className="mb-3 max-w-[80%] mr-auto">
            <div className="p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Thông báo lỗi */}
        {isError && !isTyping && (
          <div className="text-center text-xs text-red-500 mt-2 mb-2">
            Đã xảy ra lỗi khi kết nối đến dịch vụ AI
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isTyping}
        />
        <button
          type="submit"
          className={`text-white px-3 py-2 rounded-r-md ${isTyping ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          disabled={isTyping}
        >
          <Send size={18} />
        </button>
      </form>

      {/* Câu hỏi thường gặp */}
      {/* <div className="p-2 border-t flex flex-wrap gap-2">
        <p className="w-full text-xs text-gray-500">Câu hỏi thường gặp:</p>
        {quickQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuickQuestionClick(question)}
            className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700"
            disabled={isTyping}
          >
            {question}
          </button>
        ))}
      </div> */}
    </div>
  );
};

export default ChatWindow;