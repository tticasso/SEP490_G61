import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    return (
        <div className="flex items-center mb-4 pb-4 border-b last:border-b-0">
            <img 
                src={item.image} 
                alt={item.name} 
                className="w-20 h-20 object-cover mr-4"
            />
            <div className="flex-grow">
                <h3 className="text-sm font-medium">{item.name}</h3>
                <p className="text-purple-600 font-bold">
                    {item.price.toLocaleString()} đ
                    {item.originalPrice && (
                        <span className="line-through text-gray-400 ml-2 text-xs">
                            {item.originalPrice.toLocaleString()} đ
                        </span>
                    )}
                </p>
                <div className="flex items-center mt-2">
                    <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 border rounded"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 border rounded"
                    >
                        <Plus size={16} />
                    </button>
                    <button 
                        onClick={() => onRemove(item.id)}
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