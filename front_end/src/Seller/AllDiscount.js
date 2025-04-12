import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Copy,
  Plus,
  AlertTriangle,
  X,
  Save,
  Info,
  Calendar,
  Package,
  Tag,
  Coins,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

// EditCouponPopup component (embedded within AllDiscount file)
const EditCouponPopup = ({ isOpen, onClose, couponId, onCouponUpdated }) => {
  // Existing EditCouponPopup code remains the same
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [couponOriginal, setCouponOriginal] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    value: '',
    type: 'percentage',
    min_order_value: 0,
    max_discount_value: '',
    start_date: '',
    end_date: '',
    is_active: true,
    max_uses: 0,
    max_uses_per_user: 1,
    product_id: '',
    category_id: ''
  });

  const userId = AuthService.getCurrentUser()?.id;

  // Helper function to format date for input type="date"
  function formatDateForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  // Helper function to format date for display
  function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  }

  // Format value display
  const formatValue = (value, type) => {
    if (!value) return '';
    return type === 'percentage' ? `${value}%` : `${parseInt(value).toLocaleString('vi-VN')}đ`;
  };

  // Load data when the popup opens and couponId changes
  useEffect(() => {
    if (isOpen && couponId) {
      const fetchData = async () => {
        setLoading(true);
        setLoadError(null);

        try {
          // Lấy thông tin products và categories
          const [productsResponse, categoriesResponse] = await Promise.all([
            ApiService.get('/product'),
            ApiService.get('/categories')
          ]);

          // Đảm bảo dữ liệu đúng định dạng từ các API
          const productsList = productsResponse.products || productsResponse || [];
          const categoriesList = categoriesResponse.categories || categoriesResponse || [];

          setAllProducts(productsList);
          setFilteredProducts([]);
          setCategories(categoriesList);

          // Lấy thông tin coupon
          const couponResponse = await ApiService.get(`/coupon/find/${couponId}`);

          if (!couponResponse || couponResponse.message === "Coupon not found") {
            setLoadError("Không tìm thấy mã giảm giá");
            toast.error("Không tìm thấy mã giảm giá");
            return;
          }

          // Save original coupon data
          setCouponOriginal(couponResponse);

          // Format dates for input fields
          const updatedCoupon = {
            ...couponResponse,
            start_date: formatDateForInput(couponResponse.start_date),
            end_date: formatDateForInput(couponResponse.end_date)
          };

          setFormData(updatedCoupon);

          // Nếu có category_id, lọc danh sách sản phẩm theo danh mục
          if (updatedCoupon.category_id) {
            const productsInCategory = productsList.filter(product =>
              Array.isArray(product.category_id)
                ? product.category_id.includes(updatedCoupon.category_id)
                : product.category_id === updatedCoupon.category_id
            );
            setFilteredProducts(productsInCategory);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setLoadError(error?.message || 'Không thể tải dữ liệu, vui lòng thử lại sau');
          toast.error('Không thể tải dữ liệu, vui lòng thử lại sau');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, couponId]);

  // Rest of the EditCouponPopup component remains the same
  // Khi thay đổi danh mục, lọc lại danh sách sản phẩm
  useEffect(() => {
    if (formData.category_id) {
      if (formData.category_id === "") {
        // If "all categories" selected, reset products
        setFilteredProducts([]);
        setFormData(prev => ({ ...prev, product_id: "" }));
      } else {
        // Filter products by selected category
        const selectedCategory = formData.category_id;

        // The key change is in this filtering logic to handle different data structures
        const productsInCategory = allProducts.filter(product => {
          // Check if category_id is an array
          if (Array.isArray(product.category_id)) {
            // It could be an array of strings
            if (typeof product.category_id[0] === 'string') {
              return product.category_id.includes(selectedCategory);
            }
            // It could be an array of objects with _id property
            else if (typeof product.category_id[0] === 'object') {
              return product.category_id.some(cat =>
                (cat._id === selectedCategory) || (cat.id === selectedCategory)
              );
            }
          }
          // It could be a single string
          else if (typeof product.category_id === 'string') {
            return product.category_id === selectedCategory;
          }
          // It could be a single object with _id
          else if (typeof product.category_id === 'object' && product.category_id !== null) {
            return (product.category_id._id === selectedCategory) ||
              (product.category_id.id === selectedCategory);
          }

          return false;
        });

        setFilteredProducts(productsInCategory);

        // Only reset product_id if current selection isn't in the filtered list
        if (formData.product_id) {
          const productExists = productsInCategory.some(p =>
            p._id === formData.product_id || p.id === formData.product_id
          );
          if (!productExists) {
            setFormData(prev => ({ ...prev, product_id: "" }));
          }
        }
      }
    } else {
      setFilteredProducts([]);
    }
  }, [formData.category_id, allProducts]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }

    // Value validation
    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Giá trị giảm giá phải lớn hơn 0';
    } else if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Giá trị phần trăm không được vượt quá 100%';
    }

    // Date validation
    if (!formData.start_date) {
      newErrors.start_date = 'Ngày bắt đầu không được để trống';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Ngày kết thúc không được để trống';
    } else if (new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    // Max uses per user validation
    if (formData.max_uses_per_user < 0) {
      newErrors.max_uses_per_user = 'Số lần sử dụng trên mỗi người dùng không được âm';
    }

    // Category and product validation
    if (formData.category_id && formData.product_id) {
      const product = allProducts.find(p => p._id === formData.product_id || p.id === formData.product_id);

      if (product) {
        let categoryMatches = false;

        // Check if category_id is an array
        if (Array.isArray(product.category_id)) {
          // Array of strings
          if (product.category_id.length > 0 && typeof product.category_id[0] === 'string') {
            categoryMatches = product.category_id.includes(formData.category_id);
          }
          // Array of objects with _id property
          else if (product.category_id.length > 0 && typeof product.category_id[0] === 'object') {
            categoryMatches = product.category_id.some(cat =>
              (cat._id === formData.category_id) ||
              (cat.id === formData.category_id) ||
              (cat._id?.toString() === formData.category_id?.toString()) ||
              (cat.id?.toString() === formData.category_id?.toString())
            );
          }
        }
        // Single string
        else if (typeof product.category_id === 'string') {
          categoryMatches = product.category_id === formData.category_id;
        }
        // Single object with _id
        else if (typeof product.category_id === 'object' && product.category_id !== null) {
          categoryMatches =
            (product.category_id._id === formData.category_id) ||
            (product.category_id.id === formData.category_id) ||
            (product.category_id._id?.toString() === formData.category_id?.toString()) ||
            (product.category_id.id?.toString() === formData.category_id?.toString());
        }

        if (!categoryMatches) {
          newErrors.product_id = 'Sản phẩm không thuộc danh mục đã chọn';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        updated_by: userId
      };

      // Convert empty strings to null for optional fields
      if (!payload.product_id) payload.product_id = null;
      if (!payload.category_id) payload.category_id = null;
      if (!payload.max_discount_value) payload.max_discount_value = null;

      await ApiService.put(`/coupon/edit/${couponId}`, payload);
      toast.success('Cập nhật mã giảm giá thành công');

      // Call the onCouponUpdated callback to refresh the list
      if (onCouponUpdated) {
        onCouponUpdated();
      }

      // Close the popup
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error?.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to get product name by id
  const getProductName = (productId) => {
    if (!productId) return 'Tất cả sản phẩm';

    // Trích xuất ID từ object
    let idValue;
    if (typeof productId === 'object' && productId !== null) {
      idValue = productId._id || productId.id;
    } else {
      idValue = productId;
    }

    if (!idValue) return 'Sản phẩm không xác định';

    // Convert ID to string for comparison
    const productIdStr = idValue.toString();

    // Try to find the product in allProducts
    const product = allProducts.find(p =>
      p._id?.toString() === productIdStr ||
      p.id?.toString() === productIdStr
    );

    return product ? product.name : 'Sản phẩm không xác định';
  };

  // Helper to get category name by id
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Tất cả danh mục';

    // Trích xuất ID từ object
    let idValue;
    if (typeof categoryId === 'object' && categoryId !== null) {
      idValue = categoryId._id || categoryId.id;
    } else {
      idValue = categoryId;
    }

    if (!idValue) return 'Danh mục không xác định';

    // Convert ID to string for comparison
    const categoryIdStr = idValue.toString();

    const category = categories.find(c =>
      c._id?.toString() === categoryIdStr ||
      c.id?.toString() === categoryIdStr
    );

    return category ? category.name : 'Danh mục không xác định';
  };

  // Don't render anything if the popup is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">Chỉnh sửa mã giảm giá</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-red-600 font-medium text-lg mb-4">{loadError}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              {/* Coupon Summary Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center text-blue-700 mb-2">
                  <Info size={20} className="mr-2" />
                  <h2 className="text-lg font-medium">Thông tin mã giảm giá</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Tag size={18} className="mr-2 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Mã giảm giá:</p>
                      <p className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-800 mt-1">
                        {couponOriginal?.code}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Coins size={18} className="mr-2 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Giá trị:</p>
                      <p className="mt-1">
                        {formatValue(couponOriginal?.value, couponOriginal?.type)}
                        {couponOriginal?.type === 'percentage' && couponOriginal?.max_discount_value && (
                          <span className="text-gray-600 ml-1">
                            (tối đa {parseInt(couponOriginal.max_discount_value).toLocaleString('vi-VN')}đ)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar size={18} className="mr-2 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Thời hạn:</p>
                      <p className="mt-1">
                        {formatDateForDisplay(couponOriginal?.start_date)} - {formatDateForDisplay(couponOriginal?.end_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Giới hạn sử dụng:</p>
                      <p className="mt-1">
                        {couponOriginal?.max_uses > 0
                          ? `${couponOriginal.max_uses} lần`
                          : "Không giới hạn"}
                        {couponOriginal?.max_uses_per_user > 0 && (
                          <span className="ml-1">(mỗi người dùng: {couponOriginal.max_uses_per_user} lần)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Package size={18} className="mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Áp dụng cho:</p>
                      <p className="mt-1">
                        {couponOriginal?.category_id ? (
                          <>
                            Danh mục: <span className="font-medium">{getCategoryName(couponOriginal.category_id)}</span>
                            {couponOriginal?.product_id ? (
                              <>
                                <br />
                                Sản phẩm: <span className="font-medium">{getProductName(couponOriginal.product_id)}</span>
                              </>
                            ) : (
                              <> (Tất cả sản phẩm trong danh mục)</>
                            )}
                          </>
                        ) : (
                          "Tất cả sản phẩm"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CheckCircle size={18} className="mr-2 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Trạng thái:</p>
                      <p className={`mt-1 ${couponOriginal?.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                        {couponOriginal?.is_active ? 'Đang kích hoạt' : 'Vô hiệu'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Form fields remain the same */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Coupon Code (disabled, but still sent in form) */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã giảm giá <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Mã giảm giá không thể thay đổi sau khi đã tạo
                    </p>
                  </div>

                  {/* Coupon Type */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại giảm giá <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="percentage">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (VND)</option>
                    </select>
                  </div>

                  {/* Coupon Value */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá trị giảm giá <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="value"
                        value={formData.value}
                        onChange={handleChange}
                        min="0"
                        step={formData.type === 'percentage' ? '0.1' : '1000'}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.value ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder={formData.type === 'percentage' ? 'Ví dụ: 10' : 'Ví dụ: 50000'}
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        {formData.type === 'percentage' ? '%' : 'đ'}
                      </span>
                    </div>
                    {errors.value && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.value}
                      </p>
                    )}
                  </div>

                  {/* Max Discount Value (for percentage type) */}
                  {formData.type === 'percentage' && (
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giảm tối đa (VND)
                      </label>
                      <input
                        type="number"
                        name="max_discount_value"
                        value={formData.max_discount_value || ''}
                        onChange={handleChange}
                        min="0"
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Để trống nếu không giới hạn"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Giới hạn số tiền giảm tối đa khi sử dụng mã giảm giá theo %
                      </p>
                    </div>
                  )}

                  {/* Min Order Value */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá trị đơn hàng tối thiểu (VND)
                    </label>
                    <input
                      type="number"
                      name="min_order_value"
                      value={formData.min_order_value}
                      onChange={handleChange}
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Ví dụ: 100000"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Đơn hàng phải đạt giá trị này mới có thể áp dụng mã giảm giá
                    </p>
                  </div>

                  {/* Start Date */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.start_date ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.start_date && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.start_date}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      min={formData.start_date}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.end_date ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.end_date && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.end_date}
                      </p>
                    )}
                  </div>

                  {/* Max Uses */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lần sử dụng tối đa
                    </label>
                    <input
                      type="number"
                      name="max_uses"
                      value={formData.max_uses}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Nhập 0 cho không giới hạn"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Tổng số lần mã giảm giá có thể được sử dụng. Nhập 0 cho không giới hạn.
                    </p>
                  </div>

                  {/* Max Uses Per User */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lần sử dụng tối đa mỗi người dùng
                    </label>
                    <input
                      type="number"
                      name="max_uses_per_user"
                      value={formData.max_uses_per_user}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.max_uses_per_user ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Mặc định: 1"
                    />
                    {errors.max_uses_per_user && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.max_uses_per_user}
                      </p>
                    )}
                  </div>

                  {/* Category Specific - First select category */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Áp dụng cho danh mục cụ thể
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Specific - Only enabled if category is selected */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Áp dụng cho sản phẩm cụ thể
                    </label>
                    <select
                      name="product_id"
                      value={formData.product_id || ''}
                      onChange={handleChange}
                      disabled={!formData.category_id || formData.category_id === ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${!formData.category_id || formData.category_id === '' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'} ${errors.product_id ? 'border-red-500' : ''}`}
                    >
                      <option value="">
                        {!formData.category_id || formData.category_id === ''
                          ? 'Vui lòng chọn danh mục trước'
                          : 'Tất cả sản phẩm trong danh mục'}
                      </option>
                      {filteredProducts.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    {errors.product_id && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.product_id}
                      </p>
                    )}
                    {(!formData.category_id || formData.category_id === '') && (
                      <p className="mt-1 text-xs text-gray-500">
                        Vui lòng chọn danh mục trước để xem danh sách sản phẩm
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Mô tả chi tiết về mã giảm giá và điều kiện áp dụng"
                    ></textarea>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-400 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                        Kích hoạt mã giảm giá
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Cập nhật
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main AllDiscount component - UPDATED to filter by seller ID
const AllDiscount = () => {
  const navigate = useNavigate();

  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);

  // Sorting state
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Edit popup states
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState(null);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Check if coupon is active or expired
  const getCouponStatus = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = new Date(coupon.end_date);

    if (!coupon.is_active) return 'Vô hiệu';
    if (now < startDate) return 'Chưa bắt đầu';
    if (now > endDate) return 'Hết hạn';
    return 'Đang hoạt động';
  };

  // Get status color class
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Đang hoạt động':
        return 'bg-green-100 text-green-600';
      case 'Chưa bắt đầu':
        return 'bg-blue-100 text-blue-600';
      case 'Hết hạn':
        return 'bg-red-100 text-red-600';
      case 'Vô hiệu':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Get coupon type display
  const getCouponType = (coupon) => {
    if (coupon.product_id) return 'Sản phẩm';
    if (coupon.category_id) return 'Danh mục';
    return 'Toàn bộ';
  };

  // Format coupon value
  const formatCouponValue = (coupon) => {
    if (coupon.type === 'fixed') {
      return `-${new Intl.NumberFormat('vi-VN').format(coupon.value)} đ`;
    } else {
      return `-${coupon.value} %`;
    }
  };

  // Copy coupon code to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  // Load discounts from API - UPDATED to filter by seller ID
  const loadDiscounts = async () => {
    setLoading(true);
    try {
      // Get current seller ID from AuthService
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setError('Bạn cần đăng nhập để xem mã giảm giá');
        setLoading(false);
        return;
      }

      // Build query params with seller ID included
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        created_by: currentUser.id // Filter by seller ID
      });

      // Add search term if available
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await ApiService.get(`/coupon/list?${params.toString()}`);
      setDiscounts(response.coupons);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setTotalItems(response.totalItems);
      setError(null);
    } catch (err) {
      console.error('Error loading discounts:', err);
      setError('Không thể tải danh sách mã giảm giá. Vui lòng thử lại sau.');
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Handle delete discount
  const handleDeleteDiscount = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        const currentUser = AuthService.getCurrentUser();
        await ApiService.delete(`/coupon/delete/${id}`, { updated_by: currentUser.id });
        // Reload data after deletion
        loadDiscounts();
        toast.success('Đã xóa mã giảm giá thành công');
      } catch (err) {
        console.error('Error deleting discount:', err);
        toast.error('Không thể xóa mã giảm giá. Vui lòng thử lại sau.');
      }
    }
  };

  // Handle edit discount - open popup
  const handleEditDiscount = (id) => {
    // Prevent any navigation
    if (window.event) {
      window.event.preventDefault();
    }

    // Set popup state
    setSelectedCouponId(id);
    setIsEditPopupOpen(true);

    // Make sure we're not navigating anywhere
    return false;
  };

  // Handle edit popup close
  const handleEditPopupClose = () => {
    setIsEditPopupOpen(false);
    setSelectedCouponId(null);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedDiscounts.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một mã giảm giá để xóa');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedDiscounts.length} mã giảm giá đã chọn?`)) {
      try {
        const currentUser = AuthService.getCurrentUser();
        // Perform bulk delete - in a real app, you might want to create a bulk delete API endpoint
        // For now, we'll delete them one by one
        for (const id of selectedDiscounts) {
          await ApiService.delete(`/coupon/delete/${id}`, { updated_by: currentUser.id });
        }
        setSelectedDiscounts([]);
        loadDiscounts();
        toast.success(`Đã xóa ${selectedDiscounts.length} mã giảm giá`);
      } catch (err) {
        console.error('Error performing bulk delete:', err);
        toast.error('Không thể xóa các mã giảm giá đã chọn. Vui lòng thử lại sau.');
      }
    }
  };

  // Toggle discount selection
  const toggleDiscountSelection = (discountId) => {
    if (selectedDiscounts.includes(discountId)) {
      setSelectedDiscounts(selectedDiscounts.filter(id => id !== discountId));
    } else {
      setSelectedDiscounts([...selectedDiscounts, discountId]);
    }
  };

  // Toggle all discounts
  const toggleAllDiscounts = () => {
    if (selectedDiscounts.length === discounts.length) {
      setSelectedDiscounts([]);
    } else {
      setSelectedDiscounts(discounts.map(discount => discount._id));
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle create discount
  const handleCreateDiscount = () => {
    navigate('/seller-dashboard/create-discount-code');
  };

  // Handle coupon updated from popup
  const handleCouponUpdated = () => {
    loadDiscounts(); // Reload the list when a coupon is updated
  };

  // Load discounts when component mounts or when dependencies change
  useEffect(() => {
    loadDiscounts();
  }, [currentPage, limit, searchTerm]);

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-100 min-h-screen">
          {/* Page title and add button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Quản lý mã giảm giá</h1>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/seller-dashboard/add-discount')}
            >
              <Plus size={20} className="mr-2" />
              Thêm mới
            </button>
          </div>

          {/* Function bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-600">
              {selectedDiscounts.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="text-red-500 hover:text-red-700"
                >
                  Xóa đã chọn ({selectedDiscounts.length})
                </button>
              )}
            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <div className="flex items-center border rounded p-2 bg-white">
                  <select
                    className="outline-none bg-transparent"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="created_at">Sắp xếp theo</option>
                    <option value="description">Tên khuyến mãi</option>
                    <option value="code">Mã khuyến mãi</option>
                    <option value="created_at">Ngày tạo</option>
                  </select>
                </div>
              </div>
              <div className="relative">
                <div className="flex items-center border rounded p-2 bg-white">
                  <Search size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="outline-none"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            /* Discounts Table */
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedDiscounts.length === discounts.length && discounts.length > 0}
                        onChange={toggleAllDiscounts}
                      />
                    </th>
                    <th className="p-4 text-left">TÊN KHUYẾN MÃI</th>
                    <th className="p-4 text-left">MÃ KHUYẾN MÃI</th>
                    <th className="p-4 text-left">LOẠI KHUYẾN MÃI</th>
                    <th className="p-4 text-left">GIÁ TRỊ</th>
                    <th className="p-4 text-left">TRẠNG THÁI</th>
                    <th className="p-4 text-left">THỜI GIAN</th>
                    <th className="p-4 text-center">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-gray-500">
                        Không có mã giảm giá nào
                      </td>
                    </tr>
                  ) : (
                    discounts.map((discount) => {
                      const status = getCouponStatus(discount);
                      const statusClass = getStatusColorClass(status);
                      return (
                        <tr key={discount._id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectedDiscounts.includes(discount._id)}
                              onChange={() => toggleDiscountSelection(discount._id)}
                            />
                          </td>
                          <td className="p-4">{discount.description}</td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="bg-red-50 text-red-500 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                                <div className="w-3 h-3">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10H3M16 4v6M8 4v6M10 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>
                              <span>{discount.code}</span>
                              <Copy
                                size={16}
                                className="ml-2 text-gray-400 cursor-pointer"
                                onClick={() => copyToClipboard(discount.code)}
                              />
                            </div>
                          </td>
                          <td className="p-4">{getCouponType(discount)}</td>
                          <td className="p-4">{formatCouponValue(discount)}</td>
                          <td className="p-4">
                            <span className={`${statusClass} px-3 py-1 rounded-full text-sm`}>
                              {status}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            <div>{formatDate(discount.start_date)} - </div>
                            <div>{formatDate(discount.end_date)}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center space-x-4">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEditDiscount(discount._id);
                                }}
                                className="bg-transparent border-none p-0 cursor-pointer flex items-center justify-center"
                              >
                                <Edit size={18} className="text-gray-500" />
                              </button>
                              <div className="text-gray-300">|</div>
                              <Trash2
                                size={18}
                                className="text-red-500 cursor-pointer"
                                onClick={() => handleDeleteDiscount(discount._id)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
                <div className="flex items-center">
                  <button
                    className="mr-2 p-1 rounded-full border w-8 h-8 flex items-center justify-center"
                    disabled={currentPage === 1}
                    onClick={() => changePage(currentPage - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Generate page buttons */}
                  {[...Array(Math.min(totalPages, 5)).keys()].map((i) => {
                    // Show pages around current page
                    const pageToShow = totalPages <= 5
                      ? i + 1
                      : Math.max(1, Math.min(currentPage - 2 + i, totalPages));

                    // Only show if it's a continuous sequence
                    if (i > 0 && pageToShow > [...Array(Math.min(totalPages, 5)).keys()]
                      .map(j => totalPages <= 5 ? j + 1 : Math.max(1, Math.min(currentPage - 2 + j, totalPages)))[i - 1] + 1) {
                      return (
                        <span key={`ellipsis-${i}`} className="mx-1">...</span>
                      );
                    }

                    return (
                      <button
                        key={`page-${pageToShow}`}
                        className={`mr-2 p-1 rounded-full w-8 h-8 flex items-center justify-center ${pageToShow === currentPage ? 'bg-red-500 text-white' : 'border'
                          }`}
                        onClick={() => changePage(pageToShow)}
                      >
                        {pageToShow}
                      </button>
                    );
                  })}

                  <button
                    className="mr-2 p-1 rounded-full border w-8 h-8 flex items-center justify-center"
                    disabled={currentPage === totalPages}
                    onClick={() => changePage(currentPage + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="flex items-center text-sm">
                  <span>Trang {currentPage} của {totalPages}</span>
                  <span className="mx-4">-</span>
                  <span>Hiển thị</span>
                  <select
                    className="mx-2 border rounded p-1"
                    value={limit}
                    onChange={handleLimitChange}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  <span>/</span>
                  <span className="ml-2">{totalItems} mã giảm giá</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Coupon Popup */}
      <EditCouponPopup
        isOpen={isEditPopupOpen}
        onClose={handleEditPopupClose}
        couponId={selectedCouponId}
        onCouponUpdated={handleCouponUpdated}
      />
    </div>
  );
};

export default AllDiscount;