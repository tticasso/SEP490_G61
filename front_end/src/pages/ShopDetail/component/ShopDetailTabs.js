import React, { useState, useEffect } from 'react';
import { Truck, Package, MessageCircle, MapPin, Phone, Mail, Calendar, Award, Star, User, ThumbsUp, ChevronDown, ChevronUp, Store } from 'lucide-react';
import dienthoai from '../../../assets/dienthoai.jpg';
import ApiService from '../../../services/ApiService';
import { BE_API_URL } from '../../../config/config';

const ShopDetailTabs = ({ shopDetails }) => {
  const [activeTab, setActiveTab] = useState('store');
  const [shopReviews, setShopReviews] = useState([]);
  const [shopActivities, setShopActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    distribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  // Utility function to get image path
  const getImagePath = (imgPath) => {
    if (!imgPath) return "";
    // Kiểm tra nếu imgPath đã là URL đầy đủ
    if (imgPath.startsWith('http')) return imgPath;
    // Kiểm tra nếu imgPath là đường dẫn tương đối
    if (imgPath.startsWith('/uploads')) return `${BE_API_URL}${imgPath}`;
    
    // Kiểm tra nếu đường dẫn có chứa "shops" để xử lý ảnh shop
    if (imgPath.includes('shops')) {
        const fileName = imgPath.split("\\").pop();
        return `${BE_API_URL}/uploads/shops/${fileName}`;
    }
    
    // Trường hợp imgPath là đường dẫn từ backend cho sản phẩm
    const fileName = imgPath.split("\\").pop();
    return `${BE_API_URL}/uploads/products/${fileName}`;
  };

  useEffect(() => {
    // Fetch shop reviews if available and shop details is provided
    const fetchShopReviews = async () => {
      if (!shopDetails || !shopDetails.user_id) return;
      
      setLoading(true);
      try {
        const shopUserId = shopDetails.user_id;
        
        // Use the product-review API endpoint to fetch seller reviews
        const reviewsData = await ApiService.get(`/product-review/seller/${shopUserId}`, false);
        
        if (reviewsData) {
          // Handle both response formats (object with reviews or direct array)
          const reviews = reviewsData.reviews || (Array.isArray(reviewsData) ? reviewsData : []);
          setShopReviews(reviews);
          
          // Calculate statistics based on API response
          if (reviewsData.stats) {
            setReviewStats({
              totalReviews: reviewsData.stats.totalReviews || reviews.length,
              averageRating: reviewsData.stats.averageRating || 0,
              distribution: calculateDistribution(reviews)
            });
          } else {
            // Calculate stats manually if not provided by API
            const totalReviews = reviews.length;
            const avgRating = totalReviews > 0 
              ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
              : 0;
              
            setReviewStats({
              totalReviews,
              averageRating: parseFloat(avgRating.toFixed(1)),
              distribution: calculateDistribution(reviews)
            });
          }
        }
      } catch (error) {
        console.error("Error fetching shop reviews:", error);
        // Fall back to sample data
        fetchShopReviews();
      } finally {
        setLoading(false);
      }
    };

    fetchShopReviews();
  }, [shopDetails]);

  // Helper function to calculate rating distribution
  const calculateDistribution = (reviews) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[Math.floor(review.rating)] = (distribution[Math.floor(review.rating)] || 0) + 1;
      }
    });
    return distribution;
  };

  // Sample reviews data as fallback
 

  // Rendering the stars for ratings
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
      </div>
    );
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Không rõ";
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch (error) {
      return "Không rõ";
    }
  };

  // Hàm tính khoảng thời gian từ ngày cụ thể đến hiện tại
  const getTimeAgo = (dateString) => {
    if (!dateString) return "Không rõ";
    
    try {
      const now = new Date();
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Không rõ";
      }
      
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHour / 24);
      
      if (diffSec < 60) {
        return "Vừa xong";
      } else if (diffMin < 60) {
        return `${diffMin} phút trước`;
      } else if (diffHour < 24) {
        return `${diffHour} giờ trước`;
      } else if (diffDays < 30) {
        return `${diffDays} ngày trước`;
      } else {
        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths} tháng trước`;
      }
    } catch (error) {
      console.error("Time ago calculation error:", error);
      return "Không rõ";
    }
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'store':
        return (
          <div className="py-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Giới thiệu</h3>
                <div className="bg-white p-5 rounded-lg shadow">
                  <p className="text-sm text-gray-700 mb-4">
                    {shopDetails.description || 
                      `Giới thiệu về ${shopDetails.name || 'Shop'}!
                      Ra đời vào năm ${new Date(shopDetails.created_at || Date.now()).getFullYear()}, 
                      ${shopDetails.name || 'Shop'} đã sớm có một vị trí vững chắc trên thị trường bán lẻ, 
                      trở thành địa chỉ tin cậy cho người tiêu dùng...`
                    }
                  </p>
                  <a href="#" className="text-blue-500 text-sm hover:underline">Xem thêm</a>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="text-sm">{shopDetails.address || 'Chưa cập nhật địa chỉ'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <span className="text-sm">
                        {shopDetails.phone ? 
                          `${shopDetails.phone.substring(0, 6)}***** ` : 
                          'Chưa cập nhật số điện thoại '}
                        <button className="text-blue-500 hover:underline">Hiện số</button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Chính sách cửa hàng</h3>
                <div className="bg-white p-5 rounded-lg shadow">
                  <ul className="space-y-4">
                    <li className="flex">
                      <div className="mr-3">
                        <Truck className="text-yellow-500 w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Miễn phí vận chuyển nội thành</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="mr-3">
                        <Package className="text-yellow-500 w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Bảo hành 6 tháng phần cứng</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="mr-3">
                        <Calendar className="text-yellow-500 w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Đổi trả hàng 1 đổi 1 trong 7 ngày</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="mr-3">
                        <Award className="text-yellow-500 w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Trợ giá thu cũ lên đời mới</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Hoạt động</h3>
              <div className="bg-white p-5 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="relative aspect-video">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s" alt="Activity" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center mb-2">
                        <img src={shopDetails.logo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s"} alt={shopDetails.name} className="w-8 h-8 rounded-full mr-2" />
                        <div>
                          <p className="font-medium text-sm">{shopDetails.name}</p>
                          <p className="text-xs text-gray-500">5 tháng trước</p>
                        </div>
                      </div>
                      <p className="text-sm">Dành cho Anh em nào thích Newseal cực đỉnh a 🔥</p>
                      <p className="text-sm font-medium mt-1">IQOO 12 Newseal 12GB/256GB...</p>
                      <a href="#" className="text-blue-500 text-xs hover:underline">Xem thêm</a>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="relative aspect-video">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOkAOihqSfSXvbaLKoTy83L4QOmjEEUokWAQ&s" alt="Activity" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center mb-2">
                        <img src={shopDetails.logo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s"} alt={shopDetails.name} className="w-8 h-8 rounded-full mr-2" />
                        <div>
                          <p className="font-medium text-sm">{shopDetails.name}</p>
                          <p className="text-xs text-gray-500">6 tháng trước</p>
                        </div>
                      </div>
                      <p className="text-sm">shop hôm nay về hàng</p>
                      <p className="text-sm font-medium mt-1">Điện thoại Vivo iQOO Z9x - New Fullbox</p>
                      <a href="#" className="text-blue-500 text-xs hover:underline">Xem thêm</a>
                    </div>
                  </div>
                </div>
                
                <div className="text-right mt-4">
                  <a href="#" className="text-sm text-gray-500 hover:underline flex items-center justify-end">
                    Xem tất cả
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'activity':
        return (
          <div className="py-6">
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg shadow">
                <div className="flex items-start">
                  <img src={shopDetails.logo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s"} alt={shopDetails.name} className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="font-medium">{shopDetails.name}</p>
                      <span className="mx-2 text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">5 tháng trước</span>
                    </div>
                    <p className="mt-2">Dành cho Anh em nào thích Newseal cực đỉnh a 🔥</p>
                    <p className="font-medium mt-1">IQOO 12 Newseal 12GB/256GB... <span className="text-blue-500 hover:underline cursor-pointer">Xem thêm</span></p>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s" alt="Product" className="w-full h-48 object-cover rounded" />
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFRCBvaaUuSoLQC9AlVJtoyndVDuHHmyZxIw&s" alt="Product" className="w-full h-48 object-cover rounded" />
                    </div>
                    
                    <div className="mt-3 flex items-center">
                      <button className="flex items-center text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>2</span>
                      </button>
                      
                      <button className="flex items-center text-gray-500 hover:text-gray-700 ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span>1 Bình luận</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow">
                <div className="flex items-start">
                  <img src={shopDetails.logo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mdufqxZiFh_R5UBFHbygA7H9x4eUSf-IKA&s"} alt={shopDetails.name} className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="font-medium">{shopDetails.name}</p>
                      <span className="mx-2 text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">6 tháng trước</span>
                    </div>
                    <p className="mt-2">shop hôm nay về hàng</p>
                    <p className="font-medium mt-1">Điện thoại Vivo iQOO Z9x - New Fullbox <span className="text-blue-500 hover:underline cursor-pointer">Xem thêm</span></p>
                    
                    <div className="mt-3">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFRCBvaaUuSoLQC9AlVJtoyndVDuHHmyZxIw&s" alt="Product" className="w-full h-64 object-cover rounded" />
                    </div>
                    
                    <div className="mt-3 flex items-center">
                      <button className="flex items-center text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>0</span>
                      </button>
                      
                      <button className="flex items-center text-gray-500 hover:text-gray-700 ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span>0 Bình luận</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'reviews':
        return (
          <div className="py-6">
            <div className="bg-white p-5 rounded-lg shadow mb-6">
              <div className="flex items-center mb-4">
                <div className="text-3xl font-bold mr-2">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                {renderStars(reviewStats.averageRating)}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Sản phẩm giá tốt (15)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Chất lượng sản phẩm tốt (13)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Đúng hẹn (12)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Giao tiếp lịch sự, thân thiện (19)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Đáng tin cậy (16)
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm">
                  Mô tả sản phẩm đúng (15)
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex border-b border-gray-200">
                  <button className="py-2 px-4 font-medium border-b-2 border-orange-500 text-orange-500">
                    TẤT CẢ ({reviewStats.totalReviews})
                  </button>
                  <button className="py-2 px-4 font-medium text-gray-500">
                    TỪ NGƯỜI MUA ({reviewStats.totalReviews})
                  </button>
                  <button className="py-2 px-4 font-medium text-gray-500">
                    TỪ NGƯỜI BÁN (0)
                  </button>
                </div>
              </div>
              
              {/* Rating distribution */}
              <div className="space-y-2 flex-1 mt-4">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = reviewStats.distribution[rating] || 0;
                  const percentage = reviewStats.totalReviews > 0 
                    ? Math.round((count / reviewStats.totalReviews) * 100) 
                    : 0;
                  
                  return (
                    <div key={rating} className="flex items-center">
                      <div className="w-10 flex items-center">
                        <span>{rating}</span>
                        <Star className="h-4 w-4 text-yellow-400 ml-1" fill="#FBBF24" />
                      </div>
                      <div className="flex-grow h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-10 text-right text-gray-500">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : shopReviews.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-500">Chưa có đánh giá nào cho shop này</p>
                </div>
              ) : (
                // Display reviews from API
                shopReviews.map(review => (
                  <div key={review._id || review.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-start">
                      <div className="mr-3">
                        {review.avatar ? (
                          <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                            {review.avatar}
                          </div>
                        ) : (
                          <img 
                            src={`https://ui-avatars.com/api/?name=${review.user_id?.lastName || review.username || 'User'}&background=random`} 
                            alt={review.user_id?.lastName || review.username || 'User'} 
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium">
                            {review.user_id ? 
                              `${review.user_id.firstName || ''} ${review.user_id.lastName || ''}` : 
                              review.username || 'Khách hàng'}
                          </h4>
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="text-gray-500 text-sm">
                            {review.date || getTimeAgo(review.created_at)}
                          </span>
                        </div>
                        
                        <div className="mt-1">
                          {renderStars(review.rating)}
                        </div>
                        
                        {/* Product information */}
                        {(review.product_id) && (
                          <div className="mt-3 flex items-start border-t border-gray-100 pt-3">
                            <img 
                              src={getImagePath(review.product_id.thumbnail) || review.productImage || dienthoai} 
                              alt={review.product_id.name || review.product || 'Sản phẩm'} 
                              className="w-16 h-16 object-cover rounded mr-3"
                            />
                            <div>
                              <p className="text-sm">{review.product_id.name || review.product || 'Sản phẩm'}</p>
                              <p className="text-red-500 font-medium">
                                {review.price || (review.product_id?.price ? 
                                  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                    .format(review.product_id.price).replace('₫', 'đ') : 
                                  '')}
                              </p>
                              <a 
                                href={`/product-detail?id=${review.product_id._id}`} 
                                className="text-blue-500 text-xs hover:underline"
                              >
                                Xem sản phẩm
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {/* Review comment */}
                        {(review.comment || review.content) && (
                          <p className="mt-2 text-sm text-gray-700">{review.comment || review.content}</p>
                        )}
                        
                        {/* Tags if available */}
                        {review.tags && review.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {review.tags.map((tag, index) => (
                              <span key={index} className="bg-gray-100 text-xs px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Seller reply if exists */}
                        {review.reply && review.reply.text && (
                          <div className="bg-gray-50 p-3 rounded-md mt-3">
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                <Store size={14} className="text-blue-600" />
                              </div>
                              <div className="text-sm font-medium">Phản hồi từ người bán</div>
                              <div className="text-xs text-gray-500 ml-2">
                                {formatDate(review.reply.created_at)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{review.reply.text}</p>
                          </div>
                        )}
                        
                        {/* Review Actions */}
                        <div className="mt-3 flex justify-end">
                          <button className="text-gray-500 text-sm flex items-center">
                            <ThumbsUp size={14} className="mr-1" /> Hữu ích
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="mt-6 bg-[#E7E9EA]">
      {/* Tab Navigation */}
      <div className="flex border-b bg-white">
        <button 
          className={`py-3 px-6 font-medium ${activeTab === 'store' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('store')}
        >
          CỬA HÀNG
        </button>
        <button 
          className={`py-3 px-6 font-medium ${activeTab === 'activity' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('activity')}
        >
          HOẠT ĐỘNG
        </button>
        <button 
          className={`py-3 px-6 font-medium ${activeTab === 'reviews' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('reviews')}
        >
          ĐÁNH GIÁ
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="py-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default ShopDetailTabs;