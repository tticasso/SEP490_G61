import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import ApiService from '../../services/ApiService';

/**
 * Custom hook for managing payment methods
 * 
 * Handles:
 * - Loading payment methods from API
 * - Selecting a payment method
 * - Error and loading states
 * 
 * @returns {Object} Payment method data and management functions
 */
const usePaymentMethods = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch payment methods from API
    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get('/payment/list');

            if (Array.isArray(response)) {
                // Filter active payment methods
                const activeMethods = response.filter(method => method.is_active && !method.is_delete);

                // Format data for UI use
                const formattedMethods = activeMethods.map(method => ({
                    id: method._id,
                    name: method.name,
                    icon: <Truck /> // Default icon, can be changed based on payment type if needed
                }));

                setPaymentMethods(formattedMethods);

                // Auto-select first payment method if available
                if (formattedMethods.length > 0 && !selectedPaymentMethod) {
                    setSelectedPaymentMethod(formattedMethods[0].id);
                }

                setError(null);
            } else {
                console.warn("API payment/list returned data that is not an array:", response);
                // Use fallback data
                const fallbackMethods = [
                    { id: 1, name: 'Cash on Delivery', icon: <Truck /> },
                    { id: 2, name: 'Momo Payment', icon: <Truck /> },
                    { id: 3, name: 'VNPay Payment', icon: <Truck /> }
                ];
                setPaymentMethods(fallbackMethods);
                
                if (!selectedPaymentMethod) {
                    setSelectedPaymentMethod(fallbackMethods[0].id);
                }
                
                setError("Unable to get payment method list, using default data");
            }
        } catch (error) {
            console.error("Error fetching payment methods:", error);
            // Fallback to default data when API fails
            const fallbackMethods = [
                { id: 1, name: 'Cash on Delivery', icon: <Truck /> },
                { id: 2, name: 'Momo Payment', icon: <Truck /> },
                { id: 3, name: 'VNPay Payment', icon: <Truck /> }
            ];
            setPaymentMethods(fallbackMethods);
            
            if (!selectedPaymentMethod) {
                setSelectedPaymentMethod(fallbackMethods[0].id);
            }
            
            setError("Unable to get payment method list: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Load payment methods on initial render
    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    return {
        paymentMethods,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        loading,
        error,
        fetchPaymentMethods
    };
};

export default usePaymentMethods;