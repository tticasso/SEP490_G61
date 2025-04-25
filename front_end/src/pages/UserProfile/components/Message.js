import React, { useState, useEffect, useRef } from 'react';
import { SendHorizontal, Paperclip, Smile, MessageSquare } from 'lucide-react';
import donghoAvatar from '../../../assets/donghoAvatar.jpg';
import ApiService from '../../../services/ApiService';
import AuthService from '../../../services/AuthService';
import { BE_API_URL } from '../../../config/config';
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
  // Thêm state để lưu thông tin người tham gia và trạng thái
  const [participants, setParticipants] = useState({});
  const [onlineStatuses, setOnlineStatuses] = useState({});
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
    socketRef.current = io(BE_API_URL, {
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

  useEffect(() => {
    if (socketRef.current) {
      // Make sure we're listening to the correct event
      socketRef.current.on('user-status-changed', ({ userId, status }) => {
        setOnlineStatuses(prev => ({
          ...prev,
          [userId]: status
        }));
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('user-status-changed');
      }
    };
  }, []);

  // Lấy thông tin người tham gia khi chọn conversation
  useEffect(() => {
    if (selectedConversation) {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation) {
        fetchParticipantDetails(conversation);
      }
    }
  }, [selectedConversation]);

  // Hàm lấy thông tin chi tiết người tham gia
  const fetchParticipantDetails = async (conversation) => {
    try {
      // Kiểm tra xem conversation có tồn tại không
      if (!conversation) {
        console.log('Không thể lấy thông tin - conversation không tồn tại');
        return;
      }
  
      // Find id of the other participant - với kiểm tra null
      const otherParticipantId = conversation.participantId;
      if (!otherParticipantId) {
        console.log('Không có participant ID');
        return;
      }
  
      try {
        const response = await ApiService.get(`/user-status/participant/${otherParticipantId}`, true);
  
        // Store participant info
        setParticipants(prev => ({
          ...prev,
          [otherParticipantId]: response
        }));
  
        // Update online status
        setOnlineStatuses(prev => ({
          ...prev,
          [otherParticipantId]: response.status
        }));
  
      } catch (error) {
        console.error('Error fetching participant details:', error);
        // Vẫn tiếp tục xử lý - không dừng lại nếu API lỗi
      }
  
    } catch (error) {
      console.error('Error in fetchParticipantDetails:', error);
    }
  };

  // Tải tin nhắn khi chọn cuộc trò chuyện
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);

      // Refresh participant status when selecting a conversation
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation && conversation.participantId) {
        ApiService.get(`/user-status/${conversation.participantId}`, true)
          .then(response => {
            setOnlineStatuses(prev => ({
              ...prev,
              [conversation.participantId]: response.status
            }));
          })
          .catch(error => {
            console.error('Error fetching participant status:', error);
          });
      }

      // Join the conversation room via Socket.IO
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

      // Format data and calculate unread counts
      let totalUnreadMessages = 0;
      const newUnreadCounts = {};

      const formattedConversations = response.map(conv => {
        // Tìm người tham gia khác
        const otherParticipant = conv.participants.find(
          p => p && p._id && p._id.toString() !== currentUser.id.toString()
        );

        // Save participant ID of the other user (an toàn với null check)
        const participantId = otherParticipant?._id;

        // Check unread messages
        const unreadCount = conv.unread_count || 0;

        if (unreadCount > 0) {
          newUnreadCounts[conv._id] = unreadCount;
          totalUnreadMessages += unreadCount;
        }

        // Xác định người dùng có phải là chủ shop hay không, an toàn hơn
        let isShopOwner = false;
        if (conv.shop_id && conv.shop_id.user_id) {
          // Sử dụng toString cẩn thận với các giá trị có thể là null/undefined
          const shopOwnerId = String(conv.shop_id.user_id || '');
          const currentUserId = String(currentUser.id || '');
          isShopOwner = shopOwnerId && currentUserId && shopOwnerId === currentUserId;
        } else if (conv.isShopOwner) {
          isShopOwner = true;
        }

        // Xác định tên hiển thị phù hợp và an toàn với trường hợp null
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

        // Thêm logs để debug nếu cần
        // console.log(`Conversation: ${conv._id}, isShopOwner: ${isShopOwner}, displayName: ${displayName}`);

        return {
          id: conv._id,
          name: displayName,
          lastMessage: conv.last_message || 'Bắt đầu trò chuyện',
          image: conv.shop_id?.logo || donghoAvatar,
          timestamp: new Date(conv.last_message_time || Date.now()).toLocaleString(),
          unread: unreadCount > 0,
          participantId: participantId,
          isShopOwner: isShopOwner,
          shopId: conv.shop_id?._id
        };
      });

      setConversations(formattedConversations);
      setUnreadCounts(newUnreadCounts);
      setTotalUnread(totalUnreadMessages);

      // Notify Header about unread message count
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
    // Kiểm tra và làm sạch nội dung tin nhắn
    const cleanMessage = newMessage.trim();

    if (!cleanMessage || !selectedConversation) return;

    // Kiểm tra độ dài tin nhắn
    if (cleanMessage.length > 500) {
      alert('Tin nhắn không được vượt quá 500 ký tự');
      return;
    }

    try {
      // Lưu nội dung tin nhắn để sau khi xử lý xong input trống
      const messageContent = cleanMessage;

      // Clear input ngay lập tức để UX tốt hơn
      setNewMessage('');

      // ID tạm thời cho tin nhắn
      const tempId = Date.now().toString();

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
                ? { ...msg, id: response._id }
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

  // Cuộn đến tin nhắn mới khi người dùng nhấn nút cuộn
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full">
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-1/3 border-r overflow-hidden flex flex-col">
          <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Nhắn tin</h2>
            <button>-</button>
          </div>

          <div className="flex-grow overflow-y-auto">
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
                  className={`p-4 flex items-center hover:bg-gray-100 cursor-pointer ${selectedConversation === conv.id ? 'bg-gray-100' : ''
                    }`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center">
                      {conv.image ? (
                        <img
                          src={conv.image}
                          className="w-full h-full object-cover"
                          alt={conv.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = donghoAvatar; // Fallback to default avatar on error
                          }}
                        />
                      ) : (
                        <div className="bg-purple-100 text-purple-600 w-full h-full flex items-center justify-center text-lg font-semibold">
                          {conv.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    {/* Hiển thị số lượng tin nhắn chưa đọc */}
                    {unreadCounts[conv.id] && unreadCounts[conv.id] > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm border border-white">
                        {unreadCounts[conv.id] > 9 ? '9+' : unreadCounts[conv.id]}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0 ml-3">
                    <h3 className="font-semibold text-gray-800 truncate">{conv.name}</h3>
                    <p className="text-gray-500 w-[100px] text-sm truncate">{conv.lastMessage}</p>
                    <p className="text-gray-400 text-xs">{conv.timestamp}</p>
                  </div>
                  {conv.unread && (
                    <div className="w-2 h-2 bg-red-500 rounded-full ml-2 flex-shrink-0"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        {selectedConversationData ? (
          <div className="w-2/3 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 flex items-center border-b shadow-sm bg-white">
  <div className="flex-shrink-0">
    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center">
      {selectedConversationData.image ? (
        <img
          src={selectedConversationData.image}
          className="w-full h-full object-cover"
          alt={selectedConversationData.name || "Cuộc trò chuyện"}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = donghoAvatar; // Fallback to default avatar on error
          }}
        />
      ) : (
        <div className="bg-purple-100 text-purple-600 w-full h-full flex items-center justify-center text-lg font-semibold">
          {(selectedConversationData.name || "?").charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  </div>
  <div className="flex-grow ml-3">
    <h3 className="font-semibold text-gray-800">{selectedConversationData.name || "Cuộc trò chuyện"}</h3>
    <p className="text-gray-500 text-sm flex items-center gap-1">
      {selectedConversationData.participantId && onlineStatuses[selectedConversationData.participantId] && (
        <>
          <div className={`w-3 h-3 rounded-full ${
            onlineStatuses[selectedConversationData.participantId] === 'online'
              ? 'bg-green-600'
              : onlineStatuses[selectedConversationData.participantId] === 'recently'
                ? 'bg-yellow-500'
                : 'bg-gray-400'
          }`}></div>
          <span>
            {onlineStatuses[selectedConversationData.participantId] === 'online'
              ? 'Đang hoạt động'
              : onlineStatuses[selectedConversationData.participantId] === 'recently'
                ? 'Vừa hoạt động gần đây'
                : 'Không hoạt động'}
          </span>
        </>
      )}
    </p>
  </div>
</div>

            {/* Messages - Fixed scroll issues */}
            <div className="flex-grow overflow-auto h-[500px] p-4 space-y-3 bg-gray-50 overflow-x-hidden">
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
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[70%] p-3 break-words
                          ${msg.sender === 'me'
                            ? 'bg-purple-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                            : 'bg-white text-gray-800 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl border border-gray-100'
                          }
                        `}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-purple-200' : 'text-gray-400'} text-right`}>
                          {msg.timestamp.split(' ')[1]}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {typing[selectedConversation] && (
                    <div className="flex justify-start">
                      <div className="bg-white px-4 py-2 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl border border-gray-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* This empty div helps with manual scrolling to bottom */}
                  <div ref={messagesEndRef} className="h-3" />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-3 flex items-center border-t bg-white">
              <div className="flex items-center w-full bg-gray-100 rounded-full px-4 py-2">
                <button className="text-gray-500 hover:text-purple-600 mr-3 transition-colors">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  className="flex-grow bg-transparent p-1 focus:outline-none text-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyUp={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="text-gray-500 hover:text-purple-600 mr-2 transition-colors">
                  <Smile size={20} />
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 text-white p-3 rounded-full ml-3 hover:bg-purple-700 transition-colors focus:outline-none"
              >
                <SendHorizontal size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-2/3 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
            <div className="text-center p-8 max-w-md">
              <div className="mb-6 bg-gray-200 p-6 rounded-full inline-block">
                <MessageSquare size={40} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Chọn một cuộc trò chuyện</h3>
              <p className="mb-2">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin</p>
              {conversations.length === 0 && !loading && (
                <p className="text-sm bg-purple-50 p-3 rounded mt-4 border border-purple-100">
                  Bạn chưa có cuộc trò chuyện nào. Hãy ghé thăm một cửa hàng
                  và bắt đầu trò chuyện!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;