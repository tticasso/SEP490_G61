import React, { useEffect } from 'react';

/**
 * Utility functions for popup components
 */

/**
 * Create a portal container for a popup if it doesn't exist
 * 
 * @param {string} id - ID for the portal container
 * @returns {HTMLElement} Portal container element
 */
export const createPopupContainer = (id = 'popup-portal') => {
  let container = document.getElementById(id);
  
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);
  }
  
  return container;
};

/**
 * Hook to prevent body scrolling when a popup is open
 */
export const usePreventBodyScroll = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to prevent body scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Cleanup function to restore scrolling
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};

/**
 * Hook to close popup when Escape key is pressed
 */
export const useEscapeKeyClose = (isOpen, onClose) => {
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);
};

/**
 * Hook to close popup when clicking outside
 */
export const useOutsideClick = (ref, isOpen, onClose) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, isOpen, onClose]);
};

/**
 * Create overlay component for popups
 */
export const PopupOverlay = ({ isVisible, onClick, zIndex = 50 }) => {
  if (!isVisible) return null;
  
  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ zIndex }}
      onClick={onClick}
    />
  );
};

/**
 * Parse address into components for form editing
 * 
 * @param {Object} addressObj - Address object from the API
 * @returns {Object} Parsed address components
 */
export const parseAddressForPopup = (addressObj) => {
  // Try to parse from address_line1 if it has the format "house number, ward, district, province"
  const addressParts = addressObj.address_line1 ? addressObj.address_line1.split(', ') : [];
  
  // Default values
  return {
    phone: addressObj.phone || '',
    country: addressObj.country || 'Việt Nam',
    address: addressParts.length > 0 ? addressParts[0] : addressObj.address_line1 || '',
    address_line2: addressObj.address_line2 || '',
    provinceName: addressObj.city || '',
    // Try to extract district and ward names if they exist in the address
    districtName: addressParts.length >= 3 ? addressParts[addressParts.length - 2] : '',
    wardName: addressParts.length >= 2 ? addressParts[addressParts.length - 3] : ''
  };
};