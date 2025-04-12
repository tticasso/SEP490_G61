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
    condition: 'Mới', // Cambiado de 'new' a 'Mới'
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
          console.error('Không thể tải thông tin shop:', err);
          setShop(null);
        }

        try {
          // Lấy danh mục
          fetchedCategories = await ApiService.get('/categories');
          setCategories(fetchedCategories || []);
        } catch (err) {
          console.error('Không thể tải danh mục:', err);
          setCategories([]);
        }

        try {
          // Lấy thương hiệu
          fetchedBrands = await ApiService.get('/brand');
          setBrands(fetchedBrands || []);
        } catch (err) {
          console.error('Không thể tải thương hiệu:', err);
          setBrands([]);
        }

        // If in edit mode, fetch the product details
        if (editMode && editProductId) {
          try {
            const product = await ApiService.get(`/product/${editProductId}`);

            // Xử lý giá trị condition nếu nó đang là "new" từ database
            let conditionValue = product.condition || 'Mới';
            // Nếu giá trị là "new" từ database, chuyển đổi sang "Mới"
            if (conditionValue === "new") {
              conditionValue = "Mới";
            }

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
              condition: conditionValue, // Usando el valor convertido
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

  // Handle category checkbox change
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      // Add the category to the array if checked
      setNewProduct({
        ...newProduct,
        category_id: [...newProduct.category_id, value]
      });
    } else {
      // Remove the category from the array if unchecked
      setNewProduct({
        ...newProduct,
        category_id: newProduct.category_id.filter(catId => catId !== value)
      });
    }

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
      // Kiểm tra loại file
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      if (!validImageTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file hình ảnh (JPEG, JPG, PNG, GIF, WEBP)');
        e.target.value = ''; // Reset input file
        return;
      }

      console.log("File được chọn:", file.name, file.type, file.size);
      setImageFile(file);
      // Tạo URL tạm thời để preview
      setNewProduct({
        ...newProduct,
        thumbnail: URL.createObjectURL(file)
      });
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

      const currentUser = AuthService.getCurrentUser();

      // Tạo FormData để gửi cả dữ liệu sản phẩm và file ảnh
      const formData = new FormData();

      // Thêm trường is_active dựa trên tham số
      formData.append('is_active', isActive);

      // Thêm các trường cơ bản
      formData.append('name', newProduct.name);
      formData.append('price', parseFloat(newProduct.price));
      formData.append('description', newProduct.description);
      formData.append('detail', newProduct.detail);
      formData.append('slug', newProduct.slug);
      formData.append('brand_id', newProduct.brand_id);
      formData.append('meta_title', newProduct.meta_title);
      formData.append('meta_keyword', newProduct.meta_keyword);
      formData.append('meta_description', newProduct.meta_description);
      formData.append('condition', newProduct.condition); // Ahora enviará "Mới" o "Đã qua sử dụng"

      // Thêm trường khối lượng nếu có
      if (newProduct.weight) {
        formData.append('weight', parseFloat(newProduct.weight));
      }

      // Thêm các trường boolean
      formData.append('is_hot', newProduct.is_hot);
      formData.append('is_feature', newProduct.is_feature);
      formData.append('is_delete', newProduct.is_delete);

      // Thêm shop_id và thông tin user
      if (shop?._id) {
        formData.append('shop_id', shop._id);
      }
      if (currentUser?.id) {
        formData.append('created_by', currentUser.id);
        formData.append('updated_by', currentUser.id);
      }

      // Xử lý danh mục (category_id là mảng)
      if (newProduct.category_id && newProduct.category_id.length > 0) {
        // FormData không hỗ trợ trực tiếp mảng, nên cần phải thêm từng phần tử
        newProduct.category_id.forEach((catId, index) => {
          formData.append(`category_id[${index}]`, catId);
        });
      }

      // Thêm file ảnh nếu có file mới được chọn
      if (imageFile) {
        formData.append('thumbnail', imageFile);
        console.log("Đã thêm file ảnh:", imageFile.name);
      } else if (newProduct.thumbnail && !newProduct.thumbnail.startsWith('blob:')) {
        // Nếu là URL thực và không phải blob URL tạm thời, thêm URL vào formData
        formData.append('thumbnail_url', newProduct.thumbnail);
        console.log("Giữ nguyên URL thumbnail cũ:", newProduct.thumbnail);
      }

      console.log("Đang gửi form data với ảnh");

      let response;
      try {
        if (editMode && editProductId) {
          // Cập nhật sản phẩm đã tồn tại
          response = await ApiService.putFormData(`/product/edit/${editProductId}`, formData);
        } else {
          // Tạo sản phẩm mới
          response = await ApiService.postFormData('/product/create', formData);
        }
        setSubmitSuccess(true);

        // Hiển thị thông báo thành công
        alert(`Đã ${editMode ? 'cập nhật' : 'thêm'} sản phẩm "${newProduct.name}" thành công!`);

        // Điều hướng về trang danh sách sản phẩm
        navigate('/seller-dashboard/product');
      } catch (err) {
        console.error('Lỗi khi lưu sản phẩm:', err);
        // Hiển thị lỗi
        setFormErrors({
          submit: `Lỗi khi ${editMode ? 'cập nhật' : 'tạo'} sản phẩm: ${err.toString()}`
        });
      }
    } catch (err) {
      console.error('Lỗi trong quá trình xử lý:', err);
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
    <div className="flex  bg-gray-100 ">
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

                {/* Danh mục - CHANGED to checkboxes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <div className={`p-3 border ${formErrors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white max-h-60 overflow-y-auto`}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categories.map((category) => (
                        <div key={category._id} className="flex items-start mb-2">
                          <input
                            type="checkbox"
                            id={`category-${category._id}`}
                            name="category_id"
                            value={category._id}
                            checked={newProduct.category_id.includes(category._id)}
                            onChange={handleCategoryChange}
                            className="h-4 w-4 mt-1 mr-2"
                          />
                          <label 
                            htmlFor={`category-${category._id}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    <option value="Mới">Mới</option>
                    <option value="Đã qua sử dụng">Đã qua sử dụng</option>
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
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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