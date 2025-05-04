import React from 'react';
import { X as XIcon } from 'lucide-react';
import dongho from '../../../assets/dongho.png';
import ProductVariantSelector from '../../../components/ProductVariantSelector';

const ProductModal = ({
    selectedProduct,
    selectedVariant,
    quantity,
    formatPrice,
    handleVariantSelect,
    handleQuantityChange,
    addToCart,
    closeModal
}) => {
    // Xác định xem sản phẩm còn hàng hay không
    const isOutOfStock = selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock <= 0;

    // Xác định hình ảnh hiển thị - ưu tiên hình ảnh biến thể nếu có
    const displayImage = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 
        ? selectedVariant.images[0] 
        : (selectedProduct.thumbnail || dongho);

    // Xác định giá hiển thị - ưu tiên giá biến thể nếu có
    const displayPrice = selectedVariant 
        ? formatPrice(selectedVariant.price) 
        : formatPrice(selectedProduct.price);

    // Hiển thị thông tin thuộc tính biến thể
    const renderVariantAttributes = () => {
        if (!selectedVariant || !selectedVariant.attributes) return null;
        
        const attributes = selectedVariant.attributes instanceof Map 
            ? Object.fromEntries(selectedVariant.attributes) 
            : selectedVariant.attributes;
            
        if (Object.keys(attributes).length === 0) return null;
        
        return Object.entries(attributes).map(([key, value]) => (
            <span key={key} className="mr-3">
                <span className="capitalize">{key}</span>: <strong>{value}</strong>
            </span>
        ));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-11/12 max-w-4xl overflow-y-auto max-h-[90vh] relative">
                <button
                    className="absolute top-4 right-4 text-gray-800 hover:bg-gray-100 p-1 rounded-full"
                    onClick={closeModal}
                >
                    <XIcon size={24} />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">CHỌN BIẾN THỂ SẢN PHẨM</h2>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Product Image */}
                        <div className="w-full md:w-1/3">
                            <img
                                src={displayImage}
                                alt={selectedProduct.name}
                                className="w-full h-auto rounded object-cover"
                            />

                            {/* <div className="flex gap-2 mt-4 overflow-x-auto">

                                {selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 ? (
                                    selectedVariant.images.slice(0, 4).map((imgSrc, idx) => (
                                        <div key={idx} className="border border-gray-300 p-1 w-16 h-16 flex-shrink-0">
                                            <img
                                                src={imgSrc}
                                                alt={`Biến thể ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="border border-gray-300 p-1 w-16 h-16 flex-shrink-0">
                                            <img
                                                src={selectedProduct.thumbnail || dongho}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </>
                                )}
                            </div> */}
                        </div>

                        {/* Product Details with Variant Selector */}
                        <div className="w-full md:w-2/3">
                            <h3 className="text-lg font-bold mb-1">{selectedProduct.name}</h3>
                            <p className="text-red-500 font-bold text-xl mb-3">
                                {displayPrice}
                            </p>
                            
                            {/* Thông tin biến thể đã chọn */}
                            {selectedVariant && (
                                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    
                                    {renderVariantAttributes() && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            {renderVariantAttributes()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Product Variant Selector Component */}
                            <ProductVariantSelector
                                productId={selectedProduct._id}
                                onVariantSelect={handleVariantSelect}
                                initialQuantity={quantity}
                                onQuantityChange={handleQuantityChange}
                            />
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className='flex flex-col sm:flex-row gap-4 mt-6'>
                        <button
                            className={`w-full ${isOutOfStock 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-purple-600 hover:bg-purple-700'} text-white py-3 rounded-md font-medium transition-colors`}
                            onClick={() => addToCart(selectedProduct, quantity, true)}
                            disabled={isOutOfStock}
                        >
                            {isOutOfStock 
                                ? "HẾT HÀNG" 
                                : "THÊM VÀO GIỎ HÀNG"}
                        </button>
                        <button
                            onClick={() => window.location.href = `/product-detail?id=${selectedProduct._id || selectedProduct.id}`}
                            className='w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium transition-colors'
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