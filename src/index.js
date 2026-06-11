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

// ─── Self-hosted fonts (Phase 14, RD-1) ──────────────────────────────────────
// @fontsource serves the woff2 files from our own bundle (no Google Fonts
// request at runtime → no render-blocking third-party fetch, Vercel caches them)
import '@fontsource/archivo-black';            // 400 — Playground display ☀
import '@fontsource/space-grotesk/400.css';    // body, both personalities
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';    // bold UI + Lab display 🌙
import '@fontsource/jetbrains-mono/400.css';   // Lab "instrument readout" voice
import '@fontsource/jetbrains-mono/500.css';

// Design tokens MUST load before index.css (skins there consume these vars)
import './styles/tokens.css';
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