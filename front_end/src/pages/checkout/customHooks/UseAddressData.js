import { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';

/**
 * Custom hook for managing address data
 * 
 * Handles:
 * - Loading addresses
 * - Adding new addresses
 * - Editing addresses
 * - Deleting addresses
 * 
 * @param {string} userId - User ID to fetch addresses for
 * @returns {Object} Address data and management functions
 */
const useAddressData = (userId) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch addresses from API
    const fetchAddresses = async () => {
        try {
            setLoading(true);

            if (!userId) {
                throw new Error("User ID does not exist");
            }

            // Try primary API endpoint first
            try {
                const addresses = await ApiService.get(`/user-address/user/${userId}`);
                console.log("User addresses:", addresses);

                if (Array.isArray(addresses)) {
                    setAddresses(addresses);
                    if (addresses.length > 0 && !selectedAddress) {
                        setSelectedAddress(addresses[0]._id);
                    }
                    setError(null);
                } else {
                    console.warn("API returned data that is not an array:", addresses);
                    setAddresses([]);
                    setError("Cannot get address list");
                }
            } catch (apiError) {
                console.error("Error calling user-address API:", apiError);

                // Try alternate endpoint as fallback
                try {
                    const addresses = await ApiService.get(`/address/user/${userId}`);
                    console.log("User addresses (alternate endpoint):", addresses);

                    if (Array.isArray(addresses)) {
                        setAddresses(addresses);
                        if (addresses.length > 0 && !selectedAddress) {
                            setSelectedAddress(addresses[0]._id);
                        }
                        setError(null);
                    } else {
                        console.warn("Alternate API returned data that is not an array:", addresses);
                        setAddresses([]);
                        setError("Cannot get address list");
                    }
                } catch (secondApiError) {
                    console.error("Error calling alternate address API:", secondApiError);
                    setAddresses([]);
                    setError("Please add a new address.");
                }
            }
        } catch (err) {
            console.error("Error fetching addresses:", err);
            setError(err.message || "Cannot load address list");
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    // Add a new address
    const addAddress = async (addressData) => {
        try {
            // Format data for API
            const formattedAddress = {
                user_id: userId,
                address_line1: addressData.address,
                address_line2: addressData.address_line2 || "",
                city: addressData.province,
                country: addressData.country,
                phone: addressData.phone,
                status: true
            };

            console.log("Sending new address data:", formattedAddress);

            let savedAddress = null;

            try {
                // Try with primary API first
                savedAddress = await ApiService.post('/user-address/create', formattedAddress);
                console.log("Successfully created address with user-address API:", savedAddress);
            } catch (apiError) {
                console.log("Trying with alternate address API", apiError);
                // Try with alternate API if primary doesn't work
                savedAddress = await ApiService.post('/address/create', formattedAddress);
                console.log("Successfully created address with address API:", savedAddress);
            }

            // Update local state
            if (savedAddress && savedAddress._id) {
                // Add new address to state
                setAddresses(prevAddresses => [...prevAddresses, savedAddress]);
                // Select new address as current address
                setSelectedAddress(savedAddress._id);
                return { success: true, address: savedAddress };
            } else {
                // Reload address list
                await fetchAddresses();
                return { success: true };
            }
        } catch (err) {
            console.error("Error saving address:", err);
            return { 
                success: false, 
                error: err.message || "Cannot save address. Please check your information and try again." 
            };
        }
    };

    // Update an existing address
    const updateAddress = async (addressId, addressData) => {
        try {
            if (!addressId) {
                throw new Error("No address selected for editing");
            }

            // Format data for API
            const formattedAddress = {
                address_line1: addressData.address,
                address_line2: addressData.address_line2 || "",
                city: addressData.province,
                country: addressData.country,
                phone: addressData.phone,
                status: true
            };

            console.log("Sending updated address data:", formattedAddress);

            let updatedAddress = null;

            try {
                // Try primary endpoint first
                updatedAddress = await ApiService.put(`/address/edit/${addressId}`, formattedAddress);
                console.log("Successfully updated address with address/edit API:", updatedAddress);
            } catch (apiError) {
                console.log("Trying with alternate user-address API", apiError);
                // Try with alternate API if primary doesn't work
                updatedAddress = await ApiService.put(`/user-address/edit/${addressId}`, formattedAddress);
                console.log("Successfully updated address with user-address/edit API:", updatedAddress);
            }

            // Update local state
            if (updatedAddress) {
                setAddresses(prevAddresses => 
                    prevAddresses.map(addr => 
                        addr._id === addressId ? updatedAddress : addr
                    )
                );
                return { success: true, address: updatedAddress };
            } else {
                // Reload address list if API doesn't return updated address
                await fetchAddresses();
                return { success: true };
            }
        } catch (err) {
            console.error("Error updating address:", err);
            return { 
                success: false, 
                error: err.message || "Cannot update address. Please try again later." 
            };
        }
    };

    // Delete an address
    const deleteAddress = async (addressId) => {
        try {
            // Update UI first to respond immediately to user
            const remainingAddresses = addresses.filter(addr => addr._id !== addressId);
            setAddresses(remainingAddresses);

            // If deleting currently selected address, update selectedAddress
            if (selectedAddress === addressId) {
                if (remainingAddresses.length > 0) {
                    setSelectedAddress(remainingAddresses[0]._id);
                } else {
                    setSelectedAddress(null);
                }
            }

            try {
                // Try primary API first
                await ApiService.delete(`/user-address/delete/${addressId}`);
                console.log("Successfully deleted address with user-address API");
            } catch (apiError) {
                console.log("Trying with alternate address API", apiError);
                // Try alternate API if primary doesn't work
                await ApiService.delete(`/address/delete/${addressId}`);
                console.log("Successfully deleted address with address API");
            }
            
            return { success: true };
        } catch (err) {
            console.error("Error deleting address:", err);
            // Reload data in case of error to ensure UI is in sync with backend
            await fetchAddresses();
            return {
                success: false,
                error: err.message || "Cannot delete address. Please try again later."
            };
        }
    };

    // Get user name from the current user information
    const getUserName = () => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return "No name";

        // Priority get name from currentUser
        const fullName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();

        // If no name in currentUser, check if there's a name field
        if (fullName) return fullName;
        if (currentUser.name) return currentUser.name;

        // If no name, get email or username (if any)
        if (currentUser.email) return currentUser.email.split('@')[0]; // Get username part from email
        if (currentUser.username) return currentUser.username;

        return "No name";
    };

    // Format address for display
    const formatAddressForDisplay = (addressItem) => {
        const name = getUserName();

        return {
            id: addressItem._id,
            name: name,
            phone: addressItem.phone,
            address: `${addressItem.address_line1}${addressItem.address_line2 ? ', ' + addressItem.address_line2 : ''}${addressItem.city ? ', ' + addressItem.city : ''}${addressItem.country ? ', ' + addressItem.country : ''}`
        };
    };

    // Load addresses on initial render and when userId changes
    useEffect(() => {
        if (userId) {
            fetchAddresses();
        } else {
            setLoading(false);
            setError("Please log in to view your addresses.");
            setAddresses([]);
        }
    }, [userId]);

    return {
        addresses,
        selectedAddress,
        setSelectedAddress,
        loading,
        error,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        formatAddressForDisplay
    };
};

export default useAddressData;