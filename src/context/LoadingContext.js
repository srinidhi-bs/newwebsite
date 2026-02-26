import React, { createContext, useState, useContext, useCallback } from 'react';

// Create the context
const LoadingContext = createContext();

/**
 * LoadingProvider Component
 * 
 * Manages the global loading state and provides methods to show/hide the loader.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // Show the loader with an optional message
    const showLoading = useCallback((message = '') => {
        setLoadingMessage(message);
        setIsLoading(true);
    }, []);

    // Hide the loader
    const hideLoading = useCallback(() => {
        setIsLoading(false);
        setLoadingMessage('');
    }, []);

    const value = {
        isLoading,
        loadingMessage,
        showLoading,
        hideLoading
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
};

/**
 * Custom hook to use the loading context
 * @returns {Object} Loading context value
 */
export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
