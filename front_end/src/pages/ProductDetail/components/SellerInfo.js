import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import ShopOwner from '../../../assets/ShopOwner.png';
import ApiService from '../../../services/ApiService';

const SellerInfo = ({ shop, seller, product, getShopId }) => {
    const [shopReviewCount, setShopReviewCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch shop review count on component mount
    useEffect(() => {
        const fetchShopReviews = async () => {
            if (!shop || !shop.user_id) return;
            
            setLoading(true);
            try {
                // Fetch reviews for this seller/shop
                const reviews = await ApiService.get(`/product-review/seller/${shop.user_id}`, false);
                
                // If the response is an array, count the reviews
                if (Array.isArray(reviews)) {
                    setShopReviewCount(reviews.length);
                } else if (reviews && reviews.reviews && Array.isArray(reviews.reviews)) {
                    // Handle case where API returns an object with reviews array
                    setShopReviewCount(reviews.reviews.length);
                } else if (reviews && reviews.stats && reviews.stats.totalReviews) {
                    // Handle case where API returns stats object
                    setShopReviewCount(reviews.stats.totalReviews);
                }
            } catch (error) {
                console.error("Error fetching shop reviews:", error);
                setShopReviewCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchShopReviews();
    }, [shop]);

    // Get the rating to display (using shop rating if available)
    const displayRating = shop?.rating || (product?.rating || 0).toFixed(1);

    return (
        <div className="flex items-center justify-between border rounded-lg p-3 mb-4">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                    <a href={`/shop-detail?id=${getShopId()}`}>
                        <img 
                            src={shop?.logo || ShopOwner} 
                            alt="Seller avatar" 
                            className="w-full h-full object-cover" 
                        />
                    </a>
                </div>
                <div>
                    <div className="flex items-center">
                        <a href={`/shop-detail?id=${getShopId()}`} className="font-medium text-sm">
                            {shop ? shop.name : (seller ? `${seller.firstName || ''} ${seller.lastName || ''}` : 'Shop name')}
                        </a>
                        <Check size={14} className="ml-1 text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-500">
                        {shop?.created_at ? `Thành viên từ ${new Date(shop.created_at).getFullYear()}` : 'Thành viên'}
                    </p>
                    <p className="text-xs text-gray-500">* Giao dịch đã được xác minh</p>
                </div>
            </div>
            <div className="text-right border-l-[2px] pl-4">
                <p className="text-xs text-gray-500">
                    {loading ? 'Đang tải...' : `${shopReviewCount} đánh giá`}
                </p>
            </div>
        </div>
    );
};

export default SellerInfo;