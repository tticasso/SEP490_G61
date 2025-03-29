import React, { useState, useEffect } from 'react';
import ApiService from '../../../services/ApiService';
import { Store, ExternalLink, Trash2 } from 'lucide-react';
import donghoAvatar from '../../../assets/donghoAvatar.jpg';
import { BE_API_URL } from '../../../config/config';

const FollowedShops = () => {
  const [followedShops, setFollowedShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFollowedShops();
  }, []);

  // Hàm lấy đường dẫn ảnh
  const getImagePath = (imgPath) => {
    if (!imgPath) return "";
    // Kiểm tra nếu đường dẫn đã là URL đầy đủ
    if (imgPath.startsWith('http')) return imgPath;
    
    // Xử lý đường dẫn từ backend
    const fileName = imgPath.split("\\").pop().split("/").pop();
    return `${BE_API_URL}/uploads/shops/${fileName}`;
  };

  // Hàm lấy danh sách cửa hàng đã theo dõi
  const fetchFollowedShops = async () => {
    try {
      setLoading(true);
      const shops = await ApiService.get('/shop-follow/followed', true);
      setFollowedShops(shops);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching followed shops:', error);
      setError('Không thể tải danh sách cửa hàng đã theo dõi. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Hàm xử lý bỏ theo dõi cửa hàng
  const handleUnfollowShop = async (shopId) => {
    try {
      await ApiService.delete(`/shop-follow/unfollow/${shopId}`, true);
      
      // Cập nhật lại danh sách sau khi bỏ theo dõi
      setFollowedShops(prevShops => prevShops.filter(shop => shop._id !== shopId));
    } catch (error) {
      console.error('Error unfollowing shop:', error);
      alert('Không thể bỏ theo dõi cửa hàng. Vui lòng thử lại sau.');
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Không rõ";
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Không rõ";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Cửa hàng đã theo dõi</h1>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Cửa hàng đã theo dõi</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchFollowedShops}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cửa hàng đã theo dõi</h1>
      
      {followedShops.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <Store size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Bạn chưa theo dõi cửa hàng nào</p>
          <p className="text-gray-500 text-sm mt-2">Hãy khám phá các cửa hàng để tìm sản phẩm phù hợp</p>
          <a 
            href="/"
            className="inline-block mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Khám phá ngay
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followedShops.map(shop => (
            <div key={shop._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border bg-white flex-shrink-0 mr-4">
                    {shop.logo ? (
                      <img 
                        src={getImagePath(shop.logo)} 
                        alt={shop.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = donghoAvatar;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <Store size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{shop.name}</h3>
                    <p className="text-sm text-gray-500">
                      Tham gia: {formatDate(shop.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Sản phẩm: {shop.total_products || 0}</p>
                  <p>Đã bán: {shop.total_sold || 0} sản phẩm</p>
                  <p>Theo dõi: {shop.follower || 0} người</p>
                </div>

                <div className="mt-4 flex justify-between">
                  <a 
                    href={`/shop-detail?id=${shop._id}`}
                    className="flex items-center text-purple-600 hover:text-purple-700"
                  >
                    <ExternalLink size={16} className="mr-1" />
                    <span>Xem shop</span>
                  </a>
                  
                  <button
                    onClick={() => handleUnfollowShop(shop._id)}
                    className="flex items-center text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} className="mr-1" />
                    <span>Bỏ theo dõi</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowedShops;