import React, { useState, useEffect } from "react";
import ApiService from "../../../services/ApiService";
import AuthService from "../../../services/AuthService";
import { BE_API_URL } from "../../../config/config";
import { MapPin, AlertCircle, PlusCircle } from "lucide-react";
import { AddAddressPopup, EditAddressPopup } from "./shippingModal/AddressFormComponents";

const ShippingAddresses = () => {
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false);
  const [showEditAddressPopup, setShowEditAddressPopup] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy userId từ thông tin người dùng đã đăng nhập
  const currentUser = AuthService.getCurrentUser();

  // Xử lý userId có thể được lưu trữ với nhiều tên thuộc tính khác nhau
  const userId = currentUser?._id || currentUser?.id || currentUser?.userId || "";

  // Lấy tên người dùng để hiển thị
  const userName = currentUser ?
    `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() :
    "";

  // Dữ liệu mẫu khi API không hoạt động
  const mockAddresses = [
    // Dữ liệu mẫu nếu cần
  ];

  // Xử lý phản hồi API
  const processApiResponse = (response) => {
    console.log("Processing API response:", response);

    if (Array.isArray(response)) {
      console.log("Response is an array, setting directly:", response);
      setAddresses(response);
      setError(null);
    } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
      // Xử lý trường hợp API trả về dữ liệu trong thuộc tính data
      console.log("Response has data array, setting from response.data:", response.data);
      setAddresses(response.data);
      setError(null);
    } else if (response && typeof response === 'object' && response.addresses && Array.isArray(response.addresses)) {
      // Xử lý trường hợp response có thuộc tính 'addresses'
      console.log("Response has addresses array, setting from response.addresses:", response.addresses);
      setAddresses(response.addresses);
      setError(null);
    } else if (response && typeof response === 'object' && !Array.isArray(response)) {
      // Trường hợp response là một object duy nhất - bọc trong mảng
      console.log("Response is a single object, wrapping in array:", [response]);
      setAddresses([response]);
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

      if (!userId) {
        throw new Error("User ID không tồn tại");
      }

      console.log("Đang gọi API với userId:", userId);

      // Kiểm tra các endpoints khác nhau mà backend có thể đã đăng ký
      const possibleEndpoints = [
        `/address/list`,
        `/user-address/list`,
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

            // Lọc địa chỉ theo userId
            const filteredAddresses = allAddresses.filter(addr =>
              String(addr.user_id) === String(userId)
            );

            if (filteredAddresses.length > 0) {
              setAddresses(filteredAddresses);
              foundData = true;
              setError(null);
              break;
            }
          } else {
            // Nếu là endpoint user, sử dụng dữ liệu trực tiếp
            if (Array.isArray(response)) {
              setAddresses(response);
            } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
              setAddresses(response.data);
            } else if (response && typeof response === 'object' && response.addresses && Array.isArray(response.addresses)) {
              setAddresses(response.addresses);
            } else if (response && typeof response === 'object' && !Array.isArray(response)) {
              setAddresses([response]);
            }
            foundData = true;
            setError(null);
            break;
          }
        } catch (apiError) {
          lastError = apiError;
        }
      }

    } catch (err) {
      console.error("Error fetching addresses:", err);
      // Cải thiện thông báo lỗi với thông tin chi tiết hơn
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
      setError("Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo state ban đầu
  useEffect(() => {
    if (userId) {
      fetchAddresses();
    } else {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem địa chỉ của bạn.");
    }
  }, [userId]);

  // Kiểm tra kết nối API chung
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Kiểm tra server có đang chạy không bằng cách gọi API đơn giản
        const response = await fetch(`${BE_API_URL}/api/auth/check`, {
          method: 'GET'
        });
        console.log("Server status:", response.status);

        if (response.status === 404) {
          console.log("API auth/check không tồn tại, nhưng server đang chạy");
          // Kiểm tra các endpoint khác để xác nhận server đang chạy
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
            const resp = await fetch(`${BE_API_URL}/api${endpoint}`, {
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

  const handleAddAddress = () => {
    setShowAddAddressPopup(true);
  };

  const handleEditAddress = (address) => {
    setCurrentAddress(address);
    setShowEditAddressPopup(true);
  };

  const handleClosePopup = () => {
    setShowAddAddressPopup(false);
    setShowEditAddressPopup(false);
    setCurrentAddress(null);
  };

  const handleSaveAddress = async (newAddressData) => {
    try {
      const formattedAddress = {
        user_id: userId,
        address_line1: newAddressData.address,
        address_line2: newAddressData.address_line2 || "",
        // Combine location components properly
        city: `${newAddressData.ward}, ${newAddressData.district}, ${newAddressData.province}`,
        country: newAddressData.country,
        phone: newAddressData.phone, // Số điện thoại đã được format đầy đủ
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
  
  const handleRefreshData = () => {
    fetchAddresses();
  };

  const handleUpdateAddress = async (updatedAddressData) => {
    try {
      if (!currentAddress || !currentAddress._id) {
        throw new Error("Không tìm thấy ID địa chỉ để cập nhật");
      }

      const formattedAddress = {
        address_line1: updatedAddressData.address,
        address_line2: updatedAddressData.address_line2 || "",
        city: `${updatedAddressData.ward || ''}, ${updatedAddressData.district || ''}, ${updatedAddressData.province || ''}`,
        country: updatedAddressData.country,
        phone: updatedAddressData.phone, // Số điện thoại đã được format đầy đủ
        status: true
      };

      // Kiểm tra môi trường phát triển
      const isDevelopment = false; // Ghi đè để luôn gọi API

      if (isDevelopment) {
        console.log("Đang chạy ở chế độ DEV - Cập nhật địa chỉ mẫu");

        // Delay giả lập API
        await new Promise(resolve => setTimeout(resolve, 500));

        // Cập nhật địa chỉ trong state
        setAddresses(prevAddresses =>
          prevAddresses.map(addr =>
            addr._id === currentAddress._id ? { ...addr, ...formattedAddress } : addr
          )
        );

        setShowEditAddressPopup(false);
        setCurrentAddress(null);
        return;
      }

      let updatedAddress = null;

      try {
        // Thử với endpoint mới trước
        updatedAddress = await ApiService.put(`/address/edit/${currentAddress._id}`, formattedAddress);
        console.log("Address updated successfully with new endpoint:", updatedAddress);
      } catch (apiError) {
        console.log("Thử lại với endpoint thay thế", apiError);
        // Thử lại với endpoint cũ nếu endpoint mới không hoạt động
        updatedAddress = await ApiService.put(`/user-address/edit/${currentAddress._id}`, formattedAddress);
        console.log("Address updated successfully with old endpoint:", updatedAddress);
      }

      // Cập nhật state UI trước
      setAddresses(prevAddresses =>
        prevAddresses.map(addr =>
          addr._id === currentAddress._id ? {
            ...addr,
            ...formattedAddress,
            _id: currentAddress._id,
            user_id: addr.user_id
          } : addr
        )
      );

      // Sau đó tải lại dữ liệu từ server sau một khoảng thời gian nhỏ
      setTimeout(() => {
        fetchAddresses(); // Refresh data after updating
      }, 1000);

      setShowEditAddressPopup(false);
      setCurrentAddress(null);
    } catch (err) {
      console.error("Error updating address:", err);
      alert("Không thể cập nhật địa chỉ. Vui lòng thử lại sau.");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này không?")) {
      try {
        // Kiểm tra môi trường phát triển
        const isDevelopment = false; // Ghi đè để luôn gọi API

        if (isDevelopment) {
          console.log("Đang chạy ở chế độ DEV - Xóa địa chỉ mẫu");

          // Delay giả lập API
          await new Promise(resolve => setTimeout(resolve, 500));

          // Xóa địa chỉ khỏi state
          setAddresses(prevAddresses => prevAddresses.filter(addr => addr._id !== addressId));
          return;
        }

        // Xóa địa chỉ khỏi UI trước
        setAddresses(prevAddresses => prevAddresses.filter(addr => addr._id !== addressId));

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

        // Không cần tải lại dữ liệu từ server vì đã xóa khỏi UI

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

  // Kiểm tra xem API endpoint có tồn tại không
  const checkEndpointExists = async (endpoint) => {
    try {
      const response = await fetch(`${BE_API_URL}/api${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': AuthService.getToken()
        }
      });

      console.log(`API endpoint ${endpoint} status:`, response.status);
      return response.status !== 404;
    } catch (err) {
      console.error(`Không thể kiểm tra endpoint ${endpoint}:`, err);
      return false;
    }
  };

  // Chuyển đổi dữ liệu địa chỉ từ DB sang định dạng hiển thị
  const formatAddressForDisplay = (addressItem) => {
    const name = getUserName();

    // Xử lý địa chỉ
    const addressLine1 = addressItem.address_line1 || '';
    const city = addressItem.city || '';

    return {
      id: addressItem._id,
      name: name,
      phone: addressItem.phone,
      addressLine1: addressLine1,
      city: city,
      country: addressItem.country || 'Việt Nam'
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Địa chỉ nhận hàng</h2>
        <button
          onClick={handleRefreshData}
          className="text-purple-600 hover:text-purple-800"
        >
          ↻ Làm mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Đang tải...</div>
      ) : (
        <div className="space-y-4">
          {/* Hiển thị thông báo không có địa chỉ */}
          {addresses.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Bạn chưa có địa chỉ giao hàng nào</h3>
              <p className="text-gray-500 mb-4">Hãy thêm địa chỉ để đặt hàng thuận tiện hơn</p>
              <button
                onClick={handleAddAddress}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center mx-auto"
              >
                <PlusCircle size={16} className="mr-2" />
                Thêm địa chỉ
              </button>
            </div>
          ) : (
            // Hiển thị danh sách địa chỉ
            <>
              {addresses.map((addressItem) => {
                const displayAddress = formatAddressForDisplay(addressItem);
                return (
                  <div key={displayAddress.id} className="border p-4 rounded-md shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold">{displayAddress.name}</p>
                        <p className="text-gray-600">{displayAddress.phone}</p>
                      </div>
                      <div className="space-x-2">
                        <button
                          className="text-purple-600 hover:underline"
                          onClick={() => handleEditAddress(addressItem)}
                        >
                          Sửa
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDeleteAddress(displayAddress.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">{displayAddress.addressLine1}</p>
                      <p className="text-gray-600 text-sm">
                        {displayAddress.city && displayAddress.city}
                        {displayAddress.country && displayAddress.country !== 'Việt Nam' ?
                          `, ${displayAddress.country}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}

              <button
                className="w-full border-2 border-purple-600 text-purple-600 py-2 rounded-md hover:bg-purple-50 flex items-center justify-center"
                onClick={handleAddAddress}
              >
                <PlusCircle size={16} className="mr-2" />
                Thêm địa chỉ
              </button>
            </>
          )}


        </div>
      )}

      {showAddAddressPopup && (
        <AddAddressPopup onClose={handleClosePopup} onSave={handleSaveAddress} />
      )}

      {showEditAddressPopup && currentAddress && (
        <EditAddressPopup
          address={currentAddress}
          onClose={handleClosePopup}
          onSave={handleUpdateAddress}
        />
      )}
    </div>
  );
};

export default ShippingAddresses;