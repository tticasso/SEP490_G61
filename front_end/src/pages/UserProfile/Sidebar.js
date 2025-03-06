import { Link, useLocation } from 'react-router-dom';
import {User, ShoppingBag, LogOut, Lock, MapPin, MessageSquare} from 'lucide-react'
import ShopAvatar from '../../assets/ShopAvatar.png'

// Sidebar Component
const Sidebar = ({ profile }) => {
  const location = useLocation();
  
  const sidebarItems = [
    { icon: User, label: 'Tài khoản của tôi', key: 'profile', path: '/user-profile' },
    { icon: ShoppingBag, label: 'Đơn mua', key: 'orders', path: '/user-profile/orders' },
    { icon: MessageSquare, label: 'Tin nhắn', key: 'messages', path: '/user-profile/messages' },
    { icon: MapPin, label: 'Địa chỉ nhận hàng', key: 'addresses', path: '/user-profile/addresses' },
    { icon: Lock, label: 'Đổi mật khẩu', key: 'password', path: '/user-profile/password' },
  ];

  return (
    <div className="w-64 bg-white border p-4">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <img src={ShopAvatar} className='w-full h-full' alt="Profile" />
        </div>
        <div>
          <p className="font-semibold">{profile.lastName} {profile.firstName}</p>
        </div>
      </div>

      <div className="space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            className={`
              flex items-center w-full p-2 rounded 
              ${location.pathname === item.path
                ? 'bg-purple-100 text-purple-600'
                : 'hover:bg-gray-100'}
            `}
          >
            <item.icon className="mr-3" size={20} />
            <span>{item.label}</span>
          </Link>
        ))}

        <Link 
          to="/"
          className="flex items-center w-full p-2 rounded hover:bg-gray-100 text-red-500"
        >
          <LogOut className="mr-3" size={20} />
          <span>Thoát</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;