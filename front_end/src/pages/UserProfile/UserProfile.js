import React, { useState } from 'react';
import {
  User,
  ShoppingBag,
  MessageSquare,
  MapPin,
  Lock,
  LogOut
} from 'lucide-react';
import ShopAvatar from '../../assets/ShopAvatar.png';
import ProfileContent from './components/ProfileContent';
import ShippingAddresses from './components/ShippingAddresses';
import PasswordChange from './components/PasswordChange';

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, profile }) => {
  const sidebarItems = [
    { icon: User, label: 'Tài khoản của tôi', key: 'profile' },
    { icon: ShoppingBag, label: 'Đơn mua', key: 'orders' },
    { icon: MessageSquare, label: 'Tin nhắn', key: 'messages' },
    { icon: MapPin, label: 'Địa chỉ nhận hàng', key: 'addresses' },
    { icon: Lock, label: 'Đổi mật khẩu', key: 'password' },
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
          <button
            key={item.key}
            className={`
              flex items-center w-full p-2 rounded 
              ${activeTab === item.key
                ? 'bg-purple-100 text-purple-600'
                : 'hover:bg-gray-100'}
            `}
            onClick={() => setActiveTab(item.key)}
          >
            <item.icon className="mr-3" size={20} />
            <span>{item.label}</span>
          </button>
        ))}

        <a href='/'
          className="flex items-center w-full p-2 rounded hover:bg-gray-100 text-red-500"
        >
          <LogOut className="mr-3" size={20} />
          <span>Thoát</span>
        </a>
      </div>
    </div>
  );
};


// Main UserProfile Component
const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    lastName: 'Lã',
    firstName: 'Hiếu',
    email: 'lahieutx@gmail.com',
    phone: '0966768150',
    gender: 'Nam',
    birthDate: {
      day: '1',
      month: '1',
      year: '2003'
    }
  });

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleBirthDateChange = (type, value) => {
    setProfile(prev => ({
      ...prev,
      birthDate: { ...prev.birthDate, [type]: value }
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileContent
          profile={profile}
          handleInputChange={handleInputChange}
          handleBirthDateChange={handleBirthDateChange}
        />;
      case 'addresses':
        return <ShippingAddresses />;
      case 'password':
        return <PasswordChange />;
      default:
        return <div>Coming Soon</div>;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex gap-10 rounded-lg overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
        />
        <div className="flex-1 bg-white border">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;