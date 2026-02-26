/**
 * Application Entry Point
 * 
 * Main entry point that:
 * - Renders the root component
 * - Sets up React strict mode
 * - Initializes performance monitoring
 * - Configures global styles
 * 
 * Features:
 * - React 18 root API
 * - Performance tracking
 * - Error boundaries
 * - Global CSS
 * - Development tools
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals, { logMetric } from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ─── Core Web Vitals Monitoring ──────────────────────────────────────────────
// Logs CLS, FID, FCP, LCP, TTFB to the browser console with color-coded ratings.
// Open DevTools > Console to see results after page load + first interaction.
reportWebVitals(logMetric);