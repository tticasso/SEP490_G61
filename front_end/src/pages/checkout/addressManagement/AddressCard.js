import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

/**
 * AddressCard Component
 * 
 * Displays a single address card with options to select, edit, or delete.
 * 
 * @param {Object} address - The address object with formatted display properties
 * @param {boolean} isSelected - Whether this address is currently selected
 * @param {Function} onSelect - Function to call when this address is selected
 * @param {Function} onEdit - Function to call when edit button is clicked
 * @param {Function} onDelete - Function to call when delete button is clicked
 */
const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete }) => {
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
                    <span className="font-medium">{address.name} - {address.phone}</span>
                    <div className="flex space-x-2">
                        <Edit2
                            size={16}
                            className="text-blue-500 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        />
                        <Trash2
                            size={16}
                            className="text-red-500 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        />
                    </div>
                </div>
                <p className="text-gray-600">{address.address}</p>
            </div>
        </div>
    );
};

export default AddressCard;