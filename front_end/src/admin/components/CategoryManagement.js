import React, { useState } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import babyToys from '../../assets/babyToys.jpg'
import dongho from '../../assets/dongho.png'
import quanao from '../../assets/quanao.jpg'


const CategoryManagement = () => {
    // Sample category data
    const categoryData = [
        {
            id: 1,
            name: 'Máy tính & laptop',
            image: dongho,
            description: 'Category for laptops',
            lastUpdate: '22:46 1/3/2024',
            status: 'Hoạt động',
            productCount: 14
        },
        {
            id: 2,
            name: 'Đồng hồ',
            image: dongho,
            description: 'Category for smartwatches',
            lastUpdate: '22:46 1/3/2024',
            status: 'Hoạt động',
            productCount: 10
        },
        {
            id: 3,
            name: 'Thời trang nam',
            image: quanao,
            description: 'Category for accessories',
            lastUpdate: '22:46 1/3/2024',
            status: 'Hoạt động',
            productCount: 7
        },
        {
            id: 4,
            name: 'Thời trang nữ',
            image: quanao,
            description: 'Category for cameras',
            lastUpdate: '22:46 1/3/2024',
            status: 'Hoạt động',
            productCount: 5
        },
        {
            id: 5,
            name: 'Mẹ & bé',
            image: babyToys,
            description: 'Category for tablets',
            lastUpdate: '22:46 1/3/2024',
            status: 'Hoạt động',
            productCount: 4
        }
    ];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 6;

    // Filter states
    const [filter, setFilter] = useState({
        all: true,
        visible: false,
        imported: false,
        trash: false
    });

    // Selected categories for bulk actions
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Handle checkbox selection
    const handleSelectCategory = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedCategories.length === categoryData.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categoryData.map(category => category.id));
        }
    };

    // Handle pagination
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="flex-1 bg-gray-50">
            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex space-x-6 text-gray-600">
                    <button
                        className={`${filter.all ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: true, visible: false, imported: false, trash: false })}
                    >
                        Tất cả ( 26 )
                    </button>
                    <button
                        className={`${filter.visible ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: false, visible: true, imported: false, trash: false })}
                    >
                        Hiển thị ( 26 )
                    </button>
                    <button
                        className={`${filter.imported ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: false, visible: false, imported: true, trash: false })}
                    >
                        Nhập ( 0 )
                    </button>
                    <button
                        className={`${filter.trash ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: false, visible: false, imported: false, trash: true })}
                    >
                        Thùng rác ( 1 )
                    </button>
                </div>
                <div className="flex items-center">
                    <div className="flex items-center mr-4">
                        <span className="text-gray-500 mr-2">Dữ liệu mới nhất</span>
                        <RefreshCw size={18} className="text-gray-500" />
                    </div>
                    <div className="text-gray-500">July 12, 2024 16:10 PM</div>
                </div>
            </div>

            {/* Function bar */}
            <div className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center">
                    <div className="text-gray-700 mr-2">Chức năng:</div>
                    <button className="text-pink-500">Thêm vỏ thùng rác ( 0 )</button>
                </div>

                <div className="flex items-center">
                    <div className="mr-4">
                        <select className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                            <option>Sắp xếp theo</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="border border-gray-300 rounded-md px-3 py-2"
                        />
                    </div>
                </div>
            </div>

            {/* Categories table */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-md shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={selectedCategories.length === categoryData.length && categoryData.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Tên danh mục
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Mô tả
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        Cập nhật gần nhất
                                        <button className="ml-2">
                                            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                        </button>
                                    </div>
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Số sản phẩm
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categoryData.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={() => handleSelectCategory(category.id)}
                                        />
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="h-10 w-10 mr-3 object-cover"
                                            />
                                            <span className="text-sm text-gray-900">{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{category.description}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{category.lastUpdate}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                            {category.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{category.productCount}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center space-x-3">
                                            <button className="text-gray-500 hover:text-blue-600">
                                                <Edit size={18} />
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button className="text-gray-500 hover:text-red-600">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                className="p-2 border border-gray-300 rounded-md mr-2"
                                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <button className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center mr-2">
                                1
                            </button>

                            <button
                                className="w-8 h-8 rounded-full text-gray-700 flex items-center justify-center mr-2"
                                onClick={() => goToPage(2)}
                            >
                                2
                            </button>

                            <button
                                className="w-8 h-8 rounded-full text-gray-700 flex items-center justify-center mr-2"
                                onClick={() => goToPage(3)}
                            >
                                3
                            </button>

                            <button
                                className="p-2 border border-gray-300 rounded-md"
                                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="flex items-center text-sm text-gray-700">
                            <span>Trang 1 của 6</span>
                            <span className="mx-4">-</span>
                            <span>Hiển thị</span>
                            <select className="mx-2 border border-gray-300 rounded p-1">
                                <option>5</option>
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                            <span>/</span>
                            <span className="ml-2">27</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Category Button (Fixed position) */}
            <div className="fixed bottom-8 right-8">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center">
                    <span className="mr-2">+</span>
                    <span>Thêm mới</span>
                </button>
            </div>
        </div>
    );
};

export default CategoryManagement;