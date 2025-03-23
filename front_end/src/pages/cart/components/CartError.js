import React from 'react';
import { AlertOctagon } from 'lucide-react';

const CartError = ({ message }) => {
    return (
        <div className="text-center p-8">
            <AlertOctagon size={40} className="mx-auto text-red-500 mb-2" />
            <div className="text-red-500 font-semibold">{message}</div>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
                Thử lại
            </button>
        </div>
    );
};

export default CartError;