const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add copy-webpack-plugin
      if (!webpackConfig.plugins) {
        webpackConfig.plugins = [];
      }

      webpackConfig.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join('node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs'),
              to: 'static/js/pdf.worker.min.js',
            },
            // Copy qpdf WASM file for PDF Unlock tool (client-side PDF decryption)
            {
              from: path.join('node_modules', '@neslinesli93', 'qpdf-wasm', 'dist', 'qpdf.wasm'),
              to: 'static/js/qpdf.wasm',
            },
          ],
        })
      );

      // Emscripten (qpdf-wasm) references Node.js built-ins that don't exist in browsers.
      // Setting these to false tells webpack to provide empty shims.
      // The WASM module uses browser APIs (e.g., Web Crypto) as fallbacks at runtime.
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        process: false,
        fs: false,
        path: false,
        crypto: false,
      };

      // ─── WSL2 hot-reload fix ───────────────────────────────────────────────
      // inotify events don't propagate from Windows (/mnt/c) into WSL2,
      // so webpack's default file watcher never sees changes.
      // Polling every 1 second is the standard workaround.
      webpackConfig.watchOptions = {
        poll: 1000,            // Check for changes every 1 second
        aggregateTimeout: 300, // Delay rebuild 300ms after the first change
      };

      return webpackConfig;
    },
  },

  jest: {
    configure: (jestConfig) => {
      // ─── react-router v7 + Jest resolver fix ───────────────────────────────
      // react-router-dom@7 ships a "main" field pointing at ./dist/main.js,
      // which DOES NOT EXIST. The real CommonJS entry is only reachable through
      // the package's "exports" map. Webpack honors "exports" (so `npm run build`
      // works), but the Jest 27 resolver bundled with react-scripts 5 ignores it
      // and falls back to "main" — producing "Cannot find module 'react-router-dom'".
      //
      // We map the two specifiers Jest cannot resolve to their actual CommonJS
      // builds. We point at the `.js` (CJS) files, NOT the `.mjs` (ESM) ones,
      // because Jest does not transform files under node_modules.
      //   - "react-router-dom"  → its dead "main" needs redirecting
      //   - "react-router/dom"  → a subpath import (used internally by the line
      //                            above) that has no "main" fallback at all
      // "react-router" itself resolves fine via its valid "main", so it's omitted.
      jestConfig.moduleNameMapper = {
        ...jestConfig.moduleNameMapper,
        '^react-router-dom$': '<rootDir>/node_modules/react-router-dom/dist/index.js',
        '^react-router/dom$': '<rootDir>/node_modules/react-router/dist/production/dom-export.js',
      };
      return jestConfig;
    },
  },
};
