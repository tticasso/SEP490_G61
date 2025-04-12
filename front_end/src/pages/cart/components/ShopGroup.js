import React, { useState, useEffect } from 'react';
import CartItem from './CartItem';
import dongho from '../../../assets/dongho.png';
import ApiService from '../../../services/ApiService';
import { BE_API_URL } from '../../../config/config';

const ShopGroup = ({
    shop,
    index,
    shopsLength,
    selectedItems,
    areAllShopItemsSelected,
    handleSelectAllShopItems,
    handleSelectItem,
    updateQuantity,
    removeItem,
    getItemPrice
}) => {
    // Thêm state để lưu trữ thông tin shop sau khi fetch
    const [shopInfo, setShopInfo] = useState({
        shop_id: shop.shop_id,
        shop_name: shop.shop_name,
        shop_image: shop.shop_image
    });
    const [loading, setLoading] = useState(false);
    const getImagePath = (imgPath) => {
        if (!imgPath) return "";
        // Kiểm tra nếu imgPath đã là URL đầy đủ
        if (imgPath.startsWith('http')) return imgPath;
        // Kiểm tra nếu imgPath là đường dẫn tương đối
        if (imgPath.startsWith('/uploads')) return `${BE_API_URL}${imgPath}`;
        
        // Kiểm tra nếu đường dẫn có chứa "shops" để xử lý ảnh shop
        if (imgPath.includes('shops')) {
            const fileName = imgPath.split("\\").pop();
            return `${BE_API_URL}/uploads/shops/${fileName}`;
        }
        
        // Trường hợp imgPath là đường dẫn từ backend cho sản phẩm
        const fileName = imgPath.split("\\").pop();
        return `${BE_API_URL}/uploads/products/${fileName}`;
    };

    // Fetch thông tin shop nếu cần
    useEffect(() => {
        const fetchShopDetails = async () => {
            // Chỉ fetch khi cần thiết (needFetch = true và shop_id không phải 'unknown')
            if (shop.needFetch && shop.shop_id !== 'unknown') {
                setLoading(true);
                try {
                    const response = await ApiService.get(`/shops/public/${shop.shop_id}`);
                    if (response) {
                        setShopInfo({
                            shop_id: shop.shop_id,
                            shop_name: response.name || shop.shop_name,
                            shop_image: response.logo || shop.shop_image
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching shop details for ${shop.shop_id}:`, error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchShopDetails();
    }, [shop.shop_id, shop.needFetch]);

    const isAllSelected = areAllShopItemsSelected();
    
    return (
        <div className="mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-t-lg">
                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        className='scale-150 mr-2'
                        checked={isAllSelected}
                        onChange={() => handleSelectAllShopItems(isAllSelected)}
                    />
                    <div 
                        onClick={() => window.location.href = `/shop-detail/${shopInfo.shop_id}`} 
                        className="h-14 w-14 rounded-full overflow-hidden cursor-pointer ml-2"
                    >
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                <span className="animate-pulse">...</span>
                            </div>
                        ) : (
                            <img
                                src={getImagePath(shopInfo.shop_image) || dongho}
                                alt={shopInfo.shop_name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = dongho }}
                            />
                        )}
                    </div>
                </div>
                <p 
                    onClick={() => window.location.href = `/shop-detail/${shopInfo.shop_id}`} 
                    className='cursor-pointer font-medium'
                >
                    {loading ? 'Đang tải...' : shopInfo.shop_name}
                </p>
            </div>

            {shop.items.map((item) => (
                <CartItem
                    key={item._id}
                    item={item}
                    isSelected={selectedItems[item._id] || false}
                    onSelect={() => handleSelectItem(item._id)}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    getItemPrice={getItemPrice}
                />
            ))}

            {index < shopsLength - 1 && (
                <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
            )}
        </div>
    );
};

export default ShopGroup;