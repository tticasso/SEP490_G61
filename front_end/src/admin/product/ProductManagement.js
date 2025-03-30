import React, { useState, useEffect } from 'react';
import { Eye, ChevronLeft, ChevronRight, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import ApiService from '../../services/ApiService';
import ProductDetailModal from './modal/ProductDetailModal';

const ProductManagement = () => {
    // State for product data
    const [products, setProducts] = useState([]);
    const [productVariants, setProductVariants] = useState({});
    const [expandedProducts, setExpandedProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingVariants, setLoadingVariants] = useState({});
    const [error, setError] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [productsPerPage, setProductsPerPage] = useState(5);
    
    // Filter states
    const [filter, setFilter] = useState({
        all: true,
        visible: false,
        trash: false
    });
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    
    // Selected products/variants for bulk actions
    const [selectedItems, setSelectedItems] = useState({});

    // Detail modal state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Fetch products from API
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get('/product');
            setProducts(response);
            setTotalProducts(response.length);
            
            // Initialize expanded state
            const initialExpandedState = {};
            response.forEach(product => {
                initialExpandedState[product._id] = false;
            });
            setExpandedProducts(initialExpandedState);
            
            setLoading(false);
        } catch (error) {
            setError('Lỗi khi tải dữ liệu sản phẩm: ' + error);
            setLoading(false);
        }
    };

    // Fetch variants for a specific product
    const fetchVariantsForProduct = async (productId) => {
        try {
            setLoadingVariants(prevState => ({ ...prevState, [productId]: true }));
            
            const variants = await ApiService.get(`/product-variant/product/${productId}`);
            
            setProductVariants(prevVariants => ({
                ...prevVariants,
                [productId]: variants || []
            }));
            
            setLoadingVariants(prevState => ({ ...prevState, [productId]: false }));
        } catch (error) {
            console.error(`Error fetching variants for product ${productId}:`, error);
            setLoadingVariants(prevState => ({ ...prevState, [productId]: false }));
        }
    };

    // Toggle product expansion to show/hide variants
    const toggleProductExpansion = async (productId) => {
        // If we're expanding and don't have variants loaded yet, fetch them
        if (!expandedProducts[productId] && !productVariants[productId]) {
            await fetchVariantsForProduct(productId);
        }
        
        setExpandedProducts(prevState => ({
            ...prevState,
            [productId]: !prevState[productId]
        }));
    };

    // Handle checkbox selection for products and variants
    const handleSelectItem = (itemId, itemType) => {
        setSelectedItems(prevSelected => {
            const key = `${itemType}-${itemId}`;
            const newSelected = { ...prevSelected };
            
            if (newSelected[key]) {
                delete newSelected[key];
            } else {
                newSelected[key] = { id: itemId, type: itemType };
            }
            
            return newSelected;
        });
    };

    // Select all visible items
    const handleSelectAllItems = () => {
        const currentItems = getCurrentItems();
        const allSelected = currentItems.every(item => {
            const itemKey = `product-${item._id}`;
            return selectedItems[itemKey];
        });
        
        if (allSelected) {
            // Deselect all
            setSelectedItems({});
        } else {
            // Select all visible products
            const newSelected = {};
            currentItems.forEach(item => {
                newSelected[`product-${item._id}`] = { id: item._id, type: 'product' };
                
                // If expanded, also select its variants
                if (expandedProducts[item._id] && productVariants[item._id]) {
                    productVariants[item._id].forEach(variant => {
                        newSelected[`variant-${variant._id}`] = { id: variant._id, type: 'variant' };
                    });
                }
            });
            setSelectedItems(newSelected);
        }
    };

    // Handle pagination
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchProducts();
        setProductVariants({});
    };

    // View product or variant details
    const handleViewDetails = (product, variant = null) => {
        setSelectedProduct(product);
        setSelectedVariant(variant);
        setShowDetailModal(true);
    };

    // Soft delete a product
    const handleSoftDeleteProduct = async (productId) => {
        if (window.confirm('Bạn có chắc chắn muốn đưa sản phẩm này vào thùng rác?')) {
            try {
                const result = await ApiService.put(`/product/soft-delete/${productId}`);
                
                // Update local state
                setProducts(products.map(product => 
                    product._id === productId ? {...product, is_delete: true} : product
                ));
                
                // Remove from selected items
                const newSelectedItems = { ...selectedItems };
                delete newSelectedItems[`product-${productId}`];
                setSelectedItems(newSelectedItems);
            } catch (error) {
                setError('Lỗi khi xóa sản phẩm: ' + error);
            }
        }
    };

    // Soft delete a variant
    const handleSoftDeleteVariant = async (variantId, productId) => {
        if (window.confirm('Bạn có chắc chắn muốn đưa biến thể này vào thùng rác?')) {
            try {
                const result = await ApiService.put(`/product-variant/soft-delete/${variantId}`);
                
                // Update local state
                setProductVariants(prevVariants => {
                    const updatedVariants = { ...prevVariants };
                    if (updatedVariants[productId]) {
                        updatedVariants[productId] = updatedVariants[productId].map(variant => 
                            variant._id === variantId ? {...variant, is_delete: true} : variant
                        );
                    }
                    return updatedVariants;
                });
                
                // Remove from selected items
                const newSelectedItems = { ...selectedItems };
                delete newSelectedItems[`variant-${variantId}`];
                setSelectedItems(newSelectedItems);
            } catch (error) {
                setError('Lỗi khi xóa biến thể: ' + error);
            }
        }
    };

    // Restore a product
    const handleRestoreProduct = async (productId) => {
        if (window.confirm('Khôi phục sản phẩm này?')) {
            try {
                await ApiService.put(`/product/restore/${productId}`);
                
                // Update local state
                setProducts(products.map(product => 
                    product._id === productId ? {...product, is_delete: false} : product
                ));
            } catch (error) {
                setError('Lỗi khi khôi phục sản phẩm: ' + error);
            }
        }
    };

    // Restore a variant
    const handleRestoreVariant = async (variantId, productId) => {
        if (window.confirm('Khôi phục biến thể này?')) {
            try {
                await ApiService.put(`/product-variant/restore/${variantId}`);
                
                // Update local state
                setProductVariants(prevVariants => {
                    const updatedVariants = { ...prevVariants };
                    if (updatedVariants[productId]) {
                        updatedVariants[productId] = updatedVariants[productId].map(variant => 
                            variant._id === variantId ? {...variant, is_delete: false} : variant
                        );
                    }
                    return updatedVariants;
                });
            } catch (error) {
                setError('Lỗi khi khôi phục biến thể: ' + error);
            }
        }
    };

    // Bulk soft delete
    const handleBulkSoftDelete = async () => {
        const selectedCount = Object.keys(selectedItems).length;
        if (selectedCount === 0) return;
        
        if (window.confirm(`Bạn có chắc chắn muốn đưa ${selectedCount} mục đã chọn vào thùng rác?`)) {
            try {
                // Separate products and variants
                const productIds = [];
                const variantIds = [];
                
                Object.values(selectedItems).forEach(item => {
                    if (item.type === 'product') {
                        productIds.push(item.id);
                    } else if (item.type === 'variant') {
                        variantIds.push(item.id);
                    }
                });
                
                // Process products
                if (productIds.length > 0) {
                    const productResult = await ApiService.post('/product/bulk-soft-delete', {
                        productIds: productIds
                    });
                    
                    if (productResult.success && productResult.success.length > 0) {
                        setProducts(products.map(product => 
                            productResult.success.includes(product._id) ? {...product, is_delete: true} : product
                        ));
                    }
                }
                
                // Process variants
                if (variantIds.length > 0) {
                    const variantResult = await ApiService.post('/product-variant/bulk-soft-delete', {
                        variantIds: variantIds
                    });
                    
                    if (variantResult.success && variantResult.success.length > 0) {
                        setProductVariants(prevVariants => {
                            const updatedVariants = { ...prevVariants };
                            
                            Object.keys(updatedVariants).forEach(productId => {
                                updatedVariants[productId] = updatedVariants[productId].map(variant => 
                                    variantResult.success.includes(variant._id) ? {...variant, is_delete: true} : variant
                                );
                            });
                            
                            return updatedVariants;
                        });
                    }
                }
                
                // Clear selected items
                setSelectedItems({});
            } catch (error) {
                setError('Lỗi khi xóa các mục: ' + error);
            }
        }
    };

    // Bulk restore
    const handleBulkRestore = async () => {
        const selectedCount = Object.keys(selectedItems).length;
        if (selectedCount === 0) return;
        
        if (window.confirm(`Bạn có chắc chắn muốn khôi phục ${selectedCount} mục đã chọn?`)) {
            try {
                // Separate products and variants
                const productIds = [];
                const variantIds = [];
                
                Object.values(selectedItems).forEach(item => {
                    if (item.type === 'product') {
                        productIds.push(item.id);
                    } else if (item.type === 'variant') {
                        variantIds.push(item.id);
                    }
                });
                
                // Process products
                if (productIds.length > 0) {
                    const productResult = await ApiService.post('/product/bulk-restore', {
                        productIds: productIds
                    });
                    
                    if (productResult.success && productResult.success.length > 0) {
                        setProducts(products.map(product => 
                            productResult.success.includes(product._id) ? {...product, is_delete: false} : product
                        ));
                    }
                }
                
                // Process variants
                if (variantIds.length > 0) {
                    const variantResult = await ApiService.post('/product-variant/bulk-restore', {
                        variantIds: variantIds
                    });
                    
                    if (variantResult.success && variantResult.success.length > 0) {
                        setProductVariants(prevVariants => {
                            const updatedVariants = { ...prevVariants };
                            
                            Object.keys(updatedVariants).forEach(productId => {
                                updatedVariants[productId] = updatedVariants[productId].map(variant => 
                                    variantResult.success.includes(variant._id) ? {...variant, is_delete: false} : variant
                                );
                            });
                            
                            return updatedVariants;
                        });
                    }
                }
                
                // Clear selected items
                setSelectedItems({});
            } catch (error) {
                setError('Lỗi khi khôi phục các mục: ' + error);
            }
        }
    };

    // Filter products based on active filter and search term
    const filteredProducts = products.filter(product => {
        // Apply filter
        if (filter.visible && !product.is_active) return false;
        if (filter.trash && !product.is_delete) return false;
        if (!filter.trash && !filter.visible && filter.all && product.is_delete) return false;
        
        // Apply search
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                product.name.toLowerCase().includes(searchLower) ||
                (product.description && product.description.toLowerCase().includes(searchLower)) ||
                (product.shop_id && product.shop_id.name && product.shop_id.name.toLowerCase().includes(searchLower))
            );
        }
        
        return true;
    });

    // Get current page items
    const getCurrentItems = () => {
        const indexOfLastProduct = currentPage * productsPerPage;
        const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
        return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    };

    // Get current page items
    const currentProducts = getCurrentItems();
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Format price to VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(price)
            .replace('₫', 'đ');
    };

    // Render variant attributes
    const renderVariantAttributes = (variant) => {
        if (!variant.attributes) return null;
        
        // Convert attributes to a usable format
        const attributes = variant.attributes instanceof Map 
            ? Object.fromEntries(variant.attributes) 
            : variant.attributes;
        
        if (!attributes || Object.keys(attributes).length === 0) {
            return null;
        }
        
        return (
            <div className="text-xs text-gray-600 mt-1">
                {Object.entries(attributes).map(([key, value]) => (
                    <span key={key} className="mr-2 bg-gray-100 px-1 py-0.5 rounded">
                        <span className="capitalize">{key}</span>: <strong>{value}</strong>
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    return (
        <div className="flex-1 bg-gray-50">
            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex space-x-6 text-gray-600">
                    <button
                        className={`${filter.visible ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: false, visible: true, trash: false })}
                    >
                        Tất cả ( {products.filter(p => p.is_active && !p.is_delete).length} )
                    </button>
                    <button
                        className={`${filter.all ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: true, visible: false, trash: false })}
                    >
                        Đang bán ( {products.filter(p => !p.is_delete).length} )
                    </button>
                    <button
                        className={`${filter.trash ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: false, visible: false, trash: true })}
                    >
                        Thùng rác ( {products.filter(p => p.is_delete).length} )
                    </button>
                </div>

                <div className="flex items-center mt-4">
                    <div className="flex items-center mr-4 cursor-pointer" onClick={handleRefresh}>
                        <span className="text-gray-500 mr-2">Dữ liệu mới nhất</span>
                        <RefreshCw size={18} className="text-gray-500" />
                    </div>
                    <div className="text-gray-500">
                        {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}
                    </div>
                </div>
            </div>

            {/* Function bar */}
            <div className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center">
                    <div className="text-gray-700 mr-2">Chức năng:</div>
                    {!filter.trash ? (
                        <button 
                            className={`text-pink-500 ${Object.keys(selectedItems).length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={handleBulkSoftDelete}
                            disabled={Object.keys(selectedItems).length === 0}
                        >
                            Thêm vào thùng rác ( {Object.keys(selectedItems).length} )
                        </button>
                    ) : (
                        <button 
                            className={`text-green-500 ${Object.keys(selectedItems).length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={handleBulkRestore}
                            disabled={Object.keys(selectedItems).length === 0}
                        >
                            Khôi phục ( {Object.keys(selectedItems).length} )
                        </button>
                    )}
                </div>

                <div className="flex items-center">
                    <div className="mr-4">
                        <select className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                            <option>Sắp xếp theo</option>
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="price-asc">Giá tăng dần</option>
                            <option value="price-desc">Giá giảm dần</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="border border-gray-300 rounded-md px-3 py-2"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
            </div>

            {/* Products table */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-md shadow-sm overflow-x-auto" style={{ width: '100%' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={currentProducts.length > 0 && currentProducts.every(item => selectedItems[`product-${item._id}`])}
                                        onChange={handleSelectAllItems}
                                    />
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    Tên sản phẩm
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    Cửa hàng
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    Danh mục
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    Thương hiệu
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    Giá bán
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    Đã bán
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    Trạng thái
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentProducts.length > 0 ? (
                                currentProducts.map((product) => (
                                    <React.Fragment key={product._id}>
                                        {/* Product row */}
                                        <tr className={`hover:bg-gray-50 ${expandedProducts[product._id] ? 'bg-blue-50' : ''}`}>
                                            <td className="py-3 px-4" >
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 mr-2"
                                                        checked={!!selectedItems[`product-${product._id}`]}
                                                        onChange={() => handleSelectItem(product._id, 'product')}
                                                    />
                                                    <button 
                                                        onClick={() => toggleProductExpansion(product._id)}
                                                        className="text-gray-500"
                                                    >
                                                        {expandedProducts[product._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 truncate w-[80px]">
                                                <div className="flex items-center">
                                                    <img
                                                        src={product.thumbnail || 'https://via.placeholder.com/40'}
                                                        alt={product.name}
                                                        className="h-10 w-10 mr-3 object-cover"
                                                    />
                                                    <span className="text-sm text-gray-900">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
                                                {product.shop_id && product.shop_id.name ? product.shop_id.name : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
                                                {product.category_id && product.category_id.length > 0 
                                                    ? product.category_id.map(cat => cat.name).join(', ') 
                                                    : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
                                                {product.brand_id ? product.brand_id.name : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
                                                {formatPrice(product.price)}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{product.sold || 0}</td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`h-2 w-2 rounded-full mr-2 ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    <span className="text-sm text-gray-700">
                                                        {product.is_delete 
                                                            ? 'Đã xóa' 
                                                            : product.is_active 
                                                                ? 'Đang bán' 
                                                                : 'Ngừng bán'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <button 
                                                        className="text-blue-500 hover:text-blue-600"
                                                        onClick={() => handleViewDetails(product)}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    {!product.is_delete ? (
                                                        <button 
                                                            className="text-red-500 hover:text-red-600 ml-3"
                                                            onClick={() => handleSoftDeleteProduct(product._id)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="text-green-500 hover:text-green-600 ml-3"
                                                            onClick={() => handleRestoreProduct(product._id)}
                                                        >
                                                            Khôi phục
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        {/* Variants section */}
                                        {expandedProducts[product._id] && (
                                            <>
                                                {/* Header for variants */}
                                                <tr className="bg-gray-100">
                                                    <td className="py-2 px-4"></td>
                                                    <td colSpan="8" className="py-2 px-4">
                                                        <div className="text-sm font-medium text-gray-700">
                                                            Biến thể của sản phẩm
                                                        </div>
                                                    </td>
                                                </tr>
                                                
                                                {/* Loading indicator */}
                                                {loadingVariants[product._id] && (
                                                    <tr>
                                                        <td className="py-3 px-4"></td>
                                                        <td colSpan="8" className="py-3 px-4">
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-2"></div>
                                                                Đang tải biến thể...
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                
                                                {/* No variants */}
                                                {!loadingVariants[product._id] && 
                                                 (!productVariants[product._id] || productVariants[product._id].length === 0) && (
                                                    <tr>
                                                        <td className="py-3 px-4"></td>
                                                        <td colSpan="8" className="py-3 px-4">
                                                            <div className="text-sm text-gray-500">
                                                                Không có biến thể nào
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                
                                                {/* Variant list */}
                                                {!loadingVariants[product._id] && 
                                                 productVariants[product._id] && 
                                                 productVariants[product._id].map((variant) => (
                                                    <tr key={variant._id} className="hover:bg-gray-50 bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <div className="flex pl-6">
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-4 w-4"
                                                                    checked={!!selectedItems[`variant-${variant._id}`]}
                                                                    onChange={() => handleSelectItem(variant._id, 'variant')}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center">
                                                                <div className="ml-4">
                                                                    <div className="text-sm text-gray-900 font-medium">
                                                                        {variant.name || 'Biến thể không tên'}
                                                                    </div>
                                                                    {renderVariantAttributes(variant)}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4" colSpan="2">
                                                            <div className="text-sm text-gray-700">
                                                                {variant.sku || 'Chưa có mã SKU'}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4"></td>
                                                        <td className="py-3 px-4 text-sm text-gray-700">
                                                            {formatPrice(variant.price || product.price)}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-700">
                                                            <div className="text-sm text-gray-700">
                                                                Tồn kho: {variant.stock !== undefined ? variant.stock : 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center">
                                                                <span className={`h-2 w-2 rounded-full mr-2 ${!variant.is_delete ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                                <span className="text-sm text-gray-700">
                                                                    {variant.is_delete ? 'Đã xóa' : 'Đang bán'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center space-x-3">
                                                                <button 
                                                                    className="text-blue-500 hover:text-blue-600"
                                                                    onClick={() => handleViewDetails(product, variant)}
                                                                >
                                                                    <Eye size={18} />
                                                                </button>
                                                                {!variant.is_delete ? (
                                                                    <button 
                                                                        className="text-red-500 hover:text-red-600 ml-3"
                                                                        onClick={() => handleSoftDeleteVariant(variant._id, product._id)}
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        className="text-green-500 hover:text-green-600 ml-3"
                                                                        onClick={() => handleRestoreVariant(variant._id, product._id)}
                                                                    >
                                                                        Khôi phục
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="py-4 px-6 text-center text-gray-500">
                                        Không có sản phẩm nào phù hợp với tìm kiếm
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 0 && (
                        <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center">
                                <button 
                                    className={`p-2 border border-gray-300 rounded-md mr-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                
                                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                    // Show current page and surrounding pages
                                    const pageNumber = currentPage <= 3 
                                        ? index + 1 
                                        : currentPage - 3 + index + 1;
                                    
                                    if (pageNumber <= totalPages) {
                                        return (
                                            <button 
                                                key={pageNumber}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                                                    currentPage === pageNumber
                                                        ? 'bg-blue-500 text-white'
                                                        : 'text-gray-700'
                                                }`}
                                                onClick={() => goToPage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    }
                                    return null;
                                })}
                                
                                <button 
                                    className={`p-2 border border-gray-300 rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-700">
                                <span>Trang {currentPage} của {totalPages}</span>
                                <span className="mx-4">-</span>
                                <span>Hiển thị</span>
                                <select 
                                    className="mx-2 border border-gray-300 rounded p-1"
                                    value={productsPerPage}
                                    onChange={(e) => setProductsPerPage(Number(e.target.value))}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                                <span>/</span>
                                <span className="ml-2">{filteredProducts.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Product/Variant Detail Modal */}
            {showDetailModal && (
                <ProductDetailModal 
                    product={selectedProduct}
                    variant={selectedVariant}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedProduct(null);
                        setSelectedVariant(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProductManagement;