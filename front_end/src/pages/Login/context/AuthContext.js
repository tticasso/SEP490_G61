// src/pages/Login/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../../../services/AuthService';

// Create the auth context
const AuthContext = createContext(null);

// Provider component that wraps your app and makes auth object available to any
// child component that calls useAuth().
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]); // Add explicit userRoles state
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Process user roles from user data
  const extractRoles = (user) => {
    if (!user) return [];
    
    // If user has roles property and it's an array
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.map(role => {
        // If role is already a string with ROLE_ prefix
        if (typeof role === 'string' && role.startsWith('ROLE_')) {
          return role;
        }
        // If role is an object with a name property
        else if (typeof role === 'object' && role.name) {
          return `ROLE_${role.name}`;
        }
        // If role is just a string
        else if (typeof role === 'string') {
          return `ROLE_${role}`;
        }
        // Default to MEMBER if we can't determine the role
        return 'ROLE_MEMBER';
      });
    }
    
    // Default role if none found
    return ['ROLE_MEMBER'];
  };

  // Load user from localStorage on initial render
  useEffect(() => {
    const initAuth = () => {
      try {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
        
        // Extract and set roles
        const roles = extractRoles(user);
        setUserRoles(roles);
        
      } catch (error) {
        console.error('Error initializing auth context:', error);
        setCurrentUser(null);
        setUserRoles([]);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Listen for storage events to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        try {
          const user = e.newValue ? JSON.parse(e.newValue) : null;
          setCurrentUser(user);
          
          // Update roles too
          const roles = extractRoles(user);
          setUserRoles(roles);
        } catch (error) {
          console.error('Error parsing user from storage event:', error);
        }
      }
    };

    // Custom event for same-tab communication
    const handleAuthEvent = (e) => {
      if (e.detail && e.detail.type === 'AUTH_STATE_CHANGED') {
        const user = e.detail.user;
        setCurrentUser(user);
        
        // Update roles
        const roles = extractRoles(user);
        setUserRoles(roles);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-event', handleAuthEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-event', handleAuthEvent);
    };
  }, []);

  // Wrapper for login functionality
  const login = async (email, password) => {
    try {
      const userData = await AuthService.login(email, password);
      setCurrentUser(userData);
      
      // Extract and set roles
      const roles = extractRoles(userData);
      setUserRoles(roles);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Wrapper for Google login
  const handleGoogleAuthLogin = (userData) => {
    try {
      // Save to localStorage using direct approach for debugging
      const enrichedUserData = {
        ...userData,
        loginTime: new Date().getTime(),
        id: userData.id || (userData._id ? userData._id.toString() : null),
      };
      
      localStorage.setItem("user", JSON.stringify(enrichedUserData));
      
      // Update context state
      setCurrentUser(enrichedUserData);
      
      // Extract and set roles
      const roles = extractRoles(enrichedUserData);
      setUserRoles(roles);
      
      // Dispatch custom event for other components to know auth state changed
      window.dispatchEvent(
        new CustomEvent('auth-event', { 
          detail: { 
            type: 'AUTH_STATE_CHANGED', 
            user: enrichedUserData 
          } 
        })
      );
      
      return true;
    } catch (error) {
      console.error('Google auth processing error:', error);
      return false;
    }
  };

  // Wrapper for logout functionality
  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setUserRoles([]);
    
    // Dispatch custom event for other components
    window.dispatchEvent(
      new CustomEvent('auth-event', { 
        detail: { 
          type: 'AUTH_STATE_CHANGED', 
          user: null 
        } 
      })
    );
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    const formattedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return userRoles.includes(formattedRole);
  };

  const value = {
    currentUser,
    userRoles, // Expose userRoles to components
    isLoggedIn: !!currentUser,
    hasRole, // Expose helper function
    login,
    logout,
    handleGoogleAuthLogin,
    loading,
    authInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}