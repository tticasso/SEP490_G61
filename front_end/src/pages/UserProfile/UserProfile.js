import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfileContent from './components/ProfileContent'
import PasswordChange from './components/PasswordChange'
import Orders from './components/Orders'
import Message from './components/Message'
import Sidebar from './Sidebar'
import ShippingAddresses from './components/ShippingAddresses'


// Main UserProfile Component
const UserProfile = () => {
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

  return (
    <div className="container mx-auto p-4 max-w-8xl">
      <div className="flex gap-10 rounded-lg overflow-hidden">
        <Sidebar profile={profile} />
        <div className="flex-1 bg-white border">
          <Routes>
            {/* Đường dẫn chính phải khớp với path trong Sidebar */}
            <Route 
              path="/" 
              element={
                <ProfileContent
                  profile={profile}
                  handleInputChange={handleInputChange}
                  handleBirthDateChange={handleBirthDateChange}
                />
              } 
            />
            <Route path="/orders" element={<Orders />} />
            <Route path="/messages" element={<Message />} />
            <Route path="/addresses" element={<ShippingAddresses />} />
            <Route path="/password" element={<PasswordChange />} />
            {/* Bổ sung route mặc định để redirect về profile */}
            <Route path="*" element={<Navigate to="/user-profile" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;