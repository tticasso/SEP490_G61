import React from 'react';
import CartItem from './CartItem';
import dongho from '../../../assets/dongho.png';

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
                        onClick={() => window.location.href = `/shop-detail/${shop.shop_id}`} 
                        className="h-14 w-14 rounded-full overflow-hidden cursor-pointer ml-2"
                    >
                        <img
                            src={shop.shop_image || dongho}
                            alt={shop.shop_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = dongho }}
                        />
                    </div>
                </div>
                <p 
                    onClick={() => window.location.href = `/shop-detail/${shop.shop_id}`} 
                    className='cursor-pointer font-medium'
                >
                    {shop.shop_name}
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

            <div className="flex p-4 bg-gray-200">
                <button className="bg-red-500 text-white px-4 py-1 rounded">
                    Thêm khuyến mãi
                </button>
            </div>

            {index < shopsLength - 1 && (
                <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
            )}
        </div>
    );
};

export default ShopGroup;