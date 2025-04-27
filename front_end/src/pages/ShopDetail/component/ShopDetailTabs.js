import React, { useState, useEffect } from 'react';
import { Truck, Package, MessageCircle, MapPin, Phone, Mail, Calendar, Award, Star, User, ThumbsUp, ChevronDown, ChevronUp, Store } from 'lucide-react';
import dienthoai from '../../../assets/dienthoai.jpg';
import ApiService from '../../../services/ApiService';
import { BE_API_URL } from '../../../config/config';
import Pagination from '../component/Pagination'; // Import component Pagination

const ShopDetailTabs = ({ shopDetails }) => {
  const [activeTab, setActiveTab] = useState('store');
  const [shopReviews, setShopReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});
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

  // State cho phân trang đánh giá
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [reviewsPerPage] = useState(3); // Chỉ hiển thị 3 đánh giá mỗi trang

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
          
          // Calculate statistics
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
      } catch (error) {
        console.error("Error fetching shop reviews:", error);
        setShopReviews([]);
        setReviewStats({
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
      } finally {
        setLoading(false);
      }
    };

    fetchShopReviews();
  }, [shopDetails]);

  // Toggle expanding/collapsing a review
  const toggleExpandReview = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

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

  // Tính toán chỉ số đánh giá cho trang hiện tại
  const indexOfLastReview = currentReviewPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = shopReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalReviewPages = Math.ceil(shopReviews.length / reviewsPerPage);

  // Xử lý khi chuyển trang đánh giá
  const handleReviewPageChange = (pageNumber) => {
    setCurrentReviewPage(pageNumber);
    window.scrollTo({ top: document.getElementById('reviews-section')?.offsetTop - 100 || 0, behavior: 'smooth' });
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
          </div>
        );
      
      case 'reviews':
        return (
          <div className="py-6" id="reviews-section">
            <div className="bg-white p-5 rounded-lg shadow mb-6">
              <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
                <div className="p-4 border rounded-lg text-center md:w-1/4">
                  <div className="text-3xl font-bold text-gray-800 mb-1">{reviewStats.averageRating.toFixed(1)}</div>
                  <div className="flex justify-center mb-1">
                    {renderStars(reviewStats.averageRating)}
                  </div>
                  <div className="text-sm text-gray-500">Dựa trên {reviewStats.totalReviews} đánh giá</div>
                </div>
                
                <div className="space-y-2 flex-1">
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
                // Display paginated reviews
                <>
                  {currentReviews.map(review => {
                    const isExpanded = expandedReviews[review._id] || false;
                    const hasLongComment = review.comment && review.comment.length > 200;
                    const displayedComment = isExpanded || !hasLongComment ? 
                      review.comment : 
                      `${review.comment.substring(0, 200)}...`;
                    
                    return (
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
                              <div className="mt-2 text-sm text-gray-700">
                                <p>{displayedComment}</p>
                                
                                {hasLongComment && (
                                  <button 
                                    className="text-blue-600 text-sm mt-1 flex items-center"
                                    onClick={() => toggleExpandReview(review._id)}
                                  >
                                    {isExpanded ? (
                                      <>Thu gọn <ChevronUp size={16} className="ml-1" /></>
                                    ) : (
                                      <>Xem thêm <ChevronDown size={16} className="ml-1" /></>
                                    )}
                                  </button>
                                )}
                              </div>
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
                            
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination cho đánh giá */}
                  {shopReviews.length > reviewsPerPage && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={currentReviewPage}
                        totalPages={totalReviewPages}
                        onPageChange={handleReviewPageChange}
                        showingFrom={indexOfFirstReview + 1}
                        showingTo={Math.min(indexOfLastReview, shopReviews.length)}
                        totalItems={shopReviews.length}
                        simplified={true}
                      />
                    </div>
                  )}
                </>
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
          className={`py-3 px-6 font-medium ${activeTab === 'reviews' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('reviews')}
        >
          ĐÁNH GIÁ
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="container mx-auto px-4">
        {loading && activeTab !== 'store' ? (
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