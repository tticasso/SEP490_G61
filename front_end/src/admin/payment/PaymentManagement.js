import React, { useState, useEffect } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight, RefreshCw, Plus } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';
import EditPaymentModal from './modal/EditPaymentModal';
import AddPaymentModal from './AddPayment';

const PaymentManagement = () => {
    // State for payment data
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentsPerPage, setPaymentsPerPage] = useState(5);
    const [totalPayments, setTotalPayments] = useState(0);

    // Filter states
    const [filter, setFilter] = useState({
        all: true,
        active: false,
        inactive: false,
        trash: false
    });

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Selected payments for bulk actions
    const [selectedPayments, setSelectedPayments] = useState([]);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const navigate = useNavigate();

    // Fetch payments from API
    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get('/payment/list', true); // true để đảm bảo gửi token
            setPayments(response);
            setTotalPayments(response.length);
            setLoading(false);
        } catch (error) {
            setError('Lỗi khi tải dữ liệu phương thức thanh toán: ' + error);
            setLoading(false);
        }
    };

    // Handle checkbox selection
    const handleSelectPayment = (paymentId) => {
        if (selectedPayments.includes(paymentId)) {
            setSelectedPayments(selectedPayments.filter(id => id !== paymentId));
        } else {
            setSelectedPayments([...selectedPayments, paymentId]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedPayments.length === currentPayments.length) {
            setSelectedPayments([]);
        } else {
            setSelectedPayments(currentPayments.map(payment => payment._id));
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
        fetchPayments();
    };

    // Handle add new payment
    const handleAddNew = () => {
        setShowAddModal(true);
    };

    // Handle add payment success
    const handleAddPayment = (newPayment) => {
        setPayments([...payments, newPayment]);
    };

    // Handle edit payment
    const handleEditPayment = (payment) => {
        setEditingPayment(payment);
        setShowEditModal(true);
    };

    // Handle update payment (callback from EditPaymentModal)
    const handleUpdatePayment = (updatedPayment) => {
        setPayments(payments.map(payment =>
            payment._id === updatedPayment._id ? updatedPayment : payment
        ));
    };

    // Handle delete payment
    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phương thức thanh toán này?')) {
            try {
                await ApiService.delete(`/payment/delete/${paymentId}`, true); // true để đảm bảo gửi token
                // Update local state after successful deletion
                setPayments(payments.filter(payment => payment._id !== paymentId));
                // Remove from selected payments
                setSelectedPayments(selectedPayments.filter(id => id !== paymentId));
            } catch (error) {
                setError('Lỗi khi xóa phương thức thanh toán: ' + error);
            }
        }
    };

    // Handle toggle payment status
    const handleToggleStatus = async (paymentId) => {
        try {
            // Sử dụng PUT thay vì PATCH
            await ApiService.put(`/payment/toggle-status/${paymentId}`, {}, true);

            // Update local state after successful status toggle
            setPayments(payments.map(payment => {
                if (payment._id === paymentId) {
                    return { ...payment, is_active: !payment.is_active };
                }
                return payment;
            }));
        } catch (error) {
            setError('Lỗi khi thay đổi trạng thái: ' + error);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedPayments.length === 0) return;

        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedPayments.length} phương thức thanh toán đã chọn?`)) {
            try {
                // Delete each selected payment
                await Promise.all(selectedPayments.map(paymentId =>
                    ApiService.delete(`/payment/delete/${paymentId}`, true) // true để đảm bảo gửi token
                ));

                // Update local state
                setPayments(payments.filter(payment => !selectedPayments.includes(payment._id)));
                setSelectedPayments([]);
            } catch (error) {
                setError('Lỗi khi xóa phương thức thanh toán: ' + error);
            }
        }
    };

    // Filter payments based on active filter and search term
    const filteredPayments = payments.filter(payment => {
        // Apply search
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return payment.name.toLowerCase().includes(searchLower);
        }

        // Apply tab filters
        if (filter.active) return payment.is_active && !payment.is_delete;
        if (filter.inactive) return !payment.is_active && !payment.is_delete;
        if (filter.trash) return payment.is_delete;

        // "All" tab shows all non-deleted items
        return !payment.is_delete;
    });

    // Calculate total pages
    const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

    // Paginate payments
    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);

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
                <div className="flex space-x-6 text-gray-600">
                    <button
                        className={`${filter.all ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: true, active: false, inactive: false, trash: false })}
                    >
                        Tất cả ( {payments.filter(p => !p.is_delete).length} )
                    </button>
                    <button
                        className={`${filter.active ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: false, active: true, inactive: false, trash: false })}
                    >
                        Đang hoạt động ( {payments.filter(p => p.is_active && !p.is_delete).length} )
                    </button>
                    <button
                        className={`${filter.inactive ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: false, active: false, inactive: true, trash: false })}
                    >
                        Bị tắt ( {payments.filter(p => !p.is_active && !p.is_delete).length} )
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
                    <div className="mr-4">
                        <select className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                            <option>Sắp xếp theo</option>
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

            {/* Payments table */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-md shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={selectedPayments.length === currentPayments.length && currentPayments.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Tên phương thức thanh toán
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Trạng thái
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
                            {currentPayments.length > 0 ? (
                                currentPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={selectedPayments.includes(payment._id)}
                                                onChange={() => handleSelectPayment(payment._id)}
                                            />
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{payment.id}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-900">{payment.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {payment.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {payment.updated_at ? formatDate(payment.updated_at) : formatDate(payment.created_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    className="text-gray-500 hover:text-blue-600"
                                                    onClick={() => handleEditPayment(payment)}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    className="text-gray-500 hover:text-green-600"
                                                    onClick={() => handleToggleStatus(payment._id)}
                                                    title={payment.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        {payment.is_active ? (
                                                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                                        ) : (
                                                            <path d="M5.64 18.36a9 9 0 1 1 12.73 0"></path>
                                                        )}
                                                        <line x1="12" y1="2" x2="12" y2="12"></line>
                                                    </svg>
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    className="text-gray-500 hover:text-red-600"
                                                    onClick={() => handleDeletePayment(payment._id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-4 px-6 text-center text-gray-500">
                                        Không có phương thức thanh toán nào phù hợp với tìm kiếm
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
                                                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentPage === pageNumber
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
                                    value={paymentsPerPage}
                                    onChange={(e) => setPaymentsPerPage(Number(e.target.value))}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                                <span>/</span>
                                <span className="ml-2">{totalPayments}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add New Payment Button (Fixed position) */}
            <div className="fixed bottom-8 right-8">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
                    onClick={handleAddNew}
                >
                    <Plus size={20} />
                    <span className="ml-2">Thêm mới</span>
                </button>
            </div>

            {/* Edit Payment Modal */}
            {showEditModal && (
                <EditPaymentModal
                    payment={editingPayment}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingPayment(null);
                    }}
                    onUpdate={handleUpdatePayment}
                />
            )}

            {/* Add Payment Modal */}
            {showAddModal && (
                <AddPaymentModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddPayment}
                />
            )}
        </div>
    );
};

export default PaymentManagement;