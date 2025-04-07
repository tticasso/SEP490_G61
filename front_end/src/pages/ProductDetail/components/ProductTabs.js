import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, ThumbsUp, ChevronDown, ChevronUp, Store } from 'lucide-react';
import ApiService from '../../../services/ApiService';

const ProductTabs = ({ activeTab, setActiveTab, product, variants, formatPrice, safeRender }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ratingStats, setRatingStats] = useState({
        average: 0,
        total: 0,
        distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        }
    });
    const [expandedReviews, setExpandedReviews] = useState({});

    // Fetch reviews when product changes or when review tab is selected
    useEffect(() => {
        if (product && product._id && activeTab === 'reviews') {
            fetchProductReviews(product._id);
        }
    }, [product, activeTab]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('vi-VN', options);
        } catch (error) {
            return dateString;
        }
    };

    // Fetch product reviews from API
    const fetchProductReviews = async (productId) => {
        try {
            setLoading(true);
            const response = await ApiService.get(`/product-review/product/${productId}`, false);
            
            if (response) {
                setReviews(response);
                console.log("du lieu: ", reviews);
                
                // Calculate rating statistics
                const total = response.length;
                const sum = response.reduce((acc, review) => acc + review.rating, 0);
                const average = total > 0 ? sum / total : 0;
                
                // Calculate distribution
                const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                response.forEach(review => {
                    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
                });
                
                setRatingStats({
                    average: parseFloat(average.toFixed(1)),
                    total,
                    distribution
                });
            }
            
            setLoading(false);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError("Không thể tải đánh giá sản phẩm");
            setLoading(false);
        }
    };

    // Toggle expanding/collapsing a review
    const toggleExpandReview = (reviewId) => {
        setExpandedReviews(prev => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }));
    };

    // Render stars
    const renderStars = (rating) => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star}
                        size={16} 
                        fill={star <= rating ? "#FBBF24" : "none"}
                        stroke={star <= rating ? "#FBBF24" : "#CBD5E0"}
                    />
                ))}
            </div>
        );
    };

    const renderTabContent = () => {
        if (!product) return null;

        switch (activeTab) {
            case 'details':
                return (
                    <div className="py-6">
                        <h2 className="font-bold text-lg mb-4">{safeRender(product.name)}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Thông số kỹ thuật:</h3>
                                <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: safeRender(product.detail, 'Không có thông tin chi tiết') }}></div>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Mô tả sản phẩm:</h3>
                                <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: safeRender(product.description, 'Không có mô tả') }}></div>
                            </div>
                            {product.condition && (
                                <div>
                                    <h3 className="font-medium mb-2">Tình trạng:</h3>
                                    <p className="text-sm text-gray-700">{product.condition}</p>
                                </div>
                            )}

                            {/* Product variants information */}
                            {variants.length > 0 && (
                                <div>
                                    <h3 className="font-medium mb-2">Biến thể sản phẩm:</h3>
                                    <div className="text-sm text-gray-700">
                                        <p>Sản phẩm có {variants.length} biến thể:</p>
                                        <ul className="list-disc ml-5 mt-2">
                                            {variants.map((variant, index) => {
                                                // Extract attributes for display
                                                let attributeText = '';
                                                if (variant.attributes) {
                                                    const attributes = variant.attributes instanceof Map ? 
                                                        Object.fromEntries(variant.attributes) : 
                                                        variant.attributes;
                                                    
                                                    attributeText = Object.entries(attributes)
                                                        .map(([key, value]) => `${key}: ${value}`)
                                                        .join(', ');
                                                }
                                                
                                                return (
                                                    <li key={variant._id || index} className="mb-1">
                                                        <span className="font-medium">{variant.name}</span> - 
                                                        {attributeText && <span> {attributeText},</span>} 
                                                        <span> Giá: {formatPrice(variant.price)}</span>
                                                        {variant.is_default && <span className="text-green-600"> (Mặc định)</span>}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'shipping':
                return (
                    <div className="py-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold mb-3">VẬN CHUYỂN</h3>
                                <p className="text-sm text-gray-700">Miễn phí vận chuyển mặt đất trong vòng 1 đến 7 ngày làm việc. Nhận hàng tại cửa hàng trong vòng 1 đến 7 ngày làm việc. Tùy chọn giao hàng vào ngày hôm sau và chuyển phát nhanh cũng có sẵn.</p>
                                <p className="text-sm text-gray-700 mt-2">Xem Câu hỏi thường gặp về giao hàng để biết chi tiết về phương thức vận chuyển, chi phí và thời gian giao hàng.</p>
                            </div>

                            <div>
                                <h3 className="font-bold mb-3">TRẢ LẠI VÀ ĐỔI HÀNG</h3>
                                <p className="text-sm text-gray-700">Dễ dàng và miễn phí, trong vòng 14 ngày. Xem các điều kiện và thủ tục trong Câu hỏi thường gặp về việc hoàn trả của chúng tôi.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'reviews':
                return (
                    <div className="py-6">
                        {/* Rating Summary */}
                        <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
                            <div className="p-4 border rounded-lg text-center md:w-1/4">
                                <div className="text-3xl font-bold text-gray-800 mb-1">{ratingStats.average}</div>
                                <div className="flex justify-center mb-1">
                                    {renderStars(ratingStats.average)}
                                </div>
                                <div className="text-sm text-gray-500">Dựa trên {ratingStats.total} đánh giá</div>
                            </div>
                            
                            <div className="space-y-2 flex-1">
                                {[5, 4, 3, 2, 1].map(rating => {
                                    const count = ratingStats.distribution[rating] || 0;
                                    const percentage = ratingStats.total > 0 ? Math.round((count / ratingStats.total) * 100) : 0;
                                    
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

                        {/* Reviews List */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">Đánh giá từ khách hàng</h3>
                            
                            {loading ? (
                                <div className="flex justify-center items-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                                </div>
                            ) : error ? (
                                <div className="text-red-500 text-center p-4">{error}</div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-8 border rounded-lg">
                                    <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">Sản phẩm này chưa có đánh giá nào</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map(review => {
                                        const isExpanded = expandedReviews[review._id] || false;
                                        const hasLongComment = review.comment && review.comment.length > 200;
                                        const displayedComment = isExpanded || !hasLongComment ? 
                                            review.comment : 
                                            `${review.comment.substring(0, 200)}...`;
                                        
                                        return (
                                            <div key={review._id} className="border rounded-lg p-4">
                                                {/* Review Header - User info and rating */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                            <User size={20} className="text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {review.user_id ? 
                                                                    (review.user_id.lastName && review.user_id.firstName) ?
                                                                    `${review.user_id.lastName} ${review.user_id.firstName}` :
                                                                    (review.user_id.lastName || review.user_id.firstName || 'Người dùng') : 
                                                                    'Người dùng ẩn danh'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {formatDate(review.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                </div>
                                                
                                                {/* Review Content */}
                                                <div className="mb-3">
                                                    <p className="text-gray-700">{displayedComment}</p>
                                                    
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
                                                
                                                {/* Seller Reply */}
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
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white mt-6 rounded-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b">
                <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'details' ? 'text-indigo-600 border-indigo-600' : 'text-gray-600 border-transparent'}`}
                    onClick={() => setActiveTab('details')}
                >
                    CHI TIẾT SẢN PHẨM
                </button>
                <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'shipping' ? 'text-indigo-600 border-indigo-600' : 'text-gray-600 border-transparent'}`}
                    onClick={() => setActiveTab('shipping')}
                >
                    VẬN CHUYỂN & TRẢ HÀNG
                </button>
                <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'reviews' ? 'text-indigo-600 border-indigo-600' : 'text-gray-600 border-transparent'}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    ĐÁNH GIÁ
                </button>
            </div>

            {/* Tab Content */}
            <div className="px-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default ProductTabs;