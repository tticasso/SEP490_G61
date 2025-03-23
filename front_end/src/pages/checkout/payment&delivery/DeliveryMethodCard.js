import React from 'react';

/**
 * DeliveryMethodCard Component
 * 
 * Displays a single delivery/shipping method option with selection capability.
 * Shows the method name, price, and estimated delivery time.
 * 
 * @param {Object} method - The delivery method object with id, name, price and time
 * @param {boolean} isSelected - Whether this method is currently selected
 * @param {Function} onSelect - Function to call when this method is selected
 */
const DeliveryMethodCard = ({ method, isSelected, onSelect }) => {
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
            <div className="flex-grow">
                <div className="flex justify-between">
                    <span>{method.name}</span>
                    <span className="text-gray-600">{method.price.toLocaleString()}đ</span>
                </div>
                <p className="text-sm text-gray-500">{method.time}</p>
            </div>
        </div>
    );
};

export default DeliveryMethodCard;