import React, { useState, useEffect } from 'react';
import { X as XIcon, AlertCircle } from 'lucide-react';
import dongho from '../../../assets/dongho.png';
import ProductVariantSelector from '../../../components/ProductVariantSelector';
import ApiService from '../../../services/ApiService';

const ProductModal = ({
    product,
    selectedVariant,
    quantity,
    onVariantSelect,
    onQuantityChange,
    onAddToCart,
    onClose,
    formatPrice
}) => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVariants = async () => {
            if (!product || !product._id) return;
            
            try {
                setLoading(true);
                const response = await ApiService.get(`/product-variant/product/${product._id}`, false);
                
                if (response && response.length > 0) {
                    setVariants(response);
                    setError(null);
                } else {
                    setVariants([]);
                    setError("Sản phẩm này không có biến thể nào");
                }
            } catch (err) {
                console.error("Error fetching product variants:", err);
                setError("Không thể tải thông tin biến thể sản phẩm");
                setVariants([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVariants();
    }, [product]);

    // Kiểm tra xem sản phẩm có biến thể và đã chọn biến thể chưa
    const hasVariants = variants.length > 0;
    const variantSelected = selectedVariant !== null;
    
    // Kiểm tra xem biến thể đã chọn có còn hàng không
    const isOutOfStock = selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock <= 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-11/12 max-w-4xl overflow-hidden relative">
                <button
                    className="absolute top-4 right-4 text-gray-800"
                    onClick={onClose}
                >
                    <XIcon size={24} />
                </button>

                <div className="p-6 mt-10 mb-10">
                    <h2 className="text-xl font-bold mb-6">CHỌN BIẾN THỂ SẢN PHẨM</h2>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Product Image */}
                        <div className="w-full md:w-1/3">
                            <img
                                src={selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 
                                    ? selectedVariant.images[0] 
                                    : (product.thumbnail || dongho)}
                                alt={product.name}
                                className="w-full h-auto rounded"
                            />

                            <div className="flex gap-2 mt-4">
                                {/* Variant images if available, otherwise product thumbnail */}
                                {selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 ? (
                                    selectedVariant.images.slice(0, 2).map((imgSrc, idx) => (
                                        <div key={idx} className="border border-gray-300 p-1 w-16 h-16">
                                            <img
                                                src={imgSrc}
                                                alt={`Biến thể ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="border border-gray-300 p-1 w-16 h-16">
                                            <img
                                                src={product.thumbnail || dongho}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="border border-gray-300 p-1 w-16 h-16">
                                            <img
                                                src={product.thumbnail || dongho}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Product Details with Variant Selector */}
                        <div className="w-full md:w-2/3">
                            <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                            <p className="text-red-500 font-bold text-lg mb-2">
                                {selectedVariant 
                                    ? formatPrice(selectedVariant.price) 
                                    : formatPrice(product.price)}
                            </p>
                            
                            {/* Thông báo chọn biến thể */}
                            {hasVariants && !variantSelected && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                                    <div className="flex items-center">
                                        <AlertCircle size={16} className="text-yellow-600 mr-2" />
                                        <p className="text-yellow-700">Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng</p>
                                    </div>
                                </div>
                            )}

                            {/* Hiển thị trạng thái loading hoặc lỗi */}
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="inline-block animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                                    <p className="mt-2 text-sm text-gray-500">Đang tải biến thể sản phẩm...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-4">
                                    <p className="text-sm text-red-500">{error}</p>
                                </div>
                            ) : (
                                /* Product Variant Selector Component */
                                <ProductVariantSelector
                                    productId={product._id}
                                    onVariantSelect={onVariantSelect}
                                    initialQuantity={quantity}
                                    onQuantityChange={onQuantityChange}
                                />
                            )}
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className='flex gap-4 mt-6'>
                        <button
                            className={`w-full text-white py-3 rounded-md font-medium transition-colors ${
                                (hasVariants && !variantSelected) || isOutOfStock
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                            onClick={() => onAddToCart(product, quantity, true)}
                            disabled={(hasVariants && !variantSelected) || isOutOfStock}
                        >
                            {isOutOfStock 
                                ? "HẾT HÀNG" 
                                : hasVariants && !variantSelected
                                    ? "VUI LÒNG CHỌN BIẾN THỂ"
                                    : "THÊM VÀO GIỎ HÀNG"}
                        </button>
                        <button
                            onClick={() => {
                                window.location.href = `/product-detail?id=${product._id}`;
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium"
                        >
                            Xem thông tin chi tiết
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;