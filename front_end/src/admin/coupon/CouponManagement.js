import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash, Plus, Search, Tag, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import { toast } from 'react-toastify';
import AddCouponModal from './AddCoupon';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmToggleActive, setConfirmToggleActive] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  
  // State for add coupon modal
  const [showAddModal, setShowAddModal] = useState(false);

  const userId = AuthService.getCurrentUser()?.id;

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, searchTerm, activeFilter]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      let endpoint = `/coupon/list?page=${currentPage}&limit=10`;
      
      if (searchTerm) {
        endpoint += `&search=${searchTerm}`;
      }
      
      if (activeFilter !== '') {
        endpoint += `&active=${activeFilter}`;
      }
      
      const response = await ApiService.get(endpoint);
      
      setCoupons(response.coupons);
      setTotalPages(response.totalPages);
      
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCoupons();
  };

  // Handle adding a new coupon
  const handleAddCoupon = (newCoupon) => {
    setCoupons(prev => [newCoupon, ...prev]);
    toast.success('Thêm mã giảm giá thành công');
  };

  const handleDelete = async (id) => {
    try {
      setProcessingId(id);
      await ApiService.delete(`/coupon/delete/${id}`, { updated_by: userId });
      toast.success('Xóa mã giảm giá thành công');
      fetchCoupons();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Không thể xóa mã giảm giá');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      setProcessingId(coupon._id);
      
      const newStatus = !coupon.is_active;
      const payload = {
        ...coupon,
        is_active: newStatus,
        updated_by: userId
      };
      
      await ApiService.put(`/coupon/edit/${coupon._id}`, payload);
      
      toast.success(`Mã giảm giá đã được ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'}`);
      fetchCoupons();
      setConfirmToggleActive(null);
    } catch (error) {
      console.error('Error updating coupon status:', error);
      toast.error('Không thể cập nhật trạng thái mã giảm giá');
    } finally {
      setProcessingId(null);
    }
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="flex justify-center mt-5">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          &lt;
        </button>
        {pages}
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    );
  };

  // Custom date formatter
  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCouponValue = (value, type) => {
    // Kiểm tra giá trị có tồn tại không
    if (value === undefined || value === null) {
      return 'N/A';
    }
    return type === 'percentage' ? `${value}%` : `${Number(value).toLocaleString('vi-VN')}đ`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Quản lý mã giảm giá</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Thêm mã giảm giá
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã hoặc mô tả..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </form>

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang kích hoạt</option>
            <option value="false">Vô hiệu hóa</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <>
            {coupons.length === 0 ? (
              <div className="text-center py-10">
                <Tag size={40} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">Không tìm thấy mã giảm giá nào</p>
                <p className="text-gray-500 text-sm mt-1">Thử thay đổi bộ lọc hoặc thêm mã giảm giá mới</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-3 px-4 text-left">Mã</th>
                      <th className="py-3 px-4 text-left">Mô tả</th>
                      <th className="py-3 px-4 text-left">Giá trị</th>
                      <th className="py-3 px-4 text-left">Ngày bắt đầu</th>
                      <th className="py-3 px-4 text-left">Ngày kết thúc</th>
                      <th className="py-3 px-4 text-left">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold bg-blue-50 text-blue-800 px-2 py-1 rounded">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">{coupon.description}</td>
                        <td className="py-3 px-4">{formatCouponValue(coupon.value, coupon.type)}</td>
                        <td className="py-3 px-4">{formatDate(coupon.start_date)}</td>
                        <td className="py-3 px-4">{formatDate(coupon.end_date)}</td>
                        <td className="py-3 px-4">
                          {coupon.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Kích hoạt
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Vô hiệu
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setConfirmToggleActive(coupon)}
                              className={`p-1.5 rounded ${
                                coupon.is_active
                                  ? 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                  : 'bg-green-50 text-green-500 hover:bg-green-100'
                              }`}
                              title={coupon.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              disabled={processingId === coupon._id}
                            >
                              {coupon.is_active ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                            </button>
                            <Link
                              to={`/admin/edit-coupon/${coupon._id}`}
                              className="p-1.5 bg-blue-50 text-blue-500 rounded hover:bg-blue-100"
                              title="Chỉnh sửa"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => setConfirmDelete(coupon._id)}
                              className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100"
                              title="Xóa"
                              disabled={processingId === coupon._id}
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && renderPagination()}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 text-center mb-6">
              Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                disabled={processingId !== null}
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center min-w-[80px]"
                disabled={processingId !== null}
              >
                {processingId === confirmDelete ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                ) : (
                  'Xóa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Active confirmation modal */}
      {confirmToggleActive && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className={`flex items-center justify-center mb-4 ${confirmToggleActive.is_active ? 'text-gray-500' : 'text-green-500'}`}>
              {confirmToggleActive.is_active ? (
                <ToggleRight size={48} />
              ) : (
                <ToggleLeft size={48} />
              )}
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">
              {confirmToggleActive.is_active ? 'Vô hiệu hóa mã giảm giá?' : 'Kích hoạt mã giảm giá?'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {confirmToggleActive.is_active
                ? 'Mã giảm giá sẽ không còn được sử dụng sau khi vô hiệu hóa.'
                : 'Kích hoạt sẽ cho phép mã giảm giá này có thể sử dụng được.'
              }
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmToggleActive(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                disabled={processingId !== null}
              >
                Hủy
              </button>
              <button
                onClick={() => handleToggleActive(confirmToggleActive)}
                className={`px-4 py-2 text-white rounded flex items-center justify-center min-w-[120px] ${
                  confirmToggleActive.is_active 
                    ? 'bg-gray-500 hover:bg-gray-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                disabled={processingId !== null}
              >
                {processingId === confirmToggleActive._id ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                ) : (
                  confirmToggleActive.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddModal && (
        <AddCouponModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCoupon}
        />
      )}
    </div>
  );
};

export default CouponManagement;