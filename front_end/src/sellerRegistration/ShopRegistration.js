import React, { useState, useEffect } from 'react';
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
  CreditCard,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

const ShopRegistration = () => {
  const navigate = useNavigate();

  // State quản lý form
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    CCCD: '',
    address: '',
    description: '',
    website: '',
    nation_id: null,
    province_id: null,
    logo: null,
    image_cover: null,
    identityCardImage: null, // Không có trong model nhưng cần cho quá trình xác minh
    businessLicense: null    // Không có trong model nhưng cần cho quá trình xác minh
  });

  // State quản lý các bước đăng ký
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [terms, setTerms] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch user và categories khi component mount
  useEffect(() => {
    const fetchUserAndCategories = async () => {
      try {
        // Kiểm tra đăng nhập
        if (!AuthService.isLoggedIn()) {
          navigate('/login', { state: { from: '/shop/register' } });
          return;
        }

        const userData = AuthService.getCurrentUser();
        setUser(userData);

        // Pre-fill form với thông tin user
        setFormData(prev => ({
          ...prev,
          email: userData.email || '',
          phone: userData.phone || '',
          // Tạo username từ email (loại bỏ @...)
          username: userData.email ? userData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() : ''
        }));

        // Fetch danh mục
        setLoading(true);
        const categoriesData = await ApiService.get('/categories', false); // public API, không cần token
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');

        // Fallback categories nếu API fail
        setCategories([
          { _id: "1", name: 'MÁY TÍNH & LAPTOP', count: 14 },
          { _id: "2", name: 'ĐỒNG HỒ', count: 10 },
          { _id: "3", name: 'THỜI TRANG NAM', count: 7 },
          { _id: "4", name: 'THỜI TRANG NỮ', count: 5 },
          { _id: "5", name: 'ĐỒ GIA DỤNG', count: 8 },
          { _id: "6", name: 'MẸ & BÉ', count: 6 },
          { _id: "7", name: 'MỸ PHẨM', count: 12 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndCategories();
  }, [navigate]);

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
    setError(null);

    if (currentStep === 1 && selectedCategories.length === 0) {
      setError('Vui lòng chọn ít nhất một danh mục sản phẩm');
      return;
    }

    if (currentStep === 2) {
      // Validate fields in step 2
      const requiredFields = ['name', 'username', 'phone', 'email', 'CCCD', 'address'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        setError('Vui lòng điền đầy đủ các trường bắt buộc');
        return;
      }

      // Validate username format (no spaces, special chars)
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(formData.username)) {
        setError('Username chỉ được chứa chữ cái, số và dấu gạch dưới');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Email không hợp lệ');
        return;
      }
    }

    if (currentStep === 3 && !terms) {
      setError('Vui lòng đồng ý với điều khoản dịch vụ');
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

  // Helper function để upload file trực tiếp với ApiService
  const uploadFile = async (url, formData) => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-access-token': token
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  // Upload shop images (logo & image_cover)
  const uploadShopImages = async (shopId) => {
    try {
      const uploadPromises = [];

      // Upload logo
      if (formData.logo) {
        const logoFormData = new FormData();
        logoFormData.append('image', formData.logo);
        logoFormData.append('field', 'logo');

        const logoUpload = uploadFile(
          `${ApiService.API_URL}/shops/upload/${shopId}`,
          logoFormData
        );

        uploadPromises.push(logoUpload);
      }

      // Upload image_cover
      if (formData.image_cover) {
        const coverFormData = new FormData();
        coverFormData.append('image', formData.image_cover);
        coverFormData.append('field', 'image_cover');

        const coverUpload = uploadFile(
          `${ApiService.API_URL}/shops/upload/${shopId}`,
          coverFormData
        );

        uploadPromises.push(coverUpload);
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

    } catch (error) {
      console.error('Error uploading shop images:', error);
      throw new Error('Không thể tải lên hình ảnh cửa hàng');
    }
  };

  // Upload documents (identityCardImage & businessLicense)
  const uploadDocuments = async () => {
    try {
      // Skip if no documents to upload
      if (!formData.identityCardImage && !formData.businessLicense) {
        return;
      }

      const documentsFormData = new FormData();

      if (formData.identityCardImage) {
        documentsFormData.append('identityCardImage', formData.identityCardImage);
      }

      if (formData.businessLicense) {
        documentsFormData.append('businessLicense', formData.businessLicense);
      }

      await uploadFile(
        `${ApiService.API_URL}/documents/upload`,
        documentsFormData
      );

    } catch (error) {
      console.error('Error uploading documents:', error);
      throw new Error('Không thể tải lên giấy tờ xác minh');
    }
  };

  // Save shop categories
  const saveShopCategories = async (shopId) => {
    try {
      const token = AuthService.getToken();
      const response = await fetch(
        `${ApiService.API_URL}/shop-categories/${shopId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify({ categoryIds: selectedCategories })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save shop categories');
      }
    } catch (error) {
      console.error('Error saving shop categories:', error);
      throw new Error('Không thể lưu danh mục sản phẩm');
    }
  };

  // Xử lý submit form - FIXED VERSION
  // This is the fixed handleSubmit function with extensive token debugging

  const handleSubmit = async () => {
    if (!AuthService.isLoggedIn()) {
      setError('Bạn cần đăng nhập để thực hiện chức năng này');
      navigate('/login', { state: { from: '/shop/register' } });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Debug user object
      const user = AuthService.getCurrentUser();
      console.log("Current user object:", user);

      // Debug token
      const token = AuthService.getToken();
      console.log("Token from AuthService:", token);

      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      // 1. Tạo shop mới
      const shopData = {
        name: formData.name,
        username: formData.username,
        phone: formData.phone,
        email: formData.email,
        CCCD: formData.CCCD,
        address: formData.address,
        description: formData.description || '',
        website: formData.website || '',
        nation_id: formData.nation_id || null,
        province_id: formData.province_id || null
      };

      console.log("Sending request to create shop with data:", shopData);
      console.log("API URL:", `${ApiService.API_URL}/shops/create`);
      console.log("Using token header:", { 'x-access-token': token });

      // Make the request with explicit debugging
      const response = await fetch(`${ApiService.API_URL}/shops/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(shopData)
      });

      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error('Authentication failed - token invalid or expired');

        // Attempt to get full error details
        const errorText = await response.text();
        console.error('Full error response:', errorText);

        // Clear user data and force re-login
        AuthService.logout();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => {
          return { message: `Server error: ${response.status} ${response.statusText}` };
        });
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || `Lỗi server: ${response.status}`);
      }

      // Parse successful response
      const data = await response.json();
      console.log("Shop creation successful:", data);
      const shopId = data.shop._id;

      // Rest of your function for uploading images, documents, etc.
      // ...

      // QUAN TRỌNG: Cập nhật thông tin người dùng sau khi tạo cửa hàng
      // Sẽ lấy role SELLER mới từ server
      try {
        console.log("Refreshing user info to get updated roles...");
        await AuthService.refreshUserInfo();
        console.log("User info refreshed successfully");
      } catch (refreshError) {
        console.error("Failed to refresh user info:", refreshError);
        // Tiếp tục xử lý ngay cả khi không thể làm mới thông tin người dùng
      }

      setSuccess(true);

      // Làm mới trang/chuyển hướng để Header được cập nhật
      setTimeout(() => {
        // Option 1: Chuyển hướng đến trang chính để làm mới toàn bộ ứng dụng
        // window.location.href = '/shop/my-shop';

        // Option 2: Sử dụng navigate để chuyển hướng nhưng không load lại trang
        navigate('/shop/my-shop');
      }, 3000);

    } catch (error) {
      console.error('Error in shop registration:', error);

      setError(error.message || 'Có lỗi xảy ra khi đăng ký cửa hàng');

      if (error.message.includes('đăng nhập') ||
        error.message.includes('token') ||
        error.message.includes('Unauthorized')) {
        setTimeout(() => {
          navigate('/login', { state: { from: '/shop/register' } });
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị thông báo lỗi
  const renderError = () => {
    if (!error) return null;

    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
        <AlertCircle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
        <span>{error}</span>
      </div>
    );
  };

  // Hiển thị thông báo thành công
  const renderSuccess = () => {
    if (!success) return null;

    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-start">
        <CheckCircle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="font-medium">Đăng ký cửa hàng thành công!</p>
          <p>Chúng tôi đang xem xét thông tin của bạn và sẽ liên hệ trong vòng 24h. Bạn sẽ được chuyển hướng đến trang quản lý cửa hàng...</p>
        </div>
      </div>
    );
  };

  // Render step 1: Chọn danh mục
  const renderCategorySelection = () => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Chọn danh mục sản phẩm bạn muốn bán</h2>
        <p className="text-gray-600 mb-6">Bạn có thể chọn nhiều danh mục phù hợp với sản phẩm của mình</p>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin text-purple-600 mr-2" />
            <span>Đang tải danh mục...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(category => (
            <div
              key={category._id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedCategories.includes(category._id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
                }`}
              onClick={() => handleCategorySelect(category._id)}
            >
              <div className="relative h-40 mb-3 bg-gray-100 flex items-center justify-center rounded">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <Package size={48} className="text-gray-400" />
                )}
                {selectedCategories.includes(category._id) && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-center">{category.name}</h3>
              <p className="text-gray-500 text-sm text-center">{category.count || 0} Sản phẩm</p>
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
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Tên đăng nhập phải là duy nhất, không chứa khoảng trắng và ký tự đặc biệt</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả cửa hàng</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                name="CCCD"
                value={formData.CCCD}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
                <select
                  name="nation_id"
                  value={formData.nation_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Chọn quốc gia</option>
                  <option value="1">Việt Nam</option>
                  {/* Thêm các quốc gia khác nếu cần */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <select
                  name="province_id"
                  value={formData.province_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Chọn tỉnh/thành</option>
                  <option value="1">Hà Nội</option>
                  <option value="2">TP. Hồ Chí Minh</option>
                  <option value="3">Đà Nẵng</option>
                  {/* Thêm các tỉnh thành khác */}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Tải lên hình ảnh</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo cửa hàng</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Kéo thả file hoặc click để tải lên</p>
                <input
                  type="file"
                  name="logo"
                  onChange={handleFileChange}
                  className="w-full mt-2"
                  accept="image/*"
                />
                {formData.logo && (
                  <div className="mt-2 text-sm text-green-600">
                    Đã chọn: {formData.logo.name}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa cửa hàng</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Kéo thả file hoặc click để tải lên</p>
                <input
                  type="file"
                  name="image_cover"
                  onChange={handleFileChange}
                  className="w-full mt-2"
                  accept="image/*"
                />
                {formData.image_cover && (
                  <div className="mt-2 text-sm text-green-600">
                    Đã chọn: {formData.image_cover.name}
                  </div>
                )}
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
              {formData.identityCardImage && (
                <div className="mt-2 text-sm text-green-600">
                  Đã chọn: {formData.identityCardImage.name}
                </div>
              )}
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
              {formData.businessLicense && (
                <div className="mt-2 text-sm text-green-600">
                  Đã chọn: {formData.businessLicense.name}
                </div>
              )}
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
                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.number
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

      {success ? (
        renderSuccess()
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          {renderError()}

          {currentStep === 1 && renderCategorySelection()}
          {currentStep === 2 && renderShopInfo()}
          {currentStep === 3 && renderDocuments()}

          <div className="flex justify-between mt-10">
            <button
              type="button"
              onClick={handlePrevStep}
              className={`px-6 py-2 border border-gray-300 rounded-md text-gray-700 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              disabled={currentStep === 1 || loading}
            >
              Quay lại
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className={`px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center ${loading ? 'opacity-70 cursor-wait' : ''
                }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Đang xử lý...
                </>
              ) : (
                currentStep === 3 ? 'Đăng ký cửa hàng' : 'Tiếp tục'
              )}
            </button>
          </div>
        </div>
      )}

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