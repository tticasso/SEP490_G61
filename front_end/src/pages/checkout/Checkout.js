import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import CheckoutLayout from './CheckoutLayout';
import AddressSection from './addressManagement/AddressSection';
import PaymentMethodSection from './payment&delivery/PaymentMethodSection';
import DeliveryMethodSection from './payment&delivery/DeliveryMethodSection';
import OrderSummary from './orderSummary/OrderSummary';
import AddAddressPopup from './addressManagement/AddAddressPopup';
import EditAddressPopup from './addressManagement/EditAddressPopup';
import { BE_API_URL } from '../../config/config';

const CheckoutPage = () => {
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [deliveryMethod, setDeliveryMethod] = useState('standard');
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [deliveryMethods, setDeliveryMethods] = useState([]);
    const [paymentLoading, setPaymentLoading] = useState(true);
    const [shippingLoading, setShippingLoading] = useState(true);
    const [paymentError, setPaymentError] = useState(null);
    const [shippingError, setShippingError] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddAddressPopup, setShowAddAddressPopup] = useState(false);
    const [showEditAddressPopup, setShowEditAddressPopup] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const navigate = useNavigate();

    // Get user information from AuthService
    const currentUser = AuthService.getCurrentUser();
    const userId = currentUser?._id || currentUser?.id || currentUser?.userId || "";

    const fetchCartData = async () => {
        try {
            setLoading(true);

            // Get selected products from localStorage
            const selectedItemsStr = localStorage.getItem('selectedCartItems');

            if (selectedItemsStr) {
                const selectedItems = JSON.parse(selectedItemsStr);

                if (Array.isArray(selectedItems) && selectedItems.length > 0) {
                    // Get any missing variant details if needed
                    const itemsWithCompleteVariants = await ensureCompleteVariantInfo(selectedItems);
                    setCartItems(itemsWithCompleteVariants);

                    // Calculate total using variant-aware price calculation
                    const subtotal = calculateSubtotalWithVariants(itemsWithCompleteVariants);
                    setCartTotal(subtotal);
                } else {
                    // No selected products, fetch from API as fallback
                    await fetchAllCartItems();
                }
            } else {
                // No data in localStorage, fetch from API
                await fetchAllCartItems();
            }

            // Check for applied coupon
            const appliedCouponStr = localStorage.getItem('appliedCoupon');
            if (appliedCouponStr) {
                const couponData = JSON.parse(appliedCouponStr);
                setAppliedCoupon(couponData);

                // Wait for cart total to be set before calculating discount
                setTimeout(() => {
                    // Calculate discount amount
                    if (couponData.type === 'percentage') {
                        // Percentage discount
                        let discount = (cartTotal * couponData.value) / 100;
                        // Apply maximum discount limit if exists
                        if (couponData.max_discount_value) {
                            discount = Math.min(discount, couponData.max_discount_value);
                        }
                        setDiscountAmount(discount);
                    } else if (couponData.type === 'fixed') {
                        // Fixed discount
                        setDiscountAmount(couponData.value);
                    }
                }, 0);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart data:', error);
            setError('Cannot load cart data. Please try again later.');
            setLoading(false);
        }
    };

    const ensureCompleteVariantInfo = async (items) => {
        const updatedItems = [...items];

        for (let i = 0; i < updatedItems.length; i++) {
            const item = updatedItems[i];

            // If item has a variant_id but it's not a complete object
            if (item.variant_id && (
                typeof item.variant_id === 'string' ||
                !item.variant_id.attributes ||
                !item.variant_id.price
            )) {
                const productId = typeof item.product_id === 'object'
                    ? item.product_id._id
                    : item.product_id;

                const variantId = typeof item.variant_id === 'string'
                    ? item.variant_id
                    : (item.variant_id?._id || item.variant_id?.id);

                console.log(`Fetching complete variant data for product: ${productId}, variant: ${variantId}`);

                if (productId && variantId) {
                    try {
                        // First try direct variant fetch
                        let fullVariant = null;
                        try {
                            fullVariant = await ApiService.get(`/product-variant/${variantId}`, false);
                            console.log("Direct variant fetch result:", fullVariant);
                        } catch (variantError) {
                            console.log("Direct variant fetch failed, trying product variants:", variantError);

                            // If direct fetch fails, get all variants for the product
                            const variants = await ApiService.get(`/product-variant/product/${productId}`, false);
                            if (Array.isArray(variants)) {
                                fullVariant = variants.find(v => v._id === variantId);
                                console.log("Found variant in product variants:", fullVariant);
                            }
                        }

                        if (fullVariant) {
                            updatedItems[i] = {
                                ...item,
                                variant_id: fullVariant
                            };
                            console.log(`Updated item ${i} with complete variant data`);
                        }
                    } catch (error) {
                        console.error(`Failed to fetch complete variant data for product ${productId}:`, error);
                    }
                }
            }
        }

        return updatedItems;
    };

    // Improved variant-aware price calculation
    const calculateSubtotalWithVariants = (items) => {
        const total = items.reduce((total, item) => {
            let itemPrice = 0;

            // First check for variant price (highest priority)
            if (item.variant_id && typeof item.variant_id === 'object' && item.variant_id.price) {
                itemPrice = item.variant_id.price;
                console.log(`Using variant price for ${item._id}: ${itemPrice}`);
            }
            // Fall back to product price
            else if (item.product_id && typeof item.product_id === 'object') {
                itemPrice = item.product_id.discounted_price || item.product_id.price || 0;
                console.log(`Using product price for ${item._id}: ${itemPrice}`);
            }

            return total + (itemPrice * item.quantity);
        }, 0);

        console.log(`Calculated subtotal with variants: ${total}`);
        return total;
    };

    // Fetch all products from cart via API (backup)
    const fetchAllCartItems = async () => {
        try {
            const response = await ApiService.get(`/cart/user/${userId}`);
            if (response && response.items) {
                // Get any missing variant details if needed
                const itemsWithVariants = await ensureCompleteVariantInfo(response.items);
                setCartItems(itemsWithVariants);

                // Calculate cart total with variant-aware pricing
                const subtotal = calculateSubtotalWithVariants(itemsWithVariants);
                setCartTotal(subtotal);
            } else {
                setCartItems([]);
                setCartTotal(0);
            }
        } catch (error) {
            console.error('Error fetching all cart items:', error);
            setCartItems([]);
            setCartTotal(0);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            setPaymentLoading(true);
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
                if (formattedMethods.length > 0 && !paymentMethod) {
                    setPaymentMethod(formattedMethods[0].id);
                }

                setPaymentError(null);
            } else {
                console.warn("API payment/list returned data that is not an array:", response);
                setPaymentMethods([
                    { id: 1, name: 'Cash on Delivery', icon: <Truck /> },
                    { id: 2, name: 'Momo Payment', icon: <Truck /> },
                    { id: 3, name: 'VNPay Payment', icon: <Truck /> }
                ]);
                setPaymentError("Unable to get payment method list, using default data");
            }
        } catch (error) {
            console.error("Error fetching payment methods:", error);
            // Fallback to default data when API fails
            setPaymentMethods([
                { id: 1, name: 'Cash on Delivery', icon: <Truck /> },
                { id: 2, name: 'Momo Payment', icon: <Truck /> },
                { id: 3, name: 'VNPay Payment', icon: <Truck /> }
            ]);
            setPaymentError("Unable to get payment method list: " + error.message);
        } finally {
            setPaymentLoading(false);
        }
    };

    const fetchShippingMethods = async () => {
        try {
            setShippingLoading(true);
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

                // Auto-select first shipping method if not already selected
                if (formattedMethods.length > 0 && !deliveryMethod) {
                    setDeliveryMethod(formattedMethods[0].id);
                }

                setShippingError(null);
            } else {
                console.warn("API shipping/list returned data that is not an array or is empty:", response);
                setShippingError("Unable to get shipping method list, using default data");
            }
        } catch (error) {
            console.error("Error fetching shipping methods:", error);
            setShippingError("Unable to get shipping method list: " + error.message);
        } finally {
            setShippingLoading(false);
        }
    };

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

    // Fetch addresses from API or use sample data
    const fetchAddresses = async () => {
        try {
            setLoading(true);

            if (!userId) {
                throw new Error("User ID does not exist");
            }

            // Use the official address API
            try {
                // Call API to get user addresses
                const addresses = await ApiService.get(`/user-address/user/${userId}`);
                console.log("User addresses:", addresses);

                if (Array.isArray(addresses)) {
                    setAddresses(addresses);
                    if (addresses.length > 0) {
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

                // Try with alternative endpoint
                try {
                    const addresses = await ApiService.get(`/address/user/${userId}`);
                    console.log("User addresses (alternative endpoint):", addresses);

                    if (Array.isArray(addresses)) {
                        setAddresses(addresses);
                        if (addresses.length > 0) {
                            setSelectedAddress(addresses[0]._id);
                        }
                        setError(null);
                    } else {
                        console.warn("Alternative API returned data that is not an array:", addresses);
                        setAddresses([]);
                        setError("Cannot get address list");
                    }
                } catch (secondApiError) {
                    console.error("Error calling alternative address API:", secondApiError);
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

    // Initialize initial state
    useEffect(() => {
        if (userId) {
            fetchCartData();
            fetchAddresses();
            fetchPaymentMethods();
            fetchShippingMethods();
        } else {
            setLoading(false);
            setError("Please log in to continue checkout.");
        }
    }, [userId]);

    // Update discount value when cartTotal changes
    useEffect(() => {
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percentage') {
                let discount = (cartTotal * appliedCoupon.value) / 100;
                if (appliedCoupon.max_discount_value) {
                    discount = Math.min(discount, appliedCoupon.max_discount_value);
                }
                setDiscountAmount(discount);
            }
        }
    }, [cartTotal, appliedCoupon]);

    // Check API connection
    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                // Check if server is running by calling a simple API
                const response = await fetch(`${BE_API_URL}/api/auth/check`, {
                    method: 'GET'
                });
                console.log("Server status:", response.status);

                if (response.status === 404) {
                    console.log("API auth/check does not exist, but server is running");
                    await checkAvailableEndpoints();
                }
            } catch (err) {
                console.error("Cannot connect to server:", err);
                setError("Cannot connect to server. Please check if server has been started.");
            }
        };

        // Check available endpoints
        const checkAvailableEndpoints = async () => {
            try {
                // Check possible endpoints
                const endpoints = [
                    '/user-address/list',
                    '/address/list'
                ];

                for (const endpoint of endpoints) {
                    try {
                        const resp = await fetch(`${BE_API_URL}/api${endpoint}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-access-token': AuthService.getToken()
                            }
                        });
                        console.log(`API endpoint ${endpoint} status:`, resp.status);

                        if (resp.status !== 404) {
                            console.log(`Endpoint ${endpoint} can be used`);
                        }
                    } catch (endpointErr) {
                        console.error(`Cannot access endpoint ${endpoint}:`, endpointErr);
                    }
                }
            } catch (err) {
                console.error("Error checking endpoints:", err);
            }
        };

        checkServerStatus();
    }, []);

    // Remove coupon
    const handleRemoveCoupon = () => {
        localStorage.removeItem('appliedCoupon');
        setAppliedCoupon(null);
        setDiscountAmount(0);
    };

    // Open add address popup
    const handleAddAddress = () => {
        setShowAddAddressPopup(true);
    };

    const handleClosePopup = () => {
        setShowAddAddressPopup(false);
        setShowEditAddressPopup(false);
        setAddressToEdit(null);
    };

    // Save new address
    const handleSaveAddress = async (newAddressData) => {
        try {
            // Format data for API
            const formattedAddress = {
                user_id: userId,
                address_line1: newAddressData.address,
                address_line2: newAddressData.address_line2 || "",
                city: newAddressData.province,
                country: newAddressData.country,
                phone: newAddressData.phone, // Phone is already properly formatted with country code
                status: true
            };

            console.log("Sending new address data:", formattedAddress);

            let savedAddress = null;

            try {
                // Try with user-address API first
                savedAddress = await ApiService.post('/user-address/create', formattedAddress);
                console.log("Successfully created address with user-address API:", savedAddress);
            } catch (apiError) {
                console.log("Trying with alternative address API", apiError);
                // Try with address API if user-address API doesn't work
                savedAddress = await ApiService.post('/address/create', formattedAddress);
                console.log("Successfully created address with address API:", savedAddress);
            }

            // Update UI state
            if (savedAddress && savedAddress._id) {
                // Add new address to state
                setAddresses(prevAddresses => [...prevAddresses, savedAddress]);
                // Select new address as current address
                setSelectedAddress(savedAddress._id);
                // Close popup
                setShowAddAddressPopup(false);
            } else {
                // Reload address list
                fetchAddresses();
                setShowAddAddressPopup(false);
            }
        } catch (err) {
            console.error("Error saving address:", err);
            alert("Cannot save address. Please check your information and try again.");
        }
    };

    // Edit address
    const handleEditAddress = (addressId) => {
        // Find address in list
        const address = addresses.find(addr => addr._id === addressId);
        if (address) {
            setAddressToEdit(address);
            setShowEditAddressPopup(true);
        } else {
            alert("Address information not found.");
        }
    };

    // Update address
    const handleUpdateAddress = async (updatedAddressData) => {
        try {
            if (!addressToEdit || !addressToEdit._id) {
                throw new Error("No address selected for editing");
            }

            // Format data for API
            const formattedAddress = {
                address_line1: updatedAddressData.address,
                address_line2: updatedAddressData.address_line2 || "",
                city: updatedAddressData.province,
                country: updatedAddressData.country,
                phone: updatedAddressData.phone, // Phone is already properly formatted with country code
                status: true
            };

            console.log("Sending updated address data:", formattedAddress);

            let updatedAddress = null;

            try {
                // Try with new endpoint first - Change endpoint from update to edit
                updatedAddress = await ApiService.put(`/address/edit/${addressToEdit._id}`, formattedAddress);
                console.log("Successfully updated address with address/edit API:", updatedAddress);
            } catch (apiError) {
                console.log("Trying with alternative user-address API", apiError);
                // Try with user-address API if address/edit API doesn't work
                updatedAddress = await ApiService.put(`/user-address/edit/${addressToEdit._id}`, formattedAddress);
                console.log("Successfully updated address with user-address/edit API:", updatedAddress);
            }

            // Update UI state
            if (updatedAddress) {
                setAddresses(prevAddresses =>
                    prevAddresses.map(addr =>
                        addr._id === addressToEdit._id ? updatedAddress : addr
                    )
                );
            } else {
                // Reload address list if API doesn't return updated address
                fetchAddresses();
            }

            // Close popup
            setShowEditAddressPopup(false);
            setAddressToEdit(null);
        } catch (err) {
            console.error("Error updating address:", err);
            alert("Cannot update address. Please try again later.");
        }
    };

    // Delete address
    const handleDeleteAddress = async (addressId) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
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
                    // Try with user-address API first
                    await ApiService.delete(`/user-address/delete/${addressId}`);
                    console.log("Successfully deleted address with user-address API");
                } catch (apiError) {
                    console.log("Trying with alternative address API", apiError);
                    // Try with address API if user-address API doesn't work
                    await ApiService.delete(`/address/delete/${addressId}`);
                    console.log("Successfully deleted address with address API");
                }
            } catch (err) {
                console.error("Error deleting address:", err);
                alert("Cannot delete address. Please try again later.");
                // Reload data in case of error
                fetchAddresses();
            }
        }
    };

    // Get user name from current user
    const getUserName = () => {
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

    // Convert address data from DB to display format
    const formatAddressForDisplay = (addressItem) => {
        // Get user name
        const name = getUserName();

        return {
            id: addressItem._id,
            name: name,
            phone: addressItem.phone,
            address: `${addressItem.address_line1}${addressItem.address_line2 ? ', ' + addressItem.address_line2 : ''}${addressItem.city ? ', ' + addressItem.city : ''}${addressItem.country ? ', ' + addressItem.country : ''}`
        };
    };

    // Reload addresses
    const handleRefreshAddresses = () => {
        fetchAddresses();
    };

    // Calculate order total (including discount from coupon and shipping fee)
    const calculateTotal = () => {
        const subtotal = cartTotal;
        // Subtract discount amount from coupon
        const afterDiscount = Math.max(0, subtotal - discountAmount);
        // Add shipping fee
        const selectedShippingMethod = deliveryMethods.find(method => method.id === deliveryMethod);
        const deliveryPrice = selectedShippingMethod ? selectedShippingMethod.price : 0;
        console.log("afterDiscount: ", afterDiscount);
        console.log("selectedShippingMethod: ", selectedShippingMethod);
        console.log("deliveryPrice: ", deliveryPrice);

        // Calculate final total including shipping fee
        const finalTotal = afterDiscount + deliveryPrice;
        console.log('Order total calculation:', {
            subtotal,
            discountAmount,
            afterDiscount,
            deliveryPrice,
            finalTotal
        });
        return finalTotal;
    };


    // Enhanced Place Order with improved variant handling
    // In CheckoutPage.js, modify the handlePlaceOrder function to include shipping_cost

    // Enhanced Place Order with improved variant handling and PayOS integration
    // Enhanced Place Order with multi-shop order creation
    const handlePlaceOrder = async () => {
        // Kiểm tra xem có sản phẩm nào hết hàng không
        const outOfStockItems = cartItems.filter(item => {
            // Kiểm tra variant stock trước nếu có
            if (item.variant_id && typeof item.variant_id === 'object') {
                return item.variant_id.stock !== undefined && item.variant_id.stock <= 0;
            }
            // Nếu không, kiểm tra product stock
            if (item.product_id && typeof item.product_id === 'object') {
                return item.product_id.stock !== undefined && item.product_id.stock <= 0;
            }
            return false;
        });

        // Nếu có sản phẩm hết hàng, hiển thị thông báo và không cho phép đặt hàng
        if (outOfStockItems.length > 0) {
            const productNames = outOfStockItems.map(item => {
                const product = item.product_id || {};
                const productName = product.name || "Product";

                // Lấy tên variant nếu có
                const variant = item.variant_id && typeof item.variant_id === 'object' ? item.variant_id : null;
                const variantName = variant && variant.name ? ` (${variant.name})` : '';

                return `${productName}${variantName}`;
            }).join(', ');

            alert(`Cannot place order. The following items are out of stock: ${productNames}`);
            return;
        }

        if (!selectedAddress || !paymentMethod || cartItems.length === 0) {
            alert("Please select address, payment method and have products in cart");
            return;
        }

        try {
            // Show loading
            setLoading(true);

            // Get selected shipping method and its cost
            const selectedShippingMethod = deliveryMethods.find(method => method.id === deliveryMethod);
            const shippingCost = selectedShippingMethod ? selectedShippingMethod.price : 0;

            // Group cart items by shop
            const itemsByShop = {};

            cartItems.forEach(item => {
                // Determine shop_id
                let shopId = "unknown";

                if (item.product_id && typeof item.product_id === 'object' && item.product_id.shop_id) {
                    shopId = typeof item.product_id.shop_id === 'object'
                        ? item.product_id.shop_id._id
                        : item.product_id.shop_id;
                } else if (item.shop_id) {
                    shopId = typeof item.shop_id === 'object'
                        ? item.shop_id._id
                        : item.shop_id;
                }

                // Create group if it doesn't exist
                if (!itemsByShop[shopId]) {
                    itemsByShop[shopId] = [];
                }

                // Add item to group
                itemsByShop[shopId].push(item);
            });

            // Store created order IDs
            const createdOrderIds = [];

            // Calculate subtotal for discount distribution
            const cartSubtotal = cartItems.reduce((total, item) => {
                let itemPrice;
                if (item.variant_id && typeof item.variant_id === 'object' && item.variant_id.price) {
                    itemPrice = item.variant_id.price;
                } else if (typeof item.product_id === 'object') {
                    itemPrice = item.product_id.discounted_price || item.product_id.price || 0;
                } else {
                    itemPrice = 0;
                }
                return total + (itemPrice * item.quantity);
            }, 0);

            // Process each shop's orders
            for (const [shopId, shopItems] of Object.entries(itemsByShop)) {
                // Prepare order items with proper variant handling
                const orderItems = shopItems.map(item => {
                    const productId = typeof item.product_id === 'object' ? item.product_id._id : item.product_id;

                    // Handle variant ID
                    let variantId = null;
                    if (item.variant_id) {
                        variantId = typeof item.variant_id === 'object' ? item.variant_id._id : item.variant_id;
                    }

                    // Determine the correct price to send
                    let itemPrice;
                    if (item.variant_id && typeof item.variant_id === 'object' && item.variant_id.price) {
                        // Use variant price if available
                        itemPrice = item.variant_id.price;
                    } else if (typeof item.product_id === 'object') {
                        // Otherwise use product price
                        itemPrice = item.product_id.discounted_price || item.product_id.price || 0;
                    } else {
                        // Fallback
                        itemPrice = 0;
                    }

                    return {
                        product_id: productId,
                        variant_id: variantId,
                        quantity: item.quantity,
                        price: itemPrice,
                        cart_id: item.cart_id
                    };
                });

                // Calculate shop subtotal
                const shopSubtotal = orderItems.reduce(
                    (total, item) => total + (item.price * item.quantity),
                    0
                );

                // Distribute discount proportionally if coupon is applied
                let shopDiscountAmount = 0;
                if (appliedCoupon && discountAmount > 0) {
                    // Calculate discount proportion based on shop subtotal vs cart subtotal
                    const discountProportion = shopSubtotal / cartSubtotal;
                    shopDiscountAmount = Math.round(discountAmount * discountProportion);

                    // Log discount distribution
                    console.log(`Shop ${shopId} gets ${shopDiscountAmount} discount (${discountProportion.toFixed(2)}% of total ${discountAmount})`);
                }

                // Create payload for API with proper coupon handling
                const orderPayload = {
                    customer_id: userId,
                    shipping_id: deliveryMethod,
                    payment_id: paymentMethod,
                    user_address_id: selectedAddress,
                    orderItems: orderItems,
                    order_payment_id: `PAY-${Date.now()}-${shopId}`,
                    // For the coupon, we need proper ID handling
                    coupon_id: appliedCoupon ? (appliedCoupon._id || appliedCoupon.id || null) : null,
                    discount_amount: shopDiscountAmount,
                    // Add explicit shipping cost field
                    shipping_cost: shippingCost,
                    // Add shop ID
                    shop_id: shopId,
                    // Calculate total for this shop's order (subtotal + shipping - discount)
                    total_price: shopSubtotal + shippingCost - shopDiscountAmount,
                };

                console.log(`Creating order for shop ${shopId} with ${orderItems.length} items:`, orderPayload);

                // Call API to create order for this shop
                const response = await ApiService.post('/order/create', orderPayload);

                // Store created order ID
                if (response && response.order) {
                    createdOrderIds.push(response.order._id);
                    console.log(`Created order ${response.order._id} for shop ${shopId}`);
                }
            }

            // Clear saved data in localStorage after all orders are created
            localStorage.removeItem('selectedCartItems');
            localStorage.removeItem('appliedCoupon');

            // Clear cart after successful orders
            if (cartItems.length > 0 && cartItems[0].cart_id) {
                await ApiService.delete(`/cart/clear/${cartItems[0].cart_id}`);
            }

            console.log(`Created ${createdOrderIds.length} orders for ${Object.keys(itemsByShop).length} shops`);

            // Handle payment - VNPay needs special handling for multiple orders
            const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);
            const isVNPayMethod = selectedPaymentMethod && (
                selectedPaymentMethod.name.toLowerCase().includes("qr") ||
                selectedPaymentMethod.name.toLowerCase().includes("mã qr")
            );

            if (isVNPayMethod && createdOrderIds.length > 0) {
                try {
                    // If payment integration supports multiple orders, pass them all
                    if (createdOrderIds.length === 1) {
                        // For single order, proceed normally
                        console.log("Creating PayOS payment for single order:", createdOrderIds[0]);

                        const paymentResponse = await ApiService.post('/payos/create-payment', {
                            orderId: createdOrderIds[0]
                        });

                        if (paymentResponse && paymentResponse.success && paymentResponse.data && paymentResponse.data.paymentUrl) {
                            // Save payment info to localStorage
                            localStorage.setItem('currentOrderId', createdOrderIds[0]);
                            localStorage.setItem('paymentTransactionCode', paymentResponse.data.transactionCode);

                            // Redirect to payment page
                            window.location.href = paymentResponse.data.paymentUrl;
                            return;
                        }
                    } else {
                        // For multiple orders, try batch payment if supported
                        console.log("Creating PayOS payment for multiple orders:", createdOrderIds);

                        // This API endpoint would need to be implemented to handle multiple orders
                        const paymentResponse = await ApiService.post('/payos/create-batch-payment', {
                            orderIds: createdOrderIds
                        });

                        if (paymentResponse && paymentResponse.success && paymentResponse.data && paymentResponse.data.paymentUrl) {
                            // Save all order IDs for later reference
                            localStorage.setItem('currentOrderIds', JSON.stringify(createdOrderIds));
                            localStorage.setItem('paymentTransactionCode', paymentResponse.data.transactionCode);

                            // Redirect to payment page
                            window.location.href = paymentResponse.data.paymentUrl;
                            return;
                        }
                    }
                } catch (paymentError) {
                    console.error("PayOS payment error:", paymentError);
                    alert(`Lỗi khởi tạo thanh toán: ${paymentError.message || 'Không xác định'}`);
                }
            }

            // Redirect to order confirmation page with all order IDs
            if (createdOrderIds.length === 1) {
                // For single order, use the existing URL format
                window.location.href = `/order-confirmation?orderId=${createdOrderIds[0]}`;
            } else {
                // For multiple orders, pass all IDs
                window.location.href = `/order-confirmation?orderIds=${createdOrderIds.join(',')}`;
            }
        } catch (error) {
            console.error("Error creating orders:", error);
            alert(`Error placing orders: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Props to pass to the layout component
    const addressSectionProps = {
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
    };

    const paymentMethodSectionProps = {
        paymentMethods,
        paymentMethod,
        setPaymentMethod,
        paymentLoading,
        paymentError
    };

    const deliveryMethodSectionProps = {
        deliveryMethods,
        deliveryMethod,
        setDeliveryMethod,
        shippingLoading,
        shippingError
    };

    const orderSummaryProps = {
        cartItems,
        cartTotal,
        appliedCoupon,
        discountAmount,
        deliveryMethods,
        deliveryMethod,
        handleRemoveCoupon,
        calculateTotal,
        handlePlaceOrder,
        selectedAddress,
        paymentMethod,
        paymentError
    };

    return (
        <>
            <CheckoutLayout
                addressSection={<AddressSection {...addressSectionProps} />}
                paymentMethodSection={<PaymentMethodSection {...paymentMethodSectionProps} />}
                deliveryMethodSection={<DeliveryMethodSection {...deliveryMethodSectionProps} />}
                orderSummary={<OrderSummary {...orderSummaryProps} />}
            />

            {/* Popup components */}
            {showAddAddressPopup && (
                <AddAddressPopup
                    onClose={handleClosePopup}
                    onSave={handleSaveAddress}
                />
            )}

            {showEditAddressPopup && addressToEdit && (
                <EditAddressPopup
                    address={addressToEdit}
                    onClose={handleClosePopup}
                    onSave={handleUpdateAddress}
                />
            )}
        </>
    );
};

export default CheckoutPage;