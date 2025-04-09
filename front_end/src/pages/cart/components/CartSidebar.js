import React from 'react';

const CartSidebar = ({
    totalAmount,
    appliedCoupon,
    setAppliedCoupon,
    setShowCouponModal,
    hasSelectedItems,
    selectedItems,
    cartItems
}) => {
    // Prepare selected cart items for checkout
    const proceedToCheckout = () => {
        // Lưu mã giảm giá vào localStorage nếu có
        if (appliedCoupon) {
            localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
        } else {
            localStorage.removeItem('appliedCoupon');
        }
        
        // Lưu danh sách các mục đã chọn
        const selectedCartItems = cartItems.filter(item => selectedItems[item._id]);
        localStorage.setItem('selectedCartItems', JSON.stringify(selectedCartItems));
        
        window.location.href = "/checkout";
    };

    return (
        <div className="w-1/3 pl-4 border-l pt-10">
            <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm flex">
                    <p className='mr-1'>Spend 1,500,000 VND to receive</p>  <strong className='text-red-500'>Free shipping</strong>
                </p>
            </div>

            <div className="mt-4">
                <div className="justify-between mb-2">
                    <h3>Mã giảm giá</h3>
                    <div className='text-xs text-gray-600'>Mã giảm giá sẽ được áp dụng khi thanh toán</div>
                </div>
                <button
                    onClick={() => setShowCouponModal(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
                >
                    <span className="mr-2">Chọn mã giảm giá</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                        <path d="M8.646 6.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 9H6.5a.5.5 0 0 1 0-1h3.793L8.646 6.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>
            </div>

            {appliedCoupon && (
                <div className='mt-4'>
                    <p>Mã giảm giá đã áp dụng</p>
                    <div className='flex gap-2 mt-2'>
                        <div className="bg-purple-100 text-purple-700 px-3 py-2 rounded flex justify-between w-full">
                            <span className="font-medium">{appliedCoupon.code}</span>
                            <button
                                onClick={() => setAppliedCoupon(null)}
                                className="text-red-500 text-sm"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>

            <div className="mt-4">
                <div className="flex justify-between mb-2">
                    <span>Tổng đơn hàng:</span>
                    <span className="font-bold">{totalAmount.toLocaleString()}đ</span>
                </div>
                <button 
                    onClick={proceedToCheckout}
                    className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!hasSelectedItems()}
                >
                    {!hasSelectedItems() ? 'Vui lòng chọn sản phẩm' : 'Thanh toán'}
                </button>
            </div>
        </div>
    );
};

export default CartSidebar;