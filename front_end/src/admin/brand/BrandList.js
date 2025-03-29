import React, { useState, useEffect } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight, RefreshCw, Plus } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { Link, useNavigate } from 'react-router-dom';
import EditBrandModal from './modal/EditBrandModal';
import AddBrandModal from './AddBrand';

const BrandList = () => {
    // State for brands
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [brandsPerPage, setBrandsPerPage] = useState(5);
    const [totalBrands, setTotalBrands] = useState(0);
    
    // Filter states
    const [filter, setFilter] = useState({
        all: true,
        visible: false,
        imported: false,
        trash: false
    });
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    
    // Sorting state
    const [sortOption, setSortOption] = useState('');

    // Selected brands for bulk actions
    const [selectedBrands, setSelectedBrands] = useState([]);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    
    // Add Brand Modal state
    const [showAddModal, setShowAddModal] = useState(false);

    const navigate = useNavigate();

    // Fetch brands from API
    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get('/brand');
            setBrands(response);
            setTotalBrands(response.length);
            setLoading(false);
        } catch (error) {
            setError('Lỗi khi tải dữ liệu thương hiệu: ' + error);
            setLoading(false);
        }    
    };

    // Handle checkbox selection
    const handleSelectBrand = (brandId) => {
        if (selectedBrands.includes(brandId)) {
            setSelectedBrands(selectedBrands.filter(id => id !== brandId));
        } else {
            setSelectedBrands([...selectedBrands, brandId]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedBrands.length === currentBrands.length) {
            setSelectedBrands([]);
        } else {
            setSelectedBrands(currentBrands.map(brand => brand._id));
        }
    };

    // Handle pagination
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    // Handle sorting
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchBrands();
        setSearchTerm('');
        setSortOption('');
        setCurrentPage(1);
    };

    // Handle add new brand - Mở modal thêm mới thương hiệu
    const handleAddNew = () => {
        setShowAddModal(true);
    };

    // Handle add brand callback - Xử lý khi thêm thương hiệu thành công
    const handleAddBrand = (newBrand) => {
        setBrands([...brands, newBrand]);
    };

    // Handle edit brand
    const handleEditBrand = (brand) => {
        setEditingBrand(brand);
        setShowEditModal(true);
    };

    // Handle update brand (callback from EditBrandModal)
    const handleUpdateBrand = (updatedBrand) => {
        setBrands(brands.map(brand => 
            brand._id === updatedBrand._id ? updatedBrand : brand
        ));
    };

    // Handle delete brand
    const handleDeleteBrand = async (brandId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
            try {
                await ApiService.delete(`/brand/delete/${brandId}`);
                // Update local state after successful deletion
                setBrands(brands.filter(brand => brand._id !== brandId));
                // Remove from selected brands
                setSelectedBrands(selectedBrands.filter(id => id !== brandId));
            } catch (error) {
                setError('Lỗi khi xóa thương hiệu: ' + error);
            }
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedBrands.length === 0) return;
        
        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedBrands.length} thương hiệu đã chọn?`)) {
            try {
                // Delete each selected brand
                await Promise.all(selectedBrands.map(brandId => 
                    ApiService.delete(`/brand/delete/${brandId}`)
                ));
                
                // Update local state
                setBrands(brands.filter(brand => !selectedBrands.includes(brand._id)));
                setSelectedBrands([]);
            } catch (error) {
                setError('Lỗi khi xóa thương hiệu: ' + error);
            }
        }
    };

    // Filter brands based on active filter and search term
    const getFilteredAndSortedBrands = () => {
        // First apply search filter
        let result = [...brands];
        
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(brand => {
                return (
                    brand.name.toLowerCase().includes(searchLower) ||
                    (brand.description && brand.description.toLowerCase().includes(searchLower))
                );
            });
        }
        
        // Then apply sorting
        if (sortOption) {
            switch (sortOption) {
                case 'newest':
                    result.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                    break;
                case 'oldest':
                    result.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
                    break;
                case 'name-asc':
                    result.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    result.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                default:
                    break;
            }
        }
        
        return result;
    };

    // Get filtered and sorted brands
    const filteredAndSortedBrands = getFilteredAndSortedBrands();
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredAndSortedBrands.length / brandsPerPage);

    // Paginate brands
    const indexOfLastBrand = currentPage * brandsPerPage;
    const indexOfFirstBrand = indexOfLastBrand - brandsPerPage;
    const currentBrands = filteredAndSortedBrands.slice(indexOfFirstBrand, indexOfLastBrand);

    // Format categories to display
    const formatCategories = (categories) => {
        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            return 'N/A';
        }
        
        // Extract category names, handling both object and string IDs
        const categoryNames = categories.map(cat => {
            if (typeof cat === 'object' && cat !== null) {
                return cat.name;
            }
            
            return cat;
        });
        
        return categoryNames.join(', ');
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
                    <button 
                        className={`text-pink-500 ${selectedBrands.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={handleBulkDelete}
                        disabled={selectedBrands.length === 0}
                    >
                        Thêm vào thùng rác ( {selectedBrands.length} )
                    </button>
                </div>

                <div className="flex items-center">
                    <div className="mr-4">
                        <select 
                            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                            value={sortOption}
                            onChange={handleSortChange}
                        >
                            <option value="">Sắp xếp theo</option>
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="name-asc">Tên A-Z</option>
                            <option value="name-desc">Tên Z-A</option>
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

            {/* Brands table */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-md shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={selectedBrands.length === currentBrands.length && currentBrands.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Tên thương hiệu
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Danh mục
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Cập nhật gần nhất
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentBrands.length > 0 ? (
                                currentBrands.map((brand) => (
                                    <tr key={brand._id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={selectedBrands.includes(brand._id)}
                                                onChange={() => handleSelectBrand(brand._id)}
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {brand.categories && brand.categories.length > 0 
                                                ? (
                                                    <div className="max-w-xs overflow-hidden">
                                                        {formatCategories(brand.categories)}
                                                    </div>
                                                ) 
                                                : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {new Date(brand.updated_at).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-3">
                                                <button 
                                                    className="text-gray-500 hover:text-blue-600"
                                                    onClick={() => handleEditBrand(brand)}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button 
                                                    className="text-gray-500 hover:text-red-600"
                                                    onClick={() => handleDeleteBrand(brand._id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-4 px-6 text-center text-gray-500">
                                        Không có thương hiệu nào phù hợp với tìm kiếm
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
                                                        ? 'bg-pink-500 text-white'
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
                                    value={brandsPerPage}
                                    onChange={(e) => {
                                        setBrandsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Reset to first page when changing items per page
                                    }}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                                <span>/</span>
                                <span className="ml-2">{totalBrands}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add New Brand Button (Fixed position) */}
            <div className="fixed bottom-8 right-8">
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
                    onClick={handleAddNew}
                >
                    <Plus size={20} />
                    <span className="ml-2">Thêm mới</span>
                </button>
            </div>

            {/* Edit Brand Modal */}
            {showEditModal && (
                <EditBrandModal 
                    brand={editingBrand}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingBrand(null);
                    }}
                    onUpdate={handleUpdateBrand}
                />
            )}

            {/* Add Brand Modal */}
            {showAddModal && (
                <AddBrandModal 
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddBrand}
                />
            )}
        </div>
    );
};

export default BrandList;