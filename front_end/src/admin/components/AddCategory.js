import React, { useState } from 'react';
import { ChevronLeft, RefreshCw, Upload } from 'lucide-react';

const AddCategory = () => {
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [parentCategory, setParentCategory] = useState('Không');
    const [image, setImage] = useState(null);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to save the category
        console.log({
            categoryName,
            description,
            parentCategory,
            image
        });
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    // Handle save and display
    const handleSaveAndDisplay = () => {
        // Logic to save and display
        console.log("Save and display");
    };

    // Handle save
    const handleSave = () => {
        // Logic to save
        console.log("Save only");
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
                    <div className="text-gray-500">July 12, 2024 16:10 PM</div>
                </div>
            </div>

            {/* Back button */}
            <div className="p-6">
                <button className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
                    <ChevronLeft size={18} className="mr-1" />
                    <span>Quay lại</span>
                </button>

                <div className="grid grid-cols-3 gap-6">
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
                                    placeholder="Tên danh mục"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                />
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
                                        className="w-full p-3 min-h-[150px] focus:outline-none"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Nhập mô tả cho danh mục..."
                                    ></textarea>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right column - Options */}
                    <div className="col-span-1">
                        <div>
                            {/* Parent category */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cấp cha
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={parentCategory}
                                    onChange={(e) => setParentCategory(e.target.value)}
                                >
                                    <option value="Không">Không</option>
                                    <option value="Danh mục 1">Danh mục 1</option>
                                    <option value="Danh mục 2">Danh mục 2</option>
                                </select>
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
                                        onChange={handleImageUpload}
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

                {/* Action buttons */}
                <div className="mt-8 flex justify-center space-x-4">
                    <button
                        type="button"
                        className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                        onClick={handleSave}
                    >
                        Lưu bản nháp
                    </button>
                    <button
                        type="button"
                        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                        onClick={handleSaveAndDisplay}
                    >
                        Lưu và hiển thị
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCategory;