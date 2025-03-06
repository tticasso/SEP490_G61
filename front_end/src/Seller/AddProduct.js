import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash, 
  ChevronDown
} from 'lucide-react';
import Sidebar from './Sidebar';

const AddProduct = () => {
  const navigate = useNavigate();
  
  // Form state
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [productType, setProductType] = useState('single');
  const [brand, setBrand] = useState('');
  const [specs, setSpecs] = useState([{ name: '', value: '' }]);

  const handleAddSpec = () => {
    setSpecs([...specs, { name: '', value: '' }]);
  };

  const handleRemoveSpec = (index) => {
    const newSpecs = [...specs];
    newSpecs.splice(index, 1);
    setSpecs(newSpecs);
  };

  const updateSpecName = (index, value) => {
    const newSpecs = [...specs];
    newSpecs[index].name = value;
    setSpecs(newSpecs);
  };

  const updateSpecValue = (index, value) => {
    const newSpecs = [...specs];
    newSpecs[index].value = value;
    setSpecs(newSpecs);
  };

  const categories = [
    { id: 'computer', label: 'Máy tính & laptop', hasSubcategories: true },
    { id: 'watch', label: 'Đồng hồ', hasSubcategories: false },
    { id: 'menFashion', label: 'Thời trang nam', hasSubcategories: true },
    { id: 'womenFashion', label: 'Thời trang nữ', hasSubcategories: true },
    { id: 'momBaby', label: 'Mẹ & bé', hasSubcategories: false },
    { id: 'homeLiving', label: 'Nhà cửa & đời sống', hasSubcategories: false },
    { id: 'beauty', label: 'Sắc đẹp', hasSubcategories: false },
    { id: 'health', label: 'Sức khỏe', hasSubcategories: false },
    { id: 'womenShoes', label: 'Giày dép nữ', hasSubcategories: false },
    { id: 'electronics', label: 'Thiết bị điện tử', hasSubcategories: false }
  ];

  const handleSave = () => {
    // Logic để lưu sản phẩm
    alert('Đã lưu sản phẩm: ' + productName);
  };

  const handleSaveAndDisplay = () => {
    // Logic để lưu và hiển thị sản phẩm
    alert('Đã lưu và hiển thị sản phẩm: ' + productName);
    navigate('/seller-dashboard/product');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-100 min-h-screen">
          {/* Header with back button and action buttons */}
          <div className="flex justify-between items-center mb-6">
            <button 
              className="flex items-center text-gray-600" 
              onClick={() => navigate('/seller-dashboard/product')}
            >
              <ArrowLeft className="mr-2" />
              Quay lại
            </button>
            <div className="flex space-x-4">
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={handleSave}
              >
                Lưu nháp
              </button>
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                onClick={handleSaveAndDisplay}
              >
                Lưu và hiển thị
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side - Product form */}
            <div className="md:w-2/3 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Tổng quan</h2>
              
              {/* Product name */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Tên sản phẩm"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              {/* Price and Weight */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-2">Giá sản phẩm</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-l-md"
                      placeholder="99.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    <div className="bg-gray-100 p-2 border-t border-r border-b rounded-r-md">VND</div>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 mb-2">Khối lượng</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-l-md"
                      placeholder="Khối lượng"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <div className="bg-gray-100 p-2 border-t border-r border-b rounded-r-md">KG</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full p-2 border rounded-md h-32"
                  placeholder="Mô tả sản phẩm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Chi tiết</label>
                <textarea
                  className="w-full p-2 border rounded-md h-32"
                  placeholder="Chi tiết sản phẩm"
                ></textarea>
              </div>

              {/* Product Images */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Hình ảnh</h2>
                <div className="border-dashed border-2 border-gray-300 p-6 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-gray-500">Upload or drop a file right here</p>
                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, JPG...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Categories and details */}
            <div className="md:w-1/3 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Chọn danh mục</h2>
                
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center">
                      <input
                        type="radio"
                        id={cat.id}
                        name="category"
                        value={cat.id}
                        checked={category === cat.id}
                        onChange={() => setCategory(cat.id)}
                        className="mr-2"
                      />
                      <label htmlFor={cat.id} className="flex items-center justify-between w-full">
                        <span>{cat.label}</span>
                        {cat.hasSubcategories && (
                          <ChevronDown className="text-gray-500" size={16} />
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Thương hiệu</h2>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="">Choose Thương hiệu</option>
                  <option value="apple">Apple</option>
                  <option value="samsung">Samsung</option>
                  <option value="xiaomi">Xiaomi</option>
                </select>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Loại sản phẩm</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="singleProduct"
                      name="productType"
                      value="single"
                      checked={productType === 'single'}
                      onChange={() => setProductType('single')}
                      className="mr-2"
                    />
                    <label htmlFor="singleProduct">Sản phẩm đơn</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="variantProduct"
                      name="productType"
                      value="variant"
                      checked={productType === 'variant'}
                      onChange={() => setProductType('variant')}
                      className="mr-2"
                    />
                    <label htmlFor="variantProduct">Sản phẩm có biến thể</label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Thông số kỹ thuật</h2>
                </div>
                
                <div className="flex mb-2">
                  <div className="w-1/2 font-medium">Tên</div>
                  <div className="w-1/2 font-medium">Giá Trị</div>
                </div>

                {specs.map((spec, index) => (
                  <div key={index} className="flex mb-3 items-center">
                    <div className="w-1/2 pr-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="Danh mục"
                        value={spec.name}
                        onChange={(e) => updateSpecName(index, e.target.value)}
                      />
                    </div>
                    <div className="w-1/2 pl-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="Giá trị"
                        value={spec.value}
                        onChange={(e) => updateSpecValue(index, e.target.value)}
                      />
                    </div>
                    {specs.length > 1 && (
                      <button 
                        onClick={() => handleRemoveSpec(index)}
                        className="ml-2 text-red-500"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                ))}

                <button 
                  onClick={handleAddSpec}
                  className="text-purple-600 flex items-center mt-3"
                >
                  <Plus size={16} className="mr-1" />
                  Thêm trường
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;