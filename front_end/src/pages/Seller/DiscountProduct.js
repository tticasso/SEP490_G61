import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Search,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import Sidebar from './Sidebar';

const DiscountProducts = () => {
  const navigate = useNavigate();
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sắp xếp state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  
  // Dropdown state
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const products = [
    {
      id: 1,
      name: 'Cuộn dây ruy băng trứng kim tuyến dài 10m dây cột bong bóng trang trí tiệc, sinh nhật',
      originalPrice: 8000,
      discountAmount: 5000,
      salePrice: 3000,
      status: 'Hết hạn',
      image: '/api/placeholder/70/70',
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'Hộp bông ngoáy tai 2 đầu 200 cái',
      originalPrice: 12900,
      discountAmount: 5000,
      salePrice: 7900,
      status: 'Hết hạn',
      image: '/api/placeholder/70/70',
      createdAt: new Date('2024-02-20')
    },
    {
      id: 3,
      name: 'Loa Bluetooth Mini Loa bluetooth mini di động cầm tay ⭐Đèn LED Đổi Màu⭐- Tặng Kèm Dây Đeo ⭐BH 1 Năm⭐',
      originalPrice: 65000,
      discountPercent: 12,
      salePrice: 57200,
      status: 'Hết hạn',
      image: '/api/placeholder/70/70',
      createdAt: new Date('2024-03-01')
    },
    {
      id: 4,
      name: 'Sách - 365 Truyện Kể Cho Bé Trước Giờ Đi Ngủ',
      originalPrice: 42000,
      discountPercent: 12,
      salePrice: 36960,
      status: 'Hết hạn',
      image: '/api/placeholder/70/70',
      createdAt: new Date('2024-03-10')
    },
    {
      id: 5,
      name: 'Truyện - Conan ( TB 2023 ) ( Tập 1 - Tập 50 )',
      originalPrice: 25000,
      discountPercent: 12,
      salePrice: 22000,
      status: 'Hết hạn',
      image: '/api/placeholder/70/70',
      createdAt: new Date('2024-04-05')
    }
  ];

  // Áp dụng lọc và sắp xếp cho sản phẩm
  const filteredAndSortedProducts = useMemo(() => {
    // Lọc theo từ khóa tìm kiếm
    let filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Áp dụng sắp xếp nếu có
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Xử lý trường hợp giá trị null hoặc undefined
        const aValue = a[sortConfig.key] !== undefined ? a[sortConfig.key] : '';
        const bValue = b[sortConfig.key] !== undefined ? b[sortConfig.key] : '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [products, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setIsSortDropdownOpen(false);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === filteredAndSortedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredAndSortedProducts.map(product => product.id));
    }
  };

  const formatPrice = (price) => {
    return `${price.toLocaleString()} đ`;
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 bg-gray-100 min-h-screen">
          {/* Header */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center">
            <div className="flex space-x-4 text-gray-600">
              <div className={`cursor-pointer ${!searchTerm ? 'text-blue-600 font-medium' : ''}`}>
                Tất cả (7)
              </div>
              <div className="border-l border-gray-300 pl-4 cursor-pointer">
                Hiển thị (2)
              </div>
              <div className="border-l border-gray-300 pl-4 cursor-pointer">
                Nháp (5)
              </div>
              <div className="border-l border-gray-300 pl-4 cursor-pointer">
                Thùng rác (0)
              </div>
            </div>
            <div className="ml-auto">
              <button 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center"
                onClick={() => navigate('/seller-dashboard/discount-product/add-discount')}
              >
                <Plus size={20} className="mr-2" />
                Thêm mới
              </button>
            </div>
          </div>

          {/* Function bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-600">
              Chức năng: <span className="text-red-500">Thêm vô thùng rác (0)</span>
            </div>
            <div className="flex space-x-4">
              {/* Sắp xếp theo - với dropdown */}
              <div className="relative">
                <div 
                  className="flex items-center border rounded p-2 bg-white cursor-pointer"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                >
                  <span>Sắp xếp theo</span>
                  <ChevronDown size={16} className="ml-2" />
                </div>
                {isSortDropdownOpen && (
                  <div className="absolute z-10 right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                    <div 
                      className="p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                      onClick={() => handleSort('originalPrice')}
                    >
                      Giá gốc
                      {getSortIcon('originalPrice')}
                    </div>
                    <div 
                      className="p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                      onClick={() => handleSort('salePrice')}
                    >
                      Giá bán
                      {getSortIcon('salePrice')}
                    </div>
                    <div 
                      className="p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Tên A-Z
                      {getSortIcon('name')}
                    </div>
                    <div 
                      className="p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      Ngày tạo
                      {getSortIcon('createdAt')}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="flex items-center border rounded p-2 bg-white">
                  <Search size={18} className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    className="outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4" 
                      checked={selectedProducts.length === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0}
                      onChange={toggleAllProducts}
                    />
                  </th>
                  <th 
                    className="p-4 text-left cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      TÊN SẢN PHẨM
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="p-4 text-left cursor-pointer"
                    onClick={() => handleSort('originalPrice')}
                  >
                    <div className="flex items-center">
                      GIÁ GỐC ĐỊNH
                      {getSortIcon('originalPrice')}
                    </div>
                  </th>
                  <th className="p-4 text-left">GIÁ KHUYẾN MÃI</th>
                  <th 
                    className="p-4 text-left cursor-pointer"
                    onClick={() => handleSort('salePrice')}
                  >
                    <div className="flex items-center">
                      GIÁ BÁN
                      {getSortIcon('salePrice')}
                    </div>
                  </th>
                  <th className="p-4 text-left">TRẠNG THÁI</th>
                  <th className="p-4 text-center">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-16 h-16 mr-4 object-cover border rounded"
                        />
                        <span className="line-clamp-2">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{formatPrice(product.originalPrice)}</td>
                    <td className="p-4 text-red-500">
                      {product.discountAmount 
                        ? `-${formatPrice(product.discountAmount)}` 
                        : `-${product.discountPercent}%`}
                    </td>
                    <td className="p-4">{formatPrice(product.salePrice)}</td>
                    <td className="p-4">
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center space-x-4">
                        <Edit size={18} className="text-gray-500 cursor-pointer" />
                        <div className="text-gray-300">|</div>
                        <Trash2 size={18} className="text-red-500 cursor-pointer" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountProducts;