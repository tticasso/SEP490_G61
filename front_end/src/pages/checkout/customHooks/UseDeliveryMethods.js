import { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';

/**
 * Custom hook for managing delivery methods
 * 
 * Handles:
 * - Loading delivery/shipping methods from API
 * - Selecting a delivery method
 * - Error and loading states
 * 
 * @returns {Object} Delivery method data and management functions
 */
const useDeliveryMethods = () => {
    const [deliveryMethods, setDeliveryMethods] = useState([]);
    const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('standard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to generate default time description based on method name
    const getDefaultTimeDescription = (methodName) => {
        const methodNameLower = methodName.toLowerCase();
        if (methodNameLower.includes('standard') || methodNameLower.includes('tiêu chuẩn')) {
            return '3-5 Days';
        } else if (methodNameLower.includes('fast') || methodNameLower.includes('nhanh')) {
            return '1-2 Days';
        } else if (methodNameLower.includes('same day') || methodNameLower.includes('trong ngày')) {
            return 'Same-day Delivery';
        } else if (methodNameLower.includes('international') || methodNameLower.includes('quốc tế')) {
            return '7-14 Days';
        }
        return '2-7 Days';
    };

    // Fetch delivery methods from API
    const fetchDeliveryMethods = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get('/shipping/list');

            if (Array.isArray(response) && response.length > 0) {
                // Format data for UI use
                const formattedMethods = response.map(method => ({
                    id: method._id,
                    name: method.name,
                    price: method.price,
                    time: method.description || getDefaultTimeDescription(method.name)
                }));

                setDeliveryMethods(formattedMethods);

                // Auto-select first delivery method if not already selected
                if (formattedMethods.length > 0 && 
                    (!selectedDeliveryMethod || 
                     !formattedMethods.some(m => m.id === selectedDeliveryMethod))) {
                    setSelectedDeliveryMethod(formattedMethods[0].id);
                }

                setError(null);
            } else {
                console.warn("API shipping/list returned data that is not an array or is empty:", response);
                
                // Use fallback data
                const fallbackMethods = [
                    { 
                        id: 'standard', 
                        name: 'Standard Delivery', 
                        price: 30000,
                        time: '3-5 Days' 
                    },
                    { 
                        id: 'express', 
                        name: 'Express Delivery', 
                        price: 60000,
                        time: '1-2 Days' 
                    }
                ];
                
                setDeliveryMethods(fallbackMethods);
                
                if (!selectedDeliveryMethod || selectedDeliveryMethod === 'standard') {
                    setSelectedDeliveryMethod(fallbackMethods[0].id);
                }
                
                setError("Unable to get shipping method list, using default data");
            }
        } catch (error) {
            console.error("Error fetching shipping methods:", error);
            
            // Use fallback data
            const fallbackMethods = [
                { 
                    id: 'standard', 
                    name: 'Standard Delivery', 
                    price: 30000,
                    time: '3-5 Days' 
                },
                { 
                    id: 'express', 
                    name: 'Express Delivery', 
                    price: 60000,
                    time: '1-2 Days' 
                }
            ];
            
            setDeliveryMethods(fallbackMethods);
            
            if (!selectedDeliveryMethod || selectedDeliveryMethod === 'standard') {
                setSelectedDeliveryMethod(fallbackMethods[0].id);
            }
            
            setError("Unable to get shipping method list: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Get shipping cost for the selected delivery method
    const getSelectedShippingCost = () => {
        const selectedMethod = deliveryMethods.find(method => method.id === selectedDeliveryMethod);
        return selectedMethod ? selectedMethod.price : 0;
    };

    // Load delivery methods on initial render
    useEffect(() => {
        fetchDeliveryMethods();
    }, []);

    return {
        deliveryMethods,
        selectedDeliveryMethod,
        setSelectedDeliveryMethod,
        loading,
        error,
        fetchDeliveryMethods,
        getSelectedShippingCost
    };
};

export default useDeliveryMethods;