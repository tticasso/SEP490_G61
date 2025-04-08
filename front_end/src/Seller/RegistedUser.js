import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Loader } from 'lucide-react';
import Sidebar from './Sidebar';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

const RegisteredUsers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Add new states for API data handling
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reference to prevent duplicate API calls
  const fetchInProgress = React.useRef(false);

  // Fetch shop followers data
  useEffect(() => {
    // Track if component is mounted
    let isMounted = true;
    
    const fetchShopFollowers = async () => {
      // Prevent duplicate fetches
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;
      
      try {
        setLoading(true);
        
        // Verify user is authenticated
        if (!AuthService.isLoggedIn()) {
          throw new Error('User not authenticated');
        }
        
        // First, get the user's shop
        const shop = await ApiService.get('/shops/my-shop');
        // Check if component is still mounted
        if (!isMounted) return;
        
        if (!shop) {
          throw new Error('No shop found for this user');
        }
        
        const shopId = shop._id; // Get the shop ID
        
        // Fetch followers for this shop
        const fetchedFollowers = await ApiService.get(`/shop-follow/followers/${shopId}`);
        // Check if component is still mounted
        if (!isMounted) return;
        
        // Format followers data
        const formattedFollowers = fetchedFollowers.map(follower => ({
          id: follower._id,
          name: `${follower.firstName || ''} ${follower.lastName || ''}`.trim(),
          email: follower.email,
          phone: follower.phone || 'N/A',
          registered_time: new Date(follower.createdAt || follower.created_at || Date.now()).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: false
          })
        }));
        
        setFollowers(formattedFollowers);
        setError(null);
      } catch (err) {
        console.error('Error fetching followers data:', err);
        setError('Không thể tải danh sách người theo dõi. Vui lòng thử lại sau.');
        setFollowers([]); // Set empty array instead of sample data
      } finally {
        // Update loading state only if component is still mounted
        if (isMounted) {
          setLoading(false);
        }
        fetchInProgress.current = false;
      }
    };
    
    fetchShopFollowers();
    
    // Cleanup function when component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  // Apply sorting and filtering to followers
  const filteredFollowers = useMemo(() => {
    let result = [...followers];
    
    // Apply search filtering
    if (searchTerm) {
      result = result.filter(follower => 
        follower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        follower.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        follower.phone.includes(searchTerm)
      );
    }
    
    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let compareA = a[sortBy];
        let compareB = b[sortBy];
        
        // Convert to lowercase if comparing strings
        if (typeof compareA === 'string' && typeof compareB === 'string') {
          compareA = compareA.toLowerCase();
          compareB = compareB.toLowerCase();
        }
        
        if (compareA < compareB) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (compareA > compareB) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [followers, searchTerm, sortBy, sortDirection]);

  // Get paginated data
  const paginatedFollowers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFollowers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFollowers, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredFollowers.length / itemsPerPage);

  // Handle pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Handle sorting change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={(path) => navigate(path)} />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white min-h-screen">
          {/* Menu tabs */}
          <div className="p-4 border-b flex items-center space-x-6 text-sm">
            <div className="text-gray-500">Tất cả ( {followers.length} )</div>
            <div className="text-gray-500">Đang theo dõi ( {followers.length} )</div>
          </div>

          {/* Search and filter tools */}
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Danh sách người theo dõi cửa hàng</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select 
                  className="border rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={sortBy}
                  onChange={(e) => {
                    handleSortChange(e.target.value);
                  }}
                >
                  <option value="">Sắp xếp theo</option>
                  <option value="name">Tên</option>
                  <option value="registered_time">Thời gian theo dõi</option>
                  <option value="email">Email</option>
                </select>
              </div>
              
              <div className="relative border rounded-md">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  className="px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader className="animate-spin mr-2" />
              <div className="text-gray-500">Đang tải danh sách người theo dõi...</div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          )}

          {/* Data table */}
          {!loading && !error && (
            <div className="px-4">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-y">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('name')}
                    >
                      NGƯỜI THEO DÕI {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('registered_time')}
                    >
                      THỜI GIAN THEO DÕI {sortBy === 'registered_time' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange('email')}
                    >
                      EMAIL {sortBy === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedFollowers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                        Không có người theo dõi nào
                      </td>
                    </tr>
                  ) : (
                    paginatedFollowers.map((follower) => (
                      <tr key={follower.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{follower.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {follower.registered_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {follower.email}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && (
            <div className="px-4 py-3 flex justify-between items-center border-t border-gray-200">
              <div className="flex items-center">
                <button 
                  className={`mr-2 p-1 rounded-full border w-8 h-8 flex items-center justify-center ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    className={`mr-2 p-1 rounded-full w-8 h-8 flex items-center justify-center ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white' 
                        : 'border'
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className={`p-1 rounded-full border w-8 h-8 flex items-center justify-center ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ArrowLeft size={16} className="rotate-180" />
                </button>
              </div>
              
              <div className="flex items-center text-sm">
                <span>Trang {currentPage} của {totalPages || 1}</span>
                <span className="mx-4">-</span>
                <span>Hiển thị</span>
                <select 
                  className="mx-2 border rounded p-1" 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span>/</span>
                <span className="ml-2">{followers.length} người theo dõi</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredUsers;