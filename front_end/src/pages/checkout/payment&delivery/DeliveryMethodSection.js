import React from 'react';
import DeliveryMethodCard from './DeliveryMethodCard';

/**
 * DeliveryMethodSection Component
 * 
 * Displays the delivery/shipping method selection section of the checkout page.
 * Shows a list of delivery options with estimated times.
 */
const DeliveryMethodSection = ({
    deliveryMethods,
    deliveryMethod,
    setDeliveryMethod,
    shippingLoading,
    shippingError
}) => {
    return (
        <>
            <h2 className="text-xl font-bold mb-4">Phương thức giao hàng</h2>
            
            {shippingLoading ? (
                <div className="text-center py-4">Đang tải phương thức giao hàng...</div>
            ) : shippingError ? (
                <div className="text-orange-500 mb-2">{shippingError}</div>
            ) : null}

            {deliveryMethods && deliveryMethods.length > 0 ? 
                deliveryMethods.map((method) => (
                    <DeliveryMethodCard
                        key={method.id}
                        method={method}
                        isSelected={deliveryMethod === method.id}
                        onSelect={() => setDeliveryMethod(method.id)}
                    />
                ))
                : !shippingLoading && (
                    <div className="text-gray-500 text-center py-2">Không có phương thức giao hàng có sẵn nào</div>
                )
            }
        </>
    );
};

export default DeliveryMethodSection;