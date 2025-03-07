import React, { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw, Upload } from 'lucide-react';
import ApiService from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';

const AddBrand = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categories: []
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const navigate = useNavigate();

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await ApiService.get('/categories');
                setCategories(response);
                setLoadingCategories(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Handle input changes
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

    // Handle category selection
    const handleCategoryChange = (categoryId) => {
        let updatedCategories;
        
        if (formData.categories.includes(categoryId)) {
            // Remove if already selected
            updatedCategories = formData.categories.filter(id => id !== categoryId);
        } else {
            // Add if not selected
            updatedCategories = [...formData.categories, categoryId];
        }
        
        setFormData({
            ...formData,
            categories: updatedCategories
        });
        
        // Clear error for categories
        if (formErrors.categories) {
            setFormErrors({
                ...formErrors,
                categories: ''
            });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Tên thương hiệu là bắt buộc';
        }
        if (formData.categories.length === 0) {
            errors.categories = 'Vui lòng chọn ít nhất một danh mục';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            await ApiService.post('/brand/create', formData);
            
            // Redirect to brand list page
            navigate('/admin/brands');
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi tạo thương hiệu: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle save and display
    const handleSaveAndDisplay = async () => {
        // Validation
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Tên thương hiệu là bắt buộc';
        }
        if (formData.categories.length === 0) {
            errors.categories = 'Vui lòng chọn ít nhất một danh mục';
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            setLoading(true);
            await ApiService.post('/brand/create', formData);
            
            // Redirect to brand list page
            navigate('/admin/brands');
        } catch (error) {
            setFormErrors({
                submit: 'Lỗi khi tạo thương hiệu: ' + error
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle save
    const handleSave = async () => {
        await handleSubmit({
            preventDefault: () => {}
        });
    };

    return (
        <div className="flex-1 bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">THÊM THƯƠNG HIỆU</h1>
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

            {/* Content */}
            <div className="p-6">
                {formErrors.submit && (
                    <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {formErrors.submit}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-6">
                    {/* Left column - Form */}
                    <div className="col-span-2">
                        <form onSubmit={handleSubmit}>
                            {/* Brand name */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên thương hiệu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Tên thương hiệu"
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
                                        placeholder="Nhập mô tả cho thương hiệu..."
                                    ></textarea>
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
                                    {loading ? 'Đang lưu...' : 'Lưu nhập'}
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
                        </form>
                    </div>

                    {/* Right column - Categories */}
                    <div className="col-span-1">
                        <div>
                            {/* Category selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Danh mục <span className="text-red-500">*</span>
                                </label>
                                <div className={`max-h-[300px] overflow-y-auto border ${formErrors.categories ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}>
                                    {loadingCategories ? (
                                        <p className="text-center text-gray-500">Đang tải danh mục...</p>
                                    ) : (
                                        categories.map((category) => (
                                            <div key={category._id} className="mb-2 flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`category-${category._id}`}
                                                    checked={formData.categories.includes(category._id)}
                                                    onChange={() => handleCategoryChange(category._id)}
                                                    className="mr-2"
                                                />
                                                <label htmlFor={`category-${category._id}`} className="text-sm text-gray-700">
                                                    {category.name}
                                                </label>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {formErrors.categories && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.categories}</p>
                                )}
                            </div>

                            {/* Image upload */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hình đại diện
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                                    <div className="mb-3 flex justify-center">
                                        <Upload size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">Upload or drop a file right here</p>
                                    <p className="text-xs text-gray-400">JPEG,PNG,GIF,JPG</p>
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="fileUpload"
                                        accept="image/jpeg,image/png,image/gif,image/jpg"
                                    />
                                    <label
                                        htmlFor="fileUpload"
                                        className="mt-4 inline-block bg-white border border-gray-300 rounded px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
                                    >
                                        Chọn file
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBrand;