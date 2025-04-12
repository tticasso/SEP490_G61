import React, { useState, useEffect } from 'react';
import { Minus as MinusIcon, Plus as PlusIcon, Check } from 'lucide-react';
import ApiService from '../services/ApiService';

const ProductVariantSelector = ({ 
  productId, 
  onVariantSelect, 
  initialQuantity = 1,
  onQuantityChange,
  containerClassName = ""
}) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(initialQuantity);

  // Fetch variants when product ID changes
  useEffect(() => {
    const fetchVariants = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const response = await ApiService.get(`/product-variant/product/${productId}`, false);
        
        // If variants exist, set them and select the default variant
        if (response && response.length > 0) {
          setVariants(response);
          
          // Find default variant or use the first one
          const defaultVariant = response.find(variant => variant.is_default) || response[0];
          setSelectedVariant(defaultVariant);
          
          // Notify parent component about selected variant
          if (onVariantSelect) {
            onVariantSelect(defaultVariant);
          }
        } else {
          // If no variants, set empty array
          setVariants([]);
          setSelectedVariant(null);
        }
      } catch (err) {
        console.error("Error fetching product variants:", err);
        setError("Không thể tải thông tin biến thể sản phẩm");
        setVariants([]);
        setSelectedVariant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [productId]);

  // Handle quantity changes
  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (onQuantityChange) {
        onQuantityChange(newQuantity);
      }
    }
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    if (onVariantSelect) {
      onVariantSelect(variant);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'đ');
  };

  // Calculate available stock
  const getAvailableStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock || 0;
    }
    return 0;
  };

  // Format variant attributes to display
  const formatAttributes = (variant) => {
    if (!variant || !variant.attributes) return "";
    
    const attributes = variant.attributes instanceof Map ? 
      Object.fromEntries(variant.attributes) : 
      variant.attributes;
    
    return Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const availableStock = getAvailableStock();

  // Check if no variants available
  if (!loading && variants.length === 0) {
    return null;
  }

  return (
    <div className={containerClassName}>
      {loading ? (
        <div className="text-center py-2">
          <div className="inline-block animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
          <p className="mt-1 text-sm text-gray-500">Đang tải biến thể...</p>
        </div>
      ) : error ? (
        <div className="text-center py-2">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {/* Thông tin biến thể đã chọn - chỉ hiển thị một lần ở đầu */}
          {selectedVariant && (
            <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-100 flex justify-between items-center">
              <div>
                <div className="font-medium">{selectedVariant.name || "Biến thể đã chọn"}</div>
                <div className="text-sm text-gray-600">
                  {formatAttributes(selectedVariant)}
                </div>
              </div>
              <div className="text-green-600 text-sm font-medium">
                Còn {selectedVariant.stock} sản phẩm
              </div>
            </div>
          )}

          {/* Chọn biến thể - hiển thị dạng grid để tiết kiệm không gian */}
          <div className="mb-3">
            <p className="text-gray-600 text-sm mb-2">Chọn biến thể:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {variants.map((variant) => {
                const isAvailable = (variant.stock || 0) > 0;
                const isSelected = selectedVariant && selectedVariant._id === variant._id;
                
                return (
                  <div 
                    key={variant._id}
                    className={`
                      border p-2 rounded cursor-pointer relative
                      ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}
                      ${!isAvailable ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    onClick={() => isAvailable && handleVariantSelect(variant)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{variant.name || formatAttributes(variant)}</div>
                        <div className="text-red-600 text-sm font-bold">
                          {formatPrice(variant.price)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isSelected && (
                          <Check size={16} className="text-purple-600 mr-1" />
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isAvailable ? `${variant.stock}` : 'Hết'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Quantity selector - thu gọn */}
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm">Số lượng:</p>
              <div className="flex items-center">
                <button
                  className="border border-gray-300 px-2 py-0.5 flex items-center justify-center rounded-l"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                >
                  <MinusIcon size={14} />
                </button>
                <input
                  type="text"
                  value={quantity}
                  className="border-t border-b border-gray-300 w-10 py-0.5 text-center text-sm"
                  readOnly
                />
                <button
                  className="border border-gray-300 px-2 py-0.5 flex items-center justify-center rounded-r"
                  onClick={handleIncrement}
                  disabled={selectedVariant && quantity >= availableStock}
                >
                  <PlusIcon size={14} />
                </button>
                {selectedVariant && (
                  <span className="text-gray-500 text-xs ml-2">{availableStock} sản phẩm có sẵn</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductVariantSelector;