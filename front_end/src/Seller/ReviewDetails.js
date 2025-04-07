import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import Sidebar from './Sidebar'; // Import Sidebar component
import {
    Star,
    ArrowLeft,
    Share2,
    MessageCircle,
    User,
    Calendar,
    ShoppingBag,
    AlertCircle,
    Edit,
    Trash2,
    CheckCircle
} from 'lucide-react';

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [review, setReview] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchReviewDetail();
    }, [id]);

    const fetchReviewDetail = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get(`/product-review/${id}`);
            setReview(response);
            // Nếu đã có reply, cập nhật replyText để chỉnh sửa
            if (response.reply && response.reply.text) {
                setReplyText(response.reply.text);
            }
            setLoading(false);
        } catch (error) {
            setError('Không thể tải thông tin đánh giá: ' + error.toString());
            setLoading(false);
        }
    };

    // Hàm gửi phản hồi đến đánh giá
    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setSubmitLoading(true);
            
            // Xác định xem đây là tạo mới hay cập nhật phản hồi
            const isNewReply = !review.reply || !review.reply.text;
            const endpoint = `/product-review/reply/${id}`;
            const method = isNewReply ? 'post' : 'put';
            
            // Gọi API để tạo mới hoặc cập nhật phản hồi
            const response = await ApiService[method](endpoint, { replyText });
            
            // Cập nhật state với dữ liệu mới
            setReview(response);
            setSuccessMessage(isNewReply ? 'Đã gửi phản hồi thành công!' : 'Đã cập nhật phản hồi thành công!');
            setIsEditing(false);
            
            // Ẩn thông báo thành công sau 3 giây
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
            setSubmitLoading(false);
        } catch (error) {
            setError('Lỗi khi gửi phản hồi: ' + error.toString());
            setSubmitLoading(false);
        }
    };

    // Hàm xóa phản hồi
    const handleDeleteReply = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phản hồi này không?')) {
            return;
        }

        try {
            setSubmitLoading(true);
            await ApiService.delete(`/product-review/reply/${id}`);
            
            // Cập nhật state
            const updatedReview = {...review};
            delete updatedReview.reply;
            setReview(updatedReview);
            setReplyText('');
            setSuccessMessage('Đã xóa phản hồi thành công!');
            
            // Ẩn thông báo thành công sau 3 giây
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            
            setSubmitLoading(false);
        } catch (error) {
            setError('Lỗi khi xóa phản hồi: ' + error.toString());
            setSubmitLoading(false);
        }
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
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Render existing reply
    const renderExistingReply = () => {
        if (!review.reply || !review.reply.text) return null;

        return (
            <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-start">
                    <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                        <MessageCircle size={16} className="mr-1" />
                        Phản hồi của bạn:
                    </h3>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-100"
                            title="Chỉnh sửa phản hồi"
                        >
                            <Edit size={16} />
                        </button>
                        <button 
                            onClick={handleDeleteReply} 
                            className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-100"
                            title="Xóa phản hồi"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
                <p className="text-gray-700">{review.reply.text}</p>
                <div className="text-sm text-gray-500 mt-2">
                    {review.reply.updated_at && (
                        <span>{formatDate(review.reply.updated_at)}</span>
                    )}
                </div>
            </div>
        );
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
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => navigate('/seller-dashboard/reviews')}
                        className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                    >
                        Quay lại danh sách đánh giá
                    </button>
                </div>
            );
        }

        if (!review) return null;

        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate('/seller-dashboard/reviews')}
                        className="mr-3 p-2 rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">Chi tiết đánh giá</h1>
                </div>

                {/* Thông báo thành công */}
                {successMessage && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 flex items-center">
                        <CheckCircle size={20} className="mr-2" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Thông tin đánh giá */}
                <div className="mb-6 border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div className="mb-4 md:mb-0">
                            <div className="flex items-center mb-2">
                                <User size={20} className="text-gray-500 mr-2" />
                                <span className="font-medium text-gray-800">
                                    {review.user_id.lastName || 'Khách hàng'}
                                </span>
                            </div>

                            <div className="flex items-center mb-2">
                                <Calendar size={20} className="text-gray-500 mr-2" />
                                <span className="text-gray-600">
                                    {formatDate(review.created_at)}
                                </span>
                            </div>

                            <div className="flex items-center">
                                <ShoppingBag size={20} className="text-gray-500 mr-2" />
                                <span className="text-gray-800">
                                    {review.product_id.name}
                                </span>
                            </div>
                        </div>

                        <div className="border-t pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6">
                            <div className="mb-2">
                                <span className="font-medium text-gray-700 mr-2">Đánh giá:</span>
                                <div className="flex ml-1 mt-1">
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            <div>
                                <span className="font-medium text-gray-700">Thời gian:</span>
                                <span className="ml-2 text-gray-600">
                                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-medium text-gray-800 mb-2">Nội dung đánh giá:</h3>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-700">{review.comment || 'Khách hàng không để lại bình luận.'}</p>
                        </div>
                    </div>

                    {/* Hiển thị phản hồi hiện tại nếu có và không đang trong chế độ chỉnh sửa */}
                    {!isEditing && renderExistingReply()}

                    {review.product_id.thumbnail && (
                        <div className="mt-4">
                            <h3 className="font-medium text-gray-800 mb-2">Sản phẩm:</h3>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <img
                                    src={review.product_id.thumbnail}
                                    alt={review.product_id.name}
                                    className="w-16 h-16 object-cover rounded mr-3"
                                />
                                <div>
                                    <h4 className="font-medium">{review.product_id.name}</h4>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Phần phản hồi đánh giá - Hiển thị form khi không có phản hồi hoặc đang trong chế độ chỉnh sửa */}
                {(isEditing || !review.reply || !review.reply.text) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <MessageCircle size={20} className="mr-2" />
                            {isEditing ? 'Chỉnh sửa phản hồi' : 'Phản hồi đánh giá'}
                        </h2>

                        <form onSubmit={handleSubmitReply}>
                            <div className="mb-4">
                                <label
                                    htmlFor="replyText"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    {isEditing ? 'Cập nhật phản hồi của bạn' : 'Phản hồi của bạn'}
                                </label>
                                <textarea
                                    id="replyText"
                                    rows="4"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Nhập phản hồi của bạn đối với đánh giá này..."
                                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    disabled={submitLoading}
                                ></textarea>
                                <p className="text-sm text-gray-500 mt-1">
                                    Phản hồi của bạn sẽ hiển thị công khai trên đánh giá này
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isEditing) {
                                            setIsEditing(false);
                                            // Khôi phục nội dung cũ nếu đang chỉnh sửa
                                            if (review.reply && review.reply.text) {
                                                setReplyText(review.reply.text);
                                            }
                                        } else {
                                            setReplyText('');
                                        }
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2"
                                    disabled={submitLoading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                    disabled={!replyText.trim() || submitLoading}
                                >
                                    {submitLoading && (
                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    )}
                                    {isEditing ? 'Cập nhật' : 'Gửi phản hồi'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Các hành động khác */}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={() => navigate('/seller-dashboard/reviews')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Quay lại danh sách
                    </button>

                    {/* <div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Đã sao chép đường dẫn!');
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 mr-2 flex items-center"
                        >
                            <Share2 size={16} className="mr-1" />
                            Chia sẻ
                        </button>
                    </div> */}
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
    {/* Sidebar */}
    <Sidebar onNavigate={(path) => navigate(path)} />
    
    {/* Main content area - ensure this is the ONLY scrollable container */}
    <div className="flex-1 overflow-auto"> {/* Remove nested flex-col */}
      <div className="p-6"> {/* Remove flex-1 from here */}
        {renderContent()}
      </div>
    </div>
  </div>
    );
};

export default ReviewDetail;