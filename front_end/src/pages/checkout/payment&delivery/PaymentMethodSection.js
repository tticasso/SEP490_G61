import React from 'react';
import PaymentMethodCard from './PaymentMethodCard';

/**
 * PaymentMethodSection Component
 * 
 * Displays the payment method selection section of the checkout page.
 * Shows a list of payment options.
 */
const PaymentMethodSection = ({
    paymentMethods,
    paymentMethod,
    setPaymentMethod,
    paymentLoading,
    paymentError
}) => {
    return (
        <>
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            
            {paymentLoading ? (
                <div className="text-center py-4">Loading payment methods...</div>
            ) : paymentError ? (
                <div className="text-orange-500 mb-2">{paymentError}</div>
            ) : null}

            {paymentMethods && paymentMethods.length > 0 ? 
                paymentMethods.map((method) => (
                    <PaymentMethodCard
                        key={method.id}
                        method={method}
                        isSelected={paymentMethod === method.id}
                        onSelect={() => setPaymentMethod(method.id)}
                    />
                ))
                : !paymentLoading && (
                    <div className="text-gray-500 text-center py-2">No payment methods available</div>
                )
            }
        </>
    );
};

export default PaymentMethodSection;