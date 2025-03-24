import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import ApiService from '../../services/ApiService';
import AuthService from '../../services/AuthService';
import defaultProductImage from '../../assets/dongho.png';

const OrderConfirmation = () => {
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variantDetails, setVariantDetails] = useState({});
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [calculatedSubtotal, setCalculatedSubtotal] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(0); // New state for calculated total

  // Get user information
  const currentUser = AuthService.getCurrentUser();
  const userId = currentUser?._id || currentUser?.id || "";

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        
        // Get orderId from URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        if (!orderId) {
          throw new Error("Order ID not found");
        }
        
        console.log(`Fetching order data for ID: ${orderId}`);
        
        // Call API to get order information
        const orderData = await ApiService.get(`/order/find/${orderId}`);
        
        if (!orderData || !orderData.order) {
          throw new Error("Unable to load order information");
        }
        
        console.log("Order data received:", orderData);
        
        setOrder(orderData.order);
        setOrderDetails(orderData.orderDetails || []);
        
        // Calculate subtotal with received data
        if (orderData.orderDetails && orderData.orderDetails.length > 0) {
          const subtotal = calculateOrderSubtotal(orderData.orderDetails);
          setCalculatedSubtotal(subtotal);
          
          // Calculate total including shipping cost
          const shippingCost = orderData.order.shipping_id?.price || 0;
          const totalDiscount = (orderData.order.discount_amount || 0) + (orderData.order.coupon_amount || 0);
          const total = Math.max(0, subtotal - totalDiscount) + shippingCost;
          setCalculatedTotal(total);
          
          console.log(`Calculated subtotal: ${subtotal}, Shipping cost: ${shippingCost}, Discounts: ${totalDiscount}, Total: ${total}`);
        }
        
        setLoading(false);

        // Only load variant details for items that don't have variant info populated
        const needsVariantLoad = (orderData.orderDetails || []).some(detail => 
          detail.variant_id && 
          (typeof detail.variant_id !== 'object' || 
           !detail.variant_id.attributes && !detail.variant_id.name)
        );
        
        if (needsVariantLoad) {
          await loadVariantDetails(orderData.orderDetails, orderData.order);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "An error occurred loading order information");
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  // Main function to load variant details only for items that need it
  const loadVariantDetails = async (details, orderObj) => {
    try {
      setLoadingVariants(true);
      console.log(`Checking if variant details needed for ${details.length} items`);
      
      // Create a copy of the current variant details
      const detailsMap = {};
      
      // Process each order detail item
      for (const detail of details) {
        // Skip if there's no variant_id or if variant_id is already a fully populated object
        if (!detail.variant_id || 
            (typeof detail.variant_id === 'object' && 
             detail.variant_id !== null &&
             (detail.variant_id.attributes || detail.variant_id.name))) {
          console.log(`Item ${detail._id} already has complete variant info or no variant, skipping`);
          continue;
        }
        
        // We need to fetch the variant info from the API
        // Extract product ID and variant ID
        const productId = typeof detail.product_id === 'object' 
          ? (detail.product_id._id || detail.product_id.id) 
          : detail.product_id;
        
        const variantId = typeof detail.variant_id === 'object'
          ? (detail.variant_id._id || detail.variant_id.id)
          : detail.variant_id;
        
        if (!productId || !variantId) {
          console.log(`Missing productId or variantId for ${detail._id}, skipping`);
          continue;
        }
        
        console.log(`Fetching variants for product ${productId}, looking for variant ${variantId}`);
        
        try {
          // First try direct variant fetch - may be faster and more reliable
          try {
            const directVariant = await ApiService.get(`/product-variant/${variantId}`, false);
            if (directVariant && directVariant._id) {
              console.log(`Direct fetch of variant ${variantId} successful:`, directVariant);
              detailsMap[detail._id] = directVariant;
              continue; // Skip to next iteration if successful
            }
          } catch (directFetchError) {
            console.log(`Direct fetch of variant ${variantId} failed:`, directFetchError);
            // Fall through to try the product variants approach
          }
          
          // Fetch all variants for this product
          const variants = await ApiService.get(`/product-variant/product/${productId}`, false);
          
          if (!Array.isArray(variants)) {
            console.log(`API returned non-array response for variants of product ${productId}:`, variants);
            continue;
          }
          
          console.log(`Found ${variants.length} variants for product ${productId}`);
          
          // Find the specific variant we need
          const variant = variants.find(v => v._id === variantId);
          
          if (variant) {
            console.log(`Found matching variant for ${detail._id}:`, variant);
            detailsMap[detail._id] = variant;
          } else {
            console.log(`No matching variant found for ID ${variantId} in product ${productId}`);
          }
        } catch (error) {
          console.error(`Error fetching variants for product ${productId}:`, error);
        }
      }
      
      console.log("Final variant details:", detailsMap);
      setVariantDetails(detailsMap);
      
      // Recalculate subtotal and total with newly fetched variant info if needed
      if (Object.keys(detailsMap).length > 0) {
        const subtotal = calculateOrderSubtotal(details, detailsMap);
        setCalculatedSubtotal(subtotal);
        
        // Recalculate total with updated subtotal
        const shippingCost = orderObj.shipping_id?.price || 0;
        const totalDiscount = (orderObj.discount_amount || 0) + (orderObj.coupon_amount || 0);
        const total = Math.max(0, subtotal - totalDiscount) + shippingCost;
        setCalculatedTotal(total);
        
        console.log(`Updated calculated subtotal: ${subtotal}, Total: ${total}`);
      }
      
    } catch (error) {
      console.error('Error in loadVariantDetails:', error);
    } finally {
      setLoadingVariants(false);
    }
  };

  // Function to find the correct price for an item
  const getItemPrice = (detail) => {
    // Priority 1: Use price directly from order detail if available
    if (detail.price !== undefined && detail.price > 0) {
      return detail.price;
    }
    
    // Priority 2: Use price from populated variant_id
    if (detail.variant_id && typeof detail.variant_id === 'object' && detail.variant_id.price !== undefined) {
      return detail.variant_id.price;
    }
    
    // Priority 3: Check our separately loaded variant details
    if (variantDetails[detail._id]?.price !== undefined) {
      return variantDetails[detail._id].price;
    }
    
    // Priority 4: Use product price as fallback
    if (typeof detail.product_id === 'object') {
      return detail.product_id.discounted_price || detail.product_id.price || 0;
    }
    
    return 0;
  };

  // Calculate correct subtotal for order
  const calculateOrderSubtotal = (details, variants = {}) => {
    if (!details || details.length === 0) return 0;
    
    // If order.original_price is available from server and seems reasonable, use it
    if (order && order.original_price !== undefined && order.original_price > 0) {
      // Verify by calculating manually
      const manualTotal = details.reduce((sum, detail) => {
        const price = getItemPrice(detail);
        return sum + (price * detail.quantity);
      }, 0);
      
      // Only use original_price if it's close to our manual calculation
      // This helps catch cases where original_price might be incorrect
      if (Math.abs(order.original_price - manualTotal) < manualTotal * 0.5) {
        console.log(`Using server-provided original_price: ${order.original_price}`);
        return order.original_price;
      } else {
        console.warn(`Original price from server (${order.original_price}) differs significantly from calculated price (${manualTotal}). Using calculated price.`);
        return manualTotal;
      }
    }
    
    // Calculate from order details
    const total = details.reduce((sum, detail) => {
      const price = getItemPrice(detail);
      const itemTotal = price * detail.quantity;
      console.log(`Item ${detail._id}: ${price} x ${detail.quantity} = ${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    
    console.log(`Calculated subtotal from order details: ${total}`);
    return total;
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0đ";
    
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'đ');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Render variant information
  const renderVariantInfo = (detail) => {
    // First check if we have populated variant info in the detail itself
    if (detail.variant_id && typeof detail.variant_id === 'object' && 
        (detail.variant_id.name || detail.variant_id.attributes)) {
      
      const variantInfo = detail.variant_id;
      
      // Render variant name if available
      const variantName = variantInfo.name ? (
        <div className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs inline-block mb-1">
          {variantInfo.name}
        </div>
      ) : null;
      
      // Get variant attributes based on structure
      const attributes = variantInfo.attributes instanceof Map 
        ? Object.fromEntries(variantInfo.attributes) 
        : variantInfo.attributes;
      
      // If no attributes or empty object
      if (!attributes || Object.keys(attributes).length === 0) {
        return variantName; // Just return the name if available
      }
      
      // Create attribute elements
      const attributeElements = (
        <div className="text-xs text-gray-600 flex flex-wrap gap-1">
          {Object.entries(attributes).map(([key, value]) => (
            <span key={key} className="bg-gray-100 px-1 py-0.5 rounded">
              <span className="capitalize">{key}</span>: <strong>{value}</strong>
            </span>
          ))}
        </div>
      );
      
      // Return both name and attributes
      return (
        <div className="mt-1 space-y-1">
          {variantName}
          {attributeElements}
        </div>
      );
    }
    
    // Fallback - use data from variantDetails state if it's been loaded
    let variantInfo = variantDetails[detail._id];
    
    if (!variantInfo) {
      // No variant info available
      return (
        <div className="text-xs text-gray-600 mt-1">
          {detail.variant_id ? "Biến thể: ID " + (typeof detail.variant_id === 'object' ? detail.variant_id._id : detail.variant_id) : null}
        </div>
      );
    }
    
    // Render variant name if available
    const variantName = variantInfo.name ? (
      <div className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs inline-block mb-1">
        {variantInfo.name}
      </div>
    ) : null;
    
    // Get variant attributes based on structure
    const attributes = variantInfo.attributes instanceof Map 
      ? Object.fromEntries(variantInfo.attributes) 
      : variantInfo.attributes;
    
    // If no attributes or empty object
    if (!attributes || Object.keys(attributes).length === 0) {
      return variantName; // Just return the name if available
    }
    
    // Create attribute elements
    const attributeElements = (
      <div className="text-xs text-gray-600 flex flex-wrap gap-1">
        {Object.entries(attributes).map(([key, value]) => (
          <span key={key} className="bg-gray-100 px-1 py-0.5 rounded">
            <span className="capitalize">{key}</span>: <strong>{value}</strong>
          </span>
        ))}
      </div>
    );
    
    // Return both name and attributes
    return (
      <div className="mt-1 space-y-1">
        {variantName}
        {attributeElements}
      </div>
    );
  };

  // Get variant image or product image
  const getItemImage = (detail) => {
    // Priority 1: Get from populated variant_id
    if (detail.variant_id && typeof detail.variant_id === 'object' &&
        detail.variant_id.images && detail.variant_id.images.length > 0) {
      return detail.variant_id.images[0];
    }
    
    // Priority 2: Get from our separately loaded variant details
    if (variantDetails[detail._id]?.images && variantDetails[detail._id].images.length > 0) {
      return variantDetails[detail._id].images[0];
    }
    
    // Fallback to product image
    if (detail.product_id && typeof detail.product_id === 'object') {
      return detail.product_id.thumbnail || detail.product_id.image;
    }
    
    return defaultProductImage;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
        <p className="mt-4 text-gray-700">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        <div className="text-red-500 text-center mb-4">❌ {error}</div>
        <div className="flex justify-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
        <div className="text-center mb-4">Không tìm thấy thông tin đơn hàng</div>
        <div className="flex justify-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Always use calculated subtotal to ensure accuracy
  const subtotal = calculatedSubtotal || 0;
  // Calculate total discount
  const totalDiscount = (order.discount_amount || 0) + (order.coupon_amount || 0);
  // Calculate shipping cost
  const shippingCost = order.shipping_id?.price || 0;
  
  // ALWAYS use our calculatedTotal if available, otherwise calculate it manually
  // This ensures shipping is ALWAYS included in the total
  const displayTotal = calculatedTotal || Math.max(0, subtotal - totalDiscount) + shippingCost;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-600">
          Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là <span className="font-semibold">{order._id}</span>
        </p>
        <p className="text-gray-600 mt-1">
          Chúng tôi đã gửi thông tin xác nhận đến email của bạn.
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Thông tin đơn hàng</h2>
        
        <div className="flex flex-col md:flex-row md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">Mã đơn hàng:</p>
            <p className="font-semibold">{order._id}</p>
          </div>
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">Ngày đặt hàng:</p>
            <p className="font-semibold">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-600">Trạng thái:</p>
            <p className="font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block">
              {order.status_id === 'pending' ? 'Chờ xử lý' :
               order.status_id === 'processing' ? 'Đang xử lý' :
               order.status_id === 'shipped' ? 'Đang giao hàng' :
               order.status_id === 'delivered' ? 'Đã giao hàng' :
               order.status_id === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold mb-4">Chi tiết sản phẩm</h3>
          
          <div className="space-y-4">
            {orderDetails.length > 0 ? orderDetails.map((detail) => (
              <div key={detail._id} className="flex items-center border-b border-gray-100 pb-4">
                <img
                  src={getItemImage(detail)}
                  alt={detail.product_id?.name || "Sản phẩm"}
                  className="w-16 h-16 object-cover rounded mr-4"
                  onError={(e) => { e.target.src = defaultProductImage }}
                />
                <div className="flex-grow">
                  <p className="font-medium">{detail.product_id?.name || "Sản phẩm"}</p>
                  
                  {/* Variant info */}
                  {loadingVariants ? (
                    <div className="text-xs text-gray-600 mt-1">Đang tải thông tin biến thể...</div>
                  ) : (
                    renderVariantInfo(detail)
                  )}
                  
                  <p className="text-sm text-gray-600 mt-1">
                    Số lượng: {detail.quantity} x {formatPrice(getItemPrice(detail))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(getItemPrice(detail) * detail.quantity)}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-gray-600">Không có thông tin chi tiết sản phẩm</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between mb-2">
            <span>Tạm tính:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          {totalDiscount > 0 && (
            <div className="flex justify-between mb-2">
              <span>Giảm giá:</span>
              <span>-{formatPrice(totalDiscount)}</span>
            </div>
          )}
          
          <div className="flex justify-between mb-2">
            <span>Phí vận chuyển:</span>
            <span>{shippingCost > 0 ? formatPrice(shippingCost) : "Miễn phí"}</span>
          </div>
          
          <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
            <span>Tổng cộng:</span>
            <span>{formatPrice(displayTotal)}</span>
          </div>
        </div>
      </div>

      {/* Shipping and Payment Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-4">
            <div className="flex items-center mb-3">
              <Home size={20} className="mr-2 text-purple-600" />
              <h3 className="font-semibold">Địa chỉ giao hàng</h3>
            </div>
            
            {order.user_address_id ? (
              <div className="ml-7">
                <p className="font-medium">
                  {order.user_address_id.name || 
                   (currentUser?.firstName && currentUser?.lastName ? 
                    `${currentUser.firstName} ${currentUser.lastName}` : 
                    'Khách hàng')}
                </p>
                <p className="text-gray-600">{order.user_address_id.phone}</p>
                <p className="text-gray-600">
                  {order.user_address_id.address_line1}
                  {order.user_address_id.address_line2 && `, ${order.user_address_id.address_line2}`}
                  {order.user_address_id.city && `, ${order.user_address_id.city}`}
                  {order.user_address_id.country && `, ${order.user_address_id.country}`}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 ml-7">Không có thông tin địa chỉ</p>
            )}
          </div>
          
          <div className="md:w-1/2 md:pl-4 md:border-l border-gray-200">
            <div className="flex items-center mb-3">
              <Truck size={20} className="mr-2 text-purple-600" />
              <h3 className="font-semibold">Phương thức giao hàng & thanh toán</h3>
            </div>
            
            <div className="ml-7">
              <p className="text-gray-600 mb-3">
                <span className="font-medium">Phương thức giao hàng: </span>
                {order.shipping_id?.name || "Giao hàng tiêu chuẩn"}
              </p>
              
              <p className="text-gray-600">
                <span className="font-medium">Phương thức thanh toán: </span>
                {order.payment_id?.name || "Thanh toán khi nhận hàng"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <button 
          onClick={() => window.location.href = '/'}
          className="flex-1 bg-white text-purple-600 border border-purple-600 hover:bg-purple-50 py-3 rounded-lg font-medium"
        >
          Tiếp tục mua sắm
        </button>
        
        <button 
          onClick={() => window.location.href = `/user-profile/orders?id=${order._id}`}
          className="flex-1 bg-purple-600 text-white hover:bg-purple-700 py-3 rounded-lg font-medium"
        >
          Xem chi tiết đơn hàng
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;