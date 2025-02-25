import React from 'react';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <div className="bg-white">
        <div className='py-10 bg-[#F1F5F9]'></div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Column 1: Dịch Vụ Khách Hàng */}
          <div>
            <h3 className="font-bold text-sm mb-4">DỊCH VỤ KHÁCH HÀNG</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Trung Tâm Trợ Giúp Trooc</li>
              <li>Trooc Blog</li>
              <li>Trooc Mall</li>
              <li>Hướng Dẫn Mua Hàng/Đặt Hàng</li>
              <li>Hướng Dẫn Bán Hàng</li>
              <li>Ví TroocPay</li>
              <li>Trooc Xu</li>
              <li>Đơn Hàng</li>
              <li>Trả Hàng/Hoàn Tiền</li>
              <li>Liên Hệ Trooc</li>
              <li>Chính Sách Bảo Hành</li>
            </ul>
          </div>

          {/* Column 2: Trooc Việt Nam */}
          <div>
            <h3 className="font-bold text-sm mb-4">TROOC VIỆT NAM</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Về Trooc</li>
              <li>Tuyển Dụng</li>
              <li>Điều Khoản Trooc</li>
              <li>Chính Sách Bảo Mật</li>
              <li>Trooc Mall</li>
              <li>Kênh Người Bán</li>
              <li>Flash Sale</li>
              <li>Tiếp Thị Liên Kết</li>
              <li>Liên Hệ Truyền Thông</li>
            </ul>
          </div>

          {/* Column 3: Payment Methods */}
          <div>
            <h3 className="font-bold text-sm mb-4">THANH TOÁN</h3>
            <div className="grid grid-cols-3 gap-2">
              {/* Payment logos */}
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-blue-100 flex items-center justify-center text-xs text-blue-800 font-bold">VISA</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-red-100 flex items-center justify-center text-xs text-red-800 font-bold">MC</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-green-100 flex items-center justify-center text-xs text-green-800 font-bold">JCB</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-blue-100 flex items-center justify-center text-xs text-blue-800 font-bold">AMEX</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-orange-100 flex items-center justify-center text-xs text-orange-800 font-bold">UT</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-red-100 flex items-center justify-center text-xs text-red-800 font-bold">COD</div>
              </div>
            </div>

            <h3 className="font-bold text-sm mb-4 mt-8">ĐƠN VỊ VẬN CHUYỂN</h3>
            <div className="grid grid-cols-3 gap-2">
              {/* Shipping logos */}
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-orange-100 flex items-center justify-center text-xs text-orange-800 font-bold">SPX</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-yellow-100 flex items-center justify-center text-xs text-yellow-800 font-bold">VTPost</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-red-100 flex items-center justify-center text-xs text-red-800 font-bold">VietTel</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-yellow-100 flex items-center justify-center text-xs text-yellow-800 font-bold">VNPost</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-red-100 flex items-center justify-center text-xs text-red-800 font-bold">JT</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-green-100 flex items-center justify-center text-xs text-green-800 font-bold">GHN</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-red-100 flex items-center justify-center text-xs text-red-800 font-bold">NinjaV</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-blue-100 flex items-center justify-center text-xs text-blue-800 font-bold">BE</div>
              </div>
              <div className="border p-2 rounded flex items-center justify-center">
                <div className="w-10 h-6 bg-orange-100 flex items-center justify-center text-xs text-orange-800 font-bold">ALA</div>
              </div>
            </div>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h3 className="font-bold text-sm mb-4">THEO DÕI TROOC</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center">
                <Facebook size={18} className="mr-2 text-blue-600" />
                Facebook
              </li>
              <li className="flex items-center">
                <Instagram size={18} className="mr-2 text-pink-600" />
                Instagram
              </li>
              <li className="flex items-center">
                <Linkedin size={18} className="mr-2 text-blue-800" />
                LinkedIn
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-gray-500 text-sm">
          <p>© 2025 TROOC. Tất cả các quyền được bảo lưu.</p>
          <p className="mt-2">Quốc gia & Khu vực: Việt Nam</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;