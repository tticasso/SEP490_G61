import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';

const CategorySidebar = ({ categories }) => {
    const navigate = useNavigate();

    const handleCategoryClick = (categoryId) => {
        // Navigate to categories page with the selected category
        navigate(`/categories?category=${categoryId}`);
    };

    // Lấy tối đa 5 danh mục hiển thị ban đầu
    const displayCategories = categories.slice(0, 5);
    const hasMoreCategories = categories.length > 5;

    return (
        <div className="w-1/5 bg-white shadow-sm rounded-md overflow-hidden">
            <div className="w-full h-full bg-white shadow-sm rounded-md overflow-hidden flex flex-col">
                <div className="p-3 border-b border-gray-200">
                    <h3 className="font-bold text-lg text-purple-700">DANH MỤC SẢN PHẨM</h3>
                </div>

                {displayCategories.map((category) => (
                    <div
                        key={category._id}
                        className="p-3 border-b border-gray-200 hover:bg-purple-50 transition-colors cursor-pointer"
                        onClick={() => handleCategoryClick(category._id)}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-800">{category.name}</h3>
                            <ChevronRight size={16} className="text-gray-500" />
                        </div>
                    </div>
                ))}

                {hasMoreCategories && (
                    <div
                        className="p-3 text-center text-purple-600 font-medium hover:bg-purple-50 transition-colors cursor-pointer"
                        onClick={() => navigate('/categories')}
                    >
                        <div className="flex items-center justify-center gap-1">
                            <span>Xem tất cả danh mục</span>
                            <ChevronDown size={16} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategorySidebar;