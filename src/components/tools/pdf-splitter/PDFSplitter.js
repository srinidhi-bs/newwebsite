import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import JSZip from 'jszip';
import PageWrapper from '../../layout/PageWrapper';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/js/pdf.worker.min.js';

const PDFSplitter = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [pagePreviews, setPagePreviews] = useState([]);
  const [ranges, setRanges] = useState([{ from: '', to: '' }]);
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
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      setPageCount(pages.length);
      setPdfFile(file);

      // Generate previews only if pages <= 10
      if (pages.length <= 10) {
        const previews = [];
        // Generate previews logic here - will be implemented
        setPagePreviews(previews);
      }
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

  // Add new range
  const addRange = () => {
    setRanges([...ranges, { from: '', to: '' }]);
  };

  // Remove range
  const removeRange = (index) => {
    const newRanges = ranges.filter((_, i) => i !== index);
    setRanges(newRanges.length ? newRanges : [{ from: '', to: '' }]);
  };

  // Update range
  const updateRange = (index, field, value) => {
    const newRanges = ranges.map((range, i) => {
      if (i === index) {
        return { ...range, [field]: value };
      }
      return range;
    });
    setRanges(newRanges);
  };

  // Split PDF and download
  const handleSplit = async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first');
      return;
    }

    try {
      setLoading(true);
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const zip = new JSZip();

      // Validate and process each range
      for (const range of ranges) {
        const from = parseInt(range.from);
        const to = parseInt(range.to);

        if (isNaN(from) || isNaN(to) || from < 1 || to > pageCount || from > to) {
          throw new Error(`Invalid range ${from}-${to}`);
        }

        // Create new PDF for this range
        const newPdf = await PDFDocument.create();

        for (let i = from - 1; i < to; i++) {
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
        zip.file(`split_${from}-${to}.pdf`, pdfBytes);
      }

      // Generate and download zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'split_pdfs.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error splitting PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PDF Splitter</h2>

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
            <p className="text-sm text-gray-500 dark:text-gray-400">Only PDF files are accepted</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* File Info & Controls */}
        {pdfFile && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {pdfFile.name} ({pageCount} pages)
              </h3>

              {/* Page Ranges */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Split Ranges</h4>
                  <button
                    onClick={addRange}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Add Range
                  </button>
                </div>

                {ranges.map((range, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={pageCount}
                        value={range.from}
                        onChange={(e) => updateRange(index, 'from', e.target.value)}
                        placeholder="From"
                        className="w-20 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        min="1"
                        max={pageCount}
                        value={range.to}
                        onChange={(e) => updateRange(index, 'to', e.target.value)}
                        placeholder="To"
                        className="w-20 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    {ranges.length > 1 && (
                      <button
                        onClick={() => removeRange(index)}
                        className="p-2 text-red-500 hover:text-red-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Split Button */}
              <div className="mt-6">
                <button
                  onClick={handleSplit}
                  disabled={loading}
                  className={`w-full px-4 py-2 text-white rounded-lg ${loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                    } transition-colors`}
                >
                  {loading ? 'Processing...' : 'Split and Download'}
                </button>
              </div>
            </div>

            {/* Page Previews (if <= 10 pages) */}
            {pageCount <= 10 && pagePreviews.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Page Previews
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {pagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <img
                        src={preview}
                        alt={`Page ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center text-sm py-1">
                        Page {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
            <li>Once a file is uploaded, you can:
              <ul className="list-none pl-6 pt-1 space-y-1">
                <li>• Add page ranges using the "Add Range" button</li>
                <li>• Enter the starting and ending page numbers for each range</li>
                <li>• Remove ranges using the X button (except for the first range)</li>
              </ul>
            </li>
            <li>Click "Split and Download" to get your split PDFs in a zip file</li>
            <li>For PDFs with 10 pages or less, you'll see page previews below the controls</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PDFSplitter;
