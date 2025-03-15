import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu,
    Search,
    User,
    Heart,
    ShoppingCart,
    Globe,
    PiggyBank,
    ChevronRight,
    LogOut,
    MessageSquare,
    Package,
    MapPin,
    Lock,
    UserCircle,
    Store
} from 'lucide-react';
import CartModal from '../pages/cart/CartModal';
import logo from '../assets/logo.png';
import AuthService from '../services/AuthService';
// Import MessageEventBus từ Message.js
import { MessageEventBus } from '../pages/UserProfile/components/Message';

const ProductCategoriesSidebar = ({ isOpen, onClose, buttonRef }) => {
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target) &&
                !event.target.closest('.cartbutton')
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const categories = [
        { name: 'Máy tính & laptop', hasSubcategories: true },
        { name: 'Đồng hồ', hasSubcategories: false },
        { name: 'Thời trang nam', hasSubcategories: true },
        { name: 'Thời trang nữ', hasSubcategories: false },
        { name: 'Mẹ & bé', hasSubcategories: false },
        { name: 'Nhà cửa & đời sống', hasSubcategories: false },
        { name: 'Sắc đẹp', hasSubcategories: false },
        { name: 'Sức khỏe', hasSubcategories: false }
    ];

    return (
        <div
            ref={sidebarRef}
            className={`
                fixed z-50 top-[140px] left-[280px] w-64 bg-white 
                border shadow-lg rounded-md 
                transition-all duration-300 ease-in-out 
                ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
            `}
        >
            <ul className="py-2">
                {categories.map((category, index) => (
                    <li
                        onClick={() => window.location.href = "categories"}
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                    >
                        {category.name}
                        {category.hasSubcategories && (
                            <ChevronRight size={16} className="text-gray-500" />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Header = () => {
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [language, setLanguage] = useState('Vietnamese');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCategoriesSidebarOpen, setIsCategoriesSidebarOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    // State cho số lượng tin nhắn chưa đọc
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    // Use AuthService directly instead of AuthContext
    const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isLoggedIn());
    const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());

    const categoriesButtonRef = useRef(null);
    const userDropdownRef = useRef(null);
    const userButtonRef = useRef(null);

    // Lắng nghe sự kiện thay đổi số lượng tin nhắn chưa đọc
    useEffect(() => {
        // Đăng ký lắng nghe sự kiện thay đổi số lượng tin nhắn chưa đọc
        const unsubscribe = MessageEventBus.subscribe('unreadCountChanged', (count) => {
            setUnreadMessageCount(count);
        });
        
        // Cleanup khi component unmount
        return () => {
            unsubscribe();
        };
    }, []);

    // Lắng nghe sự kiện localStorage thay đổi
    useEffect(() => {
        // Hàm này sẽ được gọi khi sự kiện storage được kích hoạt
        const handleStorageChange = () => {
            // Lấy thông tin user mới từ localStorage
            const user = AuthService.getCurrentUser();
            // Kiểm tra đăng nhập
            const loggedIn = AuthService.isLoggedIn();
            
            // Cập nhật state
            setIsLoggedIn(loggedIn);
            setCurrentUser(user);
            
            console.log('Header detected auth change:', { loggedIn, userRoles: user?.roles });
        };

        // Đăng ký lắng nghe sự kiện storage
        window.addEventListener('storage', handleStorageChange);
        
        // Cập nhật trạng thái ban đầu
        handleStorageChange();
        
        // Cleanup khi component unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Always check both id and _id for compatibility
    const userId = currentUser?.id || currentUser?._id || "";
    
    // Kiểm tra xem người dùng có role SELLER không - cải tiến phương pháp phát hiện role
    const isSeller = currentUser?.roles?.some(role => {
        // Kiểm tra nhiều dạng role có thể có
        if (typeof role === 'object' && role !== null) {
            return role.name === "SELLER" || role.name === "ROLE_SELLER";
        }
        
        if (typeof role === 'string') {
            return role === "SELLER" || role === "ROLE_SELLER";
        }
        
        return false;
    });

    const toggleCategoriesSidebar = () => {
        setIsCategoriesSidebarOpen(!isCategoriesSidebarOpen);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    // Xử lý đăng xuất - sử dụng AuthService trực tiếp
    const handleLogout = () => {
        AuthService.logout();
        setIsUserDropdownOpen(false);
        setIsLoggedIn(false);
        setCurrentUser(null);
        navigate('/');
        window.location.reload();
    };

    // Xử lý click bên ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target) &&
                userButtonRef.current &&
                !userButtonRef.current.contains(event.target)
            ) {
                setIsUserDropdownOpen(false);
            }
        };

        if (isUserDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserDropdownOpen]);

    return (
        <div className="bg-white shadow-sm relative">
            {/* Top Notification Bar */}
            <div className='border-b'>
                <div className="mx-auto max-w-7xl py-2 flex items-center justify-between flex ">
                    <div className="text-center py-4 text-sm px-4">
                        Đăng ký bán hàng cùng TROOC để có những ưu đãi hấp dẫn
                    </div>
                    {/* Language and Tracking */}
                    <div className="flex gap-3 items-center space-x-4 text-sm text-gray-600">
                        <a href="#" className="hover:text-purple-600">Vị trí cửa hàng</a>
                        <a href="#" className="hover:text-purple-600">Theo dõi đơn hàng</a>
                        <a href="#" className="hover:text-purple-600">FAQs</a>
                        <div className="flex items-center space-x-2">
                            <Globe size={16} />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent outline-none"
                            >
                                <option value="Vietnamese">Vietnamese</option>
                                <option value="English">English</option>
                            </select>
                        </div>
                        {/* Currency */}
                        <div className="text-sm text-gray-600">
                            Việt Nam (VNĐ)
                        </div>
                    </div>
                </div>
            </div>

            {/* Logo and Search Section */}
            <div className='border-b py-6'>
                <div href='/' className="mx-auto max-w-7xl px-4  flex items-center space-x-6">
                    {/* Logo */}
                    <a href='/' className="flex items-center">
                        <img
                            src={logo}
                            alt="TROOC Logo"
                            className="w-16 h-16"
                        />
                    </a>

                    {/* Category and Search */}
                    <div className="flex-grow flex items-center space-x-4">
                        {/* Category Dropdown */}
                        <div className="relative">
                            <select className="bg-gray-100 px-4 py-2 rounded-md text-sm appearance-none pr-8">
                                <option>Tất cả danh mục</option>
                                <option>Điện tử</option>
                                <option>Thời trang</option>
                                <option>Nhà cửa</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="flex-grow relative w-2/5">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button className="absolute right-0 top-0 bottom-0 px-4 bg-purple-600 text-white rounded-r-md hover:bg-purple-700">
                                <Search size={20} />
                            </button>
                        </div>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-12">
                        {/* User Account Section - Conditional Rendering */}
                        <div className="relative">
                            {isLoggedIn ? (
                                // Nếu đã đăng nhập, hiển thị nút dropdown tài khoản
                                <button
                                    ref={userButtonRef}
                                    className="flex flex-col items-center text-gray-600 hover:text-purple-600 text-xs relative"
                                    onClick={toggleUserDropdown}
                                >
                                    <User size={24} />
                                    <span>Tài khoản</span>
                                    {/* Hiển thị badge khi có tin nhắn chưa đọc */}
                                    {unreadMessageCount > 0 && (
                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                        </div>
                                    )}
                                </button>
                            ) : (
                                // Nếu chưa đăng nhập, hiển thị nút chuyển đến trang login
                                <button
                                    className="flex flex-col items-center text-gray-600 hover:text-purple-600 text-xs"
                                    onClick={() => navigate('/login')}
                                >
                                    <User size={24} />
                                    <span>Login</span>
                                </button>
                            )}

                            {/* User Dropdown Menu for Logged In Users */}
                            {isLoggedIn && isUserDropdownOpen && (
                                <div
                                    ref={userDropdownRef}
                                    className="absolute z-50 right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border"
                                >
                                    <div className="px-4 py-2 border-b">
                                        <div className="font-medium text-gray-900">
                                            {currentUser?.email}
                                        </div>
                                    </div>

                                    <a
                                        href="/user-profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <UserCircle size={16} className="mr-2" />
                                        Tài khoản của tôi
                                    </a>

                                    <a
                                        href="/user-profile/orders"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Package size={16} className="mr-2" />
                                        Đơn mua
                                    </a>

                                    <a
                                        href="/user-profile/messages"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center relative"
                                    >
                                        <MessageSquare size={16} className="mr-2" />
                                        Tin nhắn
                                        {/* Hiển thị badge trong dropdown khi có tin nhắn chưa đọc */}
                                        {unreadMessageCount > 0 && (
                                            <div className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                            </div>
                                        )}
                                    </a>

                                    <a
                                        href="/user-profile/addresses"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <MapPin size={16} className="mr-2" />
                                        Địa chỉ nhận hàng
                                    </a>

                                    <a
                                        href="/user-profile/followed-shops"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Store size={16} className="mr-2" />
                                        Cửa hàng đã theo dõi
                                    </a>

                                    <a
                                        href="/user-profile/password"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <Lock size={16} className="mr-2" />
                                        Đổi mật khẩu
                                    </a>

                                    {/* Hiển thị nút truy cập vào SellerDashboard nếu người dùng có role SELLER */}
                                    {isSeller && (
                                        <a
                                            href="/seller-dashboard"
                                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center"
                                        >
                                            <Store size={16} className="mr-2" />
                                            Quản lý cửa hàng
                                        </a>
                                    )}

                                    <div className="border-t mt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="flex flex-col items-center text-gray-600 hover:text-purple-600 text-xs">
                            <Heart size={24} />
                        </button>

                        <div className='flex gap-2'>
                            <button id='cartbutton' className='cartbutton' onClick={() => setIsCartOpen(true)}>
                                <ShoppingCart size={24} />
                            </button>
                            <div className='flex flex-col items-center text-gray-600 hover:text-purple-600 text-xs'>
                                <p>Giỏ hàng</p>
                                <span>0 ₫</span>
                            </div>
                        </div>

                        <CartModal
                            isOpen={isCartOpen}
                            onClose={() => setIsCartOpen(false)}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="">
                <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between space-x-6 text-sm">
                    <button
                        ref={categoriesButtonRef}
                        className="flex items-center space-x-2 font-semibold"
                        onClick={toggleCategoriesSidebar}
                    >
                        <Menu size={20} />
                        <span>Danh mục sản phẩm</span>
                    </button>

                    <a href="/" className="hover:text-purple-600">Trang chủ</a>
                    <a href="categories" className="hover:text-purple-600">Danh mục</a>
                    <a href="#" className="hover:text-purple-600">Bài viết</a>
                    <a href="#" className="hover:text-purple-600">Hỗ trợ</a>
                    <a href="shop-registration" className="text-red-500 font-semibold">Đăng ký bán hàng</a>
                    <span className="ml-auto text-red-500 font-semibold items-center flex gap-2">
                        <PiggyBank size={30} className='color-red'></PiggyBank> Khuyến mại 20% cho đơn hàng đầu tiên
                    </span>
                </div>
            </nav>

            {/* Product Categories Sidebar */}
            <ProductCategoriesSidebar
                isOpen={isCategoriesSidebarOpen}
                onClose={() => setIsCategoriesSidebarOpen(false)}
                buttonRef={categoriesButtonRef}
            />
        </div>
    );
};

export default Header;