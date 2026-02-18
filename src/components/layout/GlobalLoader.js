import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';

/**
 * GlobalLoader Component
 * 
 * Displays a full-screen loading overlay when the global loading state is active.
 * Uses Framer Motion for smooth fade in/out animations.
 */
const GlobalLoader = () => {
    const { isLoading, loadingMessage } = useLoading();

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
                >
                    {/* Spinner */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full dark:border-gray-700 dark:border-t-indigo-400"
                    />

                    {/* Loading Message */}
                    {loadingMessage && (
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200"
                        >
                            {loadingMessage}
                        </motion.p>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlobalLoader;
