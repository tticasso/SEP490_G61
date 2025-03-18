import React, { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw, Upload } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';

const AddCategory = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState('');
    const [image, setImage] = useState(null);

    const navigate = useNavigate();

    // Fetch categories for parent selection
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await ApiService.get('/categories');
                setCategories(response);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        
        // Validation
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Tên danh mục là bắt buộc';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            await ApiService.post('/categories/create', formData);
            
            // Redirect to category list page
            navigate('/admin/categories');
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi tạo danh mục: ' + error
            });
            setLoading(false);
        }
    };

    // Handle save and display
    const handleSaveAndDisplay = () => {
        handleSubmit();
    };

    // Handle save
    const handleSave = () => {
        handleSubmit();
    };

    return (
        <div className="flex-1 bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">THÊM DANH MỤC</h1>
                <div className="flex items-center">
                    <button className="flex items-center text-gray-600 mr-4">
                        <RefreshCw size={18} className="mr-2" />
                        <span>Dữ liệu mới nhất</span>
                    </button>
                    <div className="text-gray-500">
                        {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}
                    </div>
                </div>
            </div>

            {/* Back button */}
            <div className="p-6">
                <button 
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
                    onClick={() => navigate('/admin/categories')}
                >
                    <ChevronLeft size={18} className="mr-1" />
                    <span>Quay lại</span>
                </button>

                {formErrors.submit && (
                    <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {formErrors.submit}
                    </div>
                )}

                <div className="p-8">
                    {/* Left column - Form */}
                    <div className="col-span-2">
                        <form onSubmit={handleSubmit}>
                            {/* Category name */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên danh mục <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Tên danh mục"
                                    className={`w-full p-3 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <div className="border border-gray-300 rounded-md">
                                    {/* Text editor toolbar */}
                                    <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center">
                                        <div className="flex space-x-2 mr-4">
                                            <button type="button" className="p-1 rounded hover:bg-gray-200">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                </svg>
                                            </button>
                                            <button type="button" className="p-1 rounded hover:bg-gray-200">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="border-r border-gray-300 h-6 mx-2"></div>

                                        <div className="flex items-center space-x-2">
                                            <select className="text-sm border border-gray-300 rounded px-2 py-1">
                                                <option>Paragraph</option>
                                            </select>

                                            <select className="text-sm border border-gray-300 rounded px-2 py-1">
                                                <option>System Font</option>
                                            </select>

                                            <select className="text-sm border border-gray-300 rounded px-2 py-1">
                                                <option>12pt</option>
                                            </select>
                                        </div>

                                        <div className="border-r border-gray-300 h-6 mx-2"></div>

                                        <div className="flex items-center space-x-2">
                                            <button type="button" className="p-1 rounded hover:bg-gray-200">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                </svg>
                                            </button>
                                            <button type="button" className="p-1 rounded hover:bg-gray-200">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                                </svg>
                                            </button>
                                            <button type="button" className="p-1 rounded hover:bg-gray-200">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684l.106-.316-.105-.316C21.927 11.617 19.633 5 12 5zm0 11c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" />
                                                    <path d="M12 10c-1.084 0-2 .916-2 2s.916 2 2 2 2-.916 2-2-.916-2-2-2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Text editor content area */}
                                    <textarea
                                        name="description"
                                        className="w-full p-3 min-h-[150px] focus:outline-none"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mô tả cho danh mục..."
                                    ></textarea>
                                </div>
                            </div>
                        </form>
                    </div>

                  
                </div>

                {/* Action buttons */}
                <div className="mt-8 flex justify-center space-x-4">
                    <button
                        type="button"
                        className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu bản nháp'}
                    </button>
                    <button
                        type="button"
                        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                        onClick={handleSaveAndDisplay}
                        disabled={loading}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu và hiển thị'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCategory;