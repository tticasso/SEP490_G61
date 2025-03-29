import React, { useState, useEffect } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight, RefreshCw, Plus, Power, ToggleLeft, ToggleRight } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';
import EditShippingModal from './modal/EditShippingModal';
import AddShippingModal from './AddShipping';

const ShippingManagement = () => {
    // State for shipping data
    const [shippings, setShippings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [shippingsPerPage, setShippingsPerPage] = useState(5);
    const [totalShippings, setTotalShippings] = useState(0);
    
    // Filter states
    const [filter, setFilter] = useState({
        all: true,
        myShippings: false
    });
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    
    // Selected shippings for bulk actions
    const [selectedShippings, setSelectedShippings] = useState([]);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingShipping, setEditingShipping] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // User info (assuming you have user info stored in localStorage or similar)
    const [currentUser, setCurrentUser] = useState(null);
    
    // State for storing users data to get creator names
    const [users, setUsers] = useState([]);

    const navigate = useNavigate();

    // Get current user
    useEffect(() => {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
    }, []);

    // Fetch shippings from API
    useEffect(() => {
        fetchShippings();
        fetchUsers(); // Fetch users to get creator names
    }, []);

    const fetchShippings = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get('/shipping/list', true); // true để đảm bảo gửi token
            setShippings(response);
            setTotalShippings(response.length);
            setLoading(false);
        } catch (error) {
            setError('Lỗi khi tải dữ liệu phương thức vận chuyển: ' + error);
            setLoading(false);
        }
    };

    // Fetch users to get creator names
    const fetchUsers = async () => {
        try {
            const response = await ApiService.get('/user/list', true);
            setUsers(response);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu người dùng:', error);
        }
    };

    // Get creator name from creator ID
    const getCreatorName = (creatorId) => {
        if (!creatorId) return 'N/A';
        
        const creator = users.find(user => user._id === creatorId);
        if (creator) {
            return `${creator.firstName} ${creator.lastName}`;
        }
        return creatorId; // Fallback to ID if name not found
    };

    // Handle checkbox selection
    const handleSelectShipping = (shippingId) => {
        if (selectedShippings.includes(shippingId)) {
            setSelectedShippings(selectedShippings.filter(id => id !== shippingId));
        } else {
            setSelectedShippings([...selectedShippings, shippingId]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedShippings.length === currentShippings.length) {
            setSelectedShippings([]);
        } else {
            setSelectedShippings(currentShippings.map(shipping => shipping._id));
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
        fetchShippings();
        fetchUsers();
    };

    // Handle add new shipping
    const handleAddNew = () => {
        setShowAddModal(true);
    };

    // Handle add shipping success
    const handleAddShipping = (newShipping) => {
        setShippings([...shippings, newShipping]);
    };

    // Handle edit shipping
    const handleEditShipping = (shipping) => {
        setEditingShipping(shipping);
        setShowEditModal(true);
    };

    // Handle update shipping (callback from EditShippingModal)
    const handleUpdateShipping = (updatedShipping) => {
        setShippings(shippings.map(shipping => 
            shipping._id === updatedShipping._id ? updatedShipping : shipping
        ));
    };

    // Handle delete shipping
    const handleDeleteShipping = async (shippingId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phương thức vận chuyển này?')) {
            try {
                await ApiService.delete(`/shipping/delete/${shippingId}`, true); // true để đảm bảo gửi token
                // Update local state after successful deletion
                setShippings(shippings.filter(shipping => shipping._id !== shippingId));
                // Remove from selected shippings
                setSelectedShippings(selectedShippings.filter(id => id !== shippingId));
            } catch (error) {
                setError('Lỗi khi xóa phương thức vận chuyển: ' + error);
            }
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedShippings.length === 0) return;
        
        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedShippings.length} phương thức vận chuyển đã chọn?`)) {
            try {
                // Delete each selected shipping
                await Promise.all(selectedShippings.map(shippingId => 
                    ApiService.delete(`/shipping/delete/${shippingId}`, true) // true để đảm bảo gửi token
                ));
                
                // Update local state
                setShippings(shippings.filter(shipping => !selectedShippings.includes(shipping._id)));
                setSelectedShippings([]);
            } catch (error) {
                setError('Lỗi khi xóa phương thức vận chuyển: ' + error);
            }
        }
    };

    // Filter shippings based on active filter and search term
    const filteredShippings = shippings.filter(shipping => {
        // Apply tab filters
        if (filter.myShippings && currentUser) {
            if (shipping.user_id !== currentUser.id) return false;
        }
        
        // Apply search
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                (shipping.id && shipping.id.toLowerCase().includes(searchLower)) ||
                (shipping.name && shipping.name.toLowerCase().includes(searchLower)) ||
                (shipping.description && shipping.description.toLowerCase().includes(searchLower))
            );
        }
        
        return true;
    });

    // Calculate total pages
    const totalPages = Math.ceil(filteredShippings.length / shippingsPerPage);

    // Paginate shippings
    const indexOfLastShipping = currentPage * shippingsPerPage;
    const indexOfFirstShipping = indexOfLastShipping - shippingsPerPage;
    const currentShippings = filteredShippings.slice(indexOfFirstShipping, indexOfLastShipping);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
                        className={`${filter.all ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: true, myShippings: false })}
                    >
                        Tất cả phương thức vận chuyển ( {shippings.length} )
                    </button>
                    {currentUser && (
                        <button
                            className={`${filter.myShippings ? 'text-blue-600' : ''}`}
                            onClick={() => setFilter({ all: false, myShippings: true })}
                        >
                            Phương thức của tôi ( {shippings.filter(s => s.user_id === currentUser.id).length} )
                        </button>
                    )}
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
                    <button 
                        className={`text-pink-500 ${selectedShippings.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={handleBulkDelete}
                        disabled={selectedShippings.length === 0}
                    >
                        Xóa đã chọn ( {selectedShippings.length} )
                    </button>
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

            {/* Shippings table */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-md shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={selectedShippings.length === currentShippings.length && currentShippings.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Tên phương thức
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Giá
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Mô tả
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Người tạo
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        Ngày tạo
                                    </div>
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentShippings.length > 0 ? (
                                currentShippings.map((shipping) => (
                                    <tr key={shipping._id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={selectedShippings.includes(shipping._id)}
                                                onChange={() => handleSelectShipping(shipping._id)}
                                            />
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{shipping.id}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700 font-medium">{shipping.name || 'Không có tên'}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{formatCurrency(shipping.price)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-900">{shipping.description || 'Không có mô tả'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {getCreatorName(shipping.created_by)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{formatDate(shipping.created_at)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-3">
                                                <button 
                                                    className="text-gray-500 hover:text-blue-600"
                                                    onClick={() => handleEditShipping(shipping)}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button 
                                                    className="text-gray-500 hover:text-red-600"
                                                    onClick={() => handleDeleteShipping(shipping._id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-4 px-6 text-center text-gray-500">
                                        Không có phương thức vận chuyển nào phù hợp với tìm kiếm
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
                                    value={shippingsPerPage}
                                    onChange={(e) => setShippingsPerPage(Number(e.target.value))}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                                <span>/</span>
                                <span className="ml-2">{totalShippings}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add New Shipping Button (Fixed position) */}
            <div className="fixed bottom-8 right-8">
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
                    onClick={handleAddNew}
                >
                    <Plus size={20} />
                    <span className="ml-2">Thêm mới</span>
                </button>
            </div>

            {/* Edit Shipping Modal */}
            {showEditModal && (
                <EditShippingModal 
                    shipping={editingShipping}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingShipping(null);
                    }}
                    onUpdate={handleUpdateShipping}
                />
            )}

            {/* Add Shipping Modal */}
            {showAddModal && (
                <AddShippingModal 
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddShipping}
                />
            )}
        </div>
    );
};

export default ShippingManagement;