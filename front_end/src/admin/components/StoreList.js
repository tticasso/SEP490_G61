import React, { useState } from 'react';
import { Trash2, Edit, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import StoreDetail from './StoreDetail';
import ShopAvatar from '../../assets/ShopAvatar.png'
import ShopOwner from '../../assets/ShopOwner.png'
import nguoidep from '../../assets/nguoidep.jpg'
import ShopBackground from '../../assets/ShopBackground.png'

const StoreList = () => {
    const [showStoreDetail, setShowStoreDetail] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);

    // Sample store data
    const storeData = [
        {
            id: 1,
            name: 'dinh shop',
            image: ShopAvatar,
            phone: '033583800',
            idNumber: '068203002554',
            status: 'Hoạt động',
            productCount: 0
        },
        {
            id: 2,
            name: 'Laptop tooc',
            image: nguoidep,
            phone: '0333583800',
            idNumber: '068203002553',
            status: 'Hoạt động',
            productCount: 72
        },
        {
            id: 3,
            name: 'HongThom',
            image: ShopOwner,
            phone: '036997022',
            idNumber: '215578461245',
            status: 'Hoạt động',
            productCount: 19
        },
        {
            id: 4,
            name: 'Đồ thủ công',
            image: ShopBackground,
            phone: '036997022',
            idNumber: '215578461245',
            status: 'Hoạt động',
            productCount: 22
        }
    ];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 1;

    // Filter states
    const [filter, setFilter] = useState({
        all: true,
        active: false,
        unconfirmed: false,
        locked: false,
        rejected: false
    });

    // Selected stores for bulk actions
    const [selectedStores, setSelectedStores] = useState([]);

    // Handle checkbox selection
    const handleSelectStore = (storeId) => {
        if (selectedStores.includes(storeId)) {
            setSelectedStores(selectedStores.filter(id => id !== storeId));
        } else {
            setSelectedStores([...selectedStores, storeId]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedStores.length === storeData.length) {
            setSelectedStores([]);
        } else {
            setSelectedStores(storeData.map(store => store.id));
        }
    };

    // Handle pagination
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    // Handle store selection to view details
    const handleViewStoreDetail = (store) => {
        setSelectedStore(store);
        setShowStoreDetail(true);
    };

    // Handle back from store detail
    const handleBackFromDetail = () => {
        setShowStoreDetail(false);
        setSelectedStore(null);
    };

    return (
        <div className="flex-1 bg-gray-50">
            {showStoreDetail ? (
                <StoreDetail onBack={handleBackFromDetail} storeData={selectedStore} />
            ) : (
                <>
                    {/* Tabs */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex space-x-6 text-gray-600">
                            <button
                                className={`${filter.all ? 'text-blue-600' : ''}`}
                                onClick={() => setFilter({ all: true, active: false, unconfirmed: false, locked: false, rejected: false })}
                            >
                                Tất cả ( 4 )
                            </button>
                            <button
                                className={`${filter.active ? 'text-blue-600' : ''}`}
                                onClick={() => setFilter({ all: false, active: true, unconfirmed: false, locked: false, rejected: false })}
                            >
                                Hoạt động ( 4 )
                            </button>
                            <button
                                className={`${filter.unconfirmed ? 'text-blue-600' : ''}`}
                                onClick={() => setFilter({ all: false, active: false, unconfirmed: true, locked: false, rejected: false })}
                            >
                                Chưa xác nhận ( 0 )
                            </button>
                            <button
                                className={`${filter.locked ? 'text-blue-600' : ''}`}
                                onClick={() => setFilter({ all: false, active: false, unconfirmed: false, locked: true, rejected: false })}
                            >
                                Khóa ( 0 )
                            </button>
                            <button
                                className={`${filter.rejected ? 'text-blue-600' : ''}`}
                                onClick={() => setFilter({ all: false, active: false, unconfirmed: false, locked: false, rejected: true })}
                            >
                                Từ chối ( 0 )
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

                    {/* Stores table */}
                    <div className="px-6 pb-6">
                        <div className="bg-white rounded-md shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="py-3 px-4 text-left">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={selectedStores.length === storeData.length && storeData.length > 0}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                            Tên cửa hàng
                                        </th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                            Điện thoại
                                        </th>
                                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                            Căn cước công dân
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
                                    {storeData.map((store) => (
                                        <tr key={store.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={selectedStores.includes(store.id)}
                                                    onChange={() => handleSelectStore(store.id)}
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    <img
                                                        src={store.image}
                                                        alt={store.name}
                                                        className="h-10 w-10 mr-3 object-cover"
                                                    />
                                                    <span
                                                        className="text-sm text-gray-900 hover:text-blue-600 cursor-pointer"
                                                        onClick={() => handleViewStoreDetail(store)}
                                                    >
                                                        {store.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{store.phone}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{store.idNumber}</td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                    {store.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{store.productCount}</td>
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
                                        className="p-2 border border-gray-300 rounded-md"
                                        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center text-sm text-gray-700">
                                    <span>Trang 1 của 1</span>
                                    <span className="mx-4">-</span>
                                    <span>Hiển thị</span>
                                    <select className="mx-2 border border-gray-300 rounded p-1">
                                        <option>5</option>
                                        <option>10</option>
                                        <option>20</option>
                                        <option>50</option>
                                    </select>
                                    <span>/</span>
                                    <span className="ml-2">4</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add New Store Button (Fixed position) */}
                    <div className="fixed bottom-8 right-8">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center">
                            <span className="mr-2">+</span>
                            <span>Thêm mới</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default StoreList;