import React from 'react';
import AddressForm from './AddressForm';

/**
 * AddAddressPopup Component
 * 
 * Modal popup for adding a new delivery address.
 * 
 * @param {Function} onClose - Function to call when closing the popup
 * @param {Function} onSave - Function to call with form data when saving
 */
const AddAddressPopup = ({ onClose, onSave }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md w-full max-w-lg max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Add Delivery Address</h2>
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
                    onSubmit={onSave}
                    submitLabel="Add"
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

export default AddAddressPopup;