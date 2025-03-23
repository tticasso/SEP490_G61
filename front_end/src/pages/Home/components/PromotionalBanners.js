import React from 'react';
import clothesBanner from '../../../assets/clothesBanner.jpg';
import phoneBanner from '../../../assets/phoneBanner.jpg';
import clockBanner from '../../../assets/clockBanner.jpg';

const PromotionalBanners = () => {
    return (
        <div className="grid grid-cols-3 gap-4 mt-6">
            {/* Clothes Banner */}
            <div className="bg-indigo-700 p-6 rounded-lg text-white relative overflow-hidden">
                <div className="z-10 relative">
                    <h3 className="text-2xl font-bold mb-1">Quần áo</h3>
                    <p className="text-yellow-300 font-bold text-xl">Giảm 20% Sản phẩm</p>
                    <p className="text-sm mt-1">Miễn phí ships</p>
                </div>
                <img
                    src={clothesBanner}
                    alt="Game controller"
                    className="absolute right-0 bottom-0 w-full h-full z-0"
                />
            </div>

            {/* Phone Banner */}
            <div className="bg-teal-500 p-6 rounded-lg text-white relative overflow-hidden">
                <div className="z-10 relative">
                    <h3 className="text-2xl font-bold mb-1">Điện thoại 2hand</h3>
                    <p className="text-yellow-300 font-bold text-xl">Giảm giá 80%</p>
                    <p className="text-sm mt-1">Miễn phí ship toàn quốc</p>
                </div>
                <img
                    src={phoneBanner}
                    alt="Polaroid camera"
                    className="absolute right-0 bottom-0 w-full h-full z-0"
                />
            </div>

            {/* Clock Banner */}
            <div className="bg-red-500 p-6 rounded-lg text-white relative overflow-hidden">
                <div className="z-10 relative">
                    <h3 className="text-2xl font-bold mb-1">Máy tính bảng</h3>
                    <p className="text-yellow-300 font-bold text-xl">Giảm đến 1 triệu đồng</p>
                    <p className="text-sm mt-1">Free shipping 20km Radius</p>
                </div>
                <img
                    src={clockBanner}
                    alt="Tablet computer"
                    className="absolute right-0 bottom-0 w-full h-full z-0"
                />
            </div>
        </div>
    );
};

export default PromotionalBanners;