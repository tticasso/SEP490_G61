import React from 'react';

/**
 * PaymentMethodCard Component
 * 
 * Displays a single payment method option with selection capability.
 * 
 * @param {Object} method - The payment method object with id, name and icon
 * @param {boolean} isSelected - Whether this method is currently selected
 * @param {Function} onSelect - Function to call when this method is selected
 */
const PaymentMethodCard = ({ method, isSelected, onSelect }) => {
    return (
        <div
            className={`flex items-center p-4 border rounded-lg mb-2 cursor-pointer ${
                isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}
            onClick={onSelect}
        >
            <input
                type="radio"
                checked={isSelected}
                onChange={onSelect}
                className="mr-4"
            />
            {method.icon && (
                <span className="mr-4">{method.icon}</span>
            )}
            <span>{method.name}</span>
        </div>
    );
};

export default PaymentMethodCard;