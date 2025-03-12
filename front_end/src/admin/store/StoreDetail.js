import React, { useState, useEffect } from 'react';
import { ChevronLeft, UserIcon } from 'lucide-react';
import ShopService from './services/Shopservice';
import { toast } from 'react-toastify'; // Assuming you use react-toastify for notifications

const StoreDetail = ({ onBack, shopId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shopData, setShopData] = useState({});
    const [userData, setUserData] = useState(null);
    const [provinceData, setProvinceData] = useState(null);

    // Load shop data on component mount
    useEffect(() => {
        if (shopId) {
            fetchShopData();
        } else {
            setLoading(false);
        }
    }, [shopId]);

    // Fetch shop data from API
    const fetchShopData = async () => {
        try {
            setLoading(true);
            const data = await ShopService.getShopById(shopId);
            
            // Update state with fetched data
            setShopData(data);
            
            // Fetch user data if user_id exists
            if (data.user_id) {
                fetchUserData(data.user_id);
            }
            
            // Fetch province data if province_id exists
            if (data.province_id) {
                fetchProvinceData(data.province_id);
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching shop data:', err);
            setError('Failed to load shop details. Please try again later.');
            setLoading(false);
            toast.error('Failed to load shop details');
        }
    };

    // Fetch user data
    const fetchUserData = async (userId) => {
        try {
            const userData = await ShopService.getUserById(userId);
            setUserData(userData);
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    };

    // Fetch province data
    const fetchProvinceData = async (provinceId) => {
        try {
            const provinceData = await ShopService.getProvinceById(provinceId);
           
            
            setProvinceData(provinceData);
        } catch (err) {
            console.error('Error fetching province data:', err);
        }
    };

    // Handle approve shop
    const handleApproveShop = async () => {
        try {
            setLoading(true);
            await ShopService.updateShopStatus(shopId, 'active');
            
            // Update local state
            setShopData({
                ...shopData,
                status: 'active'
            });
            
            toast.success('Cửa hàng đã được duyệt thành công');
            setLoading(false);
        } catch (err) {
            console.error('Error approving shop:', err);
            toast.error('Không thể duyệt cửa hàng');
            setLoading(false);
        }
    };

    // Handle toggle account lock status
    const handleToggleAccountStatus = async () => {
        try {
            setLoading(true);
            
            const isCurrentlyActive = shopData.is_active === 1;
            const newStatus = isCurrentlyActive ? 0 : 1;
            const actionText = isCurrentlyActive ? 'khóa' : 'mở khóa';
            
            // Update just the is_active field
            await ShopService.toggleShopActiveStatus(shopId, newStatus);
            
            // Update local state
            setShopData({
                ...shopData,
                is_active: newStatus
            });
            
            toast.success(`Cửa hàng đã được ${actionText} thành công`);
            setLoading(false);
            
        } catch (err) {
            console.error('Error toggling account status:', err);
            toast.error('Không thể thay đổi trạng thái tài khoản');
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 bg-white mx-auto max-w-7xl mb-10">
            {/* Top navigation */}
            <div className="p-6 flex justify-between items-center">
                <div className="flex items-center">
                    <button
                        className="flex items-center text-gray-600 hover:text-gray-800"
                        onClick={onBack}
                    >
                        <ChevronLeft size={18} className="mr-1" />
                        <span>Quay lại</span>
                    </button>
                </div>
                <div className="flex space-x-4">
                    {shopId && (
                        <>
                            {shopData.status === 'pending' && (
                                <button
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                                    onClick={handleApproveShop}
                                    disabled={loading}
                                >
                                    Duyệt cửa hàng
                                </button>
                            )}
                            <button
                                className={`px-6 py-2 ${shopData.is_active === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md`}
                                onClick={handleToggleAccountStatus}
                                disabled={loading}
                            >
                                {shopData.is_active === 1 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">THÔNG TIN CỬA HÀNG</h1>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-2">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">
                        {error}
                    </div>
                ) : (
                    /* Detail content */
                    <div className="grid grid-cols-2 gap-8">
                        {/* Left section - Store info */}
                        <div>
                            <div className="mb-8">
                                <h2 className="text-lg font-medium text-gray-700 mb-4">THÔNG TIN CƠ BẢN</h2>

                                <div className="mb-8 flex justify-center">
                                    <div className="relative">
                                        <img
                                            src={shopData.logo || shopData.image_cover || 'https://via.placeholder.com/150'}
                                            alt="Store logo"
                                            className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Tên cửa hàng</h3>
                                            <p className="mt-1 text-lg font-medium">{shopData.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Tên tài khoản</h3>
                                            <p className="mt-1 text-lg font-medium">{shopData.username || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Số điện thoại</h3>
                                            <p className="mt-1">{shopData.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                            <p className="mt-1">{shopData.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h3 className="text-sm font-medium text-gray-500">Website</h3>
                                    <p className="mt-1">{shopData.website || 'N/A'}</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h3 className="text-sm font-medium text-gray-500">Mô tả</h3>
                                    <p className="mt-1">{shopData.description || 'Không có mô tả'}</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h3 className="text-sm font-medium text-gray-500">Căn cước công dân</h3>
                                    <p className="mt-1">{shopData.CCCD || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right section - Additional info */}
                        <div>
                            {/* Owner Information */}
                            <div className="mb-8">
                                <h2 className="text-lg font-medium text-gray-700 mb-4">THÔNG TIN CHỦ SỞ HỮU</h2>
                                
                                {userData ? (
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div className="flex items-center mb-4">
                                            <div className="bg-blue-100 rounded-full p-3 mr-3">
                                                <UserIcon size={24} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{userData.firstName} {userData.lastName}</h3>
                                                <p className="text-sm text-gray-500">{userData.email}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">Số điện thoại</h3>
                                                <p className="mt-1">{userData.phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                                                <p className="mt-1">{userData._id || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center text-gray-500">
                                        Đang tải thông tin chủ sở hữu...
                                    </div>
                                )}
                            </div>

                            {/* Location Information */}
                            <div className="mb-8">
                                <h2 className="text-lg font-medium text-gray-700 mb-4">VỊ TRÍ</h2>
                                
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Quốc gia</h3>
                                            <p className="mt-1">{shopData.nation_id ? 'Việt Nam' : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Tỉnh / Thành phố</h3>
                                            <p className="mt-1">
                                                {provinceData ? provinceData.data_name : (shopData.province_id ? `ID: ${shopData.province_id}` : 'N/A')}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Địa chỉ</h3>
                                        <p className="mt-1">{shopData.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Information */}
                            <div className="mb-8">
                                <h2 className="text-lg font-medium text-gray-700 mb-4">TRẠNG THÁI</h2>
                                
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Trạng thái cửa hàng</h3>
                                            <div className="mt-1">
                                                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                                    shopData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {shopData.status === 'active' ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Tài khoản</h3>
                                            <div className="mt-1">
                                                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                                    shopData.is_active === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {shopData.is_active === 1 ? 'Đang hoạt động' : 'Đã khóa'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="mb-8">
                                <h2 className="text-lg font-medium text-gray-700 mb-4">THỐNG KÊ</h2>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                        <h3 className="text-sm font-medium text-gray-500">Đánh giá</h3>
                                        <p className="mt-1 text-2xl font-semibold">{shopData.rating || 0}/5</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                        <h3 className="text-sm font-medium text-gray-500">Số người theo dõi</h3>
                                        <p className="mt-1 text-2xl font-semibold">{shopData.follower || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="mb-4">
                                <h2 className="text-lg font-medium text-gray-700 mb-4">THỜI GIAN</h2>
                                
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Ngày tạo</h3>
                                            <p className="mt-1">{shopData.created_at ? new Date(shopData.created_at).toLocaleString() : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Cập nhật gần nhất</h3>
                                            <p className="mt-1">{shopData.updated_at ? new Date(shopData.updated_at).toLocaleString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreDetail;