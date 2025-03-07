import React, { useState, useEffect } from "react";
import ApiService from "../../../services/ApiService";
import AuthService from "../../../services/AuthService";

const ShippingAddresses = () => {
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false);
  const [showEditAddressPopup, setShowEditAddressPopup] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy userId từ thông tin người dùng đã đăng nhập
  const currentUser = AuthService.getCurrentUser();
  const userId = currentUser?._id || currentUser?.id || "";
  
  // Lấy tên người dùng để hiển thị
  const userName = currentUser ? 
    `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() : 
    "";
  
  // Dữ liệu mẫu khi API không hoạt động
  const mockAddresses = [
    {
      _id: "mock-address-1",
      user_id: userId,
      address_line1: "123 Đường Lê Lợi",
      address_line2: "Phường Bến Nghé",
      city: "Hồ Chí Minh",
      country: "Việt Nam",
      phone: "0901234567",
      status: true
    },
    {
      _id: "mock-address-2",
      user_id: userId,
      address_line1: "45 Đường Nguyễn Huệ",
      address_line2: "Phường Bến Thành",
      city: "Hồ Chí Minh",
      country: "Việt Nam",
      phone: "0907654321",
      status: true
    }
  ];

  // Fetch addresses từ API hoặc sử dụng dữ liệu mẫu
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra môi trường phát triển
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        console.log("Đang chạy ở chế độ DEV - Sử dụng dữ liệu mẫu");
        
        // Delay giả lập API để tạo trải nghiệm thực tế
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Sử dụng dữ liệu mẫu
        setAddresses(mockAddresses);
        setError(null);
        setLoading(false);
        return;
      }
      
      // ===== CODE GỌI API THỰC TẾ =====
      // Bỏ comment phần code bên dưới khi backend đã sẵn sàng
      /*
      if (!userId) {
        throw new Error("User ID không tồn tại");
      }
      
      console.log("Đang gọi API với userId:", userId);
      const apiEndpoint = `/user-address/user/${userId}`;
      
      const response = await ApiService.get(apiEndpoint);
      
      if (Array.isArray(response)) {
        setAddresses(response);
        setError(null);
      } else {
        console.warn("Dữ liệu không phải là mảng:", response);
        setAddresses([]);
        setError("Định dạng dữ liệu không đúng");
      }
      */
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(`Không thể tải danh sách địa chỉ: ${err.message || "Lỗi không xác định"}`);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo state ban đầu
  useEffect(() => {
    // In ra thông tin user hiện tại để debug
    console.log("Current user object:", currentUser);
    
    // Hiển thị thông tin tên người dùng
    console.log("User name:", getUserName());
    
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
        const response = await fetch("http://localhost:9999/api/auth/check", {
          method: 'GET'
        });
        console.log("Server status:", response.status);
        
        if (response.status === 404) {
          console.log("API auth/check không tồn tại, nhưng server đang chạy");
        }
      } catch (err) {
        console.error("Không thể kết nối đến server:", err);
        setError("Không thể kết nối đến server. Vui lòng kiểm tra xem server đã được khởi động chưa.");
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
        city: newAddressData.province,
        country: newAddressData.country,
        phone: newAddressData.phone
      };

      console.log("Đang gửi dữ liệu:", formattedAddress);
      
      // Kiểm tra môi trường phát triển
      const isDevelopment = process.env.NODE_ENV === 'development';
      
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
      
      // ===== CODE GỌI API THỰC TẾ =====
      // Bỏ comment khi backend đã sẵn sàng
      /*
      await ApiService.post('/user-address/create', formattedAddress);
      fetchAddresses(); // Refresh data after adding
      */
      setShowAddAddressPopup(false);
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Không thể lưu địa chỉ. Vui lòng kiểm tra lại thông tin và thử lại.");
    }
  };

  const handleUpdateAddress = async (updatedAddressData) => {
    try {
      if (!currentAddress || !currentAddress._id) {
        throw new Error("Không tìm thấy ID địa chỉ để cập nhật");
      }

      const formattedAddress = {
        address_line1: updatedAddressData.address,
        address_line2: updatedAddressData.address_line2 || "",
        city: updatedAddressData.province,
        country: updatedAddressData.country,
        phone: updatedAddressData.phone,
        status: true
      };
      
      // Kiểm tra môi trường phát triển
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        console.log("Đang chạy ở chế độ DEV - Cập nhật địa chỉ mẫu");
        
        // Delay giả lập API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Cập nhật địa chỉ trong state
        setAddresses(prevAddresses => 
          prevAddresses.map(addr => 
            addr._id === currentAddress._id ? {...addr, ...formattedAddress} : addr
          )
        );
        
        setShowEditAddressPopup(false);
        setCurrentAddress(null);
        return;
      }
      
      // ===== CODE GỌI API THỰC TẾ =====
      // Bỏ comment khi backend đã sẵn sàng
      /*
      await ApiService.put(`/user-address/edit/${currentAddress._id}`, formattedAddress);
      fetchAddresses(); // Refresh data after updating
      */
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
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (isDevelopment) {
          console.log("Đang chạy ở chế độ DEV - Xóa địa chỉ mẫu");
          
          // Delay giả lập API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Xóa địa chỉ khỏi state
          setAddresses(prevAddresses => prevAddresses.filter(addr => addr._id !== addressId));
          return;
        }
        
        // ===== CODE GỌI API THỰC TẾ =====
        // Bỏ comment khi backend đã sẵn sàng
        /*
        await ApiService.delete(`/user-address/delete/${addressId}`);
        fetchAddresses(); // Refresh data after deleting
        */
      } catch (err) {
        console.error("Error deleting address:", err);
        alert("Không thể xóa địa chỉ. Vui lòng thử lại sau.");
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
      const response = await fetch(`http://localhost:9999/api${endpoint}`, {
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
    // Lấy tên người dùng
    const name = getUserName();
    
    return {
      id: addressItem._id,
      name: name,
      phone: addressItem.phone,
      address: `${addressItem.address_line1}${addressItem.address_line2 ? ', ' + addressItem.address_line2 : ''}${addressItem.city ? ', ' + addressItem.city : ''}${addressItem.country ? ', ' + addressItem.country : ''}`
    };
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Địa chỉ nhận hàng</h2>
      
      {loading ? (
        <div className="text-center py-4">Đang tải...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới.</div>
          ) : (
            addresses.map((addressItem) => {
              const displayAddress = formatAddressForDisplay(addressItem);
              return (
                <div key={displayAddress.id} className="border p-4 rounded-md">
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
                  <p>{displayAddress.address}</p>
                </div>
              );
            })
          )}
          
          <button
            className="w-full border-2 border-purple-600 text-purple-600 py-2 rounded-md hover:bg-purple-50"
            onClick={handleAddAddress}
          >
            + Thêm địa chỉ
          </button>
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

const EditAddressPopup = ({ address, onClose, onSave }) => {
  // Phân tích địa chỉ để lấy các thành phần
  const parseAddress = (addressObj) => {
    // Thử phân tích từ address_line1 nếu có định dạng "số nhà, phường, quận, tỉnh"
    const addressParts = addressObj.address_line1 ? addressObj.address_line1.split(', ') : [];
    
    // Mặc định giá trị
    return {
      phone: addressObj.phone || '',
      country: addressObj.country || 'Việt Nam',
      address: addressParts.length > 0 ? addressParts[0] : '',
      address_line2: addressObj.address_line2 || ''
    };
  };
  
  const parsedAddress = parseAddress(address);
  
  const [formData, setFormData] = useState({
    phone: parsedAddress.phone,
    country: parsedAddress.country,
    provinceId: '0',
    provinceName: address.city || '',
    districtId: '0',
    districtName: '',
    wardId: '0',
    wardName: '',
    address: parsedAddress.address,
    address_line2: parsedAddress.address_line2
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
          
          // Nếu có tỉnh/thành phố trong dữ liệu ban đầu, thử tìm provinceId
          if (address.city) {
            const foundProvince = data.data.find(p => 
              p.full_name.toLowerCase() === address.city.toLowerCase()
            );
            
            if (foundProvince) {
              setFormData(prev => ({
                ...prev,
                provinceId: foundProvince.id,
                provinceName: foundProvince.full_name
              }));
              
              // Tải quận/huyện nếu tìm thấy tỉnh
              fetchDistricts(foundProvince.id);
            }
          }
        } else {
          console.error('Lỗi khi lấy dữ liệu tỉnh/thành phố');
        }
      } catch (error) {
        console.error('Lỗi khi gọi API tỉnh/thành phố:', error);
      }
    };
    
    fetchProvinces();
  }, [address.city]);
  
  // Lấy dữ liệu quận/huyện khi chọn tỉnh/thành phố
  const fetchDistricts = async (provinceId) => {
    try {
      const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
      const data = await response.json();
      
      if (data.error === 0) {
        setDistricts(data.data);
        
        // Nếu không có ID quận/huyện, reset các giá trị
        if (formData.districtId === '0') {
          setWards([]);
          setFormData(prev => ({
            ...prev,
            districtId: '0',
            districtName: '',
            wardId: '0',
            wardName: ''
          }));
        }
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
        
        // Nếu không có ID phường/xã, reset giá trị
        if (formData.wardId === '0') {
          setFormData(prev => ({
            ...prev,
            wardId: '0',
            wardName: ''
          }));
        }
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
        <h2 className="text-lg font-semibold mb-4">Chỉnh sửa địa chỉ</h2>
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
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingAddresses;