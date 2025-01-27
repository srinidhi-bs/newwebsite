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
          ],
        })
      );

      return webpackConfig;
    },
  },
};
