import React from 'react';
import { Filter } from 'lucide-react';

const CategorySidebar = ({ 
    categories, 
    selectedCategory, 
    handleCategorySelect,
    priceRange,
    handlePriceChange, 
    applyPriceFilter,
    clearFilters
}) => {
    // Xử lý nhập giá, đảm bảo giá không âm
    const handlePriceInputChange = (type, value) => {
        // Kiểm tra nếu giá trị nhập vào là số dương hoặc chuỗi rỗng
        if (value === '' || parseFloat(value) >= 0) {
            handlePriceChange(type, value);
        }
    };

    return (
        <div className="w-full border-r pr-4">
            <h2 className="text-lg font-bold mb-4">DANH MỤC LIÊN QUAN</h2>
            <ul className="space-y-2">
                {categories.map((category) => (
                    <li
                        key={category._id}
                        className={`
                            text-sm cursor-pointer
                            ${selectedCategory === category._id
                                ? 'text-purple-600 font-bold'
                                : 'text-gray-700 hover:text-purple-600'}
                        `}
                        onClick={() => handleCategorySelect(category._id)}
                    >
                        {category.name}
                    </li>
                ))}
            </ul>
            <div className='w-full h-[1px] bg-gray-300 mt-8'></div>
            <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">BỘ LỌC</h3>
                <div
                    className="flex items-center text-gray-500 cursor-pointer hover:text-purple-600"
                    onClick={clearFilters}
                >
                    <Filter size={16} className="mr-2" />
                    <span>Xóa bộ lọc</span>
                </div>
            </div>
            <div className='w-full h-[1px] bg-gray-300 mt-8'></div>
            <div className="mt-4">
                <h3 className="text-lg font-bold mb-4">GIÁ</h3>
                <div className="flex items-center space-x-2">
                    <input
                        type="number"
                        placeholder="Min"
                        className="w-full border rounded px-2 py-1"
                        value={priceRange.min}
                        onChange={(e) => handlePriceInputChange('min', e.target.value)}
                        min="0" // Thêm thuộc tính min để không cho phép số âm
                    />
                    <span>-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        className="w-full border rounded px-2 py-1"
                        value={priceRange.max}
                        onChange={(e) => handlePriceInputChange('max', e.target.value)}
                        min="0" // Thêm thuộc tính min để không cho phép số âm
                    />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    Giá không được âm
                </div>
                <button
                    className="w-full mt-2 bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                    onClick={applyPriceFilter}
                    disabled={
                        (priceRange.min && parseFloat(priceRange.min) < 0) ||
                        (priceRange.max && parseFloat(priceRange.max) < 0) ||
                        (priceRange.min && priceRange.max && parseFloat(priceRange.min) > parseFloat(priceRange.max))
                    }
                >
                    Áp dụng
                </button>
                {/* Hiển thị lỗi nếu min > max */}
                {priceRange.min && priceRange.max && parseFloat(priceRange.min) > parseFloat(priceRange.max) && (
                    <div className="mt-2 text-xs text-red-500">
                        Giá tối thiểu không thể lớn hơn giá tối đa
                    </div>
                )}
            </div>
            <div className='w-full h-[1px] bg-gray-300 mt-8'></div>
        </div>
    );
};

export default CategorySidebar;