import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const AddStock = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [note, setNote] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Xử lý quay lại
  const handleGoBack = () => {
    navigate('/seller-dashboard/import-history');
  };

  // Xử lý lưu và hiển thị
  const handleSaveAndShow = () => {
    alert('Lưu thành công!');
    navigate('/seller-dashboard/import-history');
  };

  // Xử lý thêm sản phẩm
  const handleAddProduct = () => {
    alert('Chức năng thêm sản phẩm đang được phát triển');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <button 
                className="mr-4 text-gray-600 hover:text-gray-900"
                onClick={handleGoBack}
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-bold">Quay lại</h1>
            </div>
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center"
              onClick={handleSaveAndShow}
            >
              <span className="mr-2">Lưu và hiển thị</span>
            </button>
          </div>
          
          {/* Content */}
          <div className="space-y-6">
            {/* Sản phẩm Section */}
            <div className="bg-white p-6 rounded-md shadow-sm">
              <h2 className="text-xl font-bold mb-4">Sản Phẩm</h2>
              <p className="text-gray-500 mb-4">Chọn sản phẩm muốn nhập thêm.</p>
              
              <div className="flex space-x-4 mb-4">
                <input
                  type="text"
                  placeholder="Search"
                  className="border rounded-md px-4 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  onClick={handleAddProduct}
                >
                  Thêm
                </button>
              </div>
              
              <div className="flex justify-center items-center py-10 border rounded-md bg-gray-50">
                <p className="text-gray-400">Chưa có sản phẩm nào</p>
              </div>
            </div>
            
            {/* Ghi chú Section */}
            <div className="bg-white p-6 rounded-md shadow-sm">
              <h2 className="text-gray-700 font-medium mb-2">Ghi chú <span className="text-gray-400">(option)</span></h2>
              <textarea
                className="w-full border rounded-md p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>
            
            {/* Bottom Save Button */}
            <div className="flex justify-end">
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center"
                onClick={handleSaveAndShow}
              >
                <span className="mr-2">Lưu và hiển thị</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStock;