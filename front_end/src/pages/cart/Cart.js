import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import dongho from '../../assets/dongho.png'
import quanao from '../../assets/quanao.jpg'

const Cart = () => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Acer Chromebook 315 CB315-3H-C19A Laptop Intel Celeron N4000',
            originalPrice: 42000000,
            discountedPrice: 36960000,
            quantity: 1,
            image: dongho
        },
        {
            id: 2,
            name: 'Quần Đùi Nữ Mặc Nhà Short Nữ Tập Gym Yoga P2HNEW QN01',
            originalPrice: 36000,
            discountedPrice: 36000,
            quantity: 1,
            image: dongho
        },
        {
            id: 3,
            name: 'SAMSUNG 14" Galaxy Book4 Pro Laptop PC Computer, Intel Core 7',
            originalPrice: 9900000,
            discountedPrice: 8712000,
            quantity: 1,
            image: dongho
        }
    ]);

    const [cartItems2, setCartItems2] = useState([
        {
            id: 1,
            name: 'Acer Chromebook 315 CB315-3H-C19A Laptop Intel Celeron N4000',
            originalPrice: 42000000,
            discountedPrice: 36960000,
            quantity: 1,
            image: quanao
        },
        {
            id: 2,
            name: 'Quần Đùi Nữ Mặc Nhà Short Nữ Tập Gym Yoga P2HNEW QN01',
            originalPrice: 36000,
            discountedPrice: 36000,
            quantity: 1,
            image: quanao
        },
        {
            id: 3,
            name: 'SAMSUNG 14" Galaxy Book4 Pro Laptop PC Computer, Intel Core 7',
            originalPrice: 9900000,
            discountedPrice: 8712000,
            quantity: 1,
            image: quanao
        }
    ]);

    const [voucher, setVoucher] = useState('');

    const updateQuantity = (id, change) => {
        setCartItems(cartItems.map(item =>
            item.id === id
                ? { ...item, quantity: Math.max(1, item.quantity + change) }
                : item
        ));
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.discountedPrice * item.quantity, 0);
    };

    return (
        <div className='flex gap-10 max-w-7xl mx-auto'>
            <div className="w-2/3 flex flex-col bg-white shadow-md rounded-lg p-4 mt-8 mb-8 ">
                <div className=" r-4">
                    <h2 className="text-xl text-center font-bold mb-4">Giỏ hàng</h2>
                    <div className="flex items-center gap-4 p-4 bg-gray-200">
                        <div onClick={() => window.location.href = "/shop-detail"} className="h-14 w-14 rounded-full overflow-hidden cursor-pointer">
                            <img
                                src={dongho}
                                alt="Mount Fuji with red autumn leaves"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p onClick={() => window.location.href = "/shop-detail"} className='cursor-pointer'>Vua đồng hồ</p>
                    </div>
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center border-b py-4">
                            <div className='p-4'>
                                <input type="checkbox" className='scale-150' />
                            </div>
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover mr-4 rounded"
                            />
                            <div className="flex-grow">
                                <h3 className="text-sm font-medium">{item.name}</h3>
                                <div className="flex items-center mt-2">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="p-1 bg-gray-100 rounded"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="mx-2">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="p-1 bg-gray-100 rounded"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="ml-4 text-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="mt-2">
                                    <span className="line-through text-gray-400 mr-2">
                                        {item.originalPrice.toLocaleString()}đ
                                    </span>
                                    <span className="font-bold text-red-500">
                                        {item.discountedPrice.toLocaleString()}đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex p-4 bg-gray-200">
                        <button className="bg-red-500 text-white px-4 py-1 rounded">
                            Thêm voucher
                        </button>
                    </div>
                </div>
                <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                <div className="pr-4 mt-10">
                    <div className="flex items-center gap-4 p-4 bg-gray-200">
                        <div onClick={() => window.location.href = "/shop-detail"} className="h-14 w-14 rounded-full overflow-hidden cursor-pointer">
                            <img
                                src={quanao}
                                alt="Mount Fuji with red autumn leaves"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p onClick={() => window.location.href = "/shop-detail"} className='cursor-pointer'>Vua đồng hồ</p>
                    </div>
                    {cartItems2.map((item) => (
                        <div key={item.id} className="flex items-center border-b py-4">
                            <div className='p-4'>
                                <input type="checkbox" className='scale-150' />
                            </div>
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover mr-4 rounded"
                            />
                            <div className="flex-grow">
                                <h3 className="text-sm font-medium">{item.name}</h3>
                                <div className="flex items-center mt-2">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="p-1 bg-gray-100 rounded"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="mx-2">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="p-1 bg-gray-100 rounded"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="ml-4 text-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="mt-2">
                                    <span className="line-through text-gray-400 mr-2">
                                        {item.originalPrice.toLocaleString()}đ
                                    </span>
                                    <span className="font-bold text-red-500">
                                        {item.discountedPrice.toLocaleString()}đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex p-4 bg-gray-200">
                        <button className="bg-red-500 text-white px-4 py-1 rounded">
                            Thêm voucher
                        </button>
                    </div>
                </div>


            </div>
            <div className="w-1/3 pl-4 border-l pt-10">
                <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm flex">
                        <p className='mr-1'>Tiêu 1.500.000 đ để nhận được</p>  <strong className='text-red-500'>Miễn phí vận chuyển</strong>
                    </p>
                </div>

                <div className="mt-4">
                    <div className="justify-between mb-2">
                        <h3>Mã giảm giá (Không bắt buộc)</h3>
                        <div className='text-xs text-gray-600'>Mã giảm giá sẽ được áp dụng ở trang thanh toán</div>
                    </div>
                    <input
                        type="text"
                        placeholder="Nhập mã giảm giá..."
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                <div className='mt-4'>
                    <p>Voucher đã áp dụng</p>
                    <div className='flex gap-2 mt-2'>
                        <p className='bg-gray-300 p-2'>DFJGF12</p>
                        <p className='bg-gray-300 p-2'>DQWER12</p>
                    </div>

                </div>
                <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                <div className="mt-4">
                    <div className="flex justify-between mb-2">
                        <span>Tổng đơn hàng:</span>
                        <span className="font-bold">{calculateTotal().toLocaleString()}đ</span>
                    </div>
                    <button onClick={() => window.location.href = "checkout"} className="w-full bg-purple-600 text-white py-2 rounded mt-4">
                        Thanh Toán
                    </button>
                </div>
            </div>
        </div>

    );
};

export default Cart;