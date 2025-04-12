import React from 'react';
import { MapPin } from 'lucide-react';

const ProductHeader = ({ product, formatDate }) => {
    return (
        <>
            <h1 className="text-lg font-bold mb-1">{product.name}</h1>
            <p className="text-sm text-gray-700 mb-3">
                {product.meta_description || (product.description ? product.description.substring(0, 100) : '')}
            </p>

            <p className="text-sm text-gray-600 mb-4">
                {product.condition || 'Tình trạng: Mới'}
                {product.created_at && ` | Đăng: ${formatDate(product.created_at)}`}
            </p>
        </>
    );
};

export default ProductHeader;