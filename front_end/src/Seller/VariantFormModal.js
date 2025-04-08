import React, { useState, useEffect } from 'react';
import { Plus, X, Loader, Upload } from 'lucide-react';
import ApiService from '../services/ApiService';
import ReactDOM from 'react-dom'; // Import ReactDOM để sử dụng Portal

// Component for adding/editing variants với khả năng xóa tất cả thuộc tính
const VariantFormModal = ({ variant, isEditing, onClose, onSave }) => {
  // Helper function để tạo SKU duy nhất với định dạng linh hoạt
  const generateSKU = (productId, variantName, attributes) => {
    let prefix = "VAR";
    if (variantName) {
      const words = variantName.split(' ');
      if (words.length > 0) {
        const firstWords = words.slice(0, Math.min(2, words.length));
        prefix = firstWords.map(word => word.charAt(0).toUpperCase()).join('');
        if (prefix.length === 1 && words[0].length > 1) {
          prefix += words[0].charAt(1).toUpperCase();
        }
      }
    }

    let attrString = '';
    if (attributes && typeof attributes === 'object') {
      if (attributes.color) {
        attrString += `-${attributes.color.toUpperCase().substring(0, 3)}`;
      }
      if (attributes.size) {
        attrString += `-${attributes.size.toUpperCase()}`;
      }
      if (!attrString && Object.keys(attributes).length > 0) {
        const firstKey = Object.keys(attributes)[0];
        attrString += `-${attributes[firstKey].toUpperCase().substring(0, 3)}`;
      }
    }

    if (!attrString) {
      attrString = `-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    }

    let idPart = '';
    if (productId && productId.length > 4) {
      idPart = `-${productId.substring(productId.length - 4)}`;
    } else {
      idPart = `-${Math.floor(Math.random() * 9000 + 1000)}`;
    }

    const number = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    return `${prefix}${attrString}${idPart}-${number}`;
  };

  const [formData, setFormData] = useState({
    name: variant.name || '',
    price: variant.price || '',
    stock: variant.stock || 0,
    attributes: variant.attributes || {},
    is_default: variant.is_default || false,
    is_active: variant.is_active !== undefined ? variant.is_active : true,
    sku: variant.sku || generateSKU(
      variant.product_id,
      variant.name || '',
      variant.attributes || {}
    )
  });
  
  // Validation state for form fields
  const [validationErrors, setValidationErrors] = useState({
    name: false,
    price: false,
    stock: false,
    sku: false
  });

  const [attrName, setAttrName] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [colorInput, setColorInput] = useState(formData.attributes?.color || '');
  const [sizeInput, setSizeInput] = useState(formData.attributes?.size || '');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Thêm effect để xử lý overflow khi modal hiển thị
  useEffect(() => {
    // Lưu trạng thái overflow ban đầu
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Thêm overflow-hidden vào body để ngăn cuộn trang khi modal mở
    document.body.style.overflow = 'hidden';
    
    // Cleanup: khôi phục lại trạng thái overflow khi component unmount
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    if (formData.attributes.color) {
      setColorInput(formData.attributes.color);
    }
    if (formData.attributes.size) {
      setSizeInput(formData.attributes.size);
    }

    // Clean up function
    return () => {
      // Revoke all ObjectURLs to prevent memory leaks
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleColorChange = (e) => {
    const value = e.target.value;
    setColorInput(value);
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          color: value.trim()
        }
      }));
    } else {
      const newAttributes = { ...formData.attributes };
      delete newAttributes.color;
      setFormData(prev => ({
        ...prev,
        attributes: newAttributes
      }));
    }
  };

  const handleSizeChange = (e) => {
    const value = e.target.value;
    setSizeInput(value);
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          size: value.trim()
        }
      }));
    } else {
      const newAttributes = { ...formData.attributes };
      delete newAttributes.size;
      setFormData(prev => ({
        ...prev,
        attributes: newAttributes
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Clear validation errors when field is changed
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: false
      });
    }
    
    // Live validation for price and stock
    if (name === 'price') {
      const priceValue = parseFloat(value);
      setValidationErrors({
        ...validationErrors,
        price: isNaN(priceValue) || priceValue <= 0
      });
    }
    
    if (name === 'stock') {
      const stockValue = parseInt(value, 10);
      setValidationErrors({
        ...validationErrors,
        stock: isNaN(stockValue) || stockValue < 0
      });
    }
  };

  useEffect(() => {
    if (!formData.userEditedSku) {
      const newSku = generateSKU(variant.product_id, formData.name, formData.attributes);
      setFormData(prev => ({
        ...prev,
        sku: newSku
      }));
    }
  }, [formData.attributes, formData.name]);

  const handleSkuChange = (e) => {
    setFormData({
      ...formData,
      sku: e.target.value,
      userEditedSku: true
    });
  };

  const addAttribute = () => {
    if (!attrName.trim() || !attrValue.trim()) return;
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        [attrName.trim()]: attrValue.trim()
      }
    });
    setAttrName('');
    setAttrValue('');
  };

  const removeAttribute = (key) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[key];
    setFormData({
      ...formData,
      attributes: newAttributes
    });
    if (key === 'color') {
      setColorInput('');
    } else if (key === 'size') {
      setSizeInput('');
    }
  };

  const regenerateSku = () => {
    const newSku = generateSKU(variant.product_id, formData.name, formData.attributes);
    setFormData(prev => ({
      ...prev,
      sku: newSku,
      userEditedSku: false
    }));
  };

  // Xử lý file ảnh
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        setError(`File "${file.name}" không đúng định dạng. Chỉ chấp nhận JPEG, JPG, PNG, GIF, WEBP.`);
      } else if (!isValidSize) {
        setError(`File "${file.name}" quá lớn. Tối đa 5MB.`);
      }
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;
    
    // Tạo preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setError(null);
  };

  // Xóa file đã chọn
  const removeSelectedFile = (index) => {
    const newFiles = [...selectedFiles];
    const newPreviewUrls = [...previewUrls];
    
    // Revoke URL object để tránh memory leak
    URL.revokeObjectURL(previewUrls[index]);
    
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setConnectionError(false);
    
    // Reset validation errors
    const newValidationErrors = {
      name: false,
      price: false,
      stock: false,
      sku: false
    };
    
    let hasError = false;

    // Validate variant name
    if (!formData.name || !formData.name.trim()) {
      setError('Tên biến thể không được để trống');
      newValidationErrors.name = true;
      hasError = true;
    }

    // Validate price - ensure it's a valid number greater than 0
    if (!formData.price) {
      setError('Vui lòng nhập giá sản phẩm');
      newValidationErrors.price = true;
      hasError = true;
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Giá sản phẩm phải là số dương và lớn hơn 0');
        newValidationErrors.price = true;
        hasError = true;
      }
    }

    // Validate stock - ensure it's a valid number and not negative
    if (formData.stock === undefined || formData.stock === null || formData.stock === '') {
      setError('Vui lòng nhập số lượng tồn kho');
      newValidationErrors.stock = true;
      hasError = true;
    } else {
      const stock = parseInt(formData.stock, 10);
      if (isNaN(stock) || stock < 0) {
        setError('Số lượng tồn kho phải là số không âm');
        newValidationErrors.stock = true;
        hasError = true;
      }
    }

    // Validate SKU
    if (!formData.sku || !formData.sku.trim()) {
      const newSku = generateSKU(variant.product_id, formData.name, formData.attributes);
      setFormData(prev => ({ ...prev, sku: newSku }));
      setError('Vui lòng cung cấp mã SKU');
      newValidationErrors.sku = true;
      hasError = true;
    }
    
    // Update validation errors state
    setValidationErrors(newValidationErrors);
    
    // If any validation error exists, stop form submission
    if (hasError) {
      return;
    }

    try {
      setLoading(true);
      const variantData = {
        product_id: variant.product_id,
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
        attributes: formData.attributes,
        is_default: formData.is_default,
        is_active: formData.is_active
      };

      let response;
      try {
        if (isEditing) {
          response = await ApiService.put(`/product-variant/edit/${variant._id}`, variantData);
        } else {
          response = await ApiService.post('/product-variant/create', variantData);
        }

        // Upload ảnh nếu có
        if (selectedFiles.length > 0 && response && response._id) {
          const imageFormData = new FormData();
          selectedFiles.forEach(file => {
            imageFormData.append('images', file);
          });
          imageFormData.append('keep_existing', 'true'); // Giữ lại ảnh cũ
          
          await ApiService.postFormData(`/product-variant/upload-images/${response._id}`, imageFormData);
          
          // Lấy dữ liệu variant đã cập nhật
          response = await ApiService.get(`/product-variant/${response._id}`);
        }
        
        onSave(response);
      } catch (fetchError) {
        if (fetchError.toString().includes('Failed to fetch') ||
          fetchError.toString().includes('Network Error') ||
          fetchError.toString().includes('CONNECTION_REFUSED')) {
          setConnectionError(true);
          setError(`Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo server đang chạy.`);
        } else {
          setError(`Lỗi khi ${isEditing ? 'cập nhật' : 'tạo'} biến thể`);
        }
      }
    } catch (err) {
      setError(`Lỗi: ${err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng React Portal để render modal trực tiếp vào body
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] isolate overflow-y-auto py-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative z-[10000] my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pt-1 z-10">
          <h3 className="text-xl font-medium">
            {isEditing ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới'}
          </h3>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className={`p-3 ${connectionError ? 'bg-orange-100 border-orange-400 text-orange-700' : 'bg-red-100 border-red-400 text-red-700'} border rounded mb-6`}>
            {error}
            {connectionError && (
              <div className="mt-2">
                <p className="font-medium">Gợi ý khắc phục:</p>
                <ul className="list-disc list-inside text-sm">
                  <li>Kiểm tra xem server backend có đang chạy không</li>
                  <li>Kiểm tra cổng (port) 9999 có đúng không</li>
                  <li>Kiểm tra tường lửa và CORS</li>
                  <li>Thử khởi động lại server</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên biến thể */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên biến thể <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                required
              />
              {validationErrors.name && (
                <p className="text-xs text-red-500 mt-1">Tên biến thể không được để trống</p>
              )}
            </div>

            {/* SKU với nút tạo mới */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Mã SKU <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={regenerateSku}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Tạo mới
                </button>
              </div>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleSkuChange}
                className={`w-full px-3 py-2 border ${validationErrors.sku ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="Mã SKU tự động"
                required
              />
              <p className="text-xs text-gray-500 mt-1">SKU sẽ tự động cập nhật khi thay đổi thuộc tính</p>
              {validationErrors.sku && (
                <p className="text-xs text-red-500 mt-1">Vui lòng cung cấp mã SKU</p>
              )}
            </div>

            {/* Màu sắc (tùy chọn) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Màu sắc (tùy chọn)
              </label>
              <input
                type="text"
                value={colorInput}
                onChange={handleColorChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ví dụ: Đỏ, Xanh, Đen..."
              />
            </div>

            {/* Kích thước (tùy chọn) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kích thước (tùy chọn)
              </label>
              <select
                value={sizeInput}
                onChange={handleSizeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Không có</option>
                <option value="S">S - Nhỏ</option>
                <option value="M">M - Vừa</option>
                <option value="L">L - Lớn</option>
                <option value="XL">XL - Rất lớn</option>
                <option value="XXL">XXL - Đặc biệt lớn</option>
              </select>
            </div>

            {/* Giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                className={`w-full px-3 py-2 border ${validationErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                required
                placeholder="Nhập giá > 0"
              />
              {validationErrors.price ? (
                <p className="text-xs text-red-500 mt-1">Giá sản phẩm phải lớn hơn 0</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Giá phải lớn hơn 0</p>
              )}
            </div>

            {/* Tồn kho */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                step="1"
                className={`w-full px-3 py-2 border ${validationErrors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                required
                placeholder="Nhập số lượng ≥ 0"
              />
              {validationErrors.stock ? (
                <p className="text-xs text-red-500 mt-1">Số lượng phải là số không âm</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Số lượng phải là số không âm</p>
              )}
            </div>

            {/* Các checkbox */}
            <div className="md:col-span-2 flex space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
                  Biến thể mặc định
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Hiển thị
                </label>
              </div>
            </div>

            {/* Thêm thuộc tính khác */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thuộc tính khác (tùy chọn)
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Tên thuộc tính"
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Giá trị"
                  value={attrValue}
                  onChange={(e) => setAttrValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={addAttribute}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Hiển thị tất cả các thuộc tính - giờ đều có thể xóa */}
              <div className="space-y-2">
                {Object.entries(formData.attributes || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div>
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttribute(key)}
                      className="text-red-500"
                      title="Xóa thuộc tính"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Thêm phần upload ảnh */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh biến thể
              </label>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  {/* Hiển thị preview ảnh sẽ upload */}
                  {previewUrls.map((url, index) => (
                    <div key={`preview-${index}`} className="relative">
                      <div className="w-24 h-24 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                        <img 
                          src={url} 
                          alt={`Preview ${index + 1}`} 
                          className="max-w-full max-h-full object-contain" 
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                        title="Xóa ảnh đã chọn"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Input để chọn ảnh mới */}
                  <label className="w-24 h-24 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                    <Plus size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Thêm ảnh</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">Hình ảnh sẽ được tự động upload sau khi lưu biến thể.</p>
                <p className="text-xs text-gray-500">Tối đa 5 hình ảnh, mỗi hình ảnh không quá 5MB.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-5 border-t sticky bottom-0 bg-white pb-1 z-10">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin mr-2 inline" />
                  Đang lưu...
                </>
              ) : (
                'Lưu biến thể'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // Render trực tiếp vào body
  );
};

export default VariantFormModal;