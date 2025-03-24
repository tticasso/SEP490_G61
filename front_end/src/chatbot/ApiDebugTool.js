// SEP490_G61/front_end/src/chatbot/ApiDebugTool.js
import React, { useState } from 'react';

const ApiDebugTool = () => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Kiểm tra API test endpoint
  const testApiConnection = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/openai/test');
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setError(`Lỗi kết nối: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Kiểm tra API chat endpoint với tin nhắn đơn giản
  const testChatApi = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              id: 1,
              text: "Xin chào",
              sender: "user",
              time: new Date()
            }
          ]
        })
      });
      
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setError(`Lỗi kết nối: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg mt-4">
      <h2 className="text-lg font-semibold mb-2">API Debug Tool</h2>
      <div className="space-x-2 mb-4">
        <button 
          onClick={testApiConnection}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          Test API Connection
        </button>
        <button 
          onClick={testChatApi}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={loading}
        >
          Test Chat API
        </button>
      </div>
      
      {loading && <p className="text-gray-600">Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {response && (
        <div className="mt-2">
          <h3 className="font-medium">Phản hồi:</h3>
          <pre className="bg-gray-800 text-green-400 p-3 rounded overflow-auto max-h-40 text-sm">{response}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiDebugTool;