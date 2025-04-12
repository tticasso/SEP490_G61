import React, { useState, useEffect } from 'react';
import { Search, Filter, Info, AlertTriangle } from 'lucide-react';

const CouponModal = ({
    show,
    onClose,
    availableCoupons,
    loading,
    applyCoupon,
    cartTotal,
    error
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'valid', 'invalid'
    const [sortBy, setSortBy] = useState('expiringSoon'); // 'expiringSoon', 'highValue', 'newest'
    const [hoveredCoupon, setHoveredCoupon] = useState(null);

    // Đảm bảo filterType sẽ chuyển thành 'valid' nếu tab 'all' không có mã nào hợp lệ
    useEffect(() => {
        if (filterType === 'all' && availableCoupons.length > 0 && !availableCoupons.some(coupon => coupon.isValid)) {
            setFilterType('invalid');
        }
    }, [availableCoupons, filterType]);

    if (!show) return null;

    // Lọc và sắp xếp mã giảm giá
    const filteredCoupons = availableCoupons
        .filter(coupon => {
            // Lọc theo tìm kiếm
            if (searchQuery && !coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !coupon.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Lọc theo trạng thái
            if (filterType === 'valid' && !coupon.isValid) {
                return false;
            }
            if (filterType === 'invalid' && coupon.isValid) {
                return false;
            }

            return true;
        })
        .sort((a, b) => {
            // Sắp xếp theo tiêu chí đã chọn
            if (sortBy === 'expiringSoon') {
                return new Date(a.end_date) - new Date(b.end_date);
            } else if (sortBy === 'highValue') {
                if (a.type === 'fixed' && b.type === 'fixed') {
                    return b.value - a.value;
                } else if (a.type === 'percentage' && b.type === 'percentage') {
                    return b.value - a.value;
                } else if (a.type === 'fixed') {
                    // Ước tính giá trị phần trăm đối với giỏ hàng hiện tại
                    const bPercentValue = (cartTotal * b.value) / 100;
                    return a.value - bPercentValue;
                } else {
                    // Ước tính giá trị phần trăm đối với giỏ hàng hiện tại
                    const aPercentValue = (cartTotal * a.value) / 100;
                    return aPercentValue - b.value;
                }
            } else if (sortBy === 'newest') {
                return new Date(b.created_at) - new Date(a.created_at);
            }
            return 0;
        });

    // Tính số lượng mã giảm giá hợp lệ và không hợp lệ
    const validCount = availableCoupons.filter(coupon => coupon.isValid).length;
    const invalidCount = availableCoupons.length - validCount;

    // Kiểm tra xem có mã giảm giá nào hợp lệ không
    const hasValidCoupons = availableCoupons.some(coupon => coupon.isValid);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Chọn mã giảm giá</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Hiển thị thông báo khi chưa chọn sản phẩm nào */}
                {availableCoupons.length > 0 && availableCoupons.every(coupon => coupon.validationMessage.includes('chọn sản phẩm')) && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4 flex items-start">
                        <AlertTriangle size={20} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-800">Vui lòng chọn sản phẩm trước</p>
                            <p className="text-sm text-yellow-700 mt-1">Hãy chọn ít nhất một sản phẩm trong giỏ hàng để áp dụng mã giảm giá.</p>
                        </div>
                    </div>
                )}

                {/* Hiển thị thông báo khi không có mã giảm giá nào hợp lệ */}
                {availableCoupons.length > 0 && !hasValidCoupons && !availableCoupons.every(coupon => coupon.validationMessage.includes('chọn sản phẩm')) && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4 flex items-start">
                        <AlertTriangle size={20} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-800">Không có mã giảm giá phù hợp</p>
                            <p className="text-sm text-yellow-700 mt-1">Không có mã giảm giá nào áp dụng được với các sản phẩm đã chọn. Vui lòng chọn thêm sản phẩm hoặc kiểm tra lại các điều kiện.</p>
                        </div>
                    </div>
                )}

                {/* Tìm kiếm mã giảm giá */}
                <div className="mb-4 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="pl-10 pr-4 py-2 border rounded-lg w-full"
                        placeholder="Tìm mã giảm giá"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Bộ lọc và sắp xếp */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                        <button
                            className={`px-3 py-1 text-xs rounded-full ${filterType === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setFilterType('all')}
                        >
                            Tất cả ({availableCoupons.length})
                        </button>
                        <button
                            className={`px-3 py-1 text-xs rounded-full ${filterType === 'valid' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setFilterType('valid')}
                            disabled={validCount === 0}
                        >
                            Khả dụng ({validCount})
                        </button>
                        <button
                            className={`px-3 py-1 text-xs rounded-full ${filterType === 'invalid' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setFilterType('invalid')}
                        >
                            Không khả dụng ({invalidCount})
                        </button>
                    </div>

                    <div className="relative">
                        <select
                            className="text-xs border rounded-md py-1 pl-2 pr-8 appearance-none bg-white"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="expiringSoon">Sắp hết hạn</option>
                            <option value="highValue">Giá trị cao</option>
                            <option value="newest">Mới nhất</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <Filter size={12} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin h-6 w-6 border-2 border-gray-300 border-t-purple-600 rounded-full"></div>
                        <p className="mt-2">Đang tải mã giảm giá...</p>
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="text-center py-8">
                        <p>{searchQuery ? 'Không tìm thấy mã giảm giá phù hợp' : 'Không có mã giảm giá khả dụng'}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCoupons.map(coupon => {
                            // Định dạng ngày hết hạn
                            const endDate = new Date(coupon.end_date);
                            const now = new Date();
                            const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

                            // Xác định trạng thái mã
                            let statusText = '';
                            let statusClass = '';
                            let statusDetail = '';

                            if (!coupon.isValid) {
                                if (coupon.validationMessage.includes('chọn sản phẩm')) {
                                    statusText = 'Chọn sản phẩm';
                                    statusClass = 'bg-blue-100 text-blue-800';
                                    statusDetail = 'Vui lòng chọn sản phẩm để kiểm tra';
                                } else if (coupon.validationMessage.includes('tối thiểu')) {
                                    statusText = 'Chưa đủ điều kiện';
                                    statusClass = 'bg-yellow-100 text-yellow-800';
                                    statusDetail = coupon.validationMessage;
                                } else if (coupon.validationMessage.includes('hết lượt')) {
                                    statusText = 'Đã hết lượt';
                                    statusClass = 'bg-red-100 text-red-800';
                                    statusDetail = coupon.validationMessage;
                                } else if (coupon.validationMessage.includes('sản phẩm cụ thể')) {
                                    statusText = 'Không áp dụng';
                                    statusClass = 'bg-orange-100 text-orange-800';
                                    statusDetail = 'Mã không áp dụng cho sản phẩm đã chọn';
                                } else {
                                    statusText = 'Không khả dụng';
                                    statusClass = 'bg-gray-100 text-gray-800';
                                    statusDetail = coupon.validationMessage;
                                }
                            }

                            return (
                                <div
                                    key={coupon._id}
                                    className={`border border-dashed ${coupon.isValid ? 'border-purple-500 hover:bg-purple-50' : 'border-gray-400 hover:bg-gray-50'} 
                                              rounded-lg p-4 transition relative
                                              ${!coupon.isValid ? 'opacity-80' : ''}`}
                                    onMouseEnter={() => setHoveredCoupon(coupon._id)}
                                    onMouseLeave={() => setHoveredCoupon(null)}
                                >
                                    {/* Badge trạng thái cho mã không hợp lệ */}
                                    {!coupon.isValid && (
                                        <div className="absolute top-2 right-2">
                                            <div className="relative">
                                                <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
                                                    {statusText}
                                                </span>
                                                {hoveredCoupon === coupon._id && (
                                                    <div className="absolute z-10 right-0 mt-1 w-48 bg-white text-xs text-gray-700 rounded-md shadow-lg p-2 border">
                                                        {statusDetail}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nội dung mã giảm giá */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className={`font-bold ${coupon.isValid ? 'text-purple-600' : 'text-gray-600'}`}>
                                                {coupon.code}
                                            </h4>
                                            <p className="text-sm">{coupon.description}</p>
                                            <div className="mt-1 text-xs text-gray-500">
                                                <p>Đơn tối thiểu: {coupon.min_order_value?.toLocaleString() || '0'}đ</p>
                                                <p>
                                                    {daysLeft > 0
                                                        ? `Còn ${daysLeft} ngày`
                                                        : 'Hết hạn hôm nay'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => coupon.isValid && applyCoupon(coupon.code)}
                                                className={`${coupon.isValid ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400'} 
                                                           text-white px-4 py-2 rounded-md truncate text-center`}
                                                disabled={!coupon.isValid}
                                                aria-label={!coupon.isValid ? `Không thể áp dụng: ${statusDetail}` : "Áp dụng mã giảm giá"}
                                            >
                                                {coupon.isValid ? 'Áp dụng' : 'Không khả dụng'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <div className="text-sm font-medium">
                                            {coupon.type === 'percentage'
                                                ? `Giảm ${coupon.value}% tối đa ${coupon.max_discount_value?.toLocaleString() || 'không giới hạn'}đ`
                                                : `Giảm ${coupon.value.toLocaleString()}đ`}
                                        </div>

                                        {/* Thông báo lý do không hợp lệ */}
                                        {!coupon.isValid && (
                                            <div className="flex items-start mt-2 text-xs text-red-500">
                                                <Info size={14} className="mr-1 flex-shrink-0 mt-0.5" />
                                                <p>{coupon.validationMessage}</p>
                                            </div>
                                        )}

                                        {/* Hiển thị giá trị giảm nếu hợp lệ */}
                                        {coupon.isValid && coupon.discountAmount > 0 && (
                                            <div className="text-xs text-green-600 mt-1">
                                                Bạn sẽ tiết kiệm: {coupon.discountAmount.toLocaleString()}đ
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Phần ghi chú cuối cùng */}
                <div className="mt-6 bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex items-start">
                    <Info size={14} className="mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                    <div>
                        <p className="font-medium">Lưu ý khi sử dụng mã giảm giá:</p>
                        <ul className="mt-1 list-disc list-inside">
                            <li>Mỗi đơn hàng chỉ áp dụng 1 mã giảm giá</li>
                            <li>Một số mã giảm giá chỉ áp dụng cho sản phẩm hoặc danh mục cụ thể</li>
                            <li>Đảm bảo đơn hàng của bạn đạt giá trị tối thiểu để áp dụng mã</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponModal;