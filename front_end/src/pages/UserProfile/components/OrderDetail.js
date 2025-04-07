import React, { useState, useEffect } from 'react';
import { ArrowLeft, Truck, Package, Calendar, MapPin, CreditCard, Clock, AlertTriangle, CheckCircle, ShoppingBag, Store } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../../services/ApiService';
import AuthService from '../../../services/AuthService';

const OrderDetail = () => {
    const [order, setOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shopData, setShopData] = useState({});  // State để lưu thông tin shop

    const { id } = useParams();
    const navigate = useNavigate();

    // Lấy thông tin người dùng
    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || "";

    useEffect(() => {
        const fetchOrderDetails = async () => {

            try {
                setLoading(true);

                if (!id) {
                    throw new Error("Mã đơn hàng không hợp lệ");
                }

                const orderData = await ApiService.get(`/order/find/${id}`);
                console.log("orderData:", orderData);
                if (!orderData || !orderData.order) {
                    throw new Error("Không thể tải thông tin đơn hàng");
                }

                // Kiểm tra xem đơn hàng có thuộc về người dùng hiện tại không
                if (orderData.order.customer_id._id !== userId) {
                    throw new Error("Bạn không có quyền xem đơn hàng này");
                }

                setOrder(orderData.order);

                // Lấy chi tiết đơn hàng và thêm thông tin shop
                const details = orderData.orderDetails || [];
                setOrderDetails(details);

                // Lấy thông tin shop cho mỗi sản phẩm nếu cần
                await fetchShopDetails(details);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError(err.message || "Đã xảy ra lỗi khi tải thông tin đơn hàng");
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, userId]);

    // Hàm lấy thông tin shop cho các sản phẩm
    const fetchShopDetails = async (details) => {
        const newShopData = { ...shopData };

        // Dùng Promise.all để lấy thông tin shop cho tất cả sản phẩm cùng lúc
        await Promise.all(details.map(async (item) => {
            if (item.product_id && item.product_id.shop_id) {
                const shopId = typeof item.product_id.shop_id === 'object'
                    ? item.product_id.shop_id._id
                    : item.product_id.shop_id;

                // Kiểm tra nếu đã lấy thông tin shop này rồi thì không cần lấy lại
                if (!newShopData[shopId]) {
                    try {
                        const shopInfo = await ApiService.get(`/shops/public/${shopId}`, false);
                        if (shopInfo) {
                            newShopData[shopId] = shopInfo;
                        }
                    } catch (error) {
                        console.error(`Không thể lấy thông tin shop ${shopId}:`, error);
                    }
                }
            }
        }));

        setShopData(newShopData);
    };

    // Xử lý hủy đơn hàng
    const handleCancelOrder = async () => {
        if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
            return;
        }

        try {
            setLoading(true);
            await ApiService.put(`/order/cancel/${id}`);

            // Cập nhật state
            setOrder(prevOrder => ({ ...prevOrder, order_status: 'cancelled' }));

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
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Lấy thông tin trạng thái đơn hàng
    const getOrderStatusInfo = (statusId) => {
        switch (statusId) {
            case 'pending':
                return {
                    label: 'Chờ xử lý',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: <Clock className="mr-2" />,
                    description: 'Đơn hàng của bạn đang chờ xác nhận từ cửa hàng.'
                };
            case 'processing':
                return {
                    label: 'Đang xử lý',
                    color: 'bg-blue-100 text-blue-800',
                    icon: <Package className="mr-2" />,
                    description: 'Đơn hàng của bạn đang được chuẩn bị.'
                };
            case 'shipped':
                return {
                    label: 'Đang giao hàng',
                    color: 'bg-indigo-100 text-indigo-800',
                    icon: <Truck className="mr-2" />,
                    description: 'Đơn hàng của bạn đang được vận chuyển.'
                };
            case 'delivered':
                return {
                    label: 'Đã giao hàng',
                    color: 'bg-green-100 text-green-800',
                    icon: <CheckCircle className="mr-2" />,
                    description: 'Đơn hàng của bạn đã được giao thành công.'
                };
            case 'cancelled':
                return {
                    label: 'Đã hủy',
                    color: 'bg-red-100 text-red-800',
                    icon: <AlertTriangle className="mr-2" />,
                    description: 'Đơn hàng của bạn đã bị hủy.'
                };
            default:
                return {
                    label: 'Không xác định',
                    color: 'bg-gray-100 text-gray-800',
                    icon: <Package className="mr-2" />,
                    description: 'Không có thông tin về trạng thái đơn hàng.'
                };
        }
    };

    // Tính tổng số sản phẩm
    const getTotalItems = () => {
        return orderDetails.reduce((sum, item) => sum + item.quantity, 0);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 mt-10 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
                <p className="mt-4 text-gray-700">Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
                <div className="text-red-500 text-center mb-4">❌ {error}</div>
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/user-profile/orders')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                    >
                        Quay lại danh sách đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
                <div className="text-center mb-4">Không tìm thấy thông tin đơn hàng</div>
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/user-profile/orders')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                    >
                        Quay lại danh sách đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    const statusInfo = getOrderStatusInfo(order.order_status);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 my-10">
            <div className="mb-6 flex items-center">
                <button
                    onClick={() => navigate('/user-profile/orders')}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng {order.id}</h1>
            </div>

            {/* Order Status */}
            <div className={`${statusInfo.color} p-4 rounded-lg mb-6 flex items-center`}>
                {statusInfo.icon}
                <div>
                    <h2 className="font-semibold">{statusInfo.label}</h2>
                    <p className="text-sm">{statusInfo.description}</p>
                </div>
            </div>

            {/* Order Info Card */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start">
                            <Calendar size={20} className="mt-0.5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                                <p className="font-medium">{formatDate(order.created_at)}</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <MapPin size={20} className="mt-0.5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                                {order.user_address_id ? (
                                    <>
                                        <p className="text-sm font-medium">{order.user_address_id.phone}</p>
                                        <p className="text-sm">
                                            {order.user_address_id.address_line1}
                                            {order.user_address_id.address_line2 && `, ${order.user_address_id.address_line2}`}
                                            {order.user_address_id.city && `, ${order.user_address_id.city}`}
                                            {order.user_address_id.country && `, ${order.user_address_id.country}`}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm">Không có thông tin địa chỉ</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Truck size={20} className="mt-0.5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-600">Phương thức giao hàng</p>
                                <p className="font-medium">{order.shipping_id?.name || "Giao hàng tiêu chuẩn"}</p>
                                {order.expected_delivery_date && (
                                    <p className="text-sm">Dự kiến giao: {formatDate(order.expected_delivery_date)}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start">
                            <CreditCard size={20} className="mt-0.5 mr-2 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                                <p className="font-medium">{order.payment_id?.name || "Thanh toán khi nhận hàng"}</p>
                                {order.payment_status && (
                                    <p className={`text-sm ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <ShoppingBag size={20} className="mr-2 text-purple-600" />
                            Sản phẩm ({getTotalItems()})
                        </h2>
                        {/* Nút đánh giá chỉ hiển thị khi order_status là 'delivered' */}
                        {order.order_status === 'delivered' && (
                            <button
                                onClick={() => navigate(`/user-profile/review/order/${order._id}`)}
                                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50"
                            >
                                Đánh giá sản phẩm
                            </button>
                        )}
                    </div>

                    <div className="space-y-4 mb-6">
                        {orderDetails.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {orderDetails.map((item) => {
                                    // Lấy thông tin shop cho sản phẩm này
                                    let shopInfo = null;
                                    if (item.product_id && item.product_id.shop_id) {
                                        const shopId = typeof item.product_id.shop_id === 'object'
                                            ? item.product_id.shop_id._id
                                            : item.product_id.shop_id;
                                        shopInfo = shopData[shopId];
                                    }

                                    return (
                                        <div key={item._id} className="flex py-4">
                                            <div className="">
                                                <img
                                                    src={item.product_id?.thumbnail || item.product_id?.image || '/placeholder-product.png'}
                                                    alt={item.product_id?.name || "Sản phẩm"}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            </div>
                                            <div className="ml-4 flex-grow">
                                                <h3 className="font-medium text-gray-800">{item.product_id?.name || "Sản phẩm"}</h3>

                                                {/* Hiển thị tên cửa hàng */}
                                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                                    <Store size={14} className="mr-1 text-purple-600" />
                                                    <span className="font-medium">
                                                        {shopInfo ? shopInfo.name : (
                                                            typeof item.product_id?.shop_id === 'object' && item.product_id?.shop_id.name
                                                                ? item.product_id.shop_id.name
                                                                : 'Không rõ cửa hàng'
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 text-sm text-gray-600">
                                                    <p>Mã sản phẩm: <span className="font-medium">{item.product_id?.id || 'N/A'}</span></p>
                                                    <p>Đơn giá: <span className="font-medium">{formatPrice(item.price || (item.product_id?.price || 0))}</span></p>
                                                    <p>Số lượng: <span className="font-medium">{item.quantity}</span></p>
                                                    {item.discount_id && (
                                                        <p>Giảm giá: <span className="font-medium text-red-600">{item.discount_id.name || 'Có giảm giá'}</span></p>
                                                    )}
                                                </div>
                                                {item.product_id?.description && (
                                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.product_id.description}</p>
                                                )}
                                            </div>
                                            <div className="ml-4 text-right">
                                                <p className="font-semibold text-purple-700">
                                                    {formatPrice((item.price || (item.product_id?.price || 0)) * item.quantity)}
                                                </p>
                                                {order.order_status === 'delivered' && (
                                                    <button
                                                        onClick={() => navigate(`/product/${item.product_id?._id}`)}
                                                        className="mt-2 text-sm text-purple-600 hover:text-purple-800"
                                                    >
                                                        Mua lại
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-600">Không có thông tin chi tiết sản phẩm</p>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between mb-2">
                            <span>Tạm tính</span>
                            <span>{formatPrice(order.original_price || order.total_price)}</span>
                        </div>

                        {order.discount_amount > 0 && (
                            <div className="flex justify-between mb-2">
                                <span>Giảm giá {order.discount_id?.code ? `(${order.discount_id.code})` : ''}</span>
                                <span className="text-red-600">-{formatPrice(order.discount_amount)}</span>
                            </div>
                        )}

                        {order.coupon_amount > 0 && (
                            <div className="flex justify-between mb-2">
                                <span>Mã giảm giá {order.coupon_id?.code ? `(${order.coupon_id.code})` : ''}</span>
                                <span className="text-red-600">-{formatPrice(order.coupon_amount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between mb-2">
                            <span>Phí vận chuyển</span>
                            <span>{order.shipping_id?.price ? formatPrice(order.shipping_id.price) : "Miễn phí"}</span>
                        </div>

                        <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                            <span>Tổng cộng</span>
                            <span className="text-purple-700">{formatPrice(order.total_price)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-between">
                <div className="flex gap-2">
                    {(order.order_status === 'pending' || order.order_status === 'processing') && (
                        <button
                            onClick={handleCancelOrder}
                            className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
                        >
                            Hủy đơn hàng
                        </button>
                    )}

                    {order.order_status === 'shipped' && (
                        <button
                            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                        >
                            Theo dõi đơn hàng
                        </button>
                    )}

                    {order.order_status === 'delivered' && (
                        <button
                            onClick={() => navigate(`/review/order/${order._id}`)}
                            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50"
                        >
                            Đánh giá sản phẩm
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/user-profile/messages')}
                        className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50"
                    >
                        Liên hệ hỗ trợ
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                        In đơn hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;