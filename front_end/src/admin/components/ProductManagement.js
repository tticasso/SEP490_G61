import React, { useState } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import dongho from '../../assets/dongho.png'
import babyToys from '../../assets/babyToys.jpg'
import dienthoai from '../../assets/dienthoai.jpg'
import khautrang5d from '../../assets/khautrang5d.jpg'
import quanao from '../../assets/quanao.jpg'

const ProductManagement = () => {
    // Sample product data
    const productData = [
        {
            id: 1,
            name: 'dwdqw123',
            image: dongho,
            stock: 123,
            price: '1.212 đ',
            sold: 0,
            type: 'multiple'
        },
        {
            id: 2,
            name: 'Set 5 Miếng Vải Ren Thêu Hoa Trang Trí Quần Áo Thủ Công',
            image: babyToys,
            stock: 3,
            price: '26.152 đ',
            sold: 0,
            type: 'single'
        },
        {
            id: 3,
            name: 'Kèm nhung loại 1 lông dày SET 100 màu pastel - dây sợi kèm lông làm hoa làm đồ chơi thủ công',
            image: dienthoai,
            stock: 65,
            price: '24.400 đ',
            sold: 0,
            type: 'single'
        },
        {
            id: 4,
            name: 'Chiếc Ngôi Sao May Mắn Giấy Gấp Ngôi Sao Màu Rơm Origami Ngôi Sao Đầy Đủ Dùng Thủ Công',
            image: khautrang5d,
            stock: 45,
            price: '12.000 đ',
            sold: 0,
            type: 'single'
        },
        {
            id: 5,
            name: 'Bộ Dụng Cụ Kim Thêu Hoa Tiết Đồ Thương Vui Nhộn Cho Trẻ Em',
            image: quanao,
            stock: 98,
            price: '99.000 đ',
            sold: 0,
            type: 'single'
        }
    ];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 23;

    // Filter states
    const [filter, setFilter] = useState({
        all: true,
        visible: false,
        imported: false,
        trash: false
    });

    // Selected products for bulk actions
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Handle checkbox selection
    const handleSelectProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedProducts.length === productData.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(productData.map(product => product.id));
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
                        Tất cả ( 0 )
                    </button>
                    <button
                        className={`${filter.visible ? 'text-blue-600' : ''}`}
                        onClick={() => setFilter({ all: false, visible: true, imported: false, trash: false })}
                    >
                        Hiện thị ( 0 )
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
                    <button className="text-pink-500">Thêm vào thùng rác ( 0 )</button>
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

            {/* Products table */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-md shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={selectedProducts.length === productData.length && productData.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Tên sản phẩm
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Số lượng
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Giá bán
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Đã bán
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Loại sản phẩm
                                </th>
                                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {productData.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => handleSelectProduct(product.id)}
                                        />
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-10 w-10 mr-3 object-cover"
                                            />
                                            <span className="text-sm text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                                            <span className="text-sm text-gray-700">In Stock ( {product.stock} )</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{product.price}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{product.sold}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{product.type}</td>
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
                            <span>Trang 1 của 23</span>
                            <span className="mx-4">-</span>
                            <span>Hiển thị</span>
                            <select className="mx-2 border border-gray-300 rounded p-1">
                                <option>5</option>
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                            <span>/</span>
                            <span className="ml-2">0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Product Button (Fixed position) */}
            <div className="fixed bottom-8 right-8">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center">
                    <Plus size={20} />
                    <span className="ml-2">Thêm mới</span>
                </button>
            </div>
        </div>
    );
};

export default ProductManagement;