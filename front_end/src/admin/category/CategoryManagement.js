import React, { useState, useEffect } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight, RefreshCw, Plus } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { Link, useNavigate } from 'react-router-dom';
import EditCategoryModal from './modal/EditCategoryModal';
import AddCategoryModal from './AddCategory';

const CategoryManagement = () => {
    // State cho dữ liệu danh mục
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage, setCategoriesPerPage] = useState(5);
    const [totalCategories, setTotalCategories] = useState(0);
    
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
    
    // Selected categories for bulk actions
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Add modal state - Thêm state để hiển thị modal thêm danh mục
    const [showAddModal, setShowAddModal] = useState(false);

    const navigate = useNavigate();

    // Fetch categories from API
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get('/categories');
            setCategories(response);
            setTotalCategories(response.length);
            setLoading(false);
        } catch (error) {
            setError('Lỗi khi tải dữ liệu danh mục: ' + error);
            setLoading(false);
        }
    };

    // Handle checkbox selection
    const handleSelectCategory = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedCategories.length === currentCategories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(currentCategories.map(category => category._id));
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
        fetchCategories();
        setSearchTerm('');
        setSortOption('');
        setCurrentPage(1);
    };

    // Handle add new category - Mở modal thêm mới danh mục
    const handleAddNew = () => {
        setShowAddModal(true);
    };

    // Handle add category callback - Xử lý khi thêm danh mục thành công
    const handleAddCategory = (newCategory) => {
        setCategories([...categories, newCategory]);
    };

    // Handle edit category
    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setShowEditModal(true);
    };

    // Handle update category (callback from EditCategoryModal)
    const handleUpdateCategory = (updatedCategory) => {
        setCategories(categories.map(category => 
            category._id === updatedCategory._id ? updatedCategory : category
        ));
    };

    // Handle delete category
    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            try {
                await ApiService.delete(`/categories/delete/${categoryId}`);
                // Update local state after successful deletion
                setCategories(categories.filter(category => category._id !== categoryId));
                // Remove from selected categories
                setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
            } catch (error) {
                setError('Lỗi khi xóa danh mục: ' + error);
            }
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedCategories.length === 0) return;
        
        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedCategories.length} danh mục đã chọn?`)) {
            try {
                // Delete each selected category
                await Promise.all(selectedCategories.map(categoryId => 
                    ApiService.delete(`/categories/delete/${categoryId}`)
                ));
                
                // Update local state
                setCategories(categories.filter(category => !selectedCategories.includes(category._id)));
                setSelectedCategories([]);
            } catch (error) {
                setError('Lỗi khi xóa danh mục: ' + error);
            }
        }
    };

    // Get filtered and sorted categories
    const getFilteredAndSortedCategories = () => {
        // First apply search filter
        let result = [...categories];
        
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(category => {
                return (
                    category.name.toLowerCase().includes(searchLower) ||
                    (category.description && category.description.toLowerCase().includes(searchLower))
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

    // Get filtered and sorted categories
    const filteredAndSortedCategories = getFilteredAndSortedCategories();
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredAndSortedCategories.length / categoriesPerPage);

    // Paginate categories
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredAndSortedCategories.slice(indexOfFirstCategory, indexOfLastCategory);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
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
                        className={`text-pink-500 ${selectedCategories.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={handleBulkDelete}
                        disabled={selectedCategories.length === 0}
                    >
                        Thêm vào thùng rác ( {selectedCategories.length} )
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

            {/* Categories table */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-md shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={selectedCategories.length === currentCategories.length && currentCategories.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Tên danh mục
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Mô tả
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        Cập nhật gần nhất
                                    </div>
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentCategories.length > 0 ? (
                                currentCategories.map((category) => (
                                    <tr key={category._id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={selectedCategories.includes(category._id)}
                                                onChange={() => handleSelectCategory(category._id)}
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {category.description ? (
                                                <div className="max-w-xs overflow-hidden text-ellipsis">
                                                    {category.description}
                                                </div>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{formatDate(category.updated_at)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-3">
                                                <button 
                                                    className="text-gray-500 hover:text-blue-600"
                                                    onClick={() => handleEditCategory(category)}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button 
                                                    className="text-gray-500 hover:text-red-600"
                                                    onClick={() => handleDeleteCategory(category._id)}
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
                                        Không có danh mục nào phù hợp với tìm kiếm
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
                                    value={categoriesPerPage}
                                    onChange={(e) => {
                                        setCategoriesPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Reset to first page when changing items per page
                                    }}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                                <span>/</span>
                                <span className="ml-2">{filteredAndSortedCategories.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add New Category Button (Fixed position) */}
            <div className="fixed bottom-8 right-8">
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
                    onClick={handleAddNew}
                >
                    <Plus size={20} />
                    <span className="ml-2">Thêm mới</span>
                </button>
            </div>

            {/* Edit Category Modal */}
            {showEditModal && (
                <EditCategoryModal 
                    category={editingCategory}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingCategory(null);
                    }}
                    onUpdate={handleUpdateCategory}
                />
            )}

            {/* Add Category Modal */}
            {showAddModal && (
                <AddCategoryModal 
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddCategory}
                />
            )}
        </div>
    );
};

export default CategoryManagement;