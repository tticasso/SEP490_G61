import React from 'react';

const CouponModal = ({ 
    show, 
    onClose, 
    availableCoupons, 
    loading, 
    applyCoupon, 
    cartTotal, 
    error 
}) => {
    if (!show) return null;
    
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
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}
                
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin h-6 w-6 border-2 border-gray-300 border-t-purple-600 rounded-full"></div>
                        <p className="mt-2">Đang tải mã giảm giá...</p>
                    </div>
                ) : availableCoupons.length === 0 ? (
                    <div className="text-center py-8">
                        <p>Không có mã giảm giá khả dụng</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {availableCoupons.map(coupon => {
                            const isValueValid = cartTotal >= (coupon.min_order_value || 0);
                            
                            return (
                                <div 
                                    key={coupon._id} 
                                    className={`border border-dashed ${isValueValid ? 'border-purple-500' : 'border-gray-400'} rounded-lg p-4 hover:bg-purple-50 transition ${!isValueValid ? 'opacity-70' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className={`font-bold ${isValueValid ? 'text-purple-600' : 'text-gray-600'}`}>{coupon.code}</h4>
                                            <p className="text-sm">{coupon.description}</p>
                                            <div className="mt-1 text-xs text-gray-500">
                                                <p>Đơn tối thiểu: {coupon.min_order_value?.toLocaleString() || '0'}đ</p>
                                                <p>Hết hạn: {new Date(coupon.end_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => applyCoupon(coupon.code)}
                                            className={`${isValueValid ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'} text-white px-4 py-2 rounded-md`}
                                            disabled={!isValueValid}
                                        >
                                            {isValueValid ? 'Áp dụng' : 'Không khả dụng'}
                                        </button>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-sm font-medium">
                                            {coupon.type === 'percentage' 
                                                ? `Giảm ${coupon.value}% tối đa ${coupon.max_discount_value?.toLocaleString() || 'không giới hạn'}đ` 
                                                : `Giảm ${coupon.value.toLocaleString()}đ`}
                                        </div>
                                        {!isValueValid && (
                                            <div className="text-xs text-red-500 mt-1">
                                                Đơn hàng chưa đạt giá trị tối thiểu
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponModal;