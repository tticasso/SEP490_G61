import React, { useState } from 'react';
import { SendHorizontal, Paperclip, Smile } from 'lucide-react';
import donghoAvatar from '../../../assets/donghoAvatar.jpg'
import nguoidep from '../../../assets/nguoidep.jpg'

const Message = () => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Vua đồng hồ',
      lastMessage: 'Nhắn tin ngay!!',
      image: donghoAvatar,
      unread: true
    },
    {
      id: 2,
      name: 'HongThom',
      lastMessage: 'Nhắn tin ngay!!',
      image: nguoidep,
      unread: false
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState(null);

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'other', 
      text: 'bạn cần giúp gì', 
      timestamp: '22:9 29/6/2024' 
    },
    { 
      id: 2, 
      sender: 'me', 
      text: 'xin chào', 
      timestamp: '22:8 29/6/2024' 
    },
    { 
      id: 3, 
      sender: 'me', 
      text: 'hj', 
      timestamp: '22:9 29/6/2024' 
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages, 
        { 
          id: messages.length + 1, 
          sender: 'me', 
          text: newMessage, 
          timestamp: new Date().toLocaleString() 
        }
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations List */}
      <div className="w-1/4 bg-white border-r">
        <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Nhắn tin</h2>
          <button>-</button>
        </div>
        {conversations.map((conv) => (
          <div 
            key={conv.id} 
            className={`p-4 flex items-center hover:bg-gray-100 cursor-pointer ${
              selectedConversation === conv.id ? 'bg-gray-100' : ''
            }`}
            onClick={() => setSelectedConversation(conv.id)}
          >
            <div className="">
                <img src={conv.image} className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3'/>
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold">{conv.name}</h3>
              <p className="text-gray-500 text-sm">{conv.lastMessage}</p>
            </div>
            {conv.unread && (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="w-3/4 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white p-4 flex items-center border-b">
          <div className="">
            <img src={donghoAvatar} className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3'/>
          </div>
          <div>
            <h3 className="font-semibold">Vua đồng hồ</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1"><p className='w-3 h-3 rounded-full bg-green-600'></p>Đang hoạt động</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
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
    </div>
  );
};

export default Message;