import React, { useState, useEffect } from 'react';
import { X, Star, AlertTriangle } from 'lucide-react';
import ApiService from '../../../services/ApiService';

const ReviewPopup = ({ product, onClose, orderId, sellerId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Danh sách từ ngữ thô tục, tiêu cực cần lọc
  const inappropriateWords = [
    'đụ', 'địt', 'đm', 'đéo', 'lồn', 'cặc', 'buồi', 'dái', 'chó', 'súc vật', 
    'ngu', 'đần', 'khùng', 'điên', 'chết', 'loz', 'lìn', 'cứt', 'shit', 'fuck', 
    'bitch', 'asshole', 'cunt', 'stupid', 'idiot', 'retard', 'dumbass', 'cock', 'dick', 'pussy'
  ];

  // Kiểm tra nội dung bình luận
  const validateComment = (text) => {
    if (!text || text.trim().length < 5) {
      return 'Bình luận phải có ít nhất 5 ký tự';
    }

    if (text.trim().length > 500) {
      return 'Bình luận không được vượt quá 500 ký tự';
    }

    // Kiểm tra từ ngữ thô tục
    const lowercaseText = text.toLowerCase();
    for (const word of inappropriateWords) {
      if (lowercaseText.includes(word.toLowerCase())) {
        return 'Bình luận chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại.';
      }
    }

    // Kiểm tra nội dung quá tiêu cực (có thể tối ưu thêm)
    const negativePatterns = [
      /tệ nhất/, /ghét nhất/, /tởm/, /kinh tởm/, /chán nản/, /thất vọng tột độ/,
      /không bao giờ/, /tệ hại/, /rác rưởi/, /lừa đảo/, /scam/, /lừa đảo/, /trả lại/
    ];

    for (const pattern of negativePatterns) {
      if (pattern.test(lowercaseText)) {
        return 'Vui lòng sử dụng ngôn ngữ tích cực và mang tính xây dựng hơn.';
      }
    }

    return null;
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    setCommentError(validateComment(newComment));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra rating
    if (rating < 1 || rating > 5) {
      setError('Vui lòng chọn đánh giá từ 1 đến 5 sao');
      return;
    }

    // Kiểm tra comment
    const commentValidationError = validateComment(comment);
    if (commentValidationError) {
      setCommentError(commentValidationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Chuẩn bị dữ liệu đánh giá
      const reviewData = {
        product_id: product._id, 
        seller_id: sellerId,
        rating,
        comment
      };

      // Gọi API để tạo đánh giá
      await ApiService.post('/product-review/create', reviewData);

      // Cập nhật trạng thái và hiển thị thông báo thành công
      setSubmitted(true);
      
      // Thông báo cho component cha rằng đánh giá đã được gửi
      if (onReviewSubmitted) {
        onReviewSubmitted(product._id);
      }

      // Tự động đóng sau 2 giây
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Đánh giá sản phẩm</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cảm ơn bạn đã đánh giá!</h3>
            <p className="text-gray-600">Đánh giá của bạn đã được ghi nhận thành công.</p>
          </div>
        ) : (
          <>
            {/* Product Info */}
            <div className="p-4 border-b">
              <div className="flex items-center">
                <div className="w-16 h-16 flex-shrink-0">
                  <img 
                    src={product?.thumbnail || product?.image || '/placeholder-product.png'} 
                    alt={product?.name || "Sản phẩm"}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">{product?.name || "Sản phẩm"}</h3>
                  <p className="text-sm text-gray-500">Mã đơn hàng: {orderId}</p>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <form onSubmit={handleSubmit} className="p-4">
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Chọn đánh giá của bạn</label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={32} 
                      onClick={() => setRating(star)}
                      fill={star <= rating ? "#FFD700" : "none"}
                      stroke={star <= rating ? "#FFD700" : "#CBD5E0"}
                      className="cursor-pointer"
                    />
                  ))}
                  <span className="ml-2 text-gray-600">{rating}/5</span>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
                  Nhận xét của bạn
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  className={`w-full px-3 py-2 border rounded-md ${commentError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  value={comment}
                  onChange={handleCommentChange}
                ></textarea>
                {commentError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle size={16} className="mr-1" />
                    {commentError}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {comment.length}/500 ký tự
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md mr-2 text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                  disabled={loading || commentError !== null}
                >
                  {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewPopup;