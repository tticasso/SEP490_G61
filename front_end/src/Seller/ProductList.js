import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Loader,
  X,
  Eye // Thêm icon Eye
} from 'lucide-react';
import Sidebar from './Sidebar';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

// Product Details Modal Component
const ProductDetailsModal = ({ product, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState(null);
  const [variants, setVariants] = useState([]);
  const [error, setError] = useState(null);
  
  // State for variant modal
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch full product details
        const fetchedProduct = await ApiService.get(`/product/${product.id || product._id}`);
        setProductDetails(fetchedProduct);
        
        // Fetch product variants
        const fetchedVariants = await ApiService.get(`/product-variant/product/${product.id || product._id}`);
        setVariants(fetchedVariants || []);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Không thể tải thông tin chi tiết sản phẩm. Vui lòng thử lại sau.');
        
        // Set fallback data for demo
        setProductDetails(product);
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [product]);
  
  const handleAddVariant = () => {
    setCurrentVariant({
      product_id: product.id || product._id,
      name: '',
      price: '',
      stock: 0,
      attributes: {},
      images: [],
      is_default: variants.length === 0 // First variant is default
    });
    setIsEditingVariant(false);
    setShowVariantModal(true);
  };
  
  const handleEditVariant = (variant) => {
    // Convert Map to object if needed
    const variantToEdit = {
      ...variant,
      attributes: variant.attributes instanceof Map ? 
        Object.fromEntries(variant.attributes) : variant.attributes || {}
    };
    
    setCurrentVariant(variantToEdit);
    setIsEditingVariant(true);
    setShowVariantModal(true);
  };
  
  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa biến thể này?')) {
      return;
    }
    
    try {
      setLoading(true);
      await ApiService.delete(`/product-variant/delete/${variantId}`);
      
      // Remove deleted variant from state
      setVariants(variants.filter(v => v._id !== variantId));
      
      setError(null);
    } catch (err) {
      console.error('Error deleting variant:', err);
      setError('Không thể xóa biến thể. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetDefaultVariant = async (variantId) => {
    try {
      setLoading(true);
      const productId = product.id || product._id;
      await ApiService.put(`/product-variant/product/${productId}/default/${variantId}`);
      
      // Update variants in state
      setVariants(variants.map(v => ({
        ...v,
        is_default: v._id === variantId
      })));
      
      setError(null);
    } catch (err) {
      console.error('Error setting default variant:', err);
      setError('Không thể đặt biến thể mặc định. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render attributes as a list
  const renderAttributes = (attributes) => {
    if (!attributes) return null;
    
    // Convert Map to object if necessary
    const attrObj = attributes instanceof Map ? 
      Object.fromEntries(attributes) : attributes;
    
    return (
      <ul className="list-disc list-inside pl-2">
        {Object.entries(attrObj).map(([key, value]) => (
          <li key={key}><span className="font-medium">{key}:</span> {value}</li>
        ))}
      </ul>
    );
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium">Chi tiết sản phẩm</h3>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin mr-2" />
            <p>Đang tải thông tin chi tiết...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">Chi tiết sản phẩm</h3>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-6">
            {error}
          </div>
        )}
        
        {productDetails && (
          <div className="space-y-6">
            {/* Product Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product Image */}
              <div className="col-span-1">
                <div className="border rounded-md p-2 h-80 flex items-center justify-center">
                  {productDetails.thumbnail ? (
                    <img 
                      src={productDetails.thumbnail} 
                      alt={productDetails.name} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/200/200";
                      }}
                    />
                  ) : (
                    <div className="text-gray-300 text-center">
                      <p>Không có hình ảnh</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Product Info */}
              <div className="col-span-2 space-y-4">
                <h2 className="text-2xl font-bold">{productDetails.name}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Giá bán</p>
                    <p className="text-xl font-semibold">{productDetails.price?.toLocaleString()}₫</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Đã bán</p>
                    <p>{productDetails.sold || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Slug</p>
                    <p className="truncate">{productDetails.slug}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <div className="flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${productDetails.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>{productDetails.is_active ? 'Đang hoạt động' : 'Tạm ẩn'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Khối lượng</p>
                    <p>{productDetails.weight} gram</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Tình trạng</p>
                    <p>
                      {productDetails.condition === 'new' && 'Mới'}
                      {productDetails.condition === 'used' && 'Đã qua sử dụng'}
                      {productDetails.condition === 'refurbished' && 'Tân trang'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Mô tả</p>
                  <p className="text-gray-700">{productDetails.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {productDetails.is_hot && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Nổi bật</span>
                  )}
                  {productDetails.is_feature && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Đặc trưng</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <hr className="my-6" />
            
            {/* Product Detail Section */}
            <div>
              <h4 className="text-lg font-medium mb-3">Chi tiết sản phẩm</h4>
              <div className="prose max-w-none">
                <p>{productDetails.detail}</p>
              </div>
            </div>
            
            {/* Divider */}
            <hr className="my-6" />
            
            {/* Product Variants Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Biến thể sản phẩm</h4>
                <button 
                  className="bg-green-500 text-white px-3 py-1 rounded flex items-center text-sm"
                  onClick={handleAddVariant}
                >
                  <Plus size={16} className="mr-1" />
                  Thêm biến thể
                </button>
              </div>
              
              {variants.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-md">
                  <p className="text-gray-500">Sản phẩm chưa có biến thể nào.</p>
                  <p className="text-gray-500 text-sm mt-1">Nhấn "Thêm biến thể" để tạo biến thể mới.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 text-left border">Biến thể</th>
                        <th className="py-2 px-4 text-left border">Thuộc tính</th>
                        <th className="py-2 px-4 text-left border">Giá</th>
                        <th className="py-2 px-4 text-left border">Tồn kho</th>
                        <th className="py-2 px-4 text-left border">Trạng thái</th>
                        <th className="py-2 px-4 text-left border">Mặc định</th>
                        <th className="py-2 px-4 text-left border">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <tr key={variant._id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border">{variant.name}</td>
                          <td className="py-2 px-4 border">
                            {renderAttributes(variant.attributes)}
                          </td>
                          <td className="py-2 px-4 border">{variant.price?.toLocaleString()}₫</td>
                          <td className="py-2 px-4 border">{variant.stock}</td>
                          <td className="py-2 px-4 border">
                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${variant.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>{variant.is_active ? 'Hiện' : 'Ẩn'}</span>
                          </td>
                          <td className="py-2 px-4 border">
                            <input 
                              type="radio" 
                              checked={variant.is_default} 
                              onChange={() => handleSetDefaultVariant(variant._id)}
                              className="mr-2"
                            />
                            {variant.is_default ? 'Mặc định' : ''}
                          </td>
                          <td className="py-2 px-4 border">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditVariant(variant)}
                                className="text-blue-500"
                                title="Sửa biến thể"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteVariant(variant._id)}
                                className="text-red-500"
                                title="Xóa biến thể"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* SEO Information */}
            <div>
              <h4 className="text-lg font-medium mb-3">Thông tin SEO</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Meta Title</p>
                  <p className="truncate">{productDetails.meta_title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Meta Keyword</p>
                  <p className="truncate">{productDetails.meta_keyword}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Meta Description</p>
                  <p className="truncate">{productDetails.meta_description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Variant Edit/Add Modal */}
        {showVariantModal && currentVariant && (
          <VariantFormModal
            variant={currentVariant}
            isEditing={isEditingVariant}
            onClose={() => setShowVariantModal(false)}
            onSave={(newVariant) => {
              if (isEditingVariant) {
                // Update variant in list
                setVariants(variants.map(v => 
                  v._id === newVariant._id ? newVariant : v
                ));
              } else {
                // Add new variant to list
                setVariants([...variants, newVariant]);
              }
              setShowVariantModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};


// Component for adding/editing variants với khả năng xóa tất cả thuộc tính
const VariantFormModal = ({ variant, isEditing, onClose, onSave }) => {
  // Helper function để tạo SKU duy nhất với định dạng linh hoạt
  const generateSKU = (productId, variantName, attributes) => {
    // Lấy một số ký tự đầu của tên sản phẩm
    let prefix = "VAR"; // Mặc định
    
    // Đoán tiền tố từ tên sản phẩm nếu có
    if (variantName) {
      const words = variantName.split(' ');
      if (words.length > 0) {
        // Lấy chữ cái đầu của 1-2 từ đầu tiên
        const firstWords = words.slice(0, Math.min(2, words.length));
        prefix = firstWords.map(word => word.charAt(0).toUpperCase()).join('');
        
        // Nếu chỉ có 1 ký tự, thêm một ký tự nữa từ từ đầu tiên
        if (prefix.length === 1 && words[0].length > 1) {
          prefix += words[0].charAt(1).toUpperCase();
        }
      }
    }
    
    // Tạo chuỗi thuộc tính nếu có
    let attrString = '';
    if (attributes && typeof attributes === 'object') {
      // Ưu tiên xử lý color và size nếu có
      if (attributes.color) {
        attrString += `-${attributes.color.toUpperCase().substring(0, 3)}`;
      }
      
      if (attributes.size) {
        attrString += `-${attributes.size.toUpperCase()}`;
      } 
      
      // Nếu không có color và size, lấy thuộc tính đầu tiên (nếu có)
      if (!attrString && Object.keys(attributes).length > 0) {
        const firstKey = Object.keys(attributes)[0];
        attrString += `-${attributes[firstKey].toUpperCase().substring(0, 3)}`;
      }
    }
    
    // Nếu không có thuộc tính nào, thêm một định danh ngẫu nhiên
    if (!attrString) {
      attrString = `-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    }
    
    // Lấy 4 chữ số cuối của ID sản phẩm nếu có
    let idPart = '';
    if (productId && productId.length > 4) {
      idPart = `-${productId.substring(productId.length - 4)}`;
    } else {
      // Random ID nếu không có
      idPart = `-${Math.floor(Math.random() * 9000 + 1000)}`;
    }
    
    // Số thứ tự ngẫu nhiên (001-999)
    const number = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    
    // Kết hợp tất cả thành SKU
    return `${prefix}${attrString}${idPart}-${number}`;
  };
  
  // Khởi tạo state với dữ liệu mặc định khi cần
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
  
  // State cho thuộc tính mới
  const [attrName, setAttrName] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  
  // State cho nhập liệu thuộc tính color và size
  const [colorInput, setColorInput] = useState(formData.attributes?.color || '');
  const [sizeInput, setSizeInput] = useState(formData.attributes?.size || '');
  
  // Log thông tin khởi tạo để debug
  useEffect(() => {
    console.log("Initial variant data:", {
      product_id: variant.product_id, 
      name: formData.name, 
      price: formData.price, 
      stock: formData.stock, 
      attrs: formData.attributes
    });
    
    console.log("Product ID:", variant.product_id);
    console.log("Variant name:", formData.name);
    console.log("Initial SKU value:", formData.sku);
    
    // Khởi tạo giá trị input color và size từ attributes
    if (formData.attributes.color) {
      setColorInput(formData.attributes.color);
    }
    
    if (formData.attributes.size) {
      setSizeInput(formData.attributes.size);
    }
  }, []);
  
  // Xử lý khi người dùng nhập color
  const handleColorChange = (e) => {
    const value = e.target.value;
    setColorInput(value);
    
    // Cập nhật thuộc tính color trong attributes nếu có giá trị
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          color: value.trim()
        }
      }));
    } else {
      // Nếu giá trị rỗng, xóa thuộc tính color
      const newAttributes = { ...formData.attributes };
      delete newAttributes.color;
      setFormData(prev => ({
        ...prev,
        attributes: newAttributes
      }));
    }
  };
  
  // Xử lý khi người dùng chọn size
  const handleSizeChange = (e) => {
    const value = e.target.value;
    setSizeInput(value);
    
    // Cập nhật thuộc tính size trong attributes nếu có giá trị
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          size: value.trim()
        }
      }));
    } else {
      // Nếu giá trị rỗng, xóa thuộc tính size
      const newAttributes = { ...formData.attributes };
      delete newAttributes.size;
      setFormData(prev => ({
        ...prev,
        attributes: newAttributes
      }));
    }
  };
  
  // Xử lý khi người dùng tự chỉnh sửa SKU
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Cập nhật SKU khi thuộc tính thay đổi
  useEffect(() => {
    // Chỉ tự động cập nhật SKU khi người dùng chưa chỉnh sửa nó
    if (!formData.userEditedSku) {
      const newSku = generateSKU(variant.product_id, formData.name, formData.attributes);
      setFormData(prev => ({
        ...prev,
        sku: newSku
      }));
    }
  }, [formData.attributes, formData.name]);
  
  // Đánh dấu khi người dùng tự chỉnh sửa SKU
  const handleSkuChange = (e) => {
    setFormData({
      ...formData,
      sku: e.target.value,
      userEditedSku: true // Đánh dấu là người dùng đã chỉnh sửa
    });
  };
  
  // Thêm thuộc tính tùy chọn mới
  const addAttribute = () => {
    if (!attrName.trim() || !attrValue.trim()) return;
    
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        [attrName.trim()]: attrValue.trim()
      }
    });
    
    // Clear input fields
    setAttrName('');
    setAttrValue('');
  };
  
  // Xóa thuộc tính - cho phép xóa tất cả các thuộc tính
  const removeAttribute = (key) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[key];
    
    setFormData({
      ...formData,
      attributes: newAttributes
    });
    
    // Nếu xóa color hoặc size, cập nhật input fields tương ứng
    if (key === 'color') {
      setColorInput('');
    } else if (key === 'size') {
      setSizeInput('');
    }
  };
  
  // Tạo SKU mới
  const regenerateSku = () => {
    const newSku = generateSKU(variant.product_id, formData.name, formData.attributes);
    setFormData(prev => ({
      ...prev,
      sku: newSku,
      userEditedSku: false // Reset trạng thái
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error states
    setError(null);
    setConnectionError(false);
    
    // Xác thực form
    if (!formData.name || !formData.name.trim()) {
      setError('Tên biến thể không được để trống');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Giá phải lớn hơn 0');
      return;
    }
    
    // Đảm bảo SKU không trống
    if (!formData.sku || !formData.sku.trim()) {
      const newSku = generateSKU(variant.product_id, formData.name, formData.attributes);
      setFormData(prev => ({ ...prev, sku: newSku }));
      setError('Vui lòng cung cấp mã SKU');
      return;
    }
    
    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu gửi đi
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
      
      console.log("Sending variant data:", JSON.stringify(variantData, null, 2));
      
      let response;
      try {
        if (isEditing) {
          response = await ApiService.put(`/product-variant/edit/${variant._id}`, variantData);
        } else {
          response = await ApiService.post('/product-variant/create', variantData);
        }
        
        console.log("API response:", response);
        onSave(response);
      } catch (fetchError) {
        console.error("Network or API error:", fetchError);
        
        // Kiểm tra lỗi kết nối
        if (fetchError.toString().includes('Failed to fetch') || 
            fetchError.toString().includes('Network Error') ||
            fetchError.toString().includes('CONNECTION_REFUSED')) {
          setConnectionError(true);
          setError(`Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo server đang chạy. Lỗi: ${fetchError.toString()}`);
        } else {
          setError(`Lỗi khi ${isEditing ? 'cập nhật' : 'tạo'} biến thể: ${fetchError.toString()}`);
        }
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(`Lỗi: ${err.toString()}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Mã SKU tự động"
                required
              />
              <p className="text-xs text-gray-500 mt-1">SKU sẽ tự động cập nhật khi thay đổi thuộc tính</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Tồn kho */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
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
          </div>
          
          <div className="flex justify-end space-x-3 pt-5 border-t">
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
              {loading ? 'Đang lưu...' : 'Lưu biến thể'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Product Modal Component
const EditProductModal = ({ product, onClose, onUpdate }) => {
    const [editingProduct, setEditingProduct] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    // State for categories and brands
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch categories and brands, and initialize product data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true);
                const [categoriesResponse, brandsResponse] = await Promise.all([
                    ApiService.get('/categories'),
                    ApiService.get('/brand')
                ]).catch(() => {
                    // Fallback for demo if API calls fail
                    return [
                        [
                            { _id: 'phone', name: 'Điện thoại' },
                            { _id: 'skincare', name: 'Chăm sóc da' },
                            { _id: 'electronics', name: 'Thiết bị điện tử' }
                        ],
                        [
                            { _id: 'apple', name: 'Apple' },
                            { _id: 'samsung', name: 'Samsung' },
                            { _id: 'xiaomi', name: 'Xiaomi' }
                        ]
                    ];
                });
                
                setCategories(categoriesResponse);
                setBrands(brandsResponse);
                
                // Initialize editing product
                if (product) {
                    setEditingProduct({
                        ...product,
                        // Ensure nested fields are properly handled
                        category_id: product.category_id ? 
                            (Array.isArray(product.category_id) ? 
                                product.category_id.map(cat => cat._id || cat) : [product.category_id]) : [],
                        brand_id: product.brand_id?._id || product.brand_id || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setFormErrors({
                    submit: 'Lỗi khi tải dữ liệu danh mục và thương hiệu: ' + error
                });
                
                // Fallback data for demo
                setCategories([
                    { _id: 'phone', name: 'Điện thoại' },
                    { _id: 'skincare', name: 'Chăm sóc da' },
                    { _id: 'electronics', name: 'Thiết bị điện tử' }
                ]);
                setBrands([
                    { _id: 'apple', name: 'Apple' },
                    { _id: 'samsung', name: 'Samsung' },
                    { _id: 'xiaomi', name: 'Xiaomi' }
                ]);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [product]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingProduct({
            ...editingProduct,
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
        setEditingProduct({
            ...editingProduct,
            [name]: checked
        });
    };

    // Handle category select change (multiple)
    const handleCategoryChange = (e) => {
        // Convert selected options to array of values
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        
        setEditingProduct({
            ...editingProduct,
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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        const errors = {};
        if (!editingProduct.name) errors.name = 'Tên sản phẩm là bắt buộc';
        if (!editingProduct.price) errors.price = 'Giá sản phẩm là bắt buộc';
        if (!editingProduct.brand_id) errors.brand_id = 'Thương hiệu là bắt buộc';
        if (!editingProduct.slug) errors.slug = 'Slug là bắt buộc';
        if (!editingProduct.weight) errors.weight = 'Khối lượng sản phẩm là bắt buộc';
        if (!editingProduct.category_id || editingProduct.category_id.length === 0) {
            errors.category_id = 'Danh mục là bắt buộc';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            const updatedProduct = await ApiService.put(`/product/edit/${editingProduct._id || editingProduct.id}`, editingProduct)
                .catch(() => {
                    // For demo, return mock response if API fails
                    return {
                        ...editingProduct,
                        updatedAt: new Date().toISOString()
                    };
                });
            
            // Call onUpdate callback with updated product
            if (onUpdate) {
                onUpdate(updatedProduct);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi cập nhật sản phẩm: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    if (!editingProduct) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium">Chỉnh sửa sản phẩm</h3>
                    <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {loadingData ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader className="animate-spin mr-2" />
                        <div className="text-gray-500">Đang tải dữ liệu...</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formErrors.submit && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {formErrors.submit}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-6">
                            {/* Tên sản phẩm */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editingProduct.name || ''}
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
                                    value={editingProduct.price || ''}
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
                                    value={editingProduct.slug || ''}
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
                                    value={editingProduct.brand_id || ''}
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
                            
                            {/* Khối lượng */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Khối lượng (gram) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={editingProduct.weight || ''}
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
                                    value={editingProduct.condition || 'new'}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="new">Mới</option>
                                    <option value="used">Đã qua sử dụng</option>
                                    <option value="refurbished">Tân trang</option>
                                </select>
                            </div>
                            
                            {/* Danh mục */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục <span className="text-red-500">*</span>
                                </label>
                                <select
                                    multiple
                                    name="category_id"
                                    value={editingProduct.category_id || []}
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
                            
                            {/* Mô tả */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả sản phẩm
                                </label>
                                <textarea
                                    name="description"
                                    value={editingProduct.description || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            {/* Chi tiết */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chi tiết sản phẩm
                                </label>
                                <textarea
                                    name="detail"
                                    value={editingProduct.detail || ''}
                                    onChange={handleInputChange}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            {/* Thumbnail */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Hình ảnh
                                </label>
                                <input
                                    type="text"
                                    name="thumbnail"
                                    value={editingProduct.thumbnail || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                                {editingProduct.thumbnail && (
                                    <div className="mt-2">
                                        <img
                                            src={editingProduct.thumbnail}
                                            alt="Thumbnail preview"
                                            className="h-20 w-20 object-cover border"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/api/placeholder/50/50";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {/* Meta fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    name="meta_title"
                                    value={editingProduct.meta_title || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Keyword
                                </label>
                                <input
                                    type="text"
                                    name="meta_keyword"
                                    value={editingProduct.meta_keyword || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Description
                                </label>
                                <textarea
                                    name="meta_description"
                                    value={editingProduct.meta_description || ''}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            {/* Status toggles */}
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={editingProduct.is_active || false}
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
                                        checked={editingProduct.is_hot || false}
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
                                        checked={editingProduct.is_feature || false}
                                        onChange={handleToggleChange}
                                        className="h-4 w-4 mr-2"
                                    />
                                    <label htmlFor="is_feature" className="text-sm font-medium text-gray-700">
                                        Sản phẩm đặc trưng
                                    </label>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_delete"
                                        name="is_delete"
                                        checked={editingProduct.is_delete || false}
                                        onChange={handleToggleChange}
                                        className="h-4 w-4 mr-2"
                                    />
                                    <label htmlFor="is_delete" className="text-sm font-medium text-gray-700">
                                        Xóa sản phẩm
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-5 border-t">
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
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const ProductList = () => {
  const navigate = useNavigate();
  
  // Tham chiếu để tránh re-render không cần thiết
  const fetchInProgress = React.useRef(false);
  
  // Style cho bảng và hình ảnh
  const tableStyles = {
    tableLayout: 'fixed',
    width: '100%'
  };
  
  // State cho modal chỉnh sửa sản phẩm
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Add state for products, loading and error
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for dropdown visibility
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // State cho modal chi tiết sản phẩm
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  // Xử lý khi click vào nút xem chi tiết
  const handleViewProduct = (product) => {
    setViewProduct(product);
    setDetailsModalOpen(true);
  };

  // Get shopId from current user (in a real app, you might get this from URL parameters or context)
  useEffect(() => {
    // Tạo biến để theo dõi nếu component unmounted
    let isMounted = true;
    
    const fetchShopAndProducts = async () => {
      // Kiểm tra nếu đã đang fetch dữ liệu thì không fetch lại
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;
      
      try {
        setLoading(true);
        
        // Verify user is authenticated
        if (!AuthService.isLoggedIn()) {
          throw new Error('User not authenticated');
        }
        
        // Get the current user's shop using the /my-shop endpoint
        const shop = await ApiService.get('/shops/my-shop');
        // Kiểm tra nếu component đã unmounted thì không cập nhật state
        if (!isMounted) return;
        
        if (!shop) {
          throw new Error('No shop found for this user');
        }
        
        const shopId = shop._id; // Get the shop ID
        
        // Fetch products for this shop
        const fetchedProducts = await ApiService.get(`/product/shop/${shopId}`);
        // Kiểm tra nếu component đã unmounted thì không cập nhật state
        if (!isMounted) return;
        
        // Map API response to match the format expected by our component
        const formattedProducts = fetchedProducts.map(product => ({
          id: product._id,
          _id: product._id, // Keep original _id for API calls
          name: product.name,
          stock: product.quantity || 0, // Assuming there's a quantity field
          price: product.price,
          sold: product.sold || 0,
          slug: product.slug || '',
          description: product.description || '',
          detail: product.detail || '',
          meta_title: product.meta_title || '',
          meta_keyword: product.meta_keyword || '',
          meta_description: product.meta_description || '',
          weight: product.weight || 0,
          condition: product.condition || 'new',
          is_active: product.is_active !== undefined ? product.is_active : true,
          is_hot: product.is_hot || false,
          is_feature: product.is_feature || false,
          is_delete: product.is_delete || false,
          type: product.type || 'single',
          thumbnail: product.thumbnail || '',
          createdAt: new Date(product.created_at),
          category_id: product.category_id || [],
          brand_id: product.brand_id || '',
          category: product.category_id && product.category_id.name ? product.category_id.name : 'Không phân loại'
        }));
        
        setProducts(formattedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
        
        // For demo purposes, use sample data if API fails
        setProducts([
          {
            id: 1,
            _id: 1,
            name: 'Apple iPhone 15 Plus 128GB',
            stock: 35,
            price: 27790000,
            sold: 0,
            slug: 'apple-iphone-15-plus-128gb',
            description: 'Điện thoại iPhone 15 Plus với bộ nhớ 128GB',
            detail: 'Chi tiết về sản phẩm iPhone 15 Plus',
            weight: 220,
            condition: 'new',
            type: 'single',
            is_active: true,
            is_hot: true,
            is_feature: false,
            is_delete: false,
            thumbnail: '/api/placeholder/200/200',
            createdAt: new Date('2024-01-15'),
            category_id: ['phone'],
            brand_id: 'apple',
            category: 'Điện thoại'
          },
          {
            id: 2,
            _id: 2,
            name: 'Sữa rửa mặt CERAVE cho da dầu da mụn và Da Khô nhạy cảm 236ml',
            stock: 26,
            price: 105000,
            sold: 0,
            slug: 'sua-rua-mat-cerave',
            description: 'Sữa rửa mặt dành cho da dầu và mụn',
            detail: 'Chi tiết về sản phẩm sữa rửa mặt',
            weight: 236,
            condition: 'new',
            type: 'single',
            is_active: true,
            is_hot: false,
            is_feature: true,
            is_delete: false,
            thumbnail: '/api/placeholder/200/200',
            createdAt: new Date('2024-02-20'),
            category_id: ['skincare'],
            brand_id: 'cerave',
            category: 'Chăm sóc da'
          },
          {
            id: 3,
            _id: 3,
            name: 'Sữa Chống Nắng Cực Mạnh Sunplay Super Block SPF81 PA++++ 70Gr',
            stock: 54,
            price: 148000,
            sold: 0,
            slug: 'sua-chong-nang-sunplay',
            description: 'Sữa chống nắng SPF 81',
            detail: 'Chi tiết về sản phẩm sữa chống nắng',
            weight: 70,
            condition: 'new',
            type: 'single',
            is_active: true,
            is_hot: false,
            is_feature: false,
            is_delete: false,
            thumbnail: '/api/placeholder/200/200',
            createdAt: new Date('2024-03-10'),
            category_id: ['skincare'],
            brand_id: 'sunplay',
            category: 'Chăm sóc da'
          }
        ]);
      } finally {
        // Cập nhật loading chỉ khi component vẫn mounted
        if (isMounted) {
          setLoading(false);
        }
        fetchInProgress.current = false;
      }
    };
    
    fetchShopAndProducts();
    
    // Cleanup function khi component unmounts
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Get unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return ['Tất cả', ...uniqueCategories];
  }, [products]);

  const sortedProducts = useMemo(() => {
    let filteredProducts = products.filter(product => 
      (categoryFilter === 'Tất cả' || product.category === categoryFilter) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filteredProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredProducts;
  }, [products, sortConfig, categoryFilter, searchTerm]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setIsSortDropdownOpen(false);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // Handle opening the edit modal
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setEditModalOpen(true);
  };

  // Handle updating product after edit
  const handleUpdateProduct = (updatedProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id || product.id === updatedProduct._id ? 
        { 
          ...updatedProduct,
          id: updatedProduct.id || updatedProduct._id,
          _id: updatedProduct._id || updatedProduct.id
        } : product
      )
    );
  };

  // Handle product deletion with confirmation
  const handleDeleteProduct = useCallback(async (productId) => {
    try {
      setLoading(true);
      await ApiService.delete(`/product/delete/${productId}`);
      // Remove the product from the state using functional update
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      setError(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">Tất cả sản phẩm ({sortedProducts.length})</span>
              <div className="text-gray-500 space-x-2">
                <span>Hiển thị ({sortedProducts.length})</span>
                <span>Nháp (0)</span>
                <span>Thùng rác (0)</span>
              </div>
            </div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              onClick={() => navigate('/seller-dashboard/add-product')}
            >
              <Plus size={20} className="mr-2" />
              Thêm mới
            </button>
          </div>

          {/* Functionality Bar */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="text-gray-600">
              Chức năng: Thêm vô thùng rác (0)
            </div>
            <div className="flex space-x-4">
              {/* Sắp xếp theo */}
              <div className="relative">
                <div 
                  className="flex items-center border rounded px-3 py-2 cursor-pointer"
                  onClick={() => {
                    setIsSortDropdownOpen(!isSortDropdownOpen);
                    setIsCategoryDropdownOpen(false);
                  }}
                >
                  <span>Sắp xếp theo</span>
                  <ChevronDown size={16} className="ml-2" />
                </div>
                {isSortDropdownOpen && (
                  <div className="absolute z-10 right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                    <div 
                      className="p-2 hover:bg-gray-100 flex justify-between items-center"
                      onClick={() => handleSort('price')}
                    >
                      Giá 
                      {getSortIcon('price')}
                    </div>
                    <div 
                      className="p-2 hover:bg-gray-100 flex justify-between items-center"
                      onClick={() => handleSort('name')}
                    >
                      Tên A-Z 
                      {getSortIcon('name')}
                    </div>
                    <div 
                      className="p-2 hover:bg-gray-100 flex justify-between items-center"
                      onClick={() => handleSort('createdAt')}
                    >
                      Ngày tạo 
                      {getSortIcon('createdAt')}
                    </div>
                  </div>
                )}
              </div>

              {/* Chọn danh mục */}
              <div className="relative">
                <div 
                  className="flex items-center border rounded px-3 py-2 cursor-pointer"
                  onClick={() => {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                    setIsSortDropdownOpen(false);
                  }}
                >
                  <span>{categoryFilter}</span>
                  <ChevronDown size={16} className="ml-2" />
                </div>
                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                    {categories.map((category) => (
                      <div 
                        key={category}
                        className="p-2 hover:bg-gray-100"
                        onClick={() => {
                          setCategoryFilter(category);
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tìm kiếm */}
              <input 
                type="text" 
                placeholder="Tìm kiếm" 
                className="border rounded px-3 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="p-8 flex justify-center items-center">
              <Loader className="animate-spin mr-2" />
              <span>Đang tải sản phẩm...</span>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          )}

          {/* Product Table */}
          {!loading && !error && (
            <table className="w-full table-fixed border-collapse">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4 text-left w-12">
                    <input type="checkbox" />
                  </th>
                  <th 
                    className="p-4 text-left cursor-pointer w-1/3"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      TÊN SẢN PHẨM
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="p-4 text-left w-24">SỐ LƯỢNG</th>
                  <th 
                    className="p-4 text-left cursor-pointer w-24"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      GIÁ
                      {getSortIcon('price')}
                    </div>
                  </th>
                  <th className="p-4 text-left w-20">ĐÃ BÁN</th>
                  <th className="p-4 text-left w-28">LOẠI SẢN PHẨM</th>
                  <th className="p-4 text-left w-32">THAO TÁC</th> {/* Điều chỉnh width */}
                </tr>
              </thead>
              <tbody>
                {sortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      Không có sản phẩm nào để hiển thị
                    </td>
                  </tr>
                ) : (
                  sortedProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 w-12">
                        <input type="checkbox" />
                      </td>
                      <td className="p-4 w-1/3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 mr-4 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                            <img 
                              src={product.thumbnail || "/api/placeholder/50/50"} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/api/placeholder/50/50";
                              }}
                            />
                          </div>
                          <span className="truncate">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-green-600 w-24">
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </td>
                      <td className="p-4 w-24">{product.price.toLocaleString()}₫</td>
                      <td className="p-4 w-20">{product.sold}</td>
                      <td className="p-4 w-28">{product.type}</td>
                      <td className="p-4 w-32">
                        <div className="flex space-x-2 justify-center">
                          <Eye 
                            size={20} 
                            className="text-blue-500 cursor-pointer flex-shrink-0" 
                            onClick={() => handleViewProduct(product)}
                            title="Xem chi tiết sản phẩm"
                          />
                          <Edit 
                            size={20} 
                            className="text-blue-500 cursor-pointer flex-shrink-0" 
                            onClick={() => handleEditProduct(product)}
                            title="Chỉnh sửa sản phẩm"
                          />
                          <Trash2 
                            size={20} 
                            className="text-red-500 cursor-pointer flex-shrink-0" 
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                                handleDeleteProduct(product.id);
                              }
                            }}
                            title="Xóa sản phẩm"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {editModalOpen && currentProduct && (
        <EditProductModal 
          product={currentProduct}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdateProduct}
        />
      )}

      {/* Product Details Modal */}
      {detailsModalOpen && viewProduct && (
        <ProductDetailsModal 
          product={viewProduct}
          onClose={() => setDetailsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductList;