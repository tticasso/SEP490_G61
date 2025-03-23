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
    return (
        <div className="md:pr-6 md:border-r md:w-1/4 mb-6 md:mb-0">
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
            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
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
            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
            <div className="mt-4">
                <h3 className="text-lg font-bold mb-4">GIÁ</h3>
                <div className="flex items-center space-x-2">
                    <input
                        type="number"
                        placeholder="Min"
                        className="w-full border rounded px-2 py-1"
                        value={priceRange.min}
                        onChange={(e) => handlePriceChange('min', e.target.value)}
                    />
                    <span>-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        className="w-full border rounded px-2 py-1"
                        value={priceRange.max}
                        onChange={(e) => handlePriceChange('max', e.target.value)}
                    />
                </div>
                <button
                    className="w-full mt-2 bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                    onClick={applyPriceFilter}
                >
                    Áp dụng
                </button>
            </div>
            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
        </div>
    );
};

export default CategorySidebar;