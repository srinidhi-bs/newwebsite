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

      return webpackConfig;
    },
  },
};
