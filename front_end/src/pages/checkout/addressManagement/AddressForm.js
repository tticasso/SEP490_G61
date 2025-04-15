import React, { useState, useEffect } from 'react';

// Country options with country codes
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
];

/**
 * AddressForm Component
 * 
 * A reusable form for adding or editing addresses
 * Handles location data fetching and form state management
 * Supports international phone numbers
 */
const AddressForm = ({ initialData = {}, onSubmit, submitLabel = "Save" }) => {
    // Parse phone number from initialData
    const parsePhoneNumber = (phoneStr) => {
        if (!phoneStr) return { countryCode: '+84', phoneNumber: '' };
        
        let cleanPhone = String(phoneStr).trim();
        
        // Check against known country codes
        for (const country of countryOptions) {
            const codeDigits = country.code.replace('+', '');
            if (cleanPhone.startsWith(codeDigits)) {
                return {
                    countryCode: country.code,
                    phoneNumber: cleanPhone.substring(codeDigits.length),
                    country: country.name
                };
            }
        }
        
        // Default to Vietnam if no match found
        return {
            countryCode: '+84',
            phoneNumber: cleanPhone,
            country: 'Việt Nam'
        };
    };
    
    // Extract phone data from initialData
    const phoneData = parsePhoneNumber(initialData.phone);

    const [formData, setFormData] = useState({
        phoneNumber: phoneData.phoneNumber || '',
        countryCode: phoneData.countryCode || '+84',
        country: initialData.country || phoneData.country || 'Việt Nam',
        provinceId: initialData.provinceId || '0',
        provinceName: initialData.provinceName || '',
        districtId: initialData.districtId || '0',
        districtName: initialData.districtName || '',
        wardId: initialData.wardId || '0',
        wardName: initialData.wardName || '',
        address: initialData.address || '',
        address_line2: initialData.address_line2 || ''
    });
    
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Load province data when component mounts
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
                const data = await response.json();
                
                if (data.error === 0) {
                    setProvinces(data.data);
                    
                    // If we have province data in initialData, try to find provinceId
                    if (initialData.provinceName) {
                        const foundProvince = data.data.find(p => 
                            p.full_name.toLowerCase().includes(initialData.provinceName.toLowerCase()) ||
                            initialData.provinceName.toLowerCase().includes(p.full_name.toLowerCase())
                        );
                        
                        if (foundProvince) {
                            setFormData(prev => ({
                                ...prev,
                                provinceId: foundProvince.id,
                                provinceName: foundProvince.full_name
                            }));
                            
                            // Load districts if province is found
                            fetchDistricts(foundProvince.id);
                        }
                    }
                } else {
                    console.error('Error fetching province data');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error calling province API:', error);
                setLoading(false);
            }
        };
        
        fetchProvinces();
    }, [initialData.provinceName]);
    
    // Fetch districts when province is selected
    const fetchDistricts = async (provinceId) => {
        if (!provinceId || provinceId === '0') {
            setDistricts([]);
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
            const data = await response.json();
            
            if (data.error === 0) {
                setDistricts(data.data);
                
                // If we have district data in initialData, try to find districtId
                if (initialData.districtName) {
                    const foundDistrict = data.data.find(d => 
                        d.full_name.toLowerCase().includes(initialData.districtName.toLowerCase()) ||
                        initialData.districtName.toLowerCase().includes(d.full_name.toLowerCase())
                    );
                    
                    if (foundDistrict) {
                        setFormData(prev => ({
                            ...prev,
                            districtId: foundDistrict.id,
                            districtName: foundDistrict.full_name
                        }));
                        
                        // Load wards if district is found
                        fetchWards(foundDistrict.id);
                    }
                }
            } else {
                console.error('Error fetching district data');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error calling district API:', error);
            setLoading(false);
        }
    };
    
    // Fetch wards when district is selected
    const fetchWards = async (districtId) => {
        if (!districtId || districtId === '0') {
            setWards([]);
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
            const data = await response.json();
            
            if (data.error === 0) {
                setWards(data.data);
                
                // If we have ward data in initialData, try to find wardId
                if (initialData.wardName) {
                    const foundWard = data.data.find(w => 
                        w.full_name.toLowerCase().includes(initialData.wardName.toLowerCase()) ||
                        initialData.wardName.toLowerCase().includes(w.full_name.toLowerCase())
                    );
                    
                    if (foundWard) {
                        setFormData(prev => ({
                            ...prev,
                            wardId: foundWard.id,
                            wardName: foundWard.full_name
                        }));
                    }
                }
            } else {
                console.error('Error fetching ward data');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error calling ward API:', error);
            setLoading(false);
        }
    };

    // Handle text input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    // Handle country change - update country code
    const handleCountryChange = (e) => {
        const selectedCountry = e.target.value;
        // Find corresponding country code
        const country = countryOptions.find(c => c.name === selectedCountry);
        const countryCode = country ? country.code : '+84'; // Default to Vietnam
        
        setFormData({
            ...formData,
            country: selectedCountry,
            countryCode: countryCode
        });
    };
    
    // Handle phone number input - only allow digits
    const handlePhoneNumberChange = (e) => {
        // Only allow digits
        const value = e.target.value.replace(/\D/g, '');
        
        // Check max length based on country
        const maxLength = getMaxPhoneLength();
        if (value.length <= maxLength) {
            setFormData(prev => ({
                ...prev,
                phoneNumber: value
            }));
        }
    };
    
    // Get maximum phone length based on country
    const getMaxPhoneLength = () => {
        switch (formData.country) {
            case 'Việt Nam': return 9; // 9 digits after +84
            case 'Hoa Kỳ': return 10;
            case 'Nhật Bản': return 10;
            case 'Hàn Quốc': return 10;
            case 'Trung Quốc': return 11;
            case 'Singapore': return 8;
            default: return 12; // Default for other countries
        }
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
        
        // Validate phone number
        if (!formData.phoneNumber) {
            alert('Please enter a phone number');
            return;
        }
        
        const minLength = formData.country === 'Singapore' ? 8 : 9;
        if (formData.phoneNumber.length < minLength) {
            alert(`Phone number must have at least ${minLength} digits`);
            return;
        }
        
        // Check if address details are complete
        if (formData.provinceId === '0' || formData.districtId === '0' || formData.wardId === '0') {
            alert('Please select Province/City, District, and Ward completely');
            return;
        }
        
        // Format phone number with country code
        const formattedPhone = formData.countryCode.replace('+', '') + formData.phoneNumber;
        
        // Create full address string
        const fullAddress = `${formData.address}, ${formData.wardName}, ${formData.districtName}, ${formData.provinceName}`;
        
        onSubmit({
            phone: formattedPhone,
            address: fullAddress,
            address_line2: formData.address_line2,
            province: formData.provinceName,
            country: formData.country
        });
    };

    return (
        <form onSubmit={handleSubmit} className="">
            {loading && (
                <div className="py-2 px-3 bg-blue-50 text-blue-700 rounded mb-4">
                    Đang tải dữ liệu...
                </div>
            )}

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
                        placeholder="Số điện thoại..."
                        value={formData.phoneNumber}
                        onChange={handlePhoneNumberChange}
                        maxLength={getMaxPhoneLength()}
                        className="border p-2 rounded-r-md w-full"
                        required
                    />
                </div>
                {formData.country === 'Việt Nam' && (
                    <p className="text-xs text-gray-500 mt-1">Ví dị: Nếu số điện thoại là 0987654321, hãy nhập 987654321</p>
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
                    placeholder="Số nhà, tên đường..."
                    value={formData.address}
                    onChange={handleChange}
                    className="border p-2 rounded-md w-full"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="address_line2" className="block text-sm text-gray-600 mb-1">Địa chỉ bổ sung (Không bắt buộc)</label>
                <input
                    id="address_line2"
                    type="text"
                    name="address_line2"
                    placeholder="Tòa nhà, số tầng, số phòng,..."
                    value={formData.address_line2}
                    onChange={handleChange}
                    className="border p-2 rounded-md w-full"
                />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
                <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};

export default AddressForm;