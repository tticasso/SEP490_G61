import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import defaultImage from '../../assets/dongho.png';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    // Kiểm tra cấu trúc dữ liệu của item và trích xuất thông tin
    const productInfo = item.product_id && typeof item.product_id === 'object' 
        ? item.product_id 
        : { name: 'Sản phẩm không xác định', price: 0 };
    
    const {
        name = 'Sản phẩm không xác định',
        price = 0,
        original_price,
        discounted_price,
        image = defaultImage
    } = productInfo;
    
    // Giá hiển thị sẽ là discounted_price nếu có, nếu không thì là price
    const displayPrice = discounted_price || price;
    const displayOriginalPrice = original_price || null;
    
    return (
        <div className="flex items-center mb-4 pb-4 border-b last:border-b-0">
            <img 
                src={image} 
                alt={name} 
                className="w-20 h-20 object-cover mr-4"
                onError={(e) => {e.target.src = defaultImage}}
            />
            <div className="flex-grow">
                <h3 className="text-sm font-medium">{name}</h3>
                <p className="text-purple-600 font-bold">
                    {displayPrice.toLocaleString()} đ
                    {displayOriginalPrice && (
                        <span className="line-through text-gray-400 ml-2 text-xs">
                            {displayOriginalPrice.toLocaleString()} đ
                        </span>
                    )}
                </p>
                <div className="flex items-center mt-2">
                    <button 
                        onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                        className="p-1 border rounded"
                        disabled={item.quantity <= 1}
                    >
                        <Minus size={16} />
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button 
                        onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                        className="p-1 border rounded"
                    >
                        <Plus size={16} />
                    </button>
                    <button 
                        onClick={() => onRemove(item._id)}
                        className="ml-auto text-red-500"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartItem;