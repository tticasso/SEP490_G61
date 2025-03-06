import React, { useState } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import babyToys from '../../assets/babyToys.jpg'
import dongho from '../../assets/dongho.png'
import quanao from '../../assets/quanao.jpg'
import dienthoai from '../../assets/dienthoai.jpg'

const BrandList = () => {
    // Sample brand data
    const brandData = [
        {
            id: 1,
            name: 'Samsung',
            image: dienthoai,
            category: 'Điện thoại & phụ kiện',
            lastUpdate: '22:47 1/3/2024',
            status: 'Hoạt động'
        },
        {
            id: 2,
            name: 'Dell',
            image: babyToys,
            category: 'Máy tính & laptop',
            lastUpdate: '22:47 1/3/2024',
            status: 'Hoạt động'
        },
        {
            id: 3,
            name: 'HP',
            image: quanao,
            category: 'Máy tính & laptop',
            lastUpdate: '22:47 1/3/2024',
            status: 'Hoạt động'
        },
        {
            id: 4,
            name: 'Sony',
            image: dienthoai,
            category: 'Thời trang nữ',
            lastUpdate: '22:47 1/3/2024',
            status: 'Hoạt động'
        },
        {
            id: 5,
            name: 'Bose',
            image: dongho,
            category: 'Nhà cửa & đời sống',
            lastUpdate: '22:47 1/3/2024',
            status: 'Hoạt động'
        }
    ];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 9;

    // Filter states
    const [filter, setFilter] = useState({
        all: true,
        visible: false,
        imported: false,
        trash: false
    });

    // Selected brands for bulk actions
    const [selectedBrands, setSelectedBrands] = useState([]);

    // Handle checkbox selection
    const handleSelectBrand = (brandId) => {
        if (selectedBrands.includes(brandId)) {
            setSelectedBrands(selectedBrands.filter(id => id !== brandId));
        } else {
            setSelectedBrands([...selectedBrands, brandId]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedBrands.length === brandData.length) {
            setSelectedBrands([]);
        } else {
            setSelectedBrands(brandData.map(brand => brand.id));
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
                        Tất cả ( 44 )
                    </button>
                    <button
                        className={`${filter.visible ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: false, visible: true, imported: false, trash: false })}
                    >
                        Hiển thị ( 44 )
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
                        Thùng rác ( 0 )
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

            {/* Brands table */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-md shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={selectedBrands.length === brandData.length && brandData.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Tên thương hiệu
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Danh mục
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Cập nhật gần nhất
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {brandData.map((brand) => (
                                <tr key={brand.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={selectedBrands.includes(brand.id)}
                                            onChange={() => handleSelectBrand(brand.id)}
                                        />
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <img
                                                src={brand.image}
                                                alt={brand.name}
                                                className="h-10 w-10 mr-3 object-cover"
                                            />
                                            <span className="text-sm text-gray-900">{brand.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{brand.category}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{brand.lastUpdate}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                            {brand.status}
                                        </span>
                                    </td>
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
                            <span>Trang 1 của 9</span>
                            <span className="mx-4">-</span>
                            <span>Hiển thị</span>
                            <select className="mx-2 border border-gray-300 rounded p-1">
                                <option>5</option>
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                            <span>/</span>
                            <span className="ml-2">44</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Brand Button (Fixed position) */}
            <div className="fixed bottom-8 right-8">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center">
                    <span className="mr-2">+</span>
                    <span>Thêm mới</span>
                </button>
            </div>
        </div>
    );
};

export default BrandList;