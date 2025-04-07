import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import Sidebar from './Sidebar';
import { 
  Star, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Calendar, 
  User,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ProductReviews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    reviewCount: 0
  });
  
  // State cho bộ lọc
  const [filters, setFilters] = useState({
    productId: '',
    rating: 0,
    sortBy: 'newest',
    startDate: '',
    endDate: ''
  });
  
  // State cho dropdown hiển thị bộ lọc
  const [showFilters, setShowFilters] = useState(false);
  
  // State cho danh sách sản phẩm (để lọc theo sản phẩm)
  const [products, setProducts] = useState([]);
  
  // Lấy thông tin người dùng hiện tại
  const currentUser = AuthService.getCurrentUser();
  
  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser || !currentUser.id) {
        throw new Error('Bạn cần đăng nhập để xem đánh giá');
      }
      
      const response = await ApiService.get(`/product-review/seller/${currentUser.id}`);
      
      setReviews(response.reviews || []);
      setStats(response.stats || {
        totalReviews: 0,
        averageRating: 0,
        reviewCount: 0
      });
      
      setLoading(false);
    } catch (error) {
      setError(error.toString());
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      if (!currentUser || !currentUser.id) return;
      
      // Giả sử bạn có API lấy tất cả sản phẩm theo seller ID
      const response = await ApiService.get(`/product/shop/${currentUser.id}`);
      setProducts(response || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
    }
  };
  
  // Lọc và sắp xếp đánh giá
  const getFilteredReviews = () => {
    let filteredReviews = [...reviews];
    
    // Lọc theo ID sản phẩm
    if (filters.productId) {
      filteredReviews = filteredReviews.filter(
        review => review.product_id._id === filters.productId
      );
    }
    
    // Lọc theo đánh giá sao
    if (filters.rating > 0) {
      filteredReviews = filteredReviews.filter(
        review => review.rating === filters.rating
      );
    }
    
    // Lọc theo ngày bắt đầu
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredReviews = filteredReviews.filter(
        review => new Date(review.created_at) >= startDate
      );
    }
    
    // Lọc theo ngày kết thúc
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filteredReviews = filteredReviews.filter(
        review => new Date(review.created_at) <= endDate
      );
    }
    
    // Sắp xếp đánh giá
    switch (filters.sortBy) {
      case 'newest':
        filteredReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filteredReviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'highest':
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    return filteredReviews;
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      productId: '',
      rating: 0,
      sortBy: 'newest',
      startDate: '',
      endDate: ''
    });
  };
  
  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      );
    }
    return stars;
  };
  
  // Format date to local string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 my-4">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <span>Lỗi: {error}</span>
          </div>
        </div>
      );
    }
    
    const filteredReviews = getFilteredReviews();
    
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Đánh giá sản phẩm</h1>
            <p className="text-gray-600">
              Quản lý tất cả đánh giá từ khách hàng về sản phẩm trong cửa hàng của bạn
            </p>
          </div>
          
          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold mb-1">Tổng số đánh giá</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalReviews}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="text-lg font-semibold mb-1">Đánh giá trung bình</h3>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-yellow-600 mr-2">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
                <div className="flex">
                  {renderStars(Math.round(stats.averageRating || 0))}
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-lg font-semibold mb-1">Đánh giá 5 sao</h3>
              <p className="text-3xl font-bold text-green-600">
                {reviews.filter(review => review.rating === 5).length}
              </p>
            </div>
          </div>
          
          {/* Bộ lọc */}
          <div className="mb-6 border border-gray-200 rounded-lg">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 rounded-t-lg"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div className="flex items-center">
                <Filter size={20} className="mr-2 text-gray-600" />
                <h2 className="text-lg font-medium">Bộ lọc đánh giá</h2>
              </div>
              {showFilters ? (
                <ChevronUp size={20} className="text-gray-600" />
              ) : (
                <ChevronDown size={20} className="text-gray-600" />
              )}
            </div>
            
            {showFilters && (
              <div className="p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sản phẩm
                    </label>
                    <select
                      name="productId"
                      value={filters.productId}
                      onChange={handleFilterChange}
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tất cả sản phẩm</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đánh giá
                    </label>
                    <select
                      name="rating"
                      value={filters.rating}
                      onChange={handleFilterChange}
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">Tất cả đánh giá</option>
                      <option value="5">5 sao</option>
                      <option value="4">4 sao</option>
                      <option value="3">3 sao</option>
                      <option value="2">2 sao</option>
                      <option value="1">1 sao</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sắp xếp theo
                    </label>
                    <select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleFilterChange}
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
                      <option value="highest">Đánh giá cao nhất</option>
                      <option value="lowest">Đánh giá thấp nhất</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
                  >
                    Đặt lại
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Danh sách đánh giá */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">
              Kết quả ({filteredReviews.length} đánh giá)
            </h2>
            
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-center mb-3">
                  <MessageCircle size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-600">Không có đánh giá nào</h3>
                <p className="text-gray-500 mt-2">
                  Hiện tại chưa có đánh giá nào phù hợp với bộ lọc của bạn.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center mb-1">                      
                            {review.product_id.name}                  
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <User size={16} className="mr-1" />
                          <span className="mr-4">
                            {review.user_id.lastName || 'Khách hàng'}
                          </span>
                          <Calendar size={16} className="mr-1" />
                          <span>{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex">
                        {review.rating >= 4 ? (
                          <div className="flex items-center text-green-600 text-sm">
                            <CheckCircle size={16} className="mr-1" />
                            <span>Đánh giá tích cực</span>
                          </div>
                        ) : review.rating <= 2 ? (
                          <div className="flex items-center text-red-600 text-sm">
                            <XCircle size={16} className="mr-1" />
                            <span>Đánh giá tiêu cực</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-600 text-sm">
                            <AlertCircle size={16} className="mr-1" />
                            <span>Đánh giá trung bình</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-0 md:ml-6">
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      
                      {review.product_id.thumbnail && (
                        <div className="mt-2 mb-3">
                          <Link to={`/seller-dashboard/product/${review.product_id._id}`}>
                            <img
                              src={review.product_id.thumbnail}
                              alt={review.product_id.name}
                              className="w-16 h-16 object-cover rounded border border-gray-200"
                            />
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <Link
                        to={`/seller-dashboard/reviews/${review._id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <MessageCircle size={16} className="mr-1" />
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Cấu trúc đã sửa để tránh hai thanh cuộn
  return (
    <div className="flex bg-gray-100">
      {/* Sidebar với chiều cao cố định */}
      <div className="w-64 flex-shrink-0 h-screen">
        <Sidebar onNavigate={(path) => navigate(path)} />
      </div>
      
      {/* Main content - không có overflow */}
      <div className="flex-1 p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProductReviews;