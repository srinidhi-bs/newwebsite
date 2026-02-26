/**
 * Tools Page Component
 * 
 * Collection of utility tools including:
 * - PDF Merger
 * - File converters
 * - Data processors
 * - Utility calculators
 * 
 * Features:
 * - Tool categorization
 * - Easy navigation
 * - Responsive grid layout
 * - Tool descriptions
 * - Dark mode compatibility
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const Tools = ({ setCurrentPage }) => {
  useDocumentTitle('Tools');
  const navigate = useNavigate();

  const handleToolClick = (path) => {
    navigate(path);
  };

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tools</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* PDF Merger Tool */}
        <div
          className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleToolClick('/tools/pdf-merger')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              PDF Merger
            </h2>
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Easily combine multiple PDF files into a single document. Select files, arrange them in your preferred order, and merge them with just a few clicks.
          </p>
          <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
            Try it now
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* PDF Splitter Tool */}
        <div
          className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleToolClick('/tools/pdf-splitter')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              PDF Splitter
            </h2>
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Split PDF files into multiple documents. Select page ranges, preview pages for smaller files, and download the split PDFs as a zip file.
          </p>
          <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
            Try it now
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* PDF to JPG Converter Tool */}
        <div
          className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleToolClick('/tools/pdf-to-jpg')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              PDF to JPG
            </h2>
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-300"
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
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Convert single-page PDF files to high-quality JPG images. Perfect for sharing PDF content as images or creating image-based previews.
          </p>
          <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
            Try it now
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* JPG to PDF Converter Tool */}
        <div
          className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleToolClick('/tools/jpg-to-pdf')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              JPG to PDF
            </h2>
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Convert JPG and PNG images to PDF files. Perfect for creating documents from images while maintaining quality and dimensions.
          </p>
          <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
            Try it now
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Image Resizer Tool */}
        <div
          className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleToolClick('/tools/image-resizer')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Image Resizer
            </h2>
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-300"
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
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Resize images to a specific target file size. Perfect for optimizing images for web or meeting upload requirements.
          </p>
          <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
            Try it now
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* PDF Resizer Tool */}
        <div
          className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleToolClick('/tools/pdf-resizer')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              PDF Resizer
            </h2>
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Compress PDF files to a specific target size. Ideal for meeting email attachment limits or reducing storage usage.
          </p>
          <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
            Try it now
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* More tools can be added here */}
      </div>
    </PageWrapper>
  );
};

export default Tools;
