import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Users,
  ShoppingBag,
  Star,
  AlertCircle,
  CheckCircle,
  Calendar,
  Upload,
  Save,
  ChevronRight,
  Package
} from 'lucide-react';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import Sidebar from './Sidebar'; // Import Sidebar component

const MyShop = () => {
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    website: ''
  });

  // Ảnh mới được chọn để upload
  const [newLogo, setNewLogo] = useState(null);
  const [newCover, setNewCover] = useState(null);

  // Tạo URL preview cho ảnh được chọn
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!AuthService.isLoggedIn()) {
      navigate('/login', { state: { from: '/shop/my-shop' } });
      return;
    }

    // Kiểm tra xem người dùng có role SELLER không
    const currentUser = AuthService.getCurrentUser();
    const isSeller = currentUser?.roles?.some(role => {
      if (typeof role === 'object' && role !== null) {
        return role.name === "SELLER" || role.name === "ROLE_SELLER";
      }
      if (typeof role === 'string') {
        return role === "SELLER" || role === "ROLE_SELLER";
      }
      return false;
    });

    if (!isSeller) {
      setError('Bạn không có quyền truy cập trang này');
      return;
    }

    // Fetch dữ liệu cửa hàng
    const fetchShopData = async () => {
      try {
        setLoading(true);
        const data = await ApiService.get('/shops/my-shop');
        setShop(data);
        
        // Cập nhật formData với thông tin cửa hàng
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          description: data.description || '',
          website: data.website || ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shop data:', error);
        setError('Cửa hàng của bạn đã bị khóa. Vui lòng liên hệ với số điện thoại 0966768150 hoặc nhắn tin với admin để được hỗ trợ');
        setLoading(false);
      }
    };

    fetchShopData();
  }, [navigate]);

  // Xử lý thay đổi input trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý thay đổi file
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'logo') {
      setNewLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    } else if (type === 'cover') {
      setNewCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Xử lý lưu thông tin cửa hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUpdateSuccess(false);

    try {
      // 1. Cập nhật thông tin cơ bản
      await ApiService.put(`/shops/edit/${shop._id}`, formData);

      // 2. Upload logo nếu có
      if (newLogo) {
        const logoFormData = new FormData();
        logoFormData.append('image', newLogo);
        logoFormData.append('field', 'logo');
        await ApiService.uploadFile(`/shops/upload/${shop._id}`, logoFormData);
      }

      // 3. Upload ảnh bìa nếu có
      if (newCover) {
        const coverFormData = new FormData();
        coverFormData.append('image', newCover);
        coverFormData.append('field', 'image_cover');
        await ApiService.uploadFile(`/shops/upload/${shop._id}`, coverFormData);
      }

      // Fetch lại dữ liệu cửa hàng sau khi cập nhật
      const updatedShop = await ApiService.get(`/shops/my-shop`);
      setShop(updatedShop);
      
      // Reset file previews
      if (newLogo) {
        URL.revokeObjectURL(logoPreview);
        setNewLogo(null);
        setLogoPreview(null);
      }
      
      if (newCover) {
        URL.revokeObjectURL(coverPreview);
        setNewCover(null);
        setCoverPreview(null);
      }

      setUpdateSuccess(true);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating shop:', error);
      setError('Có lỗi xảy ra khi cập nhật thông tin cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị trạng thái của cửa hàng
  const renderShopStatus = () => {
    if (!shop) return null;

    let statusColor = '';
    let statusText = '';
    let statusIcon = null;

    switch (shop.status) {
      case 'active':
        statusColor = 'bg-green-100 text-green-800';
        statusText = 'Hoạt động';
        statusIcon = <CheckCircle size={16} className="mr-1 text-green-600" />;
        break;
      case 'pending':
        statusColor = 'bg-yellow-100 text-yellow-800';
        statusText = 'Đang chờ duyệt';
        statusIcon = <AlertCircle size={16} className="mr-1 text-yellow-600" />;
        break;
      case 'rejected':
        statusColor = 'bg-red-100 text-red-800';
        statusText = 'Bị từ chối';
        statusIcon = <AlertCircle size={16} className="mr-1 text-red-600" />;
        break;
      default:
        statusColor = 'bg-gray-100 text-gray-800';
        statusText = 'Không xác định';
    }

    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
        {statusIcon}
        {statusText}
      </div>
    );
  };

  // Content chính của trang
  const renderMainContent = () => {
    if (loading && !shop) {
      return (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải thông tin cửa hàng...</p>
        </div>
      );
    }

    if (error && !shop) {
      return (
        <div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Quay lại
          </button>
        </div>
      );
    }

    if (!shop) return null;

    return (
      <>
        {/* Thông báo cập nhật thành công */}
        {updateSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">Cập nhật thông tin cửa hàng thành công!</p>
            </div>
          </div>
        )}

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Store className="mr-2" size={28} />
            Cửa hàng của tôi
          </h1>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Edit className="mr-2" size={16} />
              Chỉnh sửa thông tin
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setEditMode(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {loading ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={16} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Ảnh bìa cửa hàng */}
        <div className="relative h-64 rounded-lg overflow-hidden mb-6 bg-gray-100">
          {(shop.image_cover || coverPreview) ? (
            <img
              src={coverPreview || `${process.env.REACT_APP_API_URL || 'http://localhost:9999'}${shop.image_cover}`}
              alt={`${shop.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              <Store size={64} />
            </div>
          )}
          
          {editMode && (
            <div className="absolute bottom-4 right-4">
              <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 bg-opacity-70 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer">
                <Upload className="mr-2" size={16} />
                Thay đổi ảnh bìa
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cover')}
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Thông tin cửa hàng */}
          <div className="lg:w-2/3">
            {!editMode ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start mb-6">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden border bg-white flex-shrink-0 mr-6">
                    {shop.logo ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:9999'}${shop.logo}`}
                        alt={`${shop.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <Store size={36} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h2 className="text-xl font-bold mr-3">{shop.name}</h2>
                      {renderShopStatus()}
                    </div>
                    <p className="text-gray-500 mt-1">@{shop.username}</p>
                    
                    {shop.description ? (
                      <p className="mt-3 text-gray-700">{shop.description}</p>
                    ) : (
                      <p className="mt-3 text-gray-400 italic">Chưa có mô tả cửa hàng</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Thông tin liên hệ</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="text-gray-500 mr-2 mt-1 flex-shrink-0" size={18} />
                      <span>{shop.address || 'Chưa có địa chỉ'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="text-gray-500 mr-2 flex-shrink-0" size={18} />
                      <span>{shop.phone || 'Chưa có số điện thoại'}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="text-gray-500 mr-2 flex-shrink-0" size={18} />
                      <span>{shop.email}</span>
                    </div>
                    {shop.website && (
                      <div className="flex items-center">
                        <Globe className="text-gray-500 mr-2 flex-shrink-0" size={18} />
                        <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                          {shop.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start mb-6">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden border bg-white flex-shrink-0 mr-6">
                    {(logoPreview || shop.logo) ? (
                      <img
                        src={logoPreview || `${process.env.REACT_APP_API_URL || 'http://localhost:9999'}${shop.logo}`}
                        alt={`${shop.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <Store size={36} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer p-2 text-white">
                        <Upload size={20} />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'logo')}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên cửa hàng
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả cửa hàng
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Thông tin liên hệ</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website (nếu có)
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nếu cửa hàng đang ở trạng thái pending, hiển thị thông báo */}
            {shop.status === 'pending' && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-800">Cửa hàng đang chờ xét duyệt</p>
                    <p className="mt-1 text-yellow-700">
                      Đơn đăng ký của bạn đang được xem xét. Quá trình này có thể mất 1-3 ngày làm việc.
                      Chúng tôi sẽ thông báo cho bạn qua email khi có kết quả.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Nếu cửa hàng bị từ chối, hiển thị lý do */}
            {shop.status === 'rejected' && shop.reject_reason && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-red-800">Đơn đăng ký bị từ chối</p>
                    <p className="mt-1 text-red-700">
                      Lý do: {shop.reject_reason}
                    </p>
                    <p className="mt-2 text-red-700">
                      Vui lòng cập nhật thông tin cửa hàng của bạn và liên hệ với chúng tôi để được hỗ trợ.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thống kê và tính năng */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-medium mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Thông tin cửa hàng
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span>{renderShopStatus()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày đăng ký:</span>
                  <span>{new Date(shop.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đánh giá:</span>
                  <div className="flex items-center">
                    <Star className="text-yellow-400 mr-1" size={16} />
                    <span>{shop.rating || 0}/5</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Người theo dõi:</span>
                  <span>{shop.follower || 0}</span>
                </div>
              </div>
            </div>

            {/* <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium mb-4">Tác vụ nhanh</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/seller-dashboard/product')}
                  className="flex items-center justify-between w-full px-4 py-2 text-left text-sm rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <ShoppingBag className="text-purple-600 mr-3" size={18} />
                    <span>Quản lý sản phẩm</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={16} />
                </button>
                <button
                  onClick={() => navigate('/seller-dashboard/orders')}
                  className="flex items-center justify-between w-full px-4 py-2 text-left text-sm rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Package className="text-purple-600 mr-3" size={18} />
                    <span>Quản lý đơn hàng</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={16} />
                </button>
                <button
                  onClick={() => navigate('/seller-dashboard/discounts')}
                  className="flex items-center justify-between w-full px-4 py-2 text-left text-sm rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Calendar className="text-purple-600 mr-3" size={18} />
                    <span>Quản lý khuyến mãi</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={16} />
                </button>
                <button
                  onClick={() => navigate('/seller-dashboard/registed-user')}
                  className="flex items-center justify-between w-full px-4 py-2 text-left text-sm rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Users className="text-purple-600 mr-3" size={18} />
                    <span>Khách hàng đăng ký</span>
                  </div>
                  <ChevronRight className="text-gray-400" size={16} />
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </>
    );
  };

  // Render chính của component
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 p-6">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default MyShop;