import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Info, Calendar, Package, Tag, Coins, Clock, User, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

const EditCouponForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();

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

    useEffect(() => {
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
                const couponResponse = await ApiService.get(`/coupon/find/${id}`);

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
    }, [id]);

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

            await ApiService.put(`/coupon/edit/${id}`, payload);
            toast.success('Cập nhật mã giảm giá thành công');
            navigate('/admin/coupons');
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

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="p-6">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate('/admin/coupons')}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Lỗi tải dữ liệu
                    </h1>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <p className="text-red-600 font-medium text-lg mb-4">{loadError}</p>
                    <button
                        onClick={() => navigate('/admin/coupons')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/admin/coupons')}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-semibold text-gray-800">
                    Chỉnh sửa mã giảm giá
                </h1>
            </div>

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

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit}>
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
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.value ? 'border-red-500' : 'border-gray-300'
                                        }`}
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
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.start_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
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
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.end_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
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
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.max_uses_per_user ? 'border-red-500' : 'border-gray-300'
                                    }`}
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
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${!formData.category_id || formData.category_id === '' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                    } ${errors.product_id ? 'border-red-500' : ''}`}
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
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
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

                    <div className="mt-8 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/coupons')}
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
            </div>
        </div>
    );
};

export default EditCouponForm;