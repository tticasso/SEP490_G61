import React, { useState, useEffect } from 'react';
import { Truck, Edit2, Trash2 } from 'lucide-react';
import khautrang5d from '../../assets/khautrang5d.jpg';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [deliveryMethod, setDeliveryMethod] = useState('standard');
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddAddressPopup, setShowAddAddressPopup] = useState(false);
    const navigate = useNavigate();

    // Lấy thông tin người dùng từ AuthService
    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || currentUser?.userId || "";

    // Dữ liệu mẫu khi API không hoạt động
    const mockAddresses = [
        // {
        //     _id: "mock-address-1",
        //     user_id: userId,
        //     address_line1: "123 Đường Lê Lợi",
        //     address_line2: "Phường Bến Nghé",
        //     city: "Hồ Chí Minh",
        //     country: "Việt Nam",
        //     phone: "0901234567",
        //     status: true
        // },
        // {
        //     _id: "mock-address-2",
        //     user_id: userId,
        //     address_line1: "45 Đường Nguyễn Huệ",
        //     address_line2: "Phường Bến Thành",
        //     city: "Hồ Chí Minh",
        //     country: "Việt Nam",
        //     phone: "0907654321",
        //     status: true
        // }
    ];

    // Xử lý phản hồi API
    const processApiResponse = (response) => {
        console.log("Processing API response:", response);
        
        if (Array.isArray(response)) {
            console.log("Response is an array, setting directly:", response);
            setAddresses(response);
            if (response.length > 0) {
                setSelectedAddress(response[0]._id);
            }
            setError(null);
        } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
            // Xử lý trường hợp API trả về dữ liệu trong thuộc tính data
            console.log("Response has data array, setting from response.data:", response.data);
            setAddresses(response.data);
            if (response.data.length > 0) {
                setSelectedAddress(response.data[0]._id);
            }
            setError(null);
        } else if (response && typeof response === 'object' && response.addresses && Array.isArray(response.addresses)) {
            // Xử lý trường hợp response có thuộc tính 'addresses'
            console.log("Response has addresses array, setting from response.addresses:", response.addresses);
            setAddresses(response.addresses);
            if (response.addresses.length > 0) {
                setSelectedAddress(response.addresses[0]._id);
            }
            setError(null);
        } else if (response && typeof response === 'object' && !Array.isArray(response)) {
            // Trường hợp response là một object duy nhất - bọc trong mảng
            console.log("Response is a single object, wrapping in array:", [response]);
            setAddresses([response]);
            setSelectedAddress(response._id);
            setError(null);
        } else {
            console.warn("Dữ liệu không phải là mảng hoặc không có định dạng dự kiến:", response);
            setAddresses([]);
            setError("Định dạng dữ liệu không đúng");
        }
    };

    // Fetch addresses từ API hoặc sử dụng dữ liệu mẫu
    const fetchAddresses = async () => {
        try {
            setLoading(true);
            
            // Kiểm tra môi trường phát triển - ưu tiên ghi đè biến isDevelopment để dễ debug
            const isDevelopment = false; // Set false để luôn gọi API, true để sử dụng dữ liệu mẫu
            
            if (isDevelopment) {
                console.log("Đang chạy ở chế độ DEV - Sử dụng dữ liệu mẫu");
                
                // Delay giả lập API để tạo trải nghiệm thực tế
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Sử dụng dữ liệu mẫu
                setAddresses(mockAddresses);
                if (mockAddresses.length > 0) {
                    setSelectedAddress(mockAddresses[0]._id);
                }
                setError(null);
                setLoading(false);
                return;
            }
            
            // Kiểm tra userId
            if (!userId) {
                throw new Error("User ID không tồn tại");
            }
            
            console.log("Đang gọi API với userId:", userId);
            
            // Kiểm tra các endpoints khác nhau mà backend có thể đã đăng ký
            const possibleEndpoints = [
                `/address/list`, // Lấy tất cả địa chỉ rồi lọc phía client
                `/user-address/list`, // Lấy tất cả địa chỉ rồi lọc phía client  
                `/user-address/user/${userId}`,
                `/address/user/${userId}`
            ];
            
            let foundData = false;
            let lastError = null;
            
            // Thử từng endpoint cho đến khi tìm thấy dữ liệu
            for (const endpoint of possibleEndpoints) {
                try {
                    console.log(`Đang thử endpoint: ${endpoint}`);
                    const response = await ApiService.get(endpoint);
                    
                    // Nếu là endpoint list, lọc theo userId
                    if (endpoint.includes('/list')) {
                        const allAddresses = Array.isArray(response) ? response : 
                                        (response.data && Array.isArray(response.data)) ? response.data : [];
                        
                        console.log("All addresses before filtering:", allAddresses);
                        
                        // Lọc địa chỉ theo userId - chuyển đổi cả hai thành chuỗi để so sánh chắc chắn
                        const filteredAddresses = allAddresses.filter(addr => 
                            String(addr.user_id) === String(userId)
                        );
                        
                        console.log("Filtered addresses for userId", userId, ":", filteredAddresses);
                        
                        if (filteredAddresses.length > 0) {
                            setAddresses(filteredAddresses);
                            setSelectedAddress(filteredAddresses[0]._id);
                            foundData = true;
                            setError(null);
                            console.log(`Endpoint ${endpoint} hoạt động và tìm thấy ${filteredAddresses.length} địa chỉ!`);
                            break;
                        } else {
                            console.log(`Endpoint ${endpoint} hoạt động nhưng không tìm thấy địa chỉ cho userId ${userId}`);
                        }
                    } else {
                        // Nếu là endpoint user, sử dụng dữ liệu trực tiếp
                        console.log("Direct response from user endpoint:", response);
                        processApiResponse(response);
                        foundData = true;
                        setError(null);
                        console.log(`Endpoint ${endpoint} hoạt động!`);
                        break;
                    }
                } catch (apiError) {
                    console.log(`Endpoint ${endpoint} không hoạt động:`, apiError.message);
                    lastError = apiError;
                }
            }
            
            // Nếu không tìm thấy dữ liệu từ bất kỳ endpoint nào
            if (!foundData) {
                console.log("Không tìm thấy dữ liệu từ API, sử dụng dữ liệu mẫu");
                setAddresses(mockAddresses);
                if (mockAddresses.length > 0) {
                    setSelectedAddress(mockAddresses[0]._id);
                }
                
                // Thông báo lỗi nhưng vẫn hiển thị dữ liệu mẫu
                setError("Không tìm thấy địa chỉ. " + (lastError?.message || "API không tồn tại"));
            }
            
        } catch (err) {
            console.error("Error fetching addresses:", err);
            let errorMessage = "Không thể tải danh sách địa chỉ";
            
            if (err.message) {
                if (err.message.includes("401")) {
                    errorMessage += ": Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
                } else if (err.message.includes("404")) {
                    errorMessage += ": API không tồn tại hoặc đường dẫn không đúng";
                } else if (err.message.includes("500")) {
                    errorMessage += ": Lỗi máy chủ, vui lòng thử lại sau";
                } else if (err.message.includes("User ID")) {
                    errorMessage += ": Vui lòng đăng nhập để xem địa chỉ của bạn";
                } else {
                    errorMessage += `: ${err.message}`;
                }
            }
            
            setError(errorMessage);
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    // Khởi tạo state ban đầu
    useEffect(() => {
        // In ra thông tin user hiện tại để debug
        console.log("Current user object:", currentUser);
        console.log("User ID being used:", userId);
        
        if (userId) {
            fetchAddresses();
        } else {
            setLoading(false);
            setError("Vui lòng đăng nhập để tiếp tục thanh toán.");
        }
    }, [userId]);
    
    // Kiểm tra kết nối API chung
    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                // Kiểm tra server có đang chạy không bằng cách gọi API đơn giản
                const response = await fetch("http://localhost:9999/api/auth/check", {
                    method: 'GET'
                });
                console.log("Server status:", response.status);
                
                if (response.status === 404) {
                    console.log("API auth/check không tồn tại, nhưng server đang chạy");
                    await checkAvailableEndpoints();
                }
            } catch (err) {
                console.error("Không thể kết nối đến server:", err);
                setError("Không thể kết nối đến server. Vui lòng kiểm tra xem server đã được khởi động chưa.");
            }
        };
        
        // Kiểm tra các endpoint có sẵn
        const checkAvailableEndpoints = async () => {
            try {
                // Kiểm tra các endpoint có thể có
                const endpoints = [
                    '/user-address/list',
                    '/address/list'
                ];
                
                for (const endpoint of endpoints) {
                    try {
                        const resp = await fetch(`http://localhost:9999/api${endpoint}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-access-token': AuthService.getToken()
                            }
                        });
                        console.log(`API endpoint ${endpoint} status:`, resp.status);
                        
                        if (resp.status !== 404) {
                            console.log(`Endpoint ${endpoint} có thể được sử dụng`);
                        }
                    } catch (endpointErr) {
                        console.error(`Không thể truy cập endpoint ${endpoint}:`, endpointErr);
                    }
                }
            } catch (err) {
                console.error("Lỗi khi kiểm tra endpoints:", err);
            }
        };
        
        checkServerStatus();
    }, []);

    // Mở popup thêm địa chỉ mới
    const handleAddAddress = () => {
        setShowAddAddressPopup(true);
    };

    const handleClosePopup = () => {
        setShowAddAddressPopup(false);
    };

    // Lưu địa chỉ mới
    const handleSaveAddress = async (newAddressData) => {
        try {
            const formattedAddress = {
                user_id: userId,
                address_line1: newAddressData.address,
                address_line2: newAddressData.address_line2 || "",
                city: newAddressData.province,
                country: newAddressData.country,
                phone: newAddressData.phone,
                status: true
            };
        
            console.log("Đang gửi dữ liệu:", formattedAddress);
            
            // Kiểm tra môi trường phát triển
            const isDevelopment = false; // Ghi đè để luôn gọi API
            
            if (isDevelopment) {
                console.log("Đang chạy ở chế độ DEV - Thêm địa chỉ vào dữ liệu mẫu");
                
                // Delay giả lập API
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Thêm địa chỉ mới vào state
                const newAddress = {
                    _id: `mock-address-${Date.now()}`,
                    ...formattedAddress,
                    status: true
                };
                
                setAddresses(prevAddresses => [...prevAddresses, newAddress]);
                setSelectedAddress(newAddress._id);
                setShowAddAddressPopup(false);
                return;
            }
            
            let savedAddress = null;
            
            try {
                // Thử với endpoint mới trước
                savedAddress = await ApiService.post('/address/create', formattedAddress);
                console.log("Address created successfully with new endpoint:", savedAddress);
            } catch (apiError) {
                console.log("Thử lại với endpoint thay thế", apiError);
                // Thử lại với endpoint cũ nếu endpoint mới không hoạt động
                savedAddress = await ApiService.post('/user-address/create', formattedAddress);
                console.log("Address created successfully with old endpoint:", savedAddress);
            }
            
            // Tạo địa chỉ tạm thời dựa trên dữ liệu đã gửi để cập nhật UI ngay lập tức
            const tempAddress = {
                _id: savedAddress?._id || `temp-address-${Date.now()}`,
                ...formattedAddress
            };
            
            // Cập nhật state UI trước để phản hồi ngay cho người dùng
            setAddresses(prevAddresses => [...prevAddresses, tempAddress]);
            setSelectedAddress(tempAddress._id);
            
            // Sau đó tải lại dữ liệu từ server sau một khoảng thời gian nhỏ
            setTimeout(() => {
                fetchAddresses(); // Refresh data after adding
            }, 1000);
            
            setShowAddAddressPopup(false);
        } catch (err) {
            console.error("Error saving address:", err);
            alert("Không thể lưu địa chỉ. Vui lòng kiểm tra lại thông tin và thử lại.");
        }
    };

    // Chuyển đến trang chỉnh sửa địa chỉ
    const handleEditAddress = (addressId) => {
        navigate(`/account/addresses?edit=${addressId}`);
    };

    // Xóa địa chỉ
    const handleDeleteAddress = async (addressId) => {
        if (window.confirm("Bạn có chắc muốn xóa địa chỉ này không?")) {
            try {
                // Kiểm tra môi trường phát triển
                const isDevelopment = false; // Set false để luôn gọi API
                
                if (isDevelopment) {
                    console.log("Đang chạy ở chế độ DEV - Xóa địa chỉ mẫu");
                    
                    // Delay giả lập API
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Xóa địa chỉ khỏi state
                    setAddresses(prevAddresses => prevAddresses.filter(addr => addr._id !== addressId));
                    
                    // Nếu xóa địa chỉ đang được chọn, cập nhật lại selectedAddress
                    if (selectedAddress === addressId) {
                        const remainingAddresses = addresses.filter(addr => addr._id !== addressId);
                        if (remainingAddresses.length > 0) {
                            setSelectedAddress(remainingAddresses[0]._id);
                        } else {
                            setSelectedAddress(null);
                        }
                    }
                    return;
                }
                
                // Cập nhật UI trước để phản hồi ngay cho người dùng
                const remainingAddresses = addresses.filter(addr => addr._id !== addressId);
                setAddresses(remainingAddresses);
                
                // Nếu xóa địa chỉ đang được chọn, cập nhật lại selectedAddress
                if (selectedAddress === addressId) {
                    if (remainingAddresses.length > 0) {
                        setSelectedAddress(remainingAddresses[0]._id);
                    } else {
                        setSelectedAddress(null);
                    }
                }
                
                try {
                    // Thử với endpoint mới trước
                    await ApiService.delete(`/address/delete/${addressId}`);
                    console.log("Address deleted successfully with new endpoint");
                } catch (apiError) {
                    console.log("Thử lại với endpoint thay thế", apiError);
                    // Thử lại với endpoint cũ nếu endpoint mới không hoạt động
                    await ApiService.delete(`/user-address/delete/${addressId}`);
                    console.log("Address deleted successfully with old endpoint");
                }
                
            } catch (err) {
                console.error("Error deleting address:", err);
                alert("Không thể xóa địa chỉ. Vui lòng thử lại sau.");
                // Tải lại dữ liệu trong trường hợp xảy ra lỗi
                fetchAddresses();
            }
        }
    };

    // Lấy tên người dùng từ user hiện tại
    const getUserName = () => {
        if (!currentUser) return "Không có tên";
        
        // Ưu tiên lấy tên từ currentUser
        const fullName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
        
        // Nếu không có tên trong currentUser, kiểm tra xem có trường name không
        if (fullName) return fullName;
        if (currentUser.name) return currentUser.name;
        
        // Nếu không có tên, lấy email hoặc username (nếu có)
        if (currentUser.email) return currentUser.email.split('@')[0]; // Lấy phần username từ email
        if (currentUser.username) return currentUser.username;
        
        return "Không có tên";
    };

    // Chuyển đổi dữ liệu địa chỉ từ DB sang định dạng hiển thị
    const formatAddressForDisplay = (addressItem) => {
        // Lấy tên người dùng
        const name = getUserName();
        
        return {
            id: addressItem._id,
            name: name,
            phone: addressItem.phone,
            address: `${addressItem.address_line1}${addressItem.address_line2 ? ', ' + addressItem.address_line2 : ''}${addressItem.city ? ', ' + addressItem.city : ''}${addressItem.country ? ', ' + addressItem.country : ''}`
        };
    };

    // Reload addresses
    const handleRefreshAddresses = () => {
        fetchAddresses();
    };

    const paymentMethods = [
        { id: 1, name: 'Thanh toán khi nhận hàng', icon: <Truck /> },
        { id: 2, name: 'Thanh toán Momo', icon: <Truck /> },
        { id: 3, name: 'Thanh toán VNPay', icon: <Truck /> }
    ];

    const deliveryMethods = [
        {
            id: 'standard',
            name: 'Giao hàng tiêu chuẩn',
            price: 15000,
            time: '3-5 Ngày'
        },
        {
            id: 'fast',
            name: 'Giao hàng nhanh',
            price: 25000,
            time: '1-2 Ngày'
        },
        {
            id: 'same-day',
            name: 'Giao hàng trong ngày',
            price: 45000,
            time: 'Nhận hàng trong ngày'
        },
        {
            id: 'international',
            name: 'Giao hàng quốc tế',
            price: 98000,
            time: '7-14 Ngày'
        }
    ];

    const cartItems = [
        {
            id: 1,
            name: 'Khẩu trang 5d xám, Khẩu trang 5d xịn xò, 100 chiếc giá sale',
            price: 180000,
            quantity: 1,
            image: '/path/to/mask-image.jpg'
        }
    ];

    const calculateTotal = () => {
        const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
        const deliveryPrice = deliveryMethods.find(method => method.id === deliveryMethod)?.price || 0;
        return subtotal + deliveryPrice;
    };

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Delivery & Payment */}
                <div>
                    {/* Delivery Address Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Địa chỉ nhận hàng</h2>
                            {!loading && (
                                <button
                                    onClick={handleRefreshAddresses}
                                    className="text-purple-600 text-sm hover:underline"
                                >
                                    ↻ Làm mới
                                </button>
                            )}
                        </div>
                        
                        {loading ? (
                            <div className="text-center py-4">Đang tải địa chỉ...</div>
                        ) : error && addresses.length === 0 ? (
                            <div className="text-red-500 text-center py-4">
                                {error}
                                <div className="mt-2">
                                    <button
                                        onClick={handleRefreshAddresses}
                                        className="text-purple-600 hover:underline"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới để tiếp tục thanh toán.
                                <div className="mt-2">
                                    <button
                                        onClick={handleAddAddress}
                                        className="text-purple-600 hover:underline"
                                    >
                                        Thêm địa chỉ ngay
                                    </button>
                                </div>
                            </div>
                        ) : (
                            addresses.map((addressItem) => {
                                const displayAddress = formatAddressForDisplay(addressItem);
                                return (
                                    <div
                                        key={displayAddress.id}
                                        className={`flex items-center p-4 border rounded-lg mb-2 cursor-pointer ${selectedAddress === addressItem._id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                                        onClick={() => setSelectedAddress(addressItem._id)}
                                    >
                                        <input
                                            type="radio"
                                            checked={selectedAddress === addressItem._id}
                                            onChange={() => setSelectedAddress(addressItem._id)}
                                            className="mr-4"
                                        />
                                        <div className="flex-grow">
                                            <div className="flex justify-between">
                                                <span className="font-medium">{displayAddress.name} - {displayAddress.phone}</span>
                                                <div className="flex space-x-2">
                                                    <Edit2 
                                                        size={16} 
                                                        className="text-blue-500 cursor-pointer" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditAddress(addressItem._id);
                                                        }} 
                                                    />
                                                    <Trash2 
                                                        size={16} 
                                                        className="text-red-500 cursor-pointer" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAddress(addressItem._id);
                                                        }} 
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-gray-600">{displayAddress.address}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        
                        {!loading && (
                            <button 
                                className="w-full border p-4 rounded text-purple-600 font-medium mt-2"
                                onClick={handleAddAddress}
                            >
                                + Thêm địa chỉ
                            </button>
                        )}
                    </div>

                    {/* Payment Method Section */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className={`flex items-center p-4 border rounded-lg mb-2 cursor-pointer ${paymentMethod === method.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                                    }`}
                                onClick={() => setPaymentMethod(method.id)}
                            >
                                <input
                                    type="radio"
                                    checked={paymentMethod === method.id}
                                    onChange={() => setPaymentMethod(method.id)}
                                    className="mr-4"
                                />
                                {method.icon}
                                <span className="ml-4">{method.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Delivery Method Section */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">Phương thức giao hàng</h2>
                        {deliveryMethods.map((method) => (
                            <div
                                key={method.id}
                                className={`flex items-center p-4 border rounded-lg mb-2 cursor-pointer ${deliveryMethod === method.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                                    }`}
                                onClick={() => setDeliveryMethod(method.id)}
                            >
                                <input
                                    type="radio"
                                    checked={deliveryMethod === method.id}
                                    onChange={() => setDeliveryMethod(method.id)}
                                    className="mr-4"
                                />
                                <div className="flex-grow">
                                    <div className="flex justify-between">
                                        <span>{method.name}</span>
                                        <span className="text-gray-600">{method.price.toLocaleString()}đ</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{method.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <img
                                src={khautrang5d}
                                alt="Product"
                                className="w-20 h-20 object-cover mr-4 rounded"
                            />
                            <div>
                                <h3 className="font-medium">Khẩu trang 5d xám, Khẩu trang 5d xịn xò, 100 chiếc giá sale</h3>
                                <p className="text-gray-600">180.000đ</p>
                            </div>
                        </div>
                        <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                        <div className="pt-4">
                            <div className="flex justify-between mt-4">
                                <span>Tổng đơn hàng</span>
                                <span>180.000đ</span>
                            </div>
                            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                            <div className="flex justify-between mt-4">
                                <span>Voucher giảm giá</span>
                                <span className="text-red-500">0đ</span>
                            </div>
                            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                            <div className="flex justify-between mt-4">
                                <span>Phi giao hàng</span>
                                <span>
                                    {deliveryMethods.find(method => method.id === deliveryMethod)?.price.toLocaleString()}đ
                                </span>
                            </div>
                            <div className='w-full h-[1px] bg-gray-600 mt-8'></div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Tổng cộng</span>
                                <span className="text-purple-600">{calculateTotal().toLocaleString()}đ</span>
                            </div>
                        </div>

                        <button 
                            className={`w-full py-3 rounded-lg mt-4 ${
                                !selectedAddress || !paymentMethod
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                            disabled={!selectedAddress || !paymentMethod}
                        >
                            {!selectedAddress 
                                ? 'Vui lòng chọn địa chỉ giao hàng' 
                                : !paymentMethod 
                                    ? 'Vui lòng chọn phương thức thanh toán'
                                    : 'Thanh toán'}
                        </button>
                        <p className="text-center text-sm text-gray-600 mt-2">
                            Bạn muốn dùng thêm mã giảm giá hoặc thay đổi số lượng sản phẩm hãy{' '}
                            <a href="/cart" className="text-purple-600">Quay lại giỏ hàng</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Address Popup */}
            {showAddAddressPopup && (
                <AddAddressPopup onClose={handleClosePopup} onSave={handleSaveAddress} />
            )}
        </div>
    );
};

// Component AddAddressPopup
const AddAddressPopup = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        phone: '',
        country: 'Việt Nam',
        provinceId: '0',
        provinceName: '',
        districtId: '0',
        districtName: '',
        wardId: '0',
        wardName: '',
        address: '',
        address_line2: ''
    });
    
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    
    // Tải dữ liệu tỉnh/thành phố khi component được mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
                const data = await response.json();
                
                if (data.error === 0) {
                    setProvinces(data.data);
                } else {
                    console.error('Lỗi khi lấy dữ liệu tỉnh/thành phố');
                }
            } catch (error) {
                console.error('Lỗi khi gọi API tỉnh/thành phố:', error);
            }
        };
        
        fetchProvinces();
    }, []);
    
    // Lấy dữ liệu quận/huyện khi chọn tỉnh/thành phố
    const fetchDistricts = async (provinceId) => {
        try {
            const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
            const data = await response.json();
            
            if (data.error === 0) {
                setDistricts(data.data);
                setWards([]); // Reset danh sách phường/xã
                setFormData(prev => ({
                    ...prev,
                    districtId: '0',
                    districtName: '',
                    wardId: '0',
                    wardName: ''
                }));
            } else {
                console.error('Lỗi khi lấy dữ liệu quận/huyện');
            }
        } catch (error) {
            console.error('Lỗi khi gọi API quận/huyện:', error);
        }
    };
    
    // Lấy dữ liệu phường/xã khi chọn quận/huyện
    const fetchWards = async (districtId) => {
        try {
            const response = await fetch(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
            const data = await response.json();
            
            if (data.error === 0) {
                setWards(data.data);
                setFormData(prev => ({
                    ...prev,
                    wardId: '0',
                    wardName: ''
                }));
            } else {
                console.error('Lỗi khi lấy dữ liệu phường/xã');
            }
        } catch (error) {
            console.error('Lỗi khi gọi API phường/xã:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        const selectedProvince = provinces.find(p => p.id === provinceId);
        
        setFormData({
            ...formData,
            provinceId,
            provinceName: selectedProvince ? selectedProvince.full_name : ''
        });
        
        if (provinceId !== '0') {
            fetchDistricts(provinceId);
        } else {
            setDistricts([]);
            setWards([]);
        }
    };
    
    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        const selectedDistrict = districts.find(d => d.id === districtId);
        
        setFormData({
            ...formData,
            districtId,
            districtName: selectedDistrict ? selectedDistrict.full_name : ''
        });
        
        if (districtId !== '0') {
            fetchWards(districtId);
        } else {
            setWards([]);
        }
    };
    
    const handleWardChange = (e) => {
        const wardId = e.target.value;
        const selectedWard = wards.find(w => w.id === wardId);
        
        setFormData({
            ...formData,
            wardId,
            wardName: selectedWard ? selectedWard.full_name : ''
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Kiểm tra xem đã chọn đầy đủ địa chỉ chưa
        if (formData.provinceId === '0' || formData.districtId === '0' || formData.wardId === '0') {
            alert('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã');
            return;
        }
        
        // Tạo chuỗi địa chỉ đầy đủ
        const fullAddress = `${formData.address}, ${formData.wardName}, ${formData.districtName}, ${formData.provinceName}`;
        
        onSave({
            phone: formData.phone,
            address: fullAddress,
            address_line2: formData.address_line2,
            province: formData.provinceName,
            country: formData.country
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md w-full max-w-lg max-h-90vh overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Thêm địa chỉ nhận hàng</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
                        <input
                            id="phone"
                            type="text"
                            name="phone"
                            placeholder="Số điện thoại"
                            value={formData.phone}
                            onChange={handleChange}
                            className="border p-2 rounded-md w-full"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="country" className="block text-sm text-gray-600 mb-1">Quốc gia</label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="border p-2 rounded-md w-full"
                        >
                            <option value="Việt Nam">Việt Nam</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="provinceId" className="block text-sm text-gray-600 mb-1">Tỉnh / Thành phố</label>
                            <select
                                id="provinceId"
                                name="provinceId"
                                value={formData.provinceId}
                                onChange={handleProvinceChange}
                                className="border p-2 rounded-md w-full"
                                required
                            >
                                <option value="0">Chọn Tỉnh/Thành phố</option>
                                {provinces.map((province) => (
                                    <option key={province.id} value={province.id}>{province.full_name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="districtId" className="block text-sm text-gray-600 mb-1">Quận / Huyện</label>
                            <select
                                id="districtId"
                                name="districtId"
                                value={formData.districtId}
                                onChange={handleDistrictChange}
                                className="border p-2 rounded-md w-full"
                                required
                                disabled={formData.provinceId === '0'}
                            >
                                <option value="0">Chọn Quận/Huyện</option>
                                {districts.map((district) => (
                                    <option key={district.id} value={district.id}>{district.full_name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="wardId" className="block text-sm text-gray-600 mb-1">Phường / Xã</label>
                            <select
                                id="wardId"
                                name="wardId"
                                value={formData.wardId}
                                onChange={handleWardChange}
                                className="border p-2 rounded-md w-full"
                                required
                                disabled={formData.districtId === '0'}
                            >
                                <option value="0">Chọn Phường/Xã</option>
                                {wards.map((ward) => (
                                    <option key={ward.id} value={ward.id}>{ward.full_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="address" className="block text-sm text-gray-600 mb-1">Địa chỉ cụ thể</label>
                        <input
                            id="address"
                            type="text"
                            name="address"
                            placeholder="Số nhà, tên đường"
                            value={formData.address}
                            onChange={handleChange}
                            className="border p-2 rounded-md w-full"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="address_line2" className="block text-sm text-gray-600 mb-1">Địa chỉ bổ sung (không bắt buộc)</label>
                        <input
                            id="address_line2"
                            type="text"
                            name="address_line2"
                            placeholder="Tòa nhà, số tầng, số phòng, ..."
                            value={formData.address_line2}
                            onChange={handleChange}
                            className="border p-2 rounded-md w-full"
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                        >
                            Thêm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;