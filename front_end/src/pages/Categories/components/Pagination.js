import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    showingFrom,
    showingTo,
    totalItems
}) => {
    // Create an array of page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        
        // Always show first page
        pageNumbers.push(1);
        
        // Calculate range around current page
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);
        
        // Add ellipsis after first page if needed
        if (startPage > 2) {
            pageNumbers.push('...');
        }
        
        // Add page numbers around current page
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        // Add ellipsis before last page if needed
        if (endPage < totalPages - 1) {
            pageNumbers.push('...');
        }
        
        // Always show last page if more than 1 page
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }
        
        return pageNumbers;
    };

    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-8 text-sm">
            <div className="text-gray-600 mb-4 md:mb-0">
                Hiển thị <span className="font-medium">{showingTo}</span> trên <span className="font-medium">{totalItems}</span> sản phẩm
            </div>
            
            <div className="flex items-center space-x-1">
                <button 
                    className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft size={20} />
                </button>
                
                {getPageNumbers().map((pageNumber, index) => (
                    <button
                        key={index}
                        className={`
                            w-10 h-10 flex items-center justify-center rounded
                            ${pageNumber === currentPage 
                                ? 'bg-purple-600 text-white' 
                                : pageNumber === '...' 
                                    ? 'cursor-default' 
                                    : 'text-gray-700 hover:bg-gray-100'}
                        `}
                        onClick={() => pageNumber !== '...' && onPageChange(pageNumber)}
                        disabled={pageNumber === '...'}
                    >
                        {pageNumber}
                    </button>
                ))}
                
                <button 
                    className={`p-2 rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;