import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, ChevronDown, Package, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../../services/ApiService';
import AuthService from '../../../services/AuthService';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState({}); // Lưu chi tiết sản phẩm theo order._id
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState({}); // Theo dõi trạng thái tải chi tiết từng đơn hàng
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Lấy thông tin người dùng
    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || "";

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);

                if (!userId) {
                    throw new Error("Vui lòng đăng nhập để xem đơn hàng");
                }

                // Lấy đơn hàng theo user ID
                const ordersData = await ApiService.get(`/order/user/${userId}`);

                // Kiểm tra nếu có query param id để mở rộng đơn hàng cụ thể
                const urlParams = new URLSearchParams(window.location.search);
                const orderId = urlParams.get('id');

                if (orderId && ordersData.length > 0) {
                    setExpandedOrder(orderId);
                    // Tải chi tiết đơn hàng này luôn
                    fetchOrderDetails(orderId);
                }

                setOrders(ordersData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError(err.message || "Đã xảy ra lỗi khi tải thông tin đơn hàng");
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userId]);

    // Hàm lấy chi tiết đơn hàng khi mở rộng
    const fetchOrderDetails = async (orderId) => {
        if (orderDetails[orderId]) {
            // Đã có dữ liệu, không cần tải lại
            return;
        }

        try {
            // Đánh dấu đang tải chi tiết đơn hàng này
            setDetailsLoading(prev => ({ ...prev, [orderId]: true }));

            // Gọi API để lấy chi tiết đơn hàng
            const response = await ApiService.get(`/order/find/${orderId}`);

            // Lưu chi tiết vào state
            setOrderDetails(prev => ({
                ...prev,
                [orderId]: response.orderDetails || []
            }));

            // Đánh dấu đã tải xong
            setDetailsLoading(prev => ({ ...prev, [orderId]: false }));
        } catch (error) {
            console.error("Error fetching order details:", error);
            setDetailsLoading(prev => ({ ...prev, [orderId]: false }));
        }
    };

    // Xử lý khi mở rộng/thu gọn đơn hàng
    const handleExpandOrder = (orderId) => {
        if (expandedOrder === orderId) {
            // Thu gọn nếu đã mở
            setExpandedOrder(null);
        } else {
            // Mở rộng và tải chi tiết
            setExpandedOrder(orderId);
            fetchOrderDetails(orderId);
        }
    };

    // Xử lý hủy đơn hàng
    const handleCancelOrder = async (orderId) => {
        // Trước tiên kiểm tra xem đơn hàng có thể hủy không
        const orderToCancel = orders.find(order => order._id === orderId);

        if (!orderToCancel) {
            alert("Không tìm thấy thông tin đơn hàng");
            return;
        }

        // Chỉ cho phép hủy đơn hàng ở trạng thái Chờ xử lý hoặc Đang xử lý
        if (orderToCancel.order_status !== 'pending' && orderToCancel.order_status !== 'processing') {
            alert("Đơn hàng này không thể hủy vì đã được xử lý");
            return;
        }

        // Kiểm tra thời gian đặt hàng, nếu quá 24h thì không cho hủy
        const orderDate = new Date(orderToCancel.created_at);
        const currentDate = new Date();
        const hoursDiff = Math.abs(currentDate - orderDate) / 36e5; // Chuyển đổi ms thành giờ

        if (hoursDiff > 24 && orderToCancel.order_status !== 'pending') {
            alert("Đơn hàng đã quá 24 giờ kể từ khi đặt, bạn không thể hủy. Vui lòng liên hệ hỗ trợ!");
            return;
        }

        if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
            return;
        }

        try {
            setLoading(true);
            await ApiService.put(`/order/cancel/${orderId}`);

            // Cập nhật state
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, order_status: 'cancelled' } : order
                )
            );

            setLoading(false);
            alert("Đơn hàng đã được hủy thành công");
        } catch (err) {
            console.error("Error canceling order:", err);
            alert(err.message || "Không thể hủy đơn hàng. Vui lòng thử lại sau.");
            setLoading(false);
        }
    };

    // Format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(price)
            .replace('₫', 'đ');
    };

    // Format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Lọc đơn hàng theo trạng thái
    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.order_status === filter; // Sử dụng order_status thay vì status_id
    }).filter(order => {
        if (!searchQuery) return true;
        // Tìm kiếm theo ID đơn hàng
        return order.id.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Lấy tên trạng thái
    const getStatusName = (orderStatus) => {
        switch (orderStatus) {
            case 'pending': return 'Chờ xử lý';
            case 'processing': return 'Đang xử lý';
            case 'shipped': return 'Đang giao hàng';
            case 'delivered': return 'Đã giao hàng';
            case 'cancelled': return 'Đã hủy';
            default: return 'Không xác định';
        }
    };

    // Lấy tên trạng thái thanh toán (dựa trên status_id)
    const getPaymentStatusName = (statusId) => {
        switch (statusId) {
            case 'paid': return 'Đã thanh toán';
            case 'pending': return 'Chưa thanh toán';
            default: return 'Không xác định';
        }
    };


    // Lấy màu trạng thái đơn hàng
    const getStatusColor = (orderStatus) => {
        switch (orderStatus) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Lấy màu trạng thái thanh toán
    const getPaymentStatusColor = (statusId) => {
        switch (statusId) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Kiểm tra xem đơn hàng có phải thanh toán qua VNPay/PayOS không
    const isOnlinePayment = (order) => {
        if (!order || !order.payment_method) return false;

        return order.payment_method === "payos" ||
            (typeof order.payment_id === 'object' &&
                order.payment_id?.name?.toLowerCase().includes('vnpay'));
    };

    // Xử lý thanh toán đơn hàng
    const handlePayOrder = async (orderId) => {
        try {
            setLoading(true);

            // Gọi API để tạo payment link mới
            const response = await ApiService.post('/payos/create-payment', {
                orderId: orderId
            });

            if (response && response.success && response.data && response.data.paymentUrl) {
                // Lưu thông tin thanh toán vào localStorage để sử dụng sau khi thanh toán
                localStorage.setItem('currentOrderId', orderId);
                localStorage.setItem('paymentTransactionCode', response.data.transactionCode);

                // Chuyển hướng người dùng đến trang thanh toán
                window.location.href = response.data.paymentUrl;
            } else {
                throw new Error("Không thể tạo liên kết thanh toán");
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            alert(`Lỗi khởi tạo thanh toán: ${error.message || 'Không xác định'}`);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6 mt-10 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
                <p className="mt-4 text-gray-700">Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
                <div className="text-red-500 text-center mb-4">❌ {error}</div>
                <div className="flex justify-center">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 my-10">
            <div className="mb-4">
                <h2 className="text-xl font-bold">Đơn hàng của tôi</h2>
                <p className="text-gray-600">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
            </div>

            {/* Filter and Search */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
                            onClick={() => setFilter('all')}
                        >
                            Tất cả
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${filter === 'pending' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
                            onClick={() => setFilter('pending')}
                        >
                            Chờ xử lý
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${filter === 'processing' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
                            onClick={() => setFilter('processing')}
                        >
                            Đang xử lý
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${filter === 'shipped' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
                            onClick={() => setFilter('shipped')}
                        >
                            Đang giao
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${filter === 'delivered' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
                            onClick={() => setFilter('delivered')}
                        >
                            Đã giao
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${filter === 'cancelled' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
                            onClick={() => setFilter('cancelled')}
                        >
                            Đã hủy
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm theo mã đơn hàng (ORD-...)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 px-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        {searchQuery && (
                            <button
                                className="absolute right-3 top-2.5 text-gray-400"
                                onClick={() => setSearchQuery('')}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Không tìm thấy đơn hàng nào</h2>
                    <p className="text-gray-600 mb-4">
                        {searchQuery
                            ? `Không tìm thấy đơn hàng phù hợp với từ khóa "${searchQuery}"`
                            : filter !== 'all'
                                ? `Bạn chưa có đơn hàng nào với trạng thái "${getStatusName(filter)}"`
                                : "Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!"}
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Order Header */}
                            <div
                                className="p-4 border-b cursor-pointer hover:bg-gray-50"
                                onClick={() => handleExpandOrder(order._id)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center mb-2 md:mb-0">
                                        <span className="font-medium mr-2">Đơn hàng #{order.id}</span>
                                        {/* Hiển thị trạng thái đơn hàng */}
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.order_status)}`}>
                                            {getStatusName(order.order_status)}
                                        </span>

                                        {/* Hiển thị trạng thái thanh toán nếu là đơn hàng trực tuyến */}
                                        {isOnlinePayment(order) && (
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(order.status_id)}`}>
                                                {getPaymentStatusName(order.status_id)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="mr-2">Đặt ngày: {formatDate(order.created_at)}</span>
                                        {expandedOrder === order._id ? (
                                            <ChevronDown size={18} />
                                        ) : (
                                            <ChevronRight size={18} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Details (expandable) */}
                            {expandedOrder === order._id && (
                                <div className="p-4">
                                    {/* Order Items */}
                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-3">Chi tiết sản phẩm</h3>

                                        {detailsLoading[order._id] ? (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700 mx-auto"></div>
                                                <p className="mt-2 text-sm text-gray-600">Đang tải chi tiết sản phẩm...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {orderDetails[order._id] && orderDetails[order._id].length > 0 ? (
                                                    orderDetails[order._id].map((item) => (
                                                        <div key={item._id} className="flex items-center border-b border-gray-100 pb-3">
                                                            <img
                                                                src={item.product_id?.thumbnail || item.product_id?.image || '/placeholder-product.png'}
                                                                alt={item.product_id?.name || "Sản phẩm"}
                                                                className="w-16 h-16 object-cover rounded mr-4"
                                                            />
                                                            <div className="flex-grow">
                                                                <p className="font-medium">{item.product_id?.name || "Sản phẩm"}</p>
                                                                <div className="text-sm text-gray-600 flex flex-wrap gap-x-4">
                                                                    <p>Mã sản phẩm: {item.product_id?.id || 'N/A'}</p>
                                                                    <p>Số lượng: {item.quantity}</p>
                                                                    <p>Đơn giá: {formatPrice(item.price || 0)}</p>
                                                                </div>
                                                                {item.product_id?.description && (
                                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.product_id.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold">
                                                                    {formatPrice((item.price || 0) * item.quantity)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-600">
                                                        Chi tiết đơn hàng không có sẵn. Vui lòng nhấp vào "Xem chi tiết" để biết thêm thông tin.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <div className="flex justify-between mb-2">
                                            <span>Tạm tính:</span>
                                            <span>{formatPrice(order.original_price || order.total_price)}</span>
                                        </div>

                                        {order.discount_amount > 0 && (
                                            <div className="flex justify-between mb-2">
                                                <span>Giảm giá:</span>
                                                <span>-{formatPrice(order.discount_amount)}</span>
                                            </div>
                                        )}

                                        {order.coupon_amount > 0 && (
                                            <div className="flex justify-between mb-2">
                                                <span>Mã giảm giá:</span>
                                                <span>-{formatPrice(order.coupon_amount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between font-bold text-lg pt-2">
                                            <span>Tổng cộng:</span>
                                            <span>{formatPrice(order.total_price)}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => window.location.href = `/user-profile/order-detail/${order._id}`}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                        >
                                            Xem chi tiết
                                        </button>

                                        {/* Nút thanh toán chỉ hiển thị với đơn hàng trực tuyến, trạng thái status_id là 'pending' */}
                                        {isOnlinePayment(order) && order.status_id === 'pending' && (
                                            <button
                                                onClick={() => handlePayOrder(order._id)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Thanh toán ngay
                                            </button>
                                        )}

                                        {/* Các nút hủy đơn chỉ hiển thị khi order_status là 'pending' hoặc 'processing' */}
                                        {(order.order_status === 'pending' || order.order_status === 'processing') && (
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
                                            >
                                                Hủy đơn hàng
                                            </button>
                                        )}

                                        {/* Nút đánh giá chỉ hiển thị khi order_status là 'delivered' */}
                                        {order.order_status === 'delivered' && (
                                            <button
                                                onClick={() => navigate(`/user-profile/review/order/${order._id}`)}
                                                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50"
                                            >
                                                Đánh giá
                                            </button>
                                        )}

                                        {/* Nút theo dõi đơn hàng chỉ hiển thị khi order_status là 'shipped' */}
                                        {order.order_status === 'shipped' && (
                                            <button
                                                className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
                                            >
                                                Theo dõi đơn hàng
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserOrders;