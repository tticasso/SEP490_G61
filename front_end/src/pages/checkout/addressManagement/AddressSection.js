import React from 'react';
import AddressCard from './AddressCard';

/**
 * AddressSection Component
 * 
 * Displays the delivery address section of the checkout page.
 * Shows a list of saved addresses and allows adding new ones.
 */
const AddressSection = ({
    addresses,
    selectedAddress,
    setSelectedAddress,
    loading,
    error,
    handleAddAddress,
    handleEditAddress,
    handleDeleteAddress,
    handleRefreshAddresses,
    formatAddressForDisplay
}) => {
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Địa chỉ giao hàng </h2>
                {!loading && (
                    <button
                        onClick={handleRefreshAddresses}
                        className="text-purple-600 text-sm hover:underline"
                    >
                        ↻ Tải lại
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-4">Loading addresses...</div>
            ) : error && addresses.length === 0 ? (
                <div className="text-red-500 text-center py-4">
                    {error}
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                    You don't have any addresses yet. Please add a new address to continue checkout.
                    <div className="mt-2">
                        <button
                            onClick={handleAddAddress}
                            className="text-purple-600 hover:underline"
                        >
                            Add Address Now
                        </button>
                    </div>
                </div>
            ) : (
                addresses.map((addressItem) => {
                    const displayAddress = formatAddressForDisplay(addressItem);
                    return (
                        <AddressCard 
                            key={displayAddress.id}
                            address={displayAddress}
                            isSelected={selectedAddress === addressItem._id}
                            onSelect={() => setSelectedAddress(addressItem._id)}
                            onEdit={() => handleEditAddress(addressItem._id)}
                            onDelete={() => handleDeleteAddress(addressItem._id)}
                        />
                    );
                })
            )}

            {!loading && (
                <button
                    className="w-full border p-4 rounded text-purple-600 font-medium mt-2"
                    onClick={handleAddAddress}
                >
                    + Add Address
                </button>
            )}
        </>
    );
};

export default AddressSection;