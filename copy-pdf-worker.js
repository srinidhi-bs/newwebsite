const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js');
const targetFile = path.join(__dirname, 'public', 'pdf.worker.min.js');

fs.copyFileSync(sourceFile, targetFile);
console.log('PDF.js worker file copied successfully!');
