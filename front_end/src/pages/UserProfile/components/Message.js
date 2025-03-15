import React, { useState, useEffect, useRef } from 'react';
import { SendHorizontal, Paperclip, Smile } from 'lucide-react';
import donghoAvatar from '../../../assets/donghoAvatar.jpg';
import ApiService from '../../../services/ApiService';
import AuthService from '../../../services/AuthService';
import { io } from 'socket.io-client';

// Event bus để thông báo tin nhắn mới cho toàn ứng dụng
export const MessageEventBus = {
  listeners: {},
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.unsubscribe(event, callback);
  },
  unsubscribe(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  },
  publish(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

const Message = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  // const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentUser = AuthService.getCurrentUser();
  
  // Kết nối Socket.IO khi component mount
  useEffect(() => {
    // Lấy token xác thực
    const token = AuthService.getToken();
    if (!token) return;
    
    // Kết nối Socket.IO
    socketRef.current = io('http://localhost:9999', {
      auth: { token }
    });
    
    // Xử lý khi nhận được tin nhắn mới
    socketRef.current.on('new-message', (message) => {
      // Kiểm tra nếu tin nhắn mới thuộc cuộc trò chuyện đang xem
      if (message.conversation_id === selectedConversation) {
        setMessages(prev => [...prev, {
          id: message._id,
          sender: message.sender_id === currentUser.id ? 'me' : 'other',
          text: message.content,
          timestamp: new Date(message.created_at).toLocaleString(),
          isRead: message.is_read
        }]);
        
        // Chỉ cuộn xuống cuối nếu tin nhắn là do người dùng hiện tại gửi
        // if (message.sender_id === currentUser.id) {
        //   setShouldScrollToBottom(true);
        // }
      } else if (message.sender_id !== currentUser.id) {
        // Nếu tin nhắn không thuộc cuộc trò chuyện đang xem và không do mình gửi
        // tăng số lượng tin nhắn chưa đọc
        setUnreadCounts(prev => {
          const newCounts = {
            ...prev,
            [message.conversation_id]: (prev[message.conversation_id] || 0) + 1
          };
          
          // Cập nhật tổng số tin nhắn chưa đọc
          const newTotal = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
          setTotalUnread(newTotal);
          
          // Thông báo cho Header về tin nhắn mới
          MessageEventBus.publish('unreadCountChanged', newTotal);
          
          return newCounts;
        });
      }
      
      // Cập nhật danh sách cuộc trò chuyện
      setConversations(prev => 
        prev.map(conv => 
          conv.id === message.conversation_id 
            ? { 
                ...conv, 
                lastMessage: message.content, 
                timestamp: new Date(message.created_at).toLocaleString(),
                unread: message.sender_id !== currentUser.id && conv.id !== selectedConversation
              }
            : conv
        )
      );
    });
    
    // Xử lý khi người khác đang gõ
    socketRef.current.on('user-typing', ({ userId, conversationId, isTyping }) => {
      if (conversationId === selectedConversation && userId !== currentUser.id) {
        setTyping(prev => ({ ...prev, [conversationId]: isTyping }));
      }
    });
    
    // Cleanup khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedConversation, currentUser.id]);
  
  // Xử lý cuộn xuống tin nhắn mới nhất
  // useEffect(() => {
  //   if (shouldScrollToBottom && messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //     setShouldScrollToBottom(false);
  //   }
  // }, [shouldScrollToBottom, messages]);
  
  // Tải danh sách cuộc trò chuyện
  useEffect(() => {
    fetchConversations();
    
    // Thêm sự kiện lắng nghe khi component được focus lại
    const handleFocus = () => {
      fetchConversations();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  // Tải tin nhắn khi chọn cuộc trò chuyện
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      
      // Đánh dấu tin nhắn trong cuộc trò chuyện này là đã đọc
      if (unreadCounts[selectedConversation]) {
        // Cập nhật số lượng chưa đọc
        setUnreadCounts(prev => {
          const newCounts = {...prev};
          delete newCounts[selectedConversation];
          
          // Cập nhật tổng số tin nhắn chưa đọc
          const newTotal = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
          setTotalUnread(newTotal);
          
          // Thông báo cho Header về thay đổi số lượng chưa đọc
          MessageEventBus.publish('unreadCountChanged', newTotal);
          
          return newCounts;
        });
        
        // Cập nhật trạng thái chưa đọc trong danh sách cuộc trò chuyện
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation 
              ? { ...conv, unread: false }
              : conv
          )
        );
      }
      
      // Tham gia vào phòng cuộc trò chuyện qua Socket.IO
      if (socketRef.current) {
        socketRef.current.emit('join-conversation', selectedConversation);
      }
    }
  }, [selectedConversation]);
  
  // Hàm lấy danh sách cuộc trò chuyện
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/conversation/user', true);
      
      // Format dữ liệu và tính toán số lượng chưa đọc
      let totalUnreadMessages = 0;
      const newUnreadCounts = {};
      
      const formattedConversations = response.map(conv => {
        // Tìm người tham gia khác
        const otherParticipant = conv.participants.find(
          p => p._id !== currentUser.id
        );
        
        // Kiểm tra số tin nhắn chưa đọc (giả định có thông tin này từ API)
        // Trong thực tế, bạn cần API trả về số lượng tin nhắn chưa đọc cho mỗi cuộc trò chuyện
        const unreadCount = conv.unread_count || 0;
        
        if (unreadCount > 0) {
          newUnreadCounts[conv._id] = unreadCount;
          totalUnreadMessages += unreadCount;
        }
        
        return {
          id: conv._id,
          name: conv.shop_id ? conv.shop_id.name : `${otherParticipant?.firstName || ''} ${otherParticipant?.lastName || ''}`,
          lastMessage: conv.last_message || 'Bắt đầu trò chuyện',
          image: conv.shop_id?.logo || donghoAvatar,
          timestamp: new Date(conv.last_message_time).toLocaleString(),
          unread: unreadCount > 0
        };
      });
      
      setConversations(formattedConversations);
      setUnreadCounts(newUnreadCounts);
      setTotalUnread(totalUnreadMessages);
      
      // Thông báo cho Header về số lượng tin nhắn chưa đọc
      MessageEventBus.publish('unreadCountChanged', totalUnreadMessages);
      
      // Auto-select first conversation if none is selected
      if (formattedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(formattedConversations[0].id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Không thể tải cuộc trò chuyện');
      setLoading(false);
    }
  };
  
  // Hàm lấy tin nhắn của cuộc trò chuyện đã chọn
  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await ApiService.get(`/conversation/${conversationId}/messages`, true);
      
      // Format dữ liệu
      const formattedMessages = response.map(msg => ({
        id: msg._id,
        sender: msg.sender_id === currentUser.id ? 'me' : 'other',
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleString(),
        isRead: msg.is_read
      }));
      
      setMessages(formattedMessages);
      setLoading(false);
      
      // Đánh dấu là đã đọc trên server
      try {
        await ApiService.put(`/conversation/${conversationId}/read`, {}, true);
      } catch (readError) {
        console.error('Error marking messages as read:', readError);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Không thể tải tin nhắn');
      setLoading(false);
    }
  };
  
  // Hàm xử lý khi đang gõ
  const handleTyping = () => {
    if (socketRef.current && selectedConversation) {
      socketRef.current.emit('typing', {
        conversationId: selectedConversation,
        isTyping: true
      });
      
      // Clear typing status after 3 seconds
      setTimeout(() => {
        socketRef.current.emit('typing', {
          conversationId: selectedConversation,
          isTyping: false
        });
      }, 3000);
    }
  };
  
  // Hàm gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      // Lưu nội dung tin nhắn để sau khi xử lý xong input trống
      const messageContent = newMessage;
      
      // Clear input ngay lập tức để UX tốt hơn
      setNewMessage('');
      
      // ID tạm thời cho tin nhắn
      const tempId = Date.now().toString();
      
      // Thêm tin nhắn vào UI ngay lập tức (optimistic update)
      // setMessages(prev => [...prev, {
      //   id: tempId,
      //   sender: 'me',
      //   text: messageContent,
      //   timestamp: new Date().toLocaleString(),
      //   isRead: false
      // }]);
      
      // Cập nhật danh sách cuộc trò chuyện
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation 
            ? { ...conv, lastMessage: messageContent, timestamp: new Date().toLocaleString() }
            : conv
        )
      );
      
      
      
      if (socketRef.current && socketRef.current.connected) {
        // Gửi tin nhắn qua Socket.IO
        socketRef.current.emit('send-message', {
          conversationId: selectedConversation,
          content: messageContent
        });
      } else {
        console.log("Socket not connected, falling back to API");
        // Fallback dùng API
        const response = await ApiService.post('/api/conversation/send', {
          conversationId: selectedConversation,
          content: messageContent
        }, true);
        
        // Nếu dùng API, thay ID tạm thời bằng ID thực từ server
        if (response && response._id) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempId 
                ? {...msg, id: response._id}
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại sau.');
    }
  };

  // Tìm cuộc trò chuyện được chọn
  const selectedConversationData = conversations.find(
    conv => conv.id === selectedConversation
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations List */}
      <div className="w-1/4 bg-white border-r">
        <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Nhắn tin</h2>
          <button>-</button>
        </div>
        
        {loading && conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Không có cuộc trò chuyện nào</div>
        ) : (
          conversations.map((conv) => (
            <div 
              key={conv.id} 
              className={`p-4 flex items-center hover:bg-gray-100 cursor-pointer ${
                selectedConversation === conv.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <div className="relative">
                <img 
                  src={conv.image} 
                  className='w-12 h-12 rounded-full mr-3 object-cover'
                  alt={conv.name}
                />
                {/* Hiển thị số lượng tin nhắn chưa đọc */}
                {unreadCounts[conv.id] && unreadCounts[conv.id] > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCounts[conv.id] > 9 ? '9+' : unreadCounts[conv.id]}
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold">{conv.name}</h3>
                <p className="text-gray-500 text-sm">{conv.lastMessage}</p>
              </div>
              {conv.unread && (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      {selectedConversationData ? (
        <div className="w-3/4 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white p-4 flex items-center border-b">
            <div className="">
              <img 
                src={selectedConversationData.image} 
                className='w-12 h-12 rounded-full mr-3 object-cover'
                alt={selectedConversationData.name}
              />
            </div>
            <div>
              <h3 className="font-semibold">{selectedConversationData.name}</h3>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <div className='w-3 h-3 rounded-full bg-green-600'></div>
                Đang hoạt động
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {loading && messages.length === 0 ? (
              <div className="text-center text-gray-500">Đang tải tin nhắn...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500">Hãy bắt đầu cuộc trò chuyện</div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${
                      msg.sender === 'me' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div 
                      className={`
                        max-w-[70%] p-3 rounded-lg 
                        ${msg.sender === 'me' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-200 text-black'
                        }
                      `}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {typing[selectedConversation] && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* This empty div helps with scrolling to bottom */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white p-4 flex items-center border-t">
            <button className="mr-2">
              <Paperclip size={24} className="text-gray-500" />
            </button>
            <button className="mr-2">
              <Smile size={24} className="text-gray-500" />
            </button>
            <input 
              type="text" 
              placeholder="Nhập tin nhắn..."
              className="flex-grow bg-gray-100 p-2 rounded-full mr-2"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyUp={handleTyping}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="bg-purple-600 text-white p-2 rounded-full"
            >
              <SendHorizontal size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-3/4 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
          <div className="text-center">
            <p className="mb-2">Chọn một cuộc trò chuyện để bắt đầu</p>
            {conversations.length === 0 && !loading && (
              <p>
                Bạn chưa có cuộc trò chuyện nào. Hãy ghé thăm một cửa hàng 
                và bắt đầu trò chuyện!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;