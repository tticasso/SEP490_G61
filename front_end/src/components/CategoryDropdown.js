import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';

const CategoryDropdown = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        if (categoryId) {
            navigate(`/categories?category=${categoryId}`);
        } else {
            navigate('/categories');
        }
    };

    return (
        <div className="relative">
            <select
                className="bg-gray-100 px-4 py-2 rounded-md text-sm appearance-none pr-8"
                onChange={handleCategoryChange}
                defaultValue=""
                disabled={loading}
            >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                        {category.name}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                {loading ? (
                    <div className="animate-spin h-4 w-4 border-t-2 border-gray-500 border-r-2 rounded-full"></div>
                ) : (
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default CategoryDropdown;