import React from 'react';

const CategorySidebar = ({ categories }) => {
    return (
        <div className="w-1/5 bg-white">
            <div className="space-y-2 pt-3 pb-3 pl-3 pr-5">
                {categories.map((category) => (
                    <div key={category._id} className="p-3 border-b border-black">
                        <h3 className="font-medium text-gray-800 mb-2">{category.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySidebar;