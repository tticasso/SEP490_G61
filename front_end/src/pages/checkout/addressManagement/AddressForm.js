import React, { useState, useEffect } from 'react';

/**
 * AddressForm Component
 * 
 * A reusable form for adding or editing addresses
 * Handles location data fetching and form state management
 */
const AddressForm = ({ initialData = {}, onSubmit, submitLabel = "Save" }) => {
    const [formData, setFormData] = useState({
        phone: initialData.phone || '',
        country: initialData.country || 'Việt Nam',
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
        
        // Check if address details are complete
        if (formData.provinceId === '0' || formData.districtId === '0' || formData.wardId === '0') {
            alert('Please select Province/City, District, and Ward completely');
            return;
        }
        
        // Create full address string
        const fullAddress = `${formData.address}, ${formData.wardName}, ${formData.districtName}, ${formData.provinceName}`;
        
        onSubmit({
            phone: formData.phone,
            address: fullAddress,
            address_line2: formData.address_line2,
            province: formData.provinceName,
            country: formData.country
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {loading && (
                <div className="py-2 px-3 bg-blue-50 text-blue-700 rounded mb-4">
                    Loading data...
                </div>
            )}

            <div>
                <label htmlFor="phone" className="block text-sm text-gray-600 mb-1">Phone Number</label>
                <input
                    id="phone"
                    type="text"
                    name="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border p-2 rounded-md w-full"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="country" className="block text-sm text-gray-600 mb-1">Country</label>
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
                    <label htmlFor="provinceId" className="block text-sm text-gray-600 mb-1">Province / City</label>
                    <select
                        id="provinceId"
                        name="provinceId"
                        value={formData.provinceId}
                        onChange={handleProvinceChange}
                        className="border p-2 rounded-md w-full"
                        required
                    >
                        <option value="0">Select Province/City</option>
                        {provinces.map((province) => (
                            <option key={province.id} value={province.id}>{province.full_name}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="districtId" className="block text-sm text-gray-600 mb-1">District</label>
                    <select
                        id="districtId"
                        name="districtId"
                        value={formData.districtId}
                        onChange={handleDistrictChange}
                        className="border p-2 rounded-md w-full"
                        required
                        disabled={formData.provinceId === '0'}
                    >
                        <option value="0">Select District</option>
                        {districts.map((district) => (
                            <option key={district.id} value={district.id}>{district.full_name}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="wardId" className="block text-sm text-gray-600 mb-1">Ward</label>
                    <select
                        id="wardId"
                        name="wardId"
                        value={formData.wardId}
                        onChange={handleWardChange}
                        className="border p-2 rounded-md w-full"
                        required
                        disabled={formData.districtId === '0'}
                    >
                        <option value="0">Select Ward</option>
                        {wards.map((ward) => (
                            <option key={ward.id} value={ward.id}>{ward.full_name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div>
                <label htmlFor="address" className="block text-sm text-gray-600 mb-1">Specific Address</label>
                <input
                    id="address"
                    type="text"
                    name="address"
                    placeholder="House number, street name"
                    value={formData.address}
                    onChange={handleChange}
                    className="border p-2 rounded-md w-full"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="address_line2" className="block text-sm text-gray-600 mb-1">Additional Address (optional)</label>
                <input
                    id="address_line2"
                    type="text"
                    name="address_line2"
                    placeholder="Building, floor, room number, etc."
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