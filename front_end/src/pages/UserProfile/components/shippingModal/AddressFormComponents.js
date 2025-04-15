import React, { useState, useEffect } from "react";
import { MapPin, AlertCircle, PlusCircle } from "lucide-react";

// Danh sách các quốc gia và mã quốc gia tương ứng
const countryOptions = [
  { name: 'Việt Nam', code: '+84' },
  { name: 'Hoa Kỳ', code: '+1' },
  { name: 'Anh', code: '+44' },
  { name: 'Úc', code: '+61' },
  { name: 'Singapore', code: '+65' },
  { name: 'Nhật Bản', code: '+81' },
  { name: 'Hàn Quốc', code: '+82' },
  { name: 'Trung Quốc', code: '+86' },
  { name: 'Thái Lan', code: '+66' },
  // Thêm các quốc gia khác nếu cần
];

export const AddAddressPopup = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    country: 'Việt Nam',
    countryCode: '+84',
    phoneNumber: '',
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
  const [loading, setLoading] = useState(false);

  // Tải dữ liệu tỉnh/thành phố khi component được mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
        const data = await response.json();

        if (data.error === 0) {
          setProvinces(data.data);
        } else {
          console.error('Lỗi khi lấy dữ liệu tỉnh/thành phố');
        }
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi gọi API tỉnh/thành phố:', error);
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  // Lấy dữ liệu quận/huyện khi chọn tỉnh/thành phố
  const fetchDistricts = async (provinceId) => {
    if (!provinceId || provinceId === '0') {
      setDistricts([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
      const data = await response.json();

      if (data.error === 0) {
        setDistricts(data.data);
        setWards([]); // Reset danh sách phường/xã
      } else {
        console.error('Lỗi khi lấy dữ liệu quận/huyện');
      }
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi gọi API quận/huyện:', error);
      setLoading(false);
    }
  };

  // Lấy dữ liệu phường/xã khi chọn quận/huyện
  const fetchWards = async (districtId) => {
    if (!districtId || districtId === '0') {
      setWards([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
      const data = await response.json();

      if (data.error === 0) {
        setWards(data.data);
      } else {
        console.error('Lỗi khi lấy dữ liệu phường/xã');
      }
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi gọi API phường/xã:', error);
      setLoading(false);
    }
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    // Tìm mã quốc gia tương ứng
    const country = countryOptions.find(c => c.name === selectedCountry);
    const countryCode = country ? country.code : '+84'; // Mặc định là Việt Nam

    setFormData(prev => ({
      ...prev,
      country: selectedCountry,
      countryCode: countryCode
    }));
  };

  const handlePhoneNumberChange = (e) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/\D/g, '');

    // Kiểm tra độ dài tối đa
    const maxLength = getMaxPhoneLength();
    if (value.length <= maxLength) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: value
      }));
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
      provinceName: selectedProvince ? selectedProvince.full_name : '',
      districtId: '0',
      districtName: '',
      wardId: '0',
      wardName: ''
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
      districtName: selectedDistrict ? selectedDistrict.full_name : '',
      wardId: '0',
      wardName: ''
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

    // Kiểm tra số điện thoại
    if (!formData.phoneNumber) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }

    const minLength = formData.country === 'Singapore' ? 8 : 9;
    if (formData.phoneNumber.length < minLength) {
      alert(`Số điện thoại phải có ít nhất ${minLength} chữ số`);
      return;
    }

    // Kiểm tra địa chỉ chi tiết
    if (!formData.address || formData.address.trim().length < 5) {
      alert('Vui lòng nhập địa chỉ chi tiết (tối thiểu 5 ký tự)');
      return;
    }

    // Kiểm tra đã chọn đầy đủ địa chỉ chưa
    if (formData.provinceId === '0' || formData.districtId === '0' || formData.wardId === '0') {
      alert('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã');
      return;
    }

    // Format số điện thoại đầy đủ với mã quốc gia
    const formattedPhone = formData.countryCode.replace('+', '') + formData.phoneNumber;

    onSave({
      phone: formattedPhone,
      address: formData.address,
      address_line2: formData.address_line2,
      province: formData.provinceName,
      district: formData.districtName,
      ward: formData.wardName,
      country: formData.country
    });
  };

  const getMaxPhoneLength = () => {
    switch (formData.country) {
      case 'Việt Nam': return 9; // 9 chữ số sau mã quốc gia +84
      case 'Hoa Kỳ': return 10;
      case 'Nhật Bản': return 10;
      case 'Hàn Quốc': return 10;
      case 'Trung Quốc': return 11;
      case 'Singapore': return 8;
      default: return 12; // Mặc định cho các quốc gia khác
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-lg max-h-90vh overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Thêm địa chỉ nhận hàng</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quốc gia - đặt trước số điện thoại */}
          <div>
            <label htmlFor="country" className="block text-sm text-gray-600 mb-1">Quốc gia</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleCountryChange}
              className="border p-2 rounded-md w-full"
            >
              {countryOptions.map(country => (
                <option key={country.code} value={country.name}>{country.name}</option>
              ))}
            </select>
          </div>

          {/* Số điện thoại với mã quốc gia */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
            <div className="flex">
              <div className="border p-2 rounded-l-md bg-gray-100 flex items-center justify-center min-w-[60px]">
                {formData.countryCode}
              </div>
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                placeholder="Số điện thoại"
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                maxLength={getMaxPhoneLength()}
                className="border p-2 rounded-r-md w-full"
                required
              />
            </div>
            {formData.country === 'Việt Nam' && (
              <p className="text-xs text-gray-500 mt-1">Ví dụ: Đối với số 0987654321, chỉ cần nhập 987654321</p>
            )}
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
                disabled={formData.provinceId === '0' || loading}
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
                disabled={formData.districtId === '0' || loading}
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
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditAddressPopup = ({ address, onClose, onSave }) => {
  // Phân tích địa chỉ để lấy các thành phần - Sửa lại hàm này để xử lý đúng số điện thoại
  const parseAddress = (addressObj) => {
    // Khởi tạo giá trị mặc định
    const parsedAddr = {
      phone: addressObj.phone || '',
      phoneNumber: '',
      countryCode: '+84', // Mặc định là Việt Nam
      country: addressObj.country || 'Việt Nam',
      address: addressObj.address_line1 || '',
      address_line2: addressObj.address_line2 || '',
      province: '',
      district: '',
      ward: ''
    };

    // Xử lý số điện thoại - tách mã quốc gia và số điện thoại
    if (addressObj.phone) {
      let phoneStr = String(addressObj.phone);
      
      // Kiểm tra từng mã quốc gia để tách đúng
      let foundCode = false;
      for (const country of countryOptions) {
        // Xóa dấu + từ mã quốc gia để so sánh với số điện thoại
        const codeDigits = country.code.replace('+', '');
        if (phoneStr.startsWith(codeDigits)) {
          parsedAddr.countryCode = country.code;
          parsedAddr.phoneNumber = phoneStr.substring(codeDigits.length);
          
          // Tìm tên quốc gia dựa trên mã
          const matchingCountry = countryOptions.find(c => c.code === country.code);
          if (matchingCountry) {
            parsedAddr.country = matchingCountry.name;
          }
          
          foundCode = true;
          break;
        }
      }
      
      // Nếu không tìm thấy mã quốc gia hợp lệ, giả định là số Việt Nam
      if (!foundCode) {
        parsedAddr.phoneNumber = phoneStr;
      }
    }

    // Phân tích city để lấy thông tin tỉnh/quận/phường
    if (addressObj.city) {
      const cityParts = addressObj.city.split(', ');
      if (cityParts.length >= 3) {
        parsedAddr.province = cityParts[cityParts.length - 1].trim();
        parsedAddr.district = cityParts[cityParts.length - 2].trim();
        parsedAddr.ward = cityParts[cityParts.length - 3].trim();
      } else if (cityParts.length === 2) {
        parsedAddr.province = cityParts[cityParts.length - 1].trim();
        parsedAddr.district = cityParts[cityParts.length - 2].trim();
      } else if (cityParts.length === 1) {
        parsedAddr.province = cityParts[0].trim();
      }
    }

    return parsedAddr;
  };

  const parsedAddress = parseAddress(address);

  const [formData, setFormData] = useState({
    country: parsedAddress.country || 'Việt Nam',
    countryCode: parsedAddress.countryCode || '+84',
    phoneNumber: parsedAddress.phoneNumber || '',
    provinceId: '0',
    provinceName: parsedAddress.province || '',
    districtId: '0',
    districtName: parsedAddress.district || '',
    wardId: '0',
    wardName: parsedAddress.ward || '',
    address: parsedAddress.address,
    address_line2: parsedAddress.address_line2
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [foundProvince, setFoundProvince] = useState(false);
  const [foundDistrict, setFoundDistrict] = useState(false);
  const [foundWard, setFoundWard] = useState(false);
  const [loading, setLoading] = useState(false);

  // Log parsed phone data for debugging
  useEffect(() => {
    console.log("Parsed phone data:", {
      original: address.phone,
      countryCode: parsedAddress.countryCode,
      phoneNumber: parsedAddress.phoneNumber
    });
  }, [address.phone]);

  // Tải dữ liệu tỉnh/thành phố khi component được mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
        const data = await response.json();

        if (data.error === 0) {
          setProvinces(data.data);

          // Nếu có tỉnh/thành phố trong dữ liệu ban đầu, thử tìm provinceId
          if (parsedAddress.province) {
            const foundProvince = data.data.find(p =>
              p.full_name.toLowerCase().includes(parsedAddress.province.toLowerCase()) ||
              parsedAddress.province.toLowerCase().includes(p.full_name.toLowerCase())
            );

            if (foundProvince) {
              setFormData(prev => ({
                ...prev,
                provinceId: foundProvince.id,
                provinceName: foundProvince.full_name
              }));
              setFoundProvince(true);

              // Tải quận/huyện nếu tìm thấy tỉnh
              fetchDistricts(foundProvince.id, parsedAddress.district);
            }
          }
        } else {
          console.error('Lỗi khi lấy dữ liệu tỉnh/thành phố');
        }
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi gọi API tỉnh/thành phố:', error);
        setLoading(false);
      }
    };

    fetchProvinces();
  }, [parsedAddress.province, parsedAddress.district]);

  // Lấy dữ liệu quận/huyện với hỗ trợ tìm kiếm quận/huyện hiện tại
  const fetchDistricts = async (provinceId, districtName = null) => {
    if (!provinceId || provinceId === '0') {
      setDistricts([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
      const data = await response.json();

      if (data.error === 0) {
        setDistricts(data.data);

        // Nếu có tên quận/huyện, thử tìm theo tên
        if (districtName) {
          const foundDistrict = data.data.find(d =>
            d.full_name.toLowerCase().includes(districtName.toLowerCase()) ||
            districtName.toLowerCase().includes(d.full_name.toLowerCase())
          );

          if (foundDistrict) {
            setFormData(prev => ({
              ...prev,
              districtId: foundDistrict.id,
              districtName: foundDistrict.full_name
            }));
            setFoundDistrict(true);

            // Tải phường/xã nếu tìm thấy quận/huyện
            fetchWards(foundDistrict.id, parsedAddress.ward);
          }
        }
      } else {
        console.error('Lỗi khi lấy dữ liệu quận/huyện');
      }
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi gọi API quận/huyện:', error);
      setLoading(false);
    }
  };

  // Lấy dữ liệu phường/xã với hỗ trợ tìm kiếm phường/xã hiện tại
  const fetchWards = async (districtId, wardName = null) => {
    if (!districtId || districtId === '0') {
      setWards([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
      const data = await response.json();

      if (data.error === 0) {
        setWards(data.data);

        // Nếu có tên phường/xã, thử tìm theo tên
        if (wardName) {
          const foundWard = data.data.find(w =>
            w.full_name.toLowerCase().includes(wardName.toLowerCase()) ||
            wardName.toLowerCase().includes(w.full_name.toLowerCase())
          );

          if (foundWard) {
            setFormData(prev => ({
              ...prev,
              wardId: foundWard.id,
              wardName: foundWard.full_name
            }));
            setFoundWard(true);
          }
        }
      } else {
        console.error('Lỗi khi lấy dữ liệu phường/xã');
      }
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi gọi API phường/xã:', error);
      setLoading(false);
    }
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    // Tìm mã quốc gia tương ứng
    const country = countryOptions.find(c => c.name === selectedCountry);
    const countryCode = country ? country.code : '+84'; // Mặc định là Việt Nam

    setFormData(prev => ({
      ...prev,
      country: selectedCountry,
      countryCode: countryCode
    }));
  };

  const handlePhoneNumberChange = (e) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/\D/g, '');
    
    // Kiểm tra độ dài tối đa
    const maxLength = getMaxPhoneLength();
    if (value.length <= maxLength) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: value
      }));
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
      provinceName: selectedProvince ? selectedProvince.full_name : '',
      districtId: '0',
      districtName: '',
      wardId: '0',
      wardName: ''
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
      districtName: selectedDistrict ? selectedDistrict.full_name : '',
      wardId: '0',
      wardName: ''
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

    // Kiểm tra số điện thoại
    if (!formData.phoneNumber) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }

    const minLength = formData.country === 'Singapore' ? 8 : 9;
    if (formData.phoneNumber.length < minLength) {
      alert(`Số điện thoại phải có ít nhất ${minLength} chữ số`);
      return;
    }

    // Kiểm tra địa chỉ chi tiết
    if (!formData.address || formData.address.trim().length < 5) {
      alert('Vui lòng nhập địa chỉ chi tiết (tối thiểu 5 ký tự)');
      return;
    }

    // Kiểm tra đã chọn đầy đủ địa chỉ chưa
    if (formData.provinceId === '0' || formData.districtId === '0' || formData.wardId === '0') {
      alert('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã');
      return;
    }

    // Format số điện thoại đầy đủ với mã quốc gia
    const formattedPhone = formData.countryCode.replace('+', '') + formData.phoneNumber;

    onSave({
      phone: formattedPhone,
      address: formData.address,
      address_line2: formData.address_line2,
      province: formData.provinceName,
      district: formData.districtName,
      ward: formData.wardName,
      country: formData.country
    });
  };

  const getMaxPhoneLength = () => {
    switch (formData.country) {
      case 'Việt Nam': return 9; // 9 chữ số sau mã quốc gia +84
      case 'Hoa Kỳ': return 10;
      case 'Nhật Bản': return 10;
      case 'Hàn Quốc': return 10;
      case 'Trung Quốc': return 11;
      case 'Singapore': return 8;
      default: return 12; // Mặc định cho các quốc gia khác
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-lg max-h-90vh overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Chỉnh sửa địa chỉ</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quốc gia - đặt trước số điện thoại */}
          <div>
            <label htmlFor="country" className="block text-sm text-gray-600 mb-1">Quốc gia</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleCountryChange}
              className="border p-2 rounded-md w-full"
            >
              {countryOptions.map(country => (
                <option key={country.code} value={country.name}>{country.name}</option>
              ))}
            </select>
          </div>

          {/* Số điện thoại với mã quốc gia */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
            <div className="flex">
              <div className="border p-2 rounded-l-md bg-gray-100 flex items-center justify-center min-w-[60px]">
                {formData.countryCode}
              </div>
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                placeholder="Số điện thoại"
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                maxLength={getMaxPhoneLength()}
                className="border p-2 rounded-r-md w-full"
                required
              />
            </div>
            {formData.country === 'Việt Nam' && (
              <p className="text-xs text-gray-500 mt-1">Ví dụ: Đối với số 0987654321, chỉ cần nhập 987654321</p>
            )}
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
                  <option key={province.id} value={province.id}>
                    {province.full_name}
                  </option>
                ))}
              </select>
              {!foundProvince && parsedAddress.province && (
                <p className="text-xs text-orange-500 mt-1">
                  Tỉnh/thành phố hiện tại: {parsedAddress.province}
                </p>
              )}
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
                disabled={formData.provinceId === '0' || loading}
              >
                <option value="0">Chọn Quận/Huyện</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.full_name}
                  </option>
                ))}
              </select>
              {!foundDistrict && parsedAddress.district && (
                <p className="text-xs text-orange-500 mt-1">
                  Quận/huyện hiện tại: {parsedAddress.district}
                </p>
              )}
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
                disabled={formData.districtId === '0' || loading}
              >
                <option value="0">Chọn Phường/Xã</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.full_name}
                  </option>
                ))}
              </select>
              {!foundWard && parsedAddress.ward && (
                <p className="text-xs text-orange-500 mt-1">
                  Phường/xã hiện tại: {parsedAddress.ward}
                </p>
              )}
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
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};