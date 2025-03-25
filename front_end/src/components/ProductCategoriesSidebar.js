import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ApiService from '../services/ApiService';

const ProductCategoriesSidebar = ({ isOpen, onClose, buttonRef }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();

    // Lấy danh mục từ API khi component được mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await ApiService.get('/categories', false);
                setCategories(response || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target) &&
                !event.target.closest('.cartbutton')
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleCategoryClick = (categoryId) => {
        navigate(`/categories?category=${categoryId}`);
        onClose(); // Đóng sidebar sau khi chọn
    };

    return (
        <div
            ref={sidebarRef}
            className={`
                fixed z-50 top-[140px] left-[280px] w-64 bg-white 
                border shadow-lg rounded-md 
                transition-all duration-300 ease-in-out 
                ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
            `}
        >
            {loading ? (
                <div className="p-4 text-center">
                    <div className="animate-spin h-5 w-5 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
                </div>
            ) : (
                <ul className="py-2">
                    {categories.map((category) => (
                        <li
                            onClick={() => handleCategoryClick(category._id)}
                            key={category._id}
                            className="px-4 py-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                        >
                            {category.name}
                            <ChevronRight size={16} className="text-gray-500" />
                        </li>
                    ))}
                    
                    {categories.length === 0 && (
                        <li className="px-4 py-2 text-gray-500 text-center">
                            Không có danh mục nào
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default ProductCategoriesSidebar;