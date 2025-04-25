import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { MessageEventBus } from '../Message';
import ApiService from '../../../../services/ApiService';
import AuthService from '../../../../services/AuthService';
import { BE_API_URL } from '../../../../config/config';
import { useLocation } from 'react-router-dom';

const MessageBubble = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState({});
  const [onlineStatuses, setOnlineStatuses] = useState({});
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const messageWindowRef = useRef(null);
  const currentUser = AuthService.getCurrentUser();
  const location = useLocation();
  
  // Kiểm tra xem có đang ở trang user-profile không
  const isOnUserProfilePage = location.pathname.includes('/user-profile') || location.pathname.includes('/admin');

  // Lắng nghe sự kiện có tin nhắn mới
  useEffect(() => {
    const unsubscribe = MessageEventBus.subscribe('unreadCountChanged', (count) => {
      setUnreadCount(count);
      
      // Kích hoạt animation khi có tin nhắn mới
      if (count > 0) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 2000); // Dừng animation sau 2 giây
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Lấy danh sách cuộc trò chuyện khi component mount
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Xử lý cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Đóng chat khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageWindowRef.current && !messageWindowRef.current.contains(event.target) && 
          !event.target.closest('.message-bubble-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Đóng chat nếu chuyển đến trang user profile
  useEffect(() => {
    if (isOnUserProfilePage) {
      setIsOpen(false);
    }
  }, [isOnUserProfilePage]);

  // Hàm lấy danh sách cuộc trò chuyện
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/conversation/user', true);
  
      // Format data và tính toán số tin nhắn chưa đọc
      let totalUnreadMessages = 0;
      
      const formattedConversations = response.map(conv => {
        // Tìm người tham gia khác (với kiểm tra null)
        const otherParticipant = conv.participants.find(
          p => p && p._id && p._id.toString() !== currentUser.id.toString()
        );
  
        // Lưu participantId (an toàn với null)
        const participantId = otherParticipant?._id;
        
        // Đếm tin nhắn chưa đọc
        const unreadCount = conv.unread_count || 0;
        if (unreadCount > 0) {
          totalUnreadMessages += unreadCount;
        }
  
        // Xác định người dùng có phải là chủ shop hay không (cẩn thận với null)
        let isShopOwner = false;
        if (conv.shop_id && conv.shop_id.user_id) {
          const shopOwnerId = String(conv.shop_id.user_id || '');
          const currentUserId = String(currentUser.id || '');
          isShopOwner = shopOwnerId && currentUserId && shopOwnerId === currentUserId;
        } else if (conv.isShopOwner) {
          isShopOwner = true;
        }
  
        // Xác định tên hiển thị hợp lý
        let displayName;
        
        if (conv.shop_id) {
          if (isShopOwner) {
            // Nếu là chủ shop, hiển thị tên khách hàng (cẩn thận với null)
            if (otherParticipant) {
              displayName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() || 'Khách hàng';
            } else {
              displayName = 'Khách hàng'; // Fallback khi không tìm thấy thông tin người dùng
            }
          } else {
            // Nếu là khách hàng, hiển thị tên cửa hàng
            displayName = conv.shop_id.name || 'Cửa hàng';
          }
        } else if (otherParticipant) {
          // Cuộc trò chuyện thông thường giữa các người dùng
          displayName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() || 'Người dùng';
        } else {
          displayName = "Người dùng không xác định";
        }
  
        return {
          id: conv._id,
          name: displayName,
          lastMessage: conv.last_message || 'Bắt đầu trò chuyện',
          image: conv.shop_id?.logo || `${BE_API_URL}/uploads/avatar/default.png`,
          timestamp: new Date(conv.last_message_time || Date.now()).toLocaleString(),
          unread: unreadCount > 0,
          participantId: participantId,
          isShopOwner: isShopOwner,
          shopId: conv.shop_id?._id
        };
      });
  
      setConversations(formattedConversations);
      
      // Thông báo Header về số tin nhắn chưa đọc
      MessageEventBus.publish('unreadCountChanged', totalUnreadMessages);
  
      // Tự động chọn cuộc trò chuyện đầu tiên nếu có
      if (formattedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(formattedConversations[0].id);
        fetchMessages(formattedConversations[0].id);
      }
  
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Không thể tải cuộc trò chuyện');
      setLoading(false);
    }
  };

  // Hàm lấy tin nhắn của cuộc trò chuyện
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

      // Đánh dấu là đã đọc
      try {
        await ApiService.put(`/conversation/${conversationId}/read`, {}, true);
        fetchConversations(); // Refresh để cập nhật số tin nhắn chưa đọc
      } catch (readError) {
        console.error('Error marking messages as read:', readError);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Không thể tải tin nhắn');
      setLoading(false);
    }
  };

  // Hàm gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Kiểm tra và làm sạch nội dung tin nhắn
    const cleanMessage = newMessage.trim();
    if (!cleanMessage || !selectedConversation) return;

    // Reset input
    setNewMessage('');

    try {
      // Cập nhật giao diện với tin nhắn tạm thời
      const tempMessage = {
        id: Date.now().toString(),
        sender: 'me',
        text: cleanMessage,
        timestamp: new Date().toLocaleString(),
        isRead: false
      };

      setMessages(prev => [...prev, tempMessage]);

      // Gửi tin nhắn qua API
      await ApiService.post('/conversation/send', {
        conversationId: selectedConversation,
        content: cleanMessage
      }, true);

      // Refresh conversation list để cập nhật last_message
      setTimeout(() => {
        fetchConversations();
      }, 500);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại sau.');
    }
  };

  // Toggle hiển thị cửa sổ chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchConversations();
    }
  };

  // Nếu đang ở trang user-profile, không hiển thị bong bóng
  if (isOnUserProfilePage) {
    return null;
  }

  return (
    <>
      {/* Nút bong bóng tin nhắn */}
      <div className="relative">
        <button
          onClick={toggleChat}
          className={`fixed bottom-24 right-6 w-14 h-14 rounded-full ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white flex items-center justify-center shadow-lg transition-colors z-50 ${isAnimating ? 'animate-bounce' : ''} message-bubble-button`}
          aria-label="Tin nhắn"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
        
        {/* Hiển thị số tin nhắn chưa đọc */}
        {!isOpen && unreadCount > 0 && (
          <div className="fixed bottom-24 right-6 transform translate-y-[-20px] translate-x-[20px] bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full z-50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div 
          ref={messageWindowRef}
          className="fixed bottom-40 right-6 w-80 md:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-40 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Tin nhắn của bạn</h3>
                <p className="text-xs opacity-80">
                  {selectedConversation ? 'Đang trò chuyện' : 'Chọn một cuộc trò chuyện'}
                </p>
              </div>
              <button className='bg-blue-400 p-2 rounded text-sm hover:bg-blue-500' onClick={() => window.location.href = '/user-profile/messages'}> Chuyển tới tin nhắn</button>
            </div>
          </div>

          {/* Phần nội dung */}
          <div className="flex-1 flex">
            {/* Danh sách cuộc trò chuyện (1/3 chiều rộng) */}
            <div className="w-1/3 border-r overflow-y-auto bg-gray-50">
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
                    className={`p-2 flex items-center hover:bg-gray-100 cursor-pointer ${selectedConversation === conv.id ? 'bg-gray-200' : ''}`}
                    onClick={() => {
                      setSelectedConversation(conv.id);
                      fetchMessages(conv.id);
                    }}
                  >
                    <div className="relative">
                      {/* <img
                        src={conv.image}
                        className="w-10 h-10 rounded-full mr-2 object-cover"
                        alt={conv.name}
                        onError={(e) => {
                          e.target.src = `${BE_API_URL}/uploads/avatar/default.png`;
                        }}
                      /> */}
                      {conv.unread && (
                        <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3"></div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium text-sm truncate">{conv.name}</p>
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Khung chat (2/3 chiều rộng) */}
            <div className="w-2/3 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Khu vực tin nhắn */}
                  <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
                    {loading && messages.length === 0 ? (
                      <div className="text-center p-4 text-gray-500">Đang tải tin nhắn...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center p-4 text-gray-500">Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`my-1 max-w-[90%] py-2 ${message.sender === 'me' ? 'ml-auto' : 'mr-auto'}`}
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              message.sender === 'me'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input gửi tin nhắn */}
                  <form onSubmit={handleSendMessage} className="p-2 border-t flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-3 py-2 rounded-r hover:bg-indigo-700"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p>Vui lòng chọn một cuộc trò chuyện</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;