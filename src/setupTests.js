// Polyfill TextEncoder/TextDecoder for the jsdom test environment.
// react-router v7 references these globals while its module is being imported,
// but jsdom (used by react-scripts' Jest) does not provide them. We pull the
// implementations from Node's built-in 'util' module so that importing
// 'react-router-dom' inside tests doesn't throw "TextEncoder is not defined".
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Polyfill window.matchMedia for the jsdom test environment.
// jsdom does not implement matchMedia, but the app calls it during render
// (e.g., dark-mode / prefers-color-scheme detection). Without this, rendering
// any component that reads the media query throws "matchMedia is not a function".
// Default to "no match" (light mode) — sufficient for render smoke tests.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},      // deprecated API, kept for compatibility
      removeListener: () => {},   // deprecated API, kept for compatibility
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Stub window.scrollTo for the jsdom test environment.
// jsdom doesn't implement scrollTo and throws a noisy "Not implemented" error.
// AnimatedRoutes calls window.scrollTo(0, 0) on every route change, so any test
// that renders a routed component triggers it. A no-op keeps test output clean.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
