import React, { useState, useEffect } from 'react';
import { Eye, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import ApiService from '../../services/ApiService';
import ProductDetailModal from './modal/ProductDetailModal';

const ProductManagement = () => {
    // State cho dữ liệu sản phẩm
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [productsPerPage, setProductsPerPage] = useState(5);
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    // Filter states
    const [filter, setFilter] = useState({
        all: true,
        visible: false,
        trash: false
    });
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    
    // Selected products for bulk actions
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Detail modal state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

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
            setLoading(false);
        } catch (error) {
            setError('Lỗi khi tải dữ liệu sản phẩm: ' + error);
            setLoading(false);
        }
    };

    // Handle checkbox selection
    const handleSelectProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedProducts.length === currentProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(currentProducts.map(product => product._id));
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
    };

    // Handle view product details
    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setShowDetailModal(true);
    };

    // Handle soft delete (move to trash)
    const handleSoftDelete = async (productId) => {
        if (window.confirm('Bạn có chắc chắn muốn đưa sản phẩm này vào thùng rác?')) {
            try {
                // Sử dụng API mới cho xóa mềm
                const result = await ApiService.put(`/product/soft-delete/${productId}`);
                
                // Update local state
                setProducts(products.map(product => 
                    product._id === productId ? {...product, is_delete: true} : product
                ));
                
                // Remove from selected products
                setSelectedProducts(selectedProducts.filter(id => id !== productId));
            } catch (error) {
                setError('Lỗi khi xóa sản phẩm: ' + error);
            }
        }
    };

    // Handle bulk soft delete
    const handleBulkSoftDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn đưa ${selectedProducts.length} sản phẩm đã chọn vào thùng rác?`)) {
        try {
            // Sử dụng API bulk soft delete mới
            const result = await ApiService.post('/product/bulk-soft-delete', {
                productIds: selectedProducts
            });
            
            // Cập nhật trạng thái local state dựa trên kết quả từ server
            if (result.success && result.success.length > 0) {
                setProducts(products.map(product => 
                    result.success.includes(product._id) ? {...product, is_delete: true} : product
                ));
                
                // Xóa các sản phẩm đã xử lý khỏi danh sách đã chọn
                setSelectedProducts([]);
            }
            
            // Hiển thị thông báo lỗi nếu có
            if (result.errors && result.errors.length > 0) {
                setError(`Có ${result.errors.length} sản phẩm không thể xóa. Vui lòng kiểm tra quyền truy cập.`);
            }
        } catch (error) {
            setError('Lỗi khi xóa sản phẩm: ' + error);
        }
    }
};

    // Handle bulk restore from trash
    const handleBulkRestore = async () => {
        if (selectedProducts.length === 0) return;
        
        if (window.confirm(`Bạn có chắc chắn muốn khôi phục ${selectedProducts.length} sản phẩm đã chọn?`)) {
            try {
                // Sử dụng API bulk restore mới
                const result = await ApiService.post('/product/bulk-restore', {
                    productIds: selectedProducts
                });
                
                // Cập nhật trạng thái local state dựa trên kết quả từ server
                if (result.success && result.success.length > 0) {
                    setProducts(products.map(product => 
                        result.success.includes(product._id) ? {...product, is_delete: false} : product
                    ));
                    
                    // Xóa các sản phẩm đã xử lý khỏi danh sách đã chọn
                    setSelectedProducts([]);
                }
                
                // Hiển thị thông báo lỗi nếu có
                if (result.errors && result.errors.length > 0) {
                    setError(`Có ${result.errors.length} sản phẩm không thể khôi phục. Vui lòng kiểm tra quyền truy cập.`);
                }
            } catch (error) {
                setError('Lỗi khi khôi phục sản phẩm: ' + error);
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

    // Paginate products
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Format price to VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
                            className={`text-pink-500 ${selectedProducts.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={handleBulkSoftDelete}
                            disabled={selectedProducts.length === 0}
                        >
                            Thêm vào thùng rác ( {selectedProducts.length} )
                        </button>
                    ) : (
                        <button 
                            className={`text-green-500 ${selectedProducts.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={handleBulkRestore}
                            disabled={selectedProducts.length === 0}
                        >
                            Khôi phục ( {selectedProducts.length} )
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
                <div className="bg-white rounded-md shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Tên sản phẩm
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Cửa hàng
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Danh mục
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Thương hiệu
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Giá bán
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Đã bán
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentProducts.length > 0 ? (
                                currentProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={selectedProducts.includes(product._id)}
                                                onChange={() => handleSelectProduct(product._id)}
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={product.thumbnail || 'https://via.placeholder.com/40'}
                                                    alt={product.name}
                                                    className="h-10 w-10 mr-3 object-cover"
                                                />
                                                <span className="text-sm text-gray-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {product.shop_id && product.shop_id.name ? product.shop_id.name : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {product.category_id && product.category_id.length > 0 
                                                ? product.category_id.map(cat => cat.name).join(', ') 
                                                : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {product.brand_id ? product.brand_id.name : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {formatPrice(product.price)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{product.sold || 0}</td>
                                        <td className="py-3 px-4">
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
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-3">
                                                <button 
                                                    className="text-blue-500 hover:text-blue-600"
                                                    onClick={() => handleViewProduct(product)}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {!product.is_delete && (
                                                    <button 
                                                        className="text-red-500 hover:text-red-600 ml-3"
                                                        onClick={() => handleSoftDelete(product._id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                                {product.is_delete && (
    <button 
        className="text-green-500 hover:text-green-600 ml-3"
        onClick={() => {
            if (window.confirm('Khôi phục sản phẩm này?')) {
                ApiService.put(`/product/restore/${product._id}`)
                    .then(() => {
                        setProducts(products.map(p => 
                            p._id === product._id ? {...p, is_delete: false} : p
                        ));
                    })
                    .catch(err => setError('Lỗi khi khôi phục: ' + err));
            }
        }}
    >
        Khôi phục
    </button>
)}
                                            </div>
                                        </td>
                                    </tr>
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
                                <span className="ml-2">{totalProducts}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Detail Modal */}
            {showDetailModal && (
                <ProductDetailModal 
                    product={selectedProduct}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProductManagement;