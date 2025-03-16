import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Loader,
  X
} from 'lucide-react';
import Sidebar from './Sidebar';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

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
                  <th className="p-4 text-left w-24">THAO TÁC</th>
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
                      <td className="p-4 w-24">
                        <div className="flex space-x-2 justify-center">
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
    </div>
  );
};

export default ProductList;