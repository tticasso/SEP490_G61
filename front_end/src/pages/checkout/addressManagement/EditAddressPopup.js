import React from 'react';
import AddressForm from './AddressForm';

/**
 * EditAddressPopup Component
 * 
 * Modal popup for editing an existing delivery address.
 * Enhanced with better phone number parsing for international numbers.
 * 
 * @param {Object} address - The address object to edit
 * @param {Function} onClose - Function to call when closing the popup
 * @param {Function} onSave - Function to call with form data when saving
 */
const EditAddressPopup = ({ address, onClose, onSave }) => {
    // Parse address to extract components for the form with improved phone handling
    const parseAddress = (addressObj) => {
        // Try to parse from address_line1 if it has the format "house number, ward, district, province"
        const addressParts = addressObj.address_line1 ? addressObj.address_line1.split(', ') : [];
        
        // Default values
        return {
            phone: addressObj.phone || '',
            country: addressObj.country || 'Việt Nam',
            address: addressParts.length > 0 ? addressParts[0] : addressObj.address_line1 || '',
            address_line2: addressObj.address_line2 || '',
            provinceName: addressObj.city ? addressObj.city.split(', ').pop() : '',
            // Try to extract district and ward names if they exist in the address
            districtName: addressParts.length >= 3 ? addressParts[addressParts.length - 2] : '',
            wardName: addressParts.length >= 2 ? addressParts[addressParts.length - 3] : ''
        };
    };
    
    const parsedAddress = parseAddress(address);
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md w-full max-w-lg max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Chỉnh sửa địa chỉ giao hàng</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <AddressForm 
                    initialData={parsedAddress}
                    onSubmit={onSave}
                    submitLabel="Lưu"
                />
                
                <div className="mt-4 text-right">
                    <button
                        type="button"
                        onClick={onClose}
                        className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditAddressPopup;