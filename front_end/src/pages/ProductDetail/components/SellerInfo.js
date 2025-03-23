import React from 'react';
import { Check } from 'lucide-react';
import ShopOwner from '../../../assets/ShopOwner.png';

const SellerInfo = ({ shop, seller, product, getShopId }) => {
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
                <div className="flex items-center justify-end">
                    <span className="text-lg font-bold">{shop?.rating || product.rating || '5'}</span>
                    <span className="text-yellow-500 ml-1">★</span>
                </div>
                <p className="text-xs text-gray-500">{product.sold || '0'} đánh giá</p>
            </div>
        </div>
    );
};

export default SellerInfo;