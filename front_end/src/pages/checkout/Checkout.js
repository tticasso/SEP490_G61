import React, { useState } from 'react';
import { Truck, Edit2, Trash2 } from 'lucide-react';
import khautrang5d from '../../assets/khautrang5d.jpg'

const CheckoutPage = () => {
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [deliveryMethod, setDeliveryMethod] = useState('standard');

    const addresses = [
        {
            id: 1,
            name: 'Vũ Văn Định',
            phone: '333583800',
            address: '18/1/3 đường số 8 linh xuân thủ đức, Khánh Hòa, Việt Nam'
        },
        {
            id: 2,
            name: 'Vũ Văn Định',
            phone: '333583800',
            address: 'Lâm Đồng, Cao Bằng, Việt Nam'
        }
    ];

    const paymentMethods = [
        { id: 1, name: 'Thanh toán khi nhận hàng', icon: <Truck /> },
        { id: 2, name: 'Thanh toán Momo', icon: <Truck /> },
        { id: 3, name: 'Thanh toán VNPay', icon: <Truck /> }
    ];

    const deliveryMethods = [
        {
            id: 'standard',
            name: 'Giao hàng tiêu chuẩn',
            price: 15000,
            time: '3-5 Ngày'
        },
        {
            id: 'fast',
            name: 'Giao hàng nhanh',
            price: 25000,
            time: '1-2 Ngày'
        },
        {
            id: 'same-day',
            name: 'Giao hàng trong ngày',
            price: 45000,
            time: 'Nhận hàng trong ngày'
        },
        {
            id: 'international',
            name: 'Giao hàng quốc tế',
            price: 98000,
            time: '7-14 Ngày'
        }
    ];

    const cartItems = [
        {
            id: 1,
            name: 'Khẩu trang 5d xám, Khẩu trang 5d xịn xò, 100 chiếc giá sale',
            price: 180000,
            quantity: 1,
            image: '/path/to/mask-image.jpg'
        }
    ];

    const calculateTotal = () => {
        const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
        const deliveryPrice = deliveryMethods.find(method => method.id === deliveryMethod)?.price || 0;
        return subtotal + deliveryPrice;
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Delivery & Payment */}
                <div>
                    {/* Delivery Address Section */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-4">Địa chỉ nhận hàng</h2>
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className={`flex items-center p-4 border rounded-lg mb-2 cursor-pointer ${selectedAddress === address.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                                    }`}
                                onClick={() => setSelectedAddress(address.id)}
                            >
                                <input
                                    type="radio"
                                    checked={selectedAddress === address.id}
                                    onChange={() => setSelectedAddress(address.id)}
                                    className="mr-4"
                                />
                                <div className="flex-grow">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{address.name} - {address.phone}</span>
                                        <div className="flex space-x-2">
                                            <Edit2 size={16} className="text-blue-500 cursor-pointer" />
                                            <Trash2 size={16} className="text-red-500 cursor-pointer" />
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{address.address}</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full border p-4 rounded text-purple-600 font-medium mt-2">+ Thêm địa chỉ</button>
                    </div>

                    {/* Payment Method Section */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className={`flex items-center p-4 border rounded-lg mb-2 cursor-pointer ${paymentMethod === method.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                                    }`}
                                onClick={() => setPaymentMethod(method.id)}
                            >
                                <input
                                    type="radio"
                                    checked={paymentMethod === method.id}
                                    onChange={() => setPaymentMethod(method.id)}
                                    className="mr-4"
                                />
                                {method.icon}
                                <span className="ml-4">{method.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Delivery Method Section */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">Phương thức giao hàng</h2>
                        {deliveryMethods.map((method) => (
                            <div
                                key={method.id}
                                className={`flex items-center p-4 border rounded-lg mb-2 cursor-pointer ${deliveryMethod === method.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                                    }`}
                                onClick={() => setDeliveryMethod(method.id)}
                            >
                                <input
                                    type="radio"
                                    checked={deliveryMethod === method.id}
                                    onChange={() => setDeliveryMethod(method.id)}
                                    className="mr-4"
                                />
                                <div className="flex-grow">
                                    <div className="flex justify-between">
                                        <span>{method.name}</span>
                                        <span className="text-gray-600">{method.price.toLocaleString()}đ</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{method.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <img
                                src={khautrang5d}
                                alt="Product"
                                className="w-20 h-20 object-cover mr-4 rounded"
                            />
                            <div>
                                <h3 className="font-medium">Khẩu trang 5d xám, Khẩu trang 5d xịn xò, 100 chiếc giá sale</h3>
                                <p className="text-gray-600">180.000đ</p>
                            </div>
                        </div>
                        <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                        <div className="pt-4">
                            <div className="flex justify-between mt-4">
                                <span>Tổng đơn hàng</span>
                                <span>180.000đ</span>
                            </div>
                            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                            <div className="flex justify-between mt-4">
                                <span>Voucher giảm giá</span>
                                <span className="text-red-500">0đ</span>
                            </div>
                            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                            <div className="flex justify-between mt-4">
                                <span>Phi giao hàng</span>
                                <span>
                                    {deliveryMethods.find(method => method.id === deliveryMethod)?.price.toLocaleString()}đ
                                </span>
                            </div>
                            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Tổng cộng</span>
                                <span className="text-purple-600">{calculateTotal().toLocaleString()}đ</span>
                            </div>
                        </div>

                        <button className="w-full bg-purple-600 text-white py-3 rounded-lg mt-4">
                            Thanh toán
                        </button>
                        <p className="text-center text-sm text-gray-600 mt-2">
                            Bạn muốn dùng thêm mã giảm giá hoặc thay đổi số lượng sản phẩm hãy{' '}
                            <a href="cart" className="text-purple-600">Quay lại giỏ hàng</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;