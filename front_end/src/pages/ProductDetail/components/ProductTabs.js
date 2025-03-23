import React from 'react';
import { Star } from 'lucide-react';

const ProductTabs = ({ activeTab, setActiveTab, product, variants, formatPrice, safeRender }) => {
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
                        <div className="flex items-center mb-6">
                            <div className="flex items-center">
                                <span className="text-xl font-bold mr-2">{safeRender(product.rating, '0.0')}</span>
                                <span className="text-gray-500">Của 5</span>
                            </div>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="text-gray-500">0 đánh giá</span>
                        </div>

                        <div className="space-y-2 mb-8">
                            {[5, 4, 3, 2, 1].map(rating => (
                                <div key={rating} className="flex items-center">
                                    <div className="w-10 flex items-center">
                                        <span>{rating}</span>
                                        <Star className="h-4 w-4 text-yellow-400 ml-1" fill="#FBBF24" />
                                    </div>
                                    <div className="flex-grow h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                    <span className="w-8 text-right text-gray-500">0%</span>
                                </div>
                            ))}
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