import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import ShopOwner from '../../assets/ShopOwner.png'

const OrderDetail = ({ onBack }) => {
  // Sample order data
  const [orderData, setOrderData] = useState({
    id: 49,
    status: 'Đã xác nhận',
    date: '12/07/2024 16:01:43',
    
    // Product details
    products: [
      {
        id: 1,
        name: 'Khẩu trang 5d xám, Khẩu trang 5d xịn xò, 100 chiếc giá sale, chuyên khẩu trang các loại',
        image: ShopOwner,
        price: '90.000 đ',
        quantity: 2,
        total: '180.000 đ'
      }
    ],
    
    // Order summary
    summary: {
      subtotal: '180.000 đ',
      discount: '0 đ',
      shipping: '25.000 đ',
      total: '205.000 đ'
    },
    
    // Shipping info
    shipping: {
      method: 'Giao hàng nhanh',
      cost: '25.000 đ',
      estimatedDelivery: '1-2 days'
    },
    
    // Payment info
    payment: {
      method: 'Thanh toán online',
      status: 'Đã thanh toán'
    },
    
    // Customer info
    customer: {
      name: 'VŨ VĂN ĐÌNH',
      ordersCount: 10,
      email: 'vuvandinh203@gmail.com',
      phone: '(+84) 333583800',
      address: '18/1/3 đường số 8 linh xuân, thủ đức, Khánh Hòa, Việt Nam'
    },
    
    // Store info
    store: {
      name: 'HongThom',
      rating: 4.5,
      avatar: ShopOwner
    }
  });

  // Handle status update
  const handleStatusUpdate = (e) => {
    // In a real application, you would make an API call to update the order status
    console.log(`Updating order status to: ${e.target.value}`);
  };

  // Handle update button click
  const handleUpdate = () => {
    console.log("Updating order with current data");
    // API call would go here
  };

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <button
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            onClick={onBack}
          >
            <ChevronLeft size={18} className="mr-1" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng #{orderData.id}</h1>
          <span className="ml-3 px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
            {orderData.status}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="border border-gray-300 rounded-md px-4 py-2"
            defaultValue={orderData.status}
            onChange={handleStatusUpdate}
          >
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đang vận chuyển">Đang vận chuyển</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Thành công">Thành công</option>
            <option value="Hủy đơn">Hủy đơn</option>
          </select>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleUpdate}
          >
            Cập nhật
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="text-sm text-gray-500 mb-6">
          Thời gian: {orderData.date}
        </div>

        {/* Products section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>
          <div className="bg-white rounded-md border border-gray-200">
            {orderData.products.map((product) => (
              <div key={product.id} className="p-4 flex items-start border-b border-gray-200">
                <img
                  src={ShopOwner}
                  className="w-24 h-24 object-cover rounded-md mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-md font-medium text-gray-800 mb-1">{product.name}</h3>
                  <div className="text-gray-600">{product.price} × {product.quantity}</div>
                </div>
                <div className="flex items-center">
                  <div className="text-lg font-semibold text-gray-800 mr-8">
                    {product.total}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      Chờ xác nhận
                    </button>
                    <button className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Đã xác nhận
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left column */}
          <div>
            {/* Order summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Đơn hàng</h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tổng</span>
                  <span className="font-medium">{orderData.summary.subtotal}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-medium">{orderData.summary.discount}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Vận chuyển</span>
                  <span className="font-medium">{orderData.summary.shipping}</span>
                </div>
                <div className="flex justify-between py-2 mt-2">
                  <span className="text-gray-600 font-semibold">Thanh toán</span>
                  <span className="font-bold text-red-600">{orderData.summary.total}</span>
                </div>
              </div>
            </div>

            {/* Shipping information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Vận chuyển</h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="flex items-start mb-4">
                  <div className="bg-red-100 p-2 rounded-md mr-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" fill="#FF6B6B"/>
                      <path d="M17 8H7C5.34 8 4 9.34 4 11V15C4 16.66 5.34 18 7 18H7.5C7.5 18.83 8.17 19.5 9 19.5C9.83 19.5 10.5 18.83 10.5 18H13.5C13.5 18.83 14.17 19.5 15 19.5C15.83 19.5 16.5 18.83 16.5 18H17C18.66 18 20 16.66 20 15V11C20 9.34 18.66 8 17 8ZM9 18C8.45 18 8 17.55 8 17C8 16.45 8.45 16 9 16C9.55 16 10 16.45 10 17C10 17.55 9.55 18 9 18ZM15 18C14.45 18 14 17.55 14 17C14 16.45 14.45 16 15 16C15.55 16 16 16.45 16 17C16 17.55 15.55 18 15 18ZM18 13H6V11H18V13Z" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{orderData.shipping.method}</h3>
                    <p className="text-gray-600 text-sm">{orderData.shipping.estimatedDelivery}</p>
                  </div>
                  <div className="ml-auto font-semibold">{orderData.shipping.cost}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Payment method */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Thanh toán</h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="flex items-start mb-4">
                  <div className="bg-gray-100 p-2 rounded-md mr-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" fill="#E2E8F0"/>
                      <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="#4A5568"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{orderData.payment.method}</h3>
                    <p className="flex items-center text-sm">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                      <span className="text-green-500">{orderData.payment.status}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Khách hàng</h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="flex items-start mb-4">
                  <div className="mr-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {orderData.customer.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{orderData.customer.name}</h3>
                    <p className="text-gray-500 text-sm">{orderData.customer.ordersCount} Đơn đặt hàng trước đó</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-gray-600">{orderData.customer.email}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span className="text-gray-600">{orderData.customer.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Địa chỉ nhận hàng</h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <p className="text-gray-700">{orderData.customer.address}</p>
              </div>
            </div>

            {/* Store information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Gửi từ</h2>
              <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="flex items-center">
                  <img 
                    src={orderData.store.avatar} 
                    alt={orderData.store.name} 
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-medium text-gray-800">{orderData.store.name}</h3>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span>{orderData.store.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Xem cửa hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;