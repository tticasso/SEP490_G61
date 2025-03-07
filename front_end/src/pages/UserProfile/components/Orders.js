import React, { useState } from 'react';
import { MessageCircle, ShoppingBag, Store } from 'lucide-react';
import khautrang5d from '../../../assets/khautrang5d.jpg'

const Orders = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');

  const tabs = [
    'Tất cả', 
    'Chờ xác nhận', 
    'Đã xác nhận', 
    'Đang giao hàng', 
    'Hủy đơn hàng', 
    'Đơn hàng thành công', 
    'Đơn hàng thất bại', 
    'Trả hàng'
  ];

  const orders = [
    {
      id: 1,
      shop: 'HongThomShop',
      product: 'Khẩu trang 5d xám, Khẩu trang 5d xịn xò, 100 chiếc giá sale, chuyên khẩu trang 5d',
      quantity: 2,
      status: 'Chờ xác nhận',
      totalPrice: 205000,
      image: khautrang5d
    },
    {
      id: 2,
      shop: 'HongThomShop',
      product: 'Khẩu trang 5d xám, Khẩu trang 5d xịn xò, 100 chiếc giá sale, chuyên khẩu trang 5d',
      quantity: 1,
      status: 'Chờ xác nhận',
      totalPrice: 105000,
      image: khautrang5d
    },
    {
        id: 3,
        shop: 'HongThomShop',
        product: 'Khẩu trang 5d xám, Khẩu trang 5d xịn xò, 100 chiếc giá sale, chuyên khẩu trang 5d',
        quantity: 3,
        status: 'Đơn hàng thành công',
        totalPrice: 105000,
        image: khautrang5d
      }
  ];

  return (
    <div className="bg-gray-100 ">
      <div className="bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="flex justify-around overflow-x-auto border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3  ${
                activeTab === tab 
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Order List */}
        {orders.map((order) => (
          <div key={order.id} className="border-b p-4">
            {/* Shop Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <Store size={20} className="mr-2 text-gray-600" />
                <span className="font-semibold">{order.shop}</span>
              </div>
              <span className="text-red-500 font-medium">{order.status}</span>
            </div>
            <div className='w-full h-[1px] bg-gray-400 mb-8'></div>
            {/* Product Details */}
            <div className="flex items-start">
              <img 
                src={order.image} 
                alt="Product" 
                className="w-20 h-20 object-cover rounded mr-4"
              />
              <div className="flex-grow">
                <p className="text-sm">{order.product}</p>
                <p className="text-gray-600">Số lượng: {order.quantity}</p>
              </div>
            </div>
            <div className='w-full h-[1px] bg-gray-400 mt-8'></div>
            {/* Order Total and Actions */}
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-4 items-center space-x-2">
                <button onClick={() => window.location.href = '/user-profile/messages'} className="text-sm hover:text-purple-500 text-gray-600 flex items-center">
                  <MessageCircle size={16} className="mr-1" /> Nhắn tin
                </button>
                <button onClick={() => window.location.href = '/shop-detail'} className="text-sm hover:text-purple-500 text-gray-600 flex items-center">
                  <ShoppingBag size={16} className="mr-1" /> Xem Shop
                </button>
              </div>
              <div>
                <p className="text-right">
                  Thành tiền: <span className="text-red-500 font-semibold">
                    {order.totalPrice.toLocaleString()}đ
                  </span>
                </p>
                <div className="flex justify-end mt-2">
                  {order.status === 'Chờ xác nhận' && (
                    <>
                      <button className="bg-red-500 text-white px-3 py-2 rounded text-sm">
                        Mua Lại
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;