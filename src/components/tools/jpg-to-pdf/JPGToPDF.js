import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import PageWrapper from '../../layout/PageWrapper';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/static/js/pdf.worker.min.js`;

const JPGToPDF = () => {
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles) => {
    setError('');
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, JPEG, PNG)');
      return;
    }

    setImageFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false
  });

  const handleConvert = async () => {
    if (!imageFile) {
      setError('Please upload an image file first');
      return;
    }

    try {
      setLoading(true);

      // Read the image file
      const imageBytes = await imageFile.arrayBuffer();

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Embed the image
      let image;
      if (imageFile.type === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }

      // Add a page with the same dimensions as the image
      const page = pdfDoc.addPage([image.width, image.height]);

      // Draw the image on the page
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      // Create a blob and download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageFile.name.replace(/\.[^/.]+$/, '') + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      setError('Error converting image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">JPG to PDF Converter</h2>
        
        {/* File Upload Area */}
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
            hover:border-blue-500 dark:hover:border-blue-400 transition-colors`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-300">
              {isDragActive ? 
                "Drop your image here" : 
                "Drag & drop your image here, or click to select"
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Supports JPG, JPEG, and PNG files</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* File Info & Convert Button */}
        {imageFile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {imageFile.name}
            </h3>

            <button
              onClick={handleConvert}
              disabled={loading}
              className={`w-full px-4 py-2 text-white rounded-lg ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors`}
            >
              {loading ? 'Converting...' : 'Convert to PDF'}
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Instructions
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Add an image file in one of these ways:
              <ul className="list-none pl-6 pt-1 space-y-1">
                <li>• Click anywhere in the dashed box above</li>
                <li>• Drag & drop a file from your computer into the box</li>
              </ul>
            </li>
            <li>Supported file types:
              <ul className="list-none pl-6 pt-1 space-y-1">
                <li>• JPG/JPEG images</li>
                <li>• PNG images</li>
              </ul>
            </li>
            <li>Click "Convert to PDF" to create and download your PDF</li>
            <li>The PDF will maintain the original image dimensions and quality</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};

export default JPGToPDF;
