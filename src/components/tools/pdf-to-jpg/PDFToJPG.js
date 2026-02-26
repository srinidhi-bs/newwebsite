import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import PageWrapper from '../../layout/PageWrapper';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/static/js/pdf.worker.min.js`;

const PDFToJPG = () => {
  useDocumentTitle('PDF to JPG');
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles) => {
    setError('');
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    try {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      if (pdf.numPages > 1) {
        setError('Please upload a PDF with only one page');
        setPdfFile(null);
        return;
      }

      setPdfFile(file);
    } catch (err) {
      setError('Error loading PDF file: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const handleConvert = async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first');
      return;
    }

    try {
      setLoading(true);
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const page = await pdf.getPage(1);

      // Set scale for good quality
      const viewport = page.getViewport({ scale: 2.0 });

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Convert to JPG and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = pdfFile.name.replace('.pdf', '.jpg');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95); // 95% quality

    } catch (err) {
      setError('Error converting PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PDF to JPG Converter</h2>
        
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-300">
              {isDragActive ? 
                "Drop your PDF file here" : 
                "Drag & drop your PDF file here, or click to select"
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Only single-page PDF files are accepted</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* File Info & Convert Button */}
        {pdfFile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {pdfFile.name}
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
              {loading ? 'Converting...' : 'Convert to JPG'}
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Instructions
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Add a PDF file in one of these ways:
              <ul className="list-none pl-6 pt-1 space-y-1">
                <li>• Click anywhere in the dashed box above</li>
                <li>• Drag & drop a file from your computer into the box</li>
              </ul>
            </li>
            <li>Requirements:
              <ul className="list-none pl-6 pt-1 space-y-1">
                <li>• PDF must contain exactly one page</li>
                <li>• File must be a valid PDF document</li>
              </ul>
            </li>
            <li>Click "Convert to JPG" to convert and download the image</li>
            <li>The converted JPG will maintain high quality and resolution</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PDFToJPG;
