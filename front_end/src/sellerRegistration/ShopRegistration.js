import React, { useState, useEffect } from 'react';
import {
  Store,
  CheckCircle,
  Upload,
  Info,
  Package,
  MapPin,
  FileText,
  CreditCard,
  AlertCircle,
  Loader,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

const ShopRegistration = () => {
  const navigate = useNavigate();

  // State quản lý form
  const [formData, setFormData] = useState({
    name: '',
    username: '', // Thêm lại username nhưng sẽ tự động tạo từ email, không hiển thị trong UI
    phone: '',
    email: '',
    CCCD: '',
    address: '',
    description: '',
    logo: null,
    image_cover: null,
    identityCardFront: null, // Ảnh mặt trước CCCD
    identityCardBack: null,  // Ảnh mặt sau CCCD
    businessLicense: null    // Không có trong model nhưng cần cho quá trình xác minh
  });

  // Thêm state cho file và preview
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [identityFrontFile, setIdentityFrontFile] = useState(null);
  const [identityBackFile, setIdentityBackFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [identityFrontPreview, setIdentityFrontPreview] = useState(null);
  const [identityBackPreview, setIdentityBackPreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);

  // State quản lý các bước đăng ký
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [terms, setTerms] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  
  // Thêm state để theo dõi tiến trình
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  // Component ProgressBar để hiển thị tiến trình
  const ProgressBar = ({ percent, status }) => {
    if (percent === 0) return null;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm text-gray-600">{status}</div>
          <div className="text-sm font-medium text-gray-900">{percent}%</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    );
  };

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
        const email = userData.email || '';
        let username = '';
        
        if (email) {
          // Tạo username từ phần đầu của email và loại bỏ ký tự đặc biệt
          username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        }
        
        setFormData(prev => ({
          ...prev,
          email: email,
          phone: userData.phone || '',
          username: username
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
    
    // Tự động tạo username từ email nếu email thay đổi
    if (name === 'email' && value) {
      // Tạo username từ phần đầu của email và loại bỏ ký tự đặc biệt
      const username = value.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        username: username
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Xử lý chọn danh mục
  const handleCategorySelect = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Xử lý upload file - Cập nhật để thêm preview
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files[0]) return;
    
    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    
    // Cập nhật file và preview tương ứng
    switch (name) {
      case 'logo':
        setLogoFile(file);
        setLogoPreview(previewUrl);
        break;
      case 'image_cover':
        setCoverFile(file);
        setCoverPreview(previewUrl);
        break;
      case 'identityCardFront':
        setIdentityFrontFile(file);
        setIdentityFrontPreview(previewUrl);
        break;
      case 'identityCardBack':
        setIdentityBackFile(file);
        setIdentityBackPreview(previewUrl);
        break;
      case 'businessLicense':
        setLicenseFile(file);
        setLicensePreview(previewUrl);
        break;
      default:
        break;
    }
    
    // Cập nhật formData
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };

  // Xử lý xóa ảnh preview
  const handleRemoveImage = (fieldName) => {
    switch (fieldName) {
      case 'logo':
        setLogoFile(null);
        setLogoPreview(null);
        break;
      case 'image_cover':
        setCoverFile(null);
        setCoverPreview(null);
        break;
      case 'identityCardFront':
        setIdentityFrontFile(null);
        setIdentityFrontPreview(null);
        break;
      case 'identityCardBack':
        setIdentityBackFile(null);
        setIdentityBackPreview(null);
        break;
      case 'businessLicense':
        setLicenseFile(null);
        setLicensePreview(null);
        break;
      default:
        break;
    }
    
    // Cập nhật formData
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  // Function upload ảnh shop - cập nhật để hỗ trợ thêm ảnh CCCD
  const uploadShopImage = async (file, field, shopId) => {
    if (!file || !shopId) return null;
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('field', field); // field: 'logo', 'image_cover', 'identity_card_image_front', 'identity_card_image_back', 'business_license'
      
      const response = await ApiService.uploadFile(`/shops/upload/${shopId}`, formData);
      
      if (response) {
        // Trả về URL tương ứng với loại ảnh
        if (field === 'logo' && response.logo) {
          return response.logo;
        } else if (field === 'image_cover' && response.image_cover) {
          return response.image_cover;
        } else if (field === 'identity_card_image_front' && response.identity_card_image_front) {
          return response.identity_card_image_front;
        } else if (field === 'identity_card_image_back' && response.identity_card_image_back) {
          return response.identity_card_image_back;
        } else if (field === 'business_license' && response.business_license) {
          return response.business_license;
        } else {
          console.log('Response from upload:', response);
          return null;
        }
      } else {
        throw new Error('URL hình ảnh không hợp lệ');
      }
    } catch (error) {
      console.error(`Lỗi upload ảnh ${field}:`, error);
      // Không throw error, chỉ log và trả về null
      return null;
    }
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
      const requiredFields = ['name', 'phone', 'email', 'CCCD', 'address'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        setError('Vui lòng điền đầy đủ các trường bắt buộc');
        return;
      }

      // Tạo hoặc cập nhật username từ email
      if (formData.email && (!formData.username || formData.username.trim() === '')) {
        const generatedUsername = formData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        setFormData(prev => ({
          ...prev,
          username: generatedUsername
        }));
        console.log("Auto-generated username from email:", generatedUsername);
      }

      // Validate CCCD format (exactly 12 digits)
      const cccdRegex = /^\d{12}$/;
      if (!cccdRegex.test(formData.CCCD)) {
        setError('Số CCCD phải có đúng 12 chữ số');
        return;
      }

      // Validate phone format (Vietnamese phone number: starts with 0 and has 10 digits)
      const phoneRegex = /^(0[3-9])[0-9]{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('Số điện thoại không hợp lệ. Phải có 10 chữ số và bắt đầu bằng 0');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Email không hợp lệ');
        return;
      }
    }

    if (currentStep === 3) {
      // Kiểm tra xem đã tải lên ảnh CCCD chưa (cả mặt trước và mặt sau)
      if (!identityFrontFile) {
        setError('Vui lòng tải lên ảnh mặt trước CMND/CCCD');
        return;
      }
      
      if (!identityBackFile) {
        setError('Vui lòng tải lên ảnh mặt sau CMND/CCCD');
        return;
      }
      
      // Kiểm tra điều khoản
      if (!terms) {
        setError('Vui lòng đồng ý với điều khoản dịch vụ');
        return;
      }
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

  // Xử lý submit form - Đã cập nhật để upload song song
  const handleSubmit = async () => {
    console.log("handleSubmit called");
    
    if (!AuthService.isLoggedIn()) {
      setError('Bạn cần đăng nhập để thực hiện chức năng này');
      navigate('/login', { state: { from: '/shop/register' } });
      return;
    }

    // Kiểm tra xem có đủ ảnh CCCD chưa (cả mặt trước và mặt sau)
    if (!identityFrontFile) {
      setError('Vui lòng tải lên ảnh mặt trước CMND/CCCD');
      return;
    }
    
    if (!identityBackFile) {
      setError('Vui lòng tải lên ảnh mặt sau CMND/CCCD');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Hiển thị tiến trình
      setProgressStatus('Đang khởi tạo cửa hàng...');
      setProgressPercent(10);

      // Kiểm tra lại username
      let usernameValue = formData.username || '';
      if (!usernameValue && formData.email) {
        usernameValue = formData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        console.log("Re-generating username at submission time:", usernameValue);
      }

      // Chuẩn bị dữ liệu shop (không bao gồm ảnh, sẽ upload sau)
      const shopData = {
        name: formData.name,
        username: usernameValue,
        phone: formData.phone,
        email: formData.email,
        CCCD: formData.CCCD,
        address: formData.address,
        description: formData.description || '',
      };
      
      // Log để debug
      console.log("Sending request to create shop with data:", JSON.stringify(shopData, null, 2));

      // 1. Tạo shop mới
      setProgressStatus('Đang tạo cửa hàng...');
      setProgressPercent(20);
      const response = await ApiService.post('/shops/create', shopData);
      console.log("Shop creation successful:", response);
      
      if (!response || !response.shop || !response.shop._id) {
        throw new Error('Phản hồi từ server không hợp lệ hoặc thiếu thông tin shop');
      }
      
      const shopId = response.shop._id;
      let hasUploadError = false;
      
      // 2. Setup tất cả các upload trong một mảng Promise
      setProgressStatus('Đang tải lên ảnh...');
      setProgressPercent(40);
      
      const uploadPromises = [];
      const uploadResults = {
        logoUrl: null,
        coverUrl: null,
        identityFrontUrl: null,
        identityBackUrl: null,
        licenseUrl: null
      };
      
      // Thêm các file vào danh sách upload
      if (logoFile) {
        uploadPromises.push(
          uploadShopImage(logoFile, 'logo', shopId)
            .then(url => { uploadResults.logoUrl = url; })
            .catch(err => { 
              console.error("Lỗi upload logo:", err);
              hasUploadError = true;
            })
        );
      }
      
      if (coverFile) {
        uploadPromises.push(
          uploadShopImage(coverFile, 'image_cover', shopId)
            .then(url => { uploadResults.coverUrl = url; })
            .catch(err => { 
              console.error("Lỗi upload ảnh bìa:", err);
              hasUploadError = true;
            })
        );
      }
      
      // CCCD mặt trước (bắt buộc)
      if (identityFrontFile) {
        uploadPromises.push(
          uploadShopImage(identityFrontFile, 'identity_card_image_front', shopId)
            .then(url => { 
              uploadResults.identityFrontUrl = url;
              if (!url) hasUploadError = true;
            })
            .catch(err => { 
              console.error("Lỗi upload ảnh mặt trước CMND/CCCD:", err);
              hasUploadError = true;
            })
        );
      }
      
      // CCCD mặt sau (bắt buộc)
      if (identityBackFile) {
        uploadPromises.push(
          uploadShopImage(identityBackFile, 'identity_card_image_back', shopId)
            .then(url => { 
              uploadResults.identityBackUrl = url;
              if (!url) hasUploadError = true;
            })
            .catch(err => { 
              console.error("Lỗi upload ảnh mặt sau CMND/CCCD:", err);
              hasUploadError = true;
            })
        );
      }
      
      // Giấy phép kinh doanh (không bắt buộc)
      if (licenseFile) {
        uploadPromises.push(
          uploadShopImage(licenseFile, 'business_license', shopId)
            .then(url => { uploadResults.licenseUrl = url; })
            .catch(err => { 
              console.error("Lỗi upload giấy phép kinh doanh:", err);
              // Không bắt buộc nên không set hasUploadError = true
            })
        );
      }
      
      // Thực hiện tất cả các upload song song
      await Promise.all(uploadPromises);
      console.log("Upload kết quả:", uploadResults);
      
      // 3. Lưu danh mục cửa hàng
      setProgressStatus('Đang lưu danh mục...');
      setProgressPercent(80);
      
      if (shopId && selectedCategories.length > 0) {
        try {
          await ApiService.post(`/shop-categories/${shopId}`, { categoryIds: selectedCategories });
          console.log("Shop categories saved successfully");
        } catch (err) {
          console.error("Error saving shop categories:", err);
        }
      }

      // 4. Cập nhật thông tin người dùng
      setProgressStatus('Đang hoàn tất...');
      setProgressPercent(90);
      
      try {
        console.log("Refreshing user info to get updated roles...");
        await AuthService.refreshUserInfo();
        console.log("User info refreshed successfully");
      } catch (refreshError) {
        console.error("Failed to refresh user info:", refreshError);
      }

      setProgressPercent(100);
      setProgressStatus('Hoàn tất đăng ký!');
      setSuccess(true);
      
      // Hiển thị cảnh báo nếu có lỗi upload ảnh
      if (hasUploadError) {
        setError('Cửa hàng đã được tạo nhưng có lỗi khi tải lên một số hình ảnh. Bạn có thể cập nhật sau trong trang "Cửa hàng của tôi".');
      }

      // 5. Chuyển hướng sau khi đăng ký thành công
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Error in shop registration:', error);
      
      // Đảm bảo error.message tồn tại trước khi sử dụng
      const errorMessage = error && typeof error === 'object' && error.message ? 
        error.message : 'Có lỗi xảy ra khi đăng ký cửa hàng';
      setError(errorMessage);

      // Kiểm tra xem error.message có tồn tại không trước khi sử dụng includes
      if (error && typeof error === 'object' && error.message && (
        error.message.includes('đăng nhập') ||
        error.message.includes('token') ||
        error.message.includes('Unauthorized'))) {
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
          <p>Chúng tôi đang xem xét thông tin của bạn và sẽ liên hệ trong vòng 24h. Bạn sẽ được chuyển hướng về trang chủ sau 5 giây...</p>
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

  // Render step 2: Thông tin cửa hàng (Cập nhật phần upload ảnh)
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
                placeholder="Nhập 10 số, bắt đầu bằng số 0"
              />
              <p className="text-xs text-gray-500 mt-1">Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0</p>
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
                placeholder="Nhập 12 chữ số"
              />
              <p className="text-xs text-gray-500 mt-1">Số CCCD phải có đúng 12 chữ số</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Tải lên hình ảnh</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo cửa hàng</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                onClick={() => document.getElementById('logo-upload').click()}
              >
                {logoPreview ? (
                  <div className="relative">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="max-h-48 mx-auto mb-2"
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage('logo');
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                    <p className="text-sm text-gray-500">Nhấp để thay đổi</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Kéo thả file hoặc click để tải lên</p>
                  </>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  name="logo"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>

            {/* Image Cover Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa cửa hàng</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                onClick={() => document.getElementById('cover-upload').click()}
              >
                {coverPreview ? (
                  <div className="relative">
                    <img 
                      src={coverPreview} 
                      alt="Cover preview" 
                      className="max-h-48 mx-auto mb-2"
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage('image_cover');
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                    <p className="text-sm text-gray-500">Nhấp để thay đổi</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Kéo thả file hoặc click để tải lên</p>
                  </>
                )}
                <input
                  id="cover-upload"
                  type="file"
                  name="image_cover"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render step 3: Giấy tờ và xác nhận (Cập nhật phần upload giấy tờ với 2 ảnh CCCD)
  const renderDocuments = () => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Tải lên giấy tờ xác thực</h2>
        <p className="text-gray-600 mb-6">Để đảm bảo tính xác thực, vui lòng tải lên các giấy tờ sau</p>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">CMND/CCCD (bắt buộc)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity Card Front Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mặt trước CMND/CCCD <span className="text-red-500">*</span>
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                onClick={() => document.getElementById('identity-front-upload').click()}
              >
                {identityFrontPreview ? (
                  <div className="relative">
                    <img 
                      src={identityFrontPreview} 
                      alt="Identity front preview" 
                      className="max-h-48 mx-auto mb-2"
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage('identityCardFront');
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                    <p className="text-sm text-gray-500">Nhấp để thay đổi</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Tải lên ảnh mặt trước CMND/CCCD</p>
                    <p className="text-xs text-red-500 mt-1">Bắt buộc</p>
                  </>
                )}
                <input
                  id="identity-front-upload"
                  type="file"
                  name="identityCardFront"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  required
                />
              </div>
            </div>

            {/* Identity Card Back Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mặt sau CMND/CCCD <span className="text-red-500">*</span>
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                onClick={() => document.getElementById('identity-back-upload').click()}
              >
                {identityBackPreview ? (
                  <div className="relative">
                    <img 
                      src={identityBackPreview} 
                      alt="Identity back preview" 
                      className="max-h-48 mx-auto mb-2"
                    />
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage('identityCardBack');
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                    <p className="text-sm text-gray-500">Nhấp để thay đổi</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Tải lên ảnh mặt sau CMND/CCCD</p>
                    <p className="text-xs text-red-500 mt-1">Bắt buộc</p>
                  </>
                )}
                <input
                  id="identity-back-upload"
                  type="file"
                  name="identityCardBack"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business License Upload */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Giấy phép kinh doanh (không bắt buộc)</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giấy phép kinh doanh (nếu có)</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
              onClick={() => document.getElementById('license-upload').click()}
            >
              {licensePreview ? (
                <div className="relative">
                  <img 
                    src={licensePreview} 
                    alt="License preview" 
                    className="max-h-48 mx-auto mb-2"
                  />
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage('businessLicense');
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                  <p className="text-sm text-gray-500">Nhấp để thay đổi</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Kéo thả file hoặc click để tải lên</p>
                </>
              )}
              <input
                id="license-upload"
                type="file"
                name="businessLicense"
                onChange={handleFileChange}
                className="hidden"
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
                <li>Ảnh CMND/CCCD phải rõ nét, đủ thông tin cả mặt trước và mặt sau</li>
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
        
        {/* Hiển thị thanh tiến trình */}
        {progressPercent > 0 && (
          <div className="mt-4">
            <ProgressBar percent={progressPercent} status={progressStatus} />
          </div>
        )}
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