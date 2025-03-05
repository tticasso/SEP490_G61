import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Copy, 
  Trash2, 
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import Sidebar from './Sidebar';

const ProductList = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Apple iPhone 15 Plus 128GB',
      stock: 35,
      price: 27790000,
      sold: 0,
      type: 'single',
      createdAt: new Date('2024-01-15'),
      category: 'Điện thoại'
    },
    {
      id: 2,
      name: 'Sữa rửa mặt CERAVE cho da dầu da mụn và Da Khô nhạy cảm 236ml',
      stock: 26,
      price: 105000,
      sold: 0,
      type: 'single',
      createdAt: new Date('2024-02-20'),
      category: 'Chăm sóc da'
    },
    {
      id: 3,
      name: 'Sữa Chống Nắng Cực Mạnh Sunplay Super Block SPF81 PA++++ 70Gr',
      stock: 54,
      price: 148000,
      sold: 0,
      type: 'single',
      createdAt: new Date('2024-03-10'),
      category: 'Chăm sóc da'
    }
  ]);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New state for dropdown visibility
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const categories = ['Tất cả', 'Điện thoại', 'Chăm sóc da'];

  const sortedProducts = useMemo(() => {
    let filteredProducts = products.filter(product => 
      (categoryFilter === 'Tất cả' || product.category === categoryFilter) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      filteredProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredProducts;
  }, [products, sortConfig, categoryFilter, searchTerm]);

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

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">Tất cả sản phẩm ({sortedProducts.length})</span>
              <div className="text-gray-500 space-x-2">
                <span>Hiển thị ({sortedProducts.length})</span>
                <span>Nháp (0)</span>
                <span>Thùng rác (0)</span>
              </div>
            </div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              onClick={() => navigate('/seller-dashboard/add-product')}
            >
              <Plus size={20} className="mr-2" />
              Thêm mới
            </button>
          </div>

          {/* Functionality Bar */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="text-gray-600">
              Chức năng: Thêm vô thùng rác (0)
            </div>
            <div className="flex space-x-4">
              {/* Sắp xếp theo */}
              <div className="relative">
                <div 
                  className="flex items-center border rounded px-3 py-2 cursor-pointer"
                  onClick={() => {
                    setIsSortDropdownOpen(!isSortDropdownOpen);
                    setIsCategoryDropdownOpen(false);
                  }}
                >
                  <span>Sắp xếp theo</span>
                  <ChevronDown size={16} className="ml-2" />
                </div>
                {isSortDropdownOpen && (
                  <div className="absolute z-10 right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                    <div 
                      className="p-2 hover:bg-gray-100 flex justify-between items-center"
                      onClick={() => handleSort('price')}
                    >
                      Giá 
                      {getSortIcon('price')}
                    </div>
                    <div 
                      className="p-2 hover:bg-gray-100 flex justify-between items-center"
                      onClick={() => handleSort('name')}
                    >
                      Tên A-Z 
                      {getSortIcon('name')}
                    </div>
                    <div 
                      className="p-2 hover:bg-gray-100 flex justify-between items-center"
                      onClick={() => handleSort('createdAt')}
                    >
                      Ngày tạo 
                      {getSortIcon('createdAt')}
                    </div>
                  </div>
                )}
              </div>

              {/* Chọn danh mục */}
              <div className="relative">
                <div 
                  className="flex items-center border rounded px-3 py-2 cursor-pointer"
                  onClick={() => {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                    setIsSortDropdownOpen(false);
                  }}
                >
                  <span>{categoryFilter}</span>
                  <ChevronDown size={16} className="ml-2" />
                </div>
                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                    {categories.map((category) => (
                      <div 
                        key={category}
                        className="p-2 hover:bg-gray-100"
                        onClick={() => {
                          setCategoryFilter(category);
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tìm kiếm */}
              <input 
                type="text" 
                placeholder="Tìm kiếm" 
                className="border rounded px-3 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Product Table */}
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left">
                  <input type="checkbox" />
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
                <th className="p-4 text-left">SỐ LƯỢNG</th>
                <th 
                  className="p-4 text-left cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    GIÁ
                    {getSortIcon('price')}
                  </div>
                </th>
                <th className="p-4 text-left">ĐÃ BÁN</th>
                <th className="p-4 text-left">LOẠI SẢN PHẨM</th>
                <th className="p-4 text-left">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input type="checkbox" />
                  </td>
                  <td className="p-4 flex items-center">
                    <img 
                      src="/api/placeholder/50/50" 
                      alt={product.name} 
                      className="w-12 h-12 mr-4 rounded"
                    />
                    <span>{product.name}</span>
                  </td>
                  <td className="p-4 text-green-600">In Stock ({product.stock})</td>
                  <td className="p-4">{product.price.toLocaleString()}₫</td>
                  <td className="p-4">{product.sold}</td>
                  <td className="p-4">{product.type}</td>
                  <td className="p-4 flex space-x-2">
                    <Copy size={20} className="text-gray-500 cursor-pointer" />
                    <Trash2 size={20} className="text-red-500 cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;