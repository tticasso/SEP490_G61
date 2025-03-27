import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash, 
  ChevronDown,
  Loader,
  X
} from 'lucide-react';
import Sidebar from './Sidebar';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editMode = location.pathname.includes('edit-product');
  const editProductId = editMode ? location.pathname.split('/').pop() : null;
  
  // Track loading and error states
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // State for fetched data
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [shop, setShop] = useState(null);
  
  // Form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    detail: '',
    thumbnail: '',
    slug: '',
    category_id: [],
    brand_id: '',
    meta_title: '',
    meta_keyword: '',
    meta_description: '',
    weight: '',
    condition: 'new', // Default value
    is_active: true,
    is_hot: false,
    is_feature: false,
    is_delete: false
  });
  
  const [imageFile, setImageFile] = useState(null);
  
  // Fetch necessary data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);
        
        // Fetch all required data
        let userShop;
        let fetchedCategories = [];
        let fetchedBrands = [];
        
        try {
          // Fetch user's shop
          userShop = await ApiService.get('/shops/my-shop');
          setShop(userShop);
        } catch (err) {
          console.warn('Không thể tải thông tin shop:', err);
          // Sử dụng shop mẫu
          userShop = { _id: 'sample-shop-id', name: 'Shop mẫu' };
          setShop(userShop);
        }
        
        try {
          // Thử lấy categories
          fetchedCategories = await ApiService.get('/categories');
        } catch (err) {
          console.warn('Không thể tải danh mục:', err);
          // Sử dụng danh mục mẫu
          fetchedCategories = [
            { _id: 'phone', name: 'Điện thoại' },
            { _id: 'skincare', name: 'Chăm sóc da' },
            { _id: 'electronics', name: 'Thiết bị điện tử' }
          ];
        }
        setCategories(fetchedCategories || []);
        
        try {
          // Thử lấy brands
          fetchedBrands = await ApiService.get('/brand');
        } catch (err) {
          console.warn('Không thể tải thương hiệu:', err);
          // Sử dụng thương hiệu mẫu
          fetchedBrands = [
            { _id: 'apple', name: 'Apple' },
            { _id: 'samsung', name: 'Samsung' },
            { _id: 'xiaomi', name: 'Xiaomi' }
          ];
        }
        setBrands(fetchedBrands || []);
        
        // If in edit mode, fetch the product details
        if (editMode && editProductId) {
          try {
            const product = await ApiService.get(`/product/${editProductId}`);
            
            // Populate form with product details
            setNewProduct({
              name: product.name || '',
              price: product.price?.toString() || '',
              weight: product.weight?.toString() || '',
              description: product.description || '',
              detail: product.detail || '',
              category_id: product.category_id?.map(cat => cat._id || cat) || [],
              brand_id: product.brand_id?._id || product.brand_id || '',
              slug: product.slug || '',
              meta_title: product.meta_title || '',
              meta_keyword: product.meta_keyword || '',
              meta_description: product.meta_description || '',
              thumbnail: product.thumbnail || '',
              condition: product.condition || 'new',
              is_active: product.is_active !== undefined ? product.is_active : true,
              is_hot: product.is_hot || false,
              is_feature: product.is_feature || false,
              is_delete: product.is_delete || false
            });
          } catch (err) {
            console.error('Error fetching product details:', err);
            setFormErrors({
              submit: 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.'
            });
          }
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setFormErrors({
          submit: 'Không thể tải dữ liệu ban đầu. Vui lòng thử lại sau.'
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchInitialData();
  }, [editMode, editProductId]);

  // Generate slug from product name
  useEffect(() => {
    if (newProduct.name && !editMode && !newProduct.slug) {
      const generatedSlug = newProduct.name
        .toLowerCase()
        .replace(/[^\w\s]/gi, '') // Remove special characters
        .replace(/\s+/g, '-'); // Replace spaces with dashes
      
      setNewProduct(prev => ({
        ...prev,
        slug: generatedSlug,
        meta_title: prev.meta_title || newProduct.name
      }));
    }
  }, [newProduct.name, editMode, newProduct.slug]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle checkbox/toggle input change
  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: checked
    });
  };

  // Handle category select change (multiple)
  const handleCategoryChange = (e) => {
    // Convert selected options to array of values
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    
    setNewProduct({
      ...newProduct,
      category_id: selectedOptions
    });
    
    // Clear error for this field
    if (formErrors.category_id) {
      setFormErrors({
        ...formErrors,
        category_id: ''
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a temporary URL for preview
      setNewProduct({
        ...newProduct,
        thumbnail: URL.createObjectURL(file)
      });
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return newProduct.thumbnail;
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      console.log('Uploading image file:', imageFile.name, imageFile.size, imageFile.type);
      
      const uploadedImage = await ApiService.uploadFile('/upload/product-image', formData);
      
      console.log('Upload response:', uploadedImage);
      
      if (uploadedImage && uploadedImage.url) {
        return uploadedImage.url;
      } else {
        console.error('Invalid response:', uploadedImage);
        throw new Error('URL hình ảnh không hợp lệ');
      }
    } catch (error) {
      console.error('Error in uploadImage function:', error);
      throw new Error('Không thể tải lên hình ảnh sản phẩm');
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    if (!newProduct.name) errors.name = 'Tên sản phẩm là bắt buộc';
    if (!newProduct.price) errors.price = 'Giá sản phẩm là bắt buộc';
    if (!newProduct.slug) errors.slug = 'Slug là bắt buộc';
    if (!newProduct.description) errors.description = 'Mô tả sản phẩm là bắt buộc';
    if (!newProduct.detail) errors.detail = 'Chi tiết sản phẩm là bắt buộc';
    if (!newProduct.meta_title) errors.meta_title = 'Meta title là bắt buộc';
    if (!newProduct.weight) errors.weight = 'Khối lượng sản phẩm là bắt buộc';
    
    // Các trường meta và danh mục, thương hiệu đặt dưới mức nghiêm trọng hơn
    if (!newProduct.meta_keyword) errors.meta_keyword = 'Meta keyword là bắt buộc';
    if (!newProduct.meta_description) errors.meta_description = 'Meta description là bắt buộc';
    if (!newProduct.brand_id) errors.brand_id = 'Thương hiệu là bắt buộc';
    if (!newProduct.category_id || newProduct.category_id.length === 0) {
      errors.category_id = 'Danh mục là bắt buộc';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (isActive = true) => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      setFormErrors({});
      
      // Upload image if a new one was selected
      let imageUrl = newProduct.thumbnail;
      if (imageFile) {
        try {
          imageUrl = await uploadImage();
        } catch (err) {
          console.error("Lỗi upload hình ảnh:", err);
          imageUrl = newProduct.thumbnail || ''; // Giữ lại URL cũ nếu upload thất bại
        }
      }
      
      const currentUser = AuthService.getCurrentUser();
      
      // Prepare product data
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        weight: newProduct.weight ? parseFloat(newProduct.weight) : undefined,
        thumbnail: imageUrl,
        shop_id: shop?._id || 'sample-shop',
        is_active: isActive,
        created_by: currentUser?.id || 'sample-user',
        updated_by: currentUser?.id || 'sample-user',
      };
      console.log("dữ liệu trước khi gửi", productData);
      
      let response;
      try {
        if (editMode && editProductId) {
          // Update existing product
          response = await ApiService.put(`/product/edit/${editProductId}`, productData);
        } else {
          // Create new product
          response = await ApiService.post('/product/create', productData);
        }
        setSubmitSuccess(true);
        
        // Hiển thị thông báo thành công
        alert(`Đã ${editMode ? 'cập nhật' : 'thêm'} sản phẩm "${newProduct.name}" thành công!`);
        
        // Điều hướng về trang danh sách sản phẩm
        navigate('/seller-dashboard/product');
      } catch (err) {
        console.error('Error saving product:', err);
        // Hiển thị lỗi
        setFormErrors({
          submit: `Lỗi khi ${editMode ? 'cập nhật' : 'tạo'} sản phẩm: ${err.toString()}`
        });
      }
    } catch (err) {
      console.error('Error in submission:', err);
      setFormErrors({
        submit: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = () => {
    handleSubmit(false); // Save as draft
  };

  const handleSaveAndDisplay = () => {
    handleSubmit(true); // Save and display
  };

  if (loadingData) {
    return (
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <Sidebar onNavigate={(path) => navigate(path)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4" size={32} />
            <p>{editMode ? 'Đang tải thông tin sản phẩm...' : 'Đang khởi tạo...'}</p>
          </div>
        </div>
      </div>
    );
  }

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
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu nháp'}
              </button>
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                onClick={handleSaveAndDisplay}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu và hiển thị'}
              </button>
            </div>
          </div>

          {/* Form content with similar layout to the modal */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-medium mb-6">
              {editMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            
            {formErrors.submit && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-6">
                {formErrors.submit}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên sản phẩm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                
                {/* Giá */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá bán <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={newProduct.slug}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.slug ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.slug && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.slug}</p>
                  )}
                </div>
                
                {/* Thương hiệu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="brand_id"
                    value={newProduct.brand_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.brand_id ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.brand_id && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.brand_id}</p>
                  )}
                </div>
                
                {/* Danh mục */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    multiple
                    name="category_id"
                    value={newProduct.category_id}
                    onChange={handleCategoryChange}
                    className={`w-full px-3 py-2 border ${formErrors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-md h-32`}
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Giữ phím Ctrl (hoặc Command trên Mac) để chọn nhiều danh mục
                  </p>
                  {formErrors.category_id && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.category_id}</p>
                  )}
                </div>
                
                {/* Khối lượng */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khối lượng (gram) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={newProduct.weight}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.weight ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.weight && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.weight}</p>
                  )}
                </div>
                
                {/* Tình trạng */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tình trạng
                  </label>
                  <select
                    name="condition"
                    value={newProduct.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="new">Mới</option>
                    <option value="used">Đã qua sử dụng</option>
                    <option value="refurbished">Tân trang</option>
                  </select>
                </div>
                
                {/* Mô tả */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                  )}
                </div>
                
                {/* Chi tiết */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chi tiết sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="detail"
                    value={newProduct.detail}
                    onChange={handleInputChange}
                    rows={5}
                    className={`w-full px-3 py-2 border ${formErrors.detail ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.detail && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.detail}</p>
                  )}
                </div>
                
                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình ảnh sản phẩm
                  </label>
                  <div 
                    className="border-dashed border-2 border-gray-300 p-4 rounded-md flex items-center justify-center cursor-pointer"
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    {newProduct.thumbnail ? (
                      <div className="text-center">
                        <img 
                          src={newProduct.thumbnail} 
                          alt="Product preview" 
                          className="max-h-48 mx-auto mb-2"
                        />
                        <p className="text-sm text-gray-500">Nhấp để thay đổi hình ảnh</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                        <p className="text-gray-500">Upload or drop a file right here</p>
                        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, JPG...</p>
                      </div>
                    )}
                    <input 
                      id="image-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                
                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={newProduct.meta_title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.meta_title ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.meta_title && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.meta_title}</p>
                  )}
                </div>
                
                {/* Meta Keyword */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Keyword <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="meta_keyword"
                    value={newProduct.meta_keyword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.meta_keyword ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.meta_keyword && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.meta_keyword}</p>
                  )}
                </div>
                
                {/* Meta Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="meta_description"
                    value={newProduct.meta_description}
                    onChange={handleInputChange}
                    rows={2}
                    className={`w-full px-3 py-2 border ${formErrors.meta_description ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {formErrors.meta_description && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.meta_description}</p>
                  )}
                </div>
                
                {/* Status toggles */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={newProduct.is_active}
                      onChange={handleToggleChange}
                      className="h-4 w-4 mr-2"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Hiển thị trên cửa hàng
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_hot"
                      name="is_hot"
                      checked={newProduct.is_hot}
                      onChange={handleToggleChange}
                      className="h-4 w-4 mr-2"
                    />
                    <label htmlFor="is_hot" className="text-sm font-medium text-gray-700">
                      Sản phẩm nổi bật
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_feature"
                      name="is_feature"
                      checked={newProduct.is_feature}
                      onChange={handleToggleChange}
                      className="h-4 w-4 mr-2"
                    />
                    <label htmlFor="is_feature" className="text-sm font-medium text-gray-700">
                      Sản phẩm đặc trưng
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;