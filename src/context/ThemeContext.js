/**
 * Theme Context
 * 
 * Provides global theme state and management for the application.
 * 
 * Features:
 * - System theme detection
 * - Local storage persistence
 * - Context-based state management
 * - Synchronization with document classList
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeContext = createContext();

// How long the cross-personality morph lasts (must outlive the 0.6s CSS
// transition in index.css by a small buffer so it never gets cut short)
const MORPH_DURATION_MS = 650;

export const ThemeProvider = ({ children }) => {
    // Initialize theme based on local storage or system preference
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // Listens for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Handle theme changes
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Only save to localStorage if it's a manual toggle, not during sync
        // But for now, we want to persist state created by the user.
        // We'll handle persistence in the toggle function.
    }, [theme]);

    // Listen for system theme changes if no user preference is overridden
    // Note: We currently prefer explicit user choice once set. 
    // To support "System" mode explicitly would require a third state option ('system').
    // For now, we only initialize from system if empty.

    // Timer handle for the morph class removal (ref survives re-renders
    // without triggering them; rapid double-toggles just reset the timer)
    const morphTimer = useRef(null);

    // Clear any pending morph timer if the provider ever unmounts
    useEffect(() => {
        return () => clearTimeout(morphTimer.current);
    }, []);

    const toggleTheme = () => {
        // ── Cross-personality morph (Phase 14, RD-2) ─────────────────────
        // Briefly tag <html> with .theme-morph so EVERY element transitions
        // its colors/shadows/radii while the .dark class flips (the CSS rule
        // lives in index.css). The class is removed right after the 0.6s
        // transition ends — leaving it on permanently would make normal
        // hover effects feel sluggish.
        // Respect reduced motion: those users get an instant flip instead.
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reducedMotion) {
            const root = document.documentElement;
            root.classList.add('theme-morph');
            clearTimeout(morphTimer.current);
            morphTimer.current = setTimeout(() => {
                root.classList.remove('theme-morph');
            }, MORPH_DURATION_MS);
        }

        setTheme(prevTheme => {
            const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };

    const value = {
        theme,
        toggleTheme,
        isDark: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
