import React from 'react';
import { ClockIcon } from 'lucide-react';
import dongho from '../../../assets/ProductDetail.png';

const SimilarProducts = ({ similarProducts, formatPrice, getTimeAgo, safeRender }) => {
    if (!similarProducts || similarProducts.length === 0) return null;

    // Safe ID for links - avoid the "_id" undefined error
    const getSafeId = (obj) => {
        if (!obj) return 'unknown';
        return obj._id || obj.id || 'unknown';
    };

    return (
        <div className="pt-10">
            <div className="flex items-center mb-4 bg-white p-4">
                <ClockIcon size={24} className="text-red-500 mr-2" />
                <h2 className="text-lg font-bold text-red-500">SẢN PHẨM TƯƠNG TỰ</h2>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 bg-[#F1F5F9]">
                {similarProducts.map((product) => (
                    <div
                        key={getSafeId(product)}
                        className="border rounded bg-white overflow-hidden cursor-pointer"
                        onClick={() => window.location.href = `/product-detail?id=${getSafeId(product)}`}
                    >
                        <img
                            src={safeRender(product.thumbnail, dongho)}
                            alt={safeRender(product.name, 'Product')}
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-2">
                            <h3 className="text-sm font-medium">{safeRender(product.name, 'Sản phẩm')}</h3>
                            <div className="text-xs text-gray-500">{safeRender(product.condition, 'Mới 100%')}</div>
                            <div className="text-red-500 font-bold mt-1">{formatPrice(product.price)}</div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                <ClockIcon size={12} className="mr-1" />
                                <span>{product.created_at ? getTimeAgo(product.created_at) : 'Mới đăng'}</span>
                                <span className="mx-1">•</span>
                                <span>{safeRender(product.location, 'Hà Nội')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimilarProducts;