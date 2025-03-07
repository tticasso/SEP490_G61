// src/chatbot/ChatWindow.js
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const ChatWindow = ({ isOpen }) => {
  // Lưu trạng thái chat trong localStorage
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      // Parse saved messages và chuyển đổi chuỗi thời gian thành đối tượng Date
      const parsedMessages = JSON.parse(savedMessages);
      return parsedMessages.map(msg => ({
        ...msg,
        time: new Date(msg.time)
      }));
    } else {
      return [
        { id: 1, text: "Xin chào! Tôi là chatbot hỗ trợ. Tôi có thể giúp gì cho bạn?", sender: 'bot', time: new Date() }
      ];
    }
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Thêm trạng thái "đang nhập"
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
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);
  
  // Cuộn xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Xử lý khi người dùng gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    // Thêm tin nhắn của người dùng vào danh sách
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      time: new Date()
    };
    
    setMessages([...messages, userMessage]);
    const currentInput = inputValue; // Lưu giá trị hiện tại
    setInputValue(''); // Xóa input
    
    // Hiển thị trạng thái "đang nhập"
    setIsTyping(true);

    // Giả lập phản hồi từ bot sau 1.5 giây
    setTimeout(() => {
      let botResponse;
      
      // Xử lý câu trả lời dựa trên tin nhắn người dùng
      const lowercaseInput = currentInput.toLowerCase();
      if (lowercaseInput.includes('xin chào') || lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
        botResponse = "Xin chào! Tôi có thể giúp gì cho bạn?";
      } else if (lowercaseInput.includes('đặt hàng') || lowercaseInput.includes('mua')) {
        botResponse = "Để đặt hàng, bạn có thể thêm sản phẩm vào giỏ hàng và tiến hành thanh toán. Nếu cần hỗ trợ, vui lòng liên hệ hotline 0966.768.150.";
      } else if (lowercaseInput.includes('giá') || lowercaseInput.includes('bao nhiêu')) {
        botResponse = "Bạn có thể tìm thấy giá sản phẩm trên trang chi tiết sản phẩm. Nếu bạn cần thêm thông tin, vui lòng cho biết sản phẩm bạn quan tâm.";
      } else if (lowercaseInput.includes('ship') || lowercaseInput.includes('giao hàng') || lowercaseInput.includes('vận chuyển')) {
        botResponse = "Chúng tôi giao hàng toàn quốc. Thời gian giao hàng từ 2-5 ngày tùy khu vực. Đơn hàng trên 500k được miễn phí giao hàng.";
      } else if (lowercaseInput.includes('thanh toán') || lowercaseInput.includes('payment')) {
        botResponse = "Chúng tôi hỗ trợ thanh toán qua: Thẻ tín dụng/ghi nợ, Chuyển khoản ngân hàng, Ví điện tử (Momo, ZaloPay, VNPay) và COD (thanh toán khi nhận hàng).";
      } else if (lowercaseInput.includes('đổi trả') || lowercaseInput.includes('hoàn tiền')) {
        botResponse = "Chính sách đổi trả của chúng tôi cho phép đổi trả trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm còn nguyên vẹn. Bạn cần giữ lại hóa đơn và bao bì sản phẩm.";
      } else {
        botResponse = "Cảm ơn bạn đã liên hệ. Để được hỗ trợ cụ thể hơn, vui lòng gọi hotline 0966.768.150 hoặc để lại email và số điện thoại, chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.";
      }

      // Tắt trạng thái "đang nhập"
      setIsTyping(false);
      
      // Thêm phản hồi từ bot vào danh sách tin nhắn
      const botMessage = {
        id: Date.now(),
        text: botResponse,
        sender: 'bot',
        time: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 1500);
  };

  // Xử lý khi chọn câu hỏi thường gặp
  const handleQuickQuestionClick = (question) => {
    setInputValue(question);
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`fixed bottom-24 right-6 w-80 md:w-96 h-[550px] bg-white rounded-lg shadow-xl flex flex-col z-40 transition-transform duration-300 ${
        isOpen ? 'transform translate-y-0' : 'transform translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 rounded-t-lg">
        <h3 className="font-medium">Hỗ trợ khách hàng</h3>
        <p className="text-xs opacity-80">Chúng tôi sẵn sàng hỗ trợ bạn 24/7</p>
      </div>
      
      {/* Message area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-3 max-w-[80%] ${
              message.sender === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div 
              className={`p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-none' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.text}
            </div>
            <div 
              className={`text-xs mt-1 text-gray-500 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              {formatTime(message.time)}
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
        />
        <button 
          type="submit"
          className="bg-purple-600 text-white px-3 py-2 rounded-r-md hover:bg-purple-700"
        >
          <Send size={18} />
        </button>
      </form>
      
      {/* Câu hỏi thường gặp */}
      <div className="p-2 border-t flex flex-wrap gap-2">
        <p className="w-full text-xs text-gray-500">Câu hỏi thường gặp:</p>
        {quickQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuickQuestionClick(question)}
            className="text-xs px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatWindow;