import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfileContent from './components/ProfileContent'
import PasswordChange from './components/PasswordChange'
import Orders from './components/Orders'
import Message from './components/Message'
import Sidebar from './Sidebar'
import ShippingAddresses from './components/ShippingAddresses'
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

// Main UserProfile Component
const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile data from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Lấy id của người dùng từ AuthService
        const currentUser = AuthService.getCurrentUser();
        
        if (!currentUser) {
          throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        }
        
        // Gọi API để lấy thông tin chi tiết của người dùng
        const userData = await ApiService.get(`/user/find/${currentUser.email}`);
        
        // Xử lý dữ liệu nhận được từ API
        let formattedData = {
          ...userData,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          gender: userData.gender || 'Nam',
          birthDate: {
            day: '1',
            month: '1',
            year: '2003'
          }
        };

        // Nếu API trả về ngày sinh, xử lý định dạng
        if (userData.birthDate) {
          const date = new Date(userData.birthDate);
          formattedData.birthDate = {
            day: date.getDate().toString(),
            month: (date.getMonth() + 1).toString(),
            year: date.getFullYear().toString()
          };
        }

        setProfile(formattedData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleBirthDateChange = (type, value) => {
    setProfile(prev => ({
      ...prev,
      birthDate: { ...prev.birthDate, [type]: value }
    }));
  };

  // Update profile function to be passed to ProfileContent
  const updateProfile = async (updatedProfile) => {
    try {
      // Lấy id của người dùng
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }
      
      // Format ngày sinh theo định dạng yyyy-mm-dd
      const day = updatedProfile.birthDate.day.padStart(2, '0');
      const month = updatedProfile.birthDate.month.padStart(2, '0');
      const year = updatedProfile.birthDate.year;
      const birthDateString = `${year}-${month}-${day}`;
      
      // Chuẩn bị dữ liệu để gửi lên API
      const profileToUpdate = {
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
        gender: updatedProfile.gender,
        // Email thường không cho phép thay đổi nên không đưa vào đây
      };
      
      // Nếu có trường birthDate trong model, thêm vào
      if (updatedProfile.birthDate) {
        profileToUpdate.birthDate = birthDateString;
      }
      
      // Gọi API cập nhật thông tin người dùng
      // Dựa vào routes, dùng endpoint /edit/:id
      const response = await ApiService.put(`/user/edit/${updatedProfile._id}`, profileToUpdate);
      
      if (response) {
        // Cập nhật lại state với dữ liệu mới
        setProfile({
          ...response,
          birthDate: updatedProfile.birthDate
        });
        
        return { success: true };
      } else {
        throw new Error("Không nhận được phản hồi từ server");
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      return { 
        success: false, 
        error: err.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.' 
      };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-7xl flex justify-center items-center h-64">
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto p-4 max-w-7xl flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
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
                  updateProfile={updateProfile}
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