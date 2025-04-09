import React, { useState } from 'react';
import { 
  Truck, 
  Shield, 
  Tag, 
  MessageCircle, 
  Star 
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const paymentMethods = [
    'visa', 'mastercard', 'discover', 'western-union', 'amex', 'cirus', 'paypal'
  ];

  const featuresData = [
    { 
      icon: Shield, 
      title: 'THANH TOÁN AN TOÀN', 
      description: '100% Bảo mật thanh toán' 
    },
    { 
      icon: Tag, 
      title: 'GÃM GIÁ TRỰC TUYẾN', 
      description: 'Có nhiều mã giảm giá khi mua hàng' 
    },
    { 
      icon: MessageCircle, 
      title: 'TRUNG TÂM TRỢ GIÚP', 
      description: 'Hỗ trợ 24/7' 
    },
    { 
      icon: Star, 
      title: 'SẢN PHẨM TUYỆT VỜI', 
      description: 'Từ nhiều nhãn hàng nổi tiếng' 
    }
  ];

  return (
    <footer className="bg-white">
      {/* Features Section */}
      <div className="py-6 border">
        <div className="mx-auto max-w-7xl flex justify-between space-x-4">
          {featuresData.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col text-center p-4 hover:bg-purple-200 items-center space-x-3 text-purple-600"
            >
              <feature.icon size={40} className="text-purple-600" />
              <div>
                <h4 className="font-semibold text-sm">{feature.title}</h4>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl py-12 grid grid-cols-4 gap-8">
        {/* Address Section */}
        <div>
          <h3 className="font-bold mb-4">ĐỊA CHỈ</h3>
          <div className="space-y-2 text-gray-700">
            <p>Bạn có câu hỏi? Hãy gọi cho chúng tôi để được hỗ trợ 24/7</p>
            <p className="font-semibold text-purple-600">Hotline: +84 966 768 150</p>
            <p>66-69 Mục Uyên, Tân Xã, Thạch Hòa, Thạch Thất, Hà Nội</p>
            <p>lahieutx@gmail.com</p>
            <p>trooc2hand@gmail.com</p>
          </div>
        </div>

        {/* Information Section */}
        <div>
          <h3 className="font-bold mb-4">THÔNG TIN</h3>
          <ul className="space-y-2 text-gray-700">
            <li><a href="#" className="hover:text-purple-600">Về chúng tôi</a></li>
            <li><a href="#" className="hover:text-purple-600">Thông tin vận chuyển</a></li>
            <li><a href="#" className="hover:text-purple-600">Phương thức thanh toán</a></li>
            <li><a href="#" className="hover:text-purple-600">Gửi hỗ trợ</a></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="font-bold mb-4">LIÊN HỆ</h3>
          <ul className="space-y-2 text-gray-700">
            <li><a href="#" className="hover:text-purple-600">Địa chỉ</a></li>
            <li><a href="#" className="hover:text-purple-600">Đơn hàng</a></li>
            <li><a href="#" className="hover:text-purple-600">FAQs</a></li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div>
          <h3 className="font-bold mb-4">ĐĂNG KÝ NHẬN THÔNG BÁO</h3>
          <p className="text-gray-700 mb-4">
            Với 20.000 khách hàng đã đăng ký với TROOC hãy đăng ký 
            nhanh để được những giảm giá tuyệt vời từ chúng tôi
          </p>
          <div className="flex">
            <input 
              type="email"
              placeholder="Địa chỉ email của bạn..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700">
              ĐĂNG KÝ
            </button>
          </div>
        </div>
      </div>

      
    </footer>
  );
};

export default Footer;