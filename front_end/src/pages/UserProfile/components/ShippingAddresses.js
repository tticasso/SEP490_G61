import React, { useState } from "react";

const ShippingAddresses = () => {
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false);
  const [addresses, setAddresses] = useState([
    {
      name: 'Vũ Văn Định',
      phone: '3335583800',
      address: '18/1/3 đường số 8 linh trung, Khánh Hòa, Việt Nam'
    },
    {
      name: 'Vũ Văn Định',
      phone: '3335583800',
      address: 'Lâm Đồng, Cao Bằng, Việt Nam'
    }
  ]);

  const handleAddAddress = () => {
    setShowAddAddressPopup(true);
  };

  const handleClosePopup = () => {
    setShowAddAddressPopup(false);
  };

  const handleSaveAddress = (newAddress) => {
    setAddresses([...addresses, newAddress]);
    setShowAddAddressPopup(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Địa chỉ nhận hàng</h2>
      <div className="space-y-4">
        {addresses.map((address, index) => (
          <div key={index} className="border p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="font-semibold">{address.name}</p>
                <p className="text-gray-600">{address.phone}</p>
              </div>
              <div className="space-x-2">
                <button className="text-purple-600 hover:underline">Sửa</button>
                <button className="text-red-600 hover:underline">Xóa</button>
              </div>
            </div>
            <p>{address.address}</p>
          </div>
        ))}
        <button
          className="w-full border-2 border-purple-600 text-purple-600 py-2 rounded-md hover:bg-purple-50"
          onClick={handleAddAddress}
        >
          + Thêm địa chỉ
        </button>
      </div>

      {showAddAddressPopup && (
        <AddAddressPopup onClose={handleClosePopup} onSave={handleSaveAddress} />
      )}
    </div>
  );
};

const AddAddressPopup = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: 'Việt Nam',
    province: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      address: `${formData.address}, ${formData.province}, ${formData.country}`
    });
  };

  // Danh sách tỉnh thành phố của Việt Nam (tham khảo từ Wikipedia)
  const provinces = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
    "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
    "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
    "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
    "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng",
    "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang",
    "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai",
    "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận",
    "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi",
    "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh",
    "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang",
    "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-20">
      <div className="bg-white p-6 rounded-md w-1/2 h-1/2">
        <h2 className="text-lg font-semibold mb-4">Thêm địa chỉ nhận hàng</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              name="firstName"
              placeholder="Họ đệm"
              value={formData.firstName}
              onChange={handleChange}
              className="border p-2 rounded-md w-1/2"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Tên"
              value={formData.lastName}
              onChange={handleChange}
              className="border p-2 rounded-md w-1/2"
            />
          </div>
          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
          <div className="flex space-x-2">
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="border p-2 rounded-md w-1/2"
            >
              <option value="Việt Nam">Việt Nam</option>
            </select>
            <select
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="border p-2 rounded-md w-1/2"
            >
              <option value="">Chọn tỉnh / thành phố</option>
              {provinces.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            name="address"
            placeholder="Địa chỉ"
            value={formData.address}
            onChange={handleChange}
            className="border p-2 rounded-md w-full"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="border p-2 rounded-md"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-purple-600 text-white p-2 rounded-md"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingAddresses;