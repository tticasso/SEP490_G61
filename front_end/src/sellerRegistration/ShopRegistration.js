import React, { useState } from 'react';
import { 
  Store, 
  CheckCircle, 
  Upload, 
  Info, 
  Package, 
  MapPin, 
  Phone, 
  Mail,
  FileText,
  CreditCard
} from 'lucide-react';
// Giả lập các hình ảnh danh mục
import laptopCategory from '../assets/laptopCategory.jpg';
import donghoAvatar from '../assets/donghoAvatar.jpg';
import quanao from '../assets/quanao.jpg';
import kitchenware from '../assets/kitchenWare.jpg';
import babyToys from '../assets/babyToys.jpg';
import cosmetic from '../assets/cosmetic.jpg';


const ShopRegistration = () => {
  // State quản lý form
  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    identityCard: '',
    bankAccount: '',
    bankName: '',
    categories: [],
    profileImage: null,
    coverImage: null,
    identityCardImage: null,
    businessLicense: null,
  });
  
  // State quản lý các bước đăng ký
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [terms, setTerms] = useState(false);
  
  // Danh sách danh mục sản phẩm
  const categories = [
    { id: 1, name: 'MÁY TÍNH & LAPTOP', image: laptopCategory, count: 14 },
    { id: 2, name: 'ĐỒNG HỒ', image: donghoAvatar, count: 10 },
    { id: 3, name: 'THỜI TRANG NAM', image: quanao, count: 7 },
    { id: 4, name: 'THỜI TRANG NỮ', image: quanao, count: 5 },
    { id: 5, name: 'ĐỒ GIA DỤNG', image: kitchenware, count: 8 },
    { id: 6, name: 'MẸ & BÉ', image: babyToys, count: 6 },
    { id: 7, name: 'MỸ PHẨM', image: cosmetic, count: 12 }
  ];
  
  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Xử lý chọn danh mục
  const handleCategorySelect = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };
  
  // Xử lý upload file
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };
  
  // Xử lý chuyển bước
  const handleNextStep = () => {
    if (currentStep === 1 && selectedCategories.length === 0) {
      alert('Vui lòng chọn ít nhất một danh mục sản phẩm');
      return;
    }
    
    if (currentStep === 3 && !terms) {
      alert('Vui lòng đồng ý với điều khoản dịch vụ');
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Xử lý submit form
      handleSubmit();
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Xử lý submit form
  const handleSubmit = () => {
    // Tạo form data để gửi lên server
    const submitData = {
      ...formData,
      categories: selectedCategories
    };
    
    console.log('Form submitted:', submitData);
    alert('Đăng ký cửa hàng thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24h.');
    window.location.href = '/'
  };
  
  // Render step 1: Chọn danh mục
  const renderCategorySelection = () => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Chọn danh mục sản phẩm bạn muốn bán</h2>
        <p className="text-gray-600 mb-6">Bạn có thể chọn nhiều danh mục phù hợp với sản phẩm của mình</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(category => (
            <div 
              key={category.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedCategories.includes(category.id) 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <div className="relative h-40 mb-3">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover rounded"
                />
                {selectedCategories.includes(category.id) && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-center">{category.name}</h3>
              <p className="text-gray-500 text-sm text-center">{category.count} Sản phẩm</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render step 2: Thông tin cửa hàng
  const renderShopInfo = () => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Thông tin cửa hàng</h2>
        <p className="text-gray-600 mb-6">Vui lòng điền đầy đủ thông tin cửa hàng của bạn</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng *</label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả cửa hàng</label>
              <textarea
                name="shopDescription"
                value={formData.shopDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên chủ cửa hàng *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cửa hàng *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số CMND/CCCD *</label>
              <input
                type="text"
                name="identityCard"
                value={formData.identityCard}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản ngân hàng *</label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngân hàng *</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Tải lên hình ảnh</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện cửa hàng</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Kéo thả file hoặc click để tải lên</p>
                <input
                  type="file"
                  name="profileImage"
                  onChange={handleFileChange}
                  className="w-full mt-2"
                  accept="image/*"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa cửa hàng</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Kéo thả file hoặc click để tải lên</p>
                <input
                  type="file"
                  name="coverImage"
                  onChange={handleFileChange}
                  className="w-full mt-2"
                  accept="image/*"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render step 3: Giấy tờ và xác nhận
  const renderDocuments = () => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Tải lên giấy tờ xác thực</h2>
        <p className="text-gray-600 mb-6">Để đảm bảo tính xác thực, vui lòng tải lên các giấy tờ sau</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh CMND/CCCD (mặt trước và sau) *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Kéo thả file hoặc click để tải lên</p>
              <input
                type="file"
                name="identityCardImage"
                onChange={handleFileChange}
                className="w-full mt-2"
                accept="image/*"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giấy phép kinh doanh (nếu có)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Kéo thả file hoặc click để tải lên</p>
              <input
                type="file"
                name="businessLicense"
                onChange={handleFileChange}
                className="w-full mt-2"
                accept="image/*,.pdf"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <Info className="text-yellow-500 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800">Lưu ý quan trọng</h4>
              <ul className="list-disc pl-5 mt-2 text-sm text-yellow-700 space-y-1">
                <li>Các thông tin và giấy tờ của bạn sẽ được bảo mật tuyệt đối</li>
                <li>Quá trình xét duyệt có thể mất từ 1-3 ngày làm việc</li>
                <li>Nếu thông tin không chính xác, đơn đăng ký của bạn có thể bị từ chối</li>
                <li>Sau khi được phê duyệt, bạn có thể bắt đầu đăng bán sản phẩm</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={terms}
              onChange={() => setTerms(!terms)}
              className="mt-1 mr-3"
            />
            <span className="text-sm text-gray-700">
              Tôi đã đọc và đồng ý với <a href="#" className="text-purple-600 hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-purple-600 hover:underline">Chính sách bán hàng</a> của Trooc. Tôi cam kết tuân thủ các quy định về bán hàng và chịu trách nhiệm về các sản phẩm đăng bán.
            </span>
          </label>
        </div>
      </div>
    );
  };
  
  // Render step indicators
  const renderStepIndicators = () => {
    const steps = [
      { number: 1, title: 'Chọn danh mục', icon: Package },
      { number: 2, title: 'Thông tin cửa hàng', icon: Store },
      { number: 3, title: 'Xác nhận', icon: FileText },
    ];
    
    return (
      <div className="flex justify-center mb-10">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.number 
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                <step.icon size={20} />
              </div>
              <div className="text-sm mt-2 font-medium text-gray-600">{step.title}</div>
            </div>
            
            {index < steps.length - 1 && (
              <div className="w-20 md:w-32 h-1 mt-5 mx-2 bg-gray-200">
                <div 
                  className="h-full bg-purple-600" 
                  style={{ width: currentStep > step.number ? '100%' : '0%' }}
                ></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  // Main render function
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Đăng ký trở thành người bán trên Trooc</h1>
        <p className="text-gray-600 mt-2">Tiếp cận hàng triệu khách hàng và phát triển kinh doanh của bạn</p>
      </div>
      
      {renderStepIndicators()}
      
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        {currentStep === 1 && renderCategorySelection()}
        {currentStep === 2 && renderShopInfo()}
        {currentStep === 3 && renderDocuments()}
        
        <div className="flex justify-between mt-10">
          <button
            type="button"
            onClick={handlePrevStep}
            className={`px-6 py-2 border border-gray-300 rounded-md text-gray-700 ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
            disabled={currentStep === 1}
          >
            Quay lại
          </button>
          
          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            {currentStep === 3 ? 'Đăng ký cửa hàng' : 'Tiếp tục'}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Lợi ích khi bán hàng trên Trooc</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Store className="text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-1">Tiếp cận khách hàng</h3>
              <p className="text-sm text-gray-600">Kết nối với hàng triệu khách hàng tiềm năng trên nền tảng của chúng tôi</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-1">Mở rộng địa bàn</h3>
              <p className="text-sm text-gray-600">Bán hàng toàn quốc không giới hạn địa lý, mở rộng thị trường của bạn</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-1">Thanh toán an toàn</h3>
              <p className="text-sm text-gray-600">Hệ thống thanh toán bảo mật, đảm bảo quyền lợi cho người bán</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopRegistration;