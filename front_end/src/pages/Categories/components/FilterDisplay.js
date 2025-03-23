import React from 'react';
import { X as XIcon } from 'lucide-react';

const FilterDisplay = ({
    selectedCategory,
    categories,
    priceRange,
    selectedLocations,
    setPriceRange,
    setSelectedLocations,
    setSelectedCategory,
    clearFilters,
    formatPrice
}) => {
    // If no filters are active, don't display anything
    if (!(selectedCategory || priceRange.min || priceRange.max > 0 || selectedLocations.length > 0)) {
        return null;
    }

    return (
        <div className="mb-4 p-3 bg-gray-100 rounded">
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>

                {selectedCategory && (
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center">
                        {categories.find(c => c._id === selectedCategory)?.name}
                        <XIcon
                            size={14}
                            className="ml-1 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory(null);
                            }}
                        />
                    </div>
                )}

                {(priceRange.min || priceRange.max) && (
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center">
                        Giá: {priceRange.min ? formatPrice(priceRange.min) : '0đ'} - {priceRange.max ? formatPrice(priceRange.max) : '∞'}
                        <XIcon
                            size={14}
                            className="ml-1 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPriceRange({ min: '', max: '' });
                            }}
                        />
                    </div>
                )}

                {selectedLocations.length > 0 && (
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center">
                        Địa điểm: {selectedLocations.length > 2
                            ? `${selectedLocations.slice(0, 2).join(', ')} +${selectedLocations.length - 2}`
                            : selectedLocations.join(', ')}
                        <XIcon
                            size={14}
                            className="ml-1 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLocations([]);
                            }}
                        />
                    </div>
                )}

                <button
                    className="text-xs text-red-500 hover:text-red-700 ml-auto"
                    onClick={clearFilters}
                >
                    Xóa tất cả
                </button>
            </div>
        </div>
    );
};

export default FilterDisplay;