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
import SEO from '../common/SEO';
import SectionHeader from '../common/SectionHeader';

const Tools = ({ setCurrentPage }) => {
  const navigate = useNavigate();

  const handleToolClick = (path) => {
    navigate(path);
  };

  return (
    <PageWrapper>
      <SEO routeKey="/tools" />
      {/* Magazine-voice header, matching Home's "TOOLS / 03" contents row */}
      <SectionHeader kicker="Tools / 03" title="Tools" accent="text-accent-tools" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* PDF Merger Tool */}
        <div
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/pdf-merger')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              PDF Merger
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
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
          <p className="text-ink-muted">
            Easily combine multiple PDF files into a single document. Select files, arrange them in your preferred order, and merge them with just a few clicks.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/pdf-splitter')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              PDF Splitter
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
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
          <p className="text-ink-muted">
            Split PDF files into multiple documents. Select page ranges, preview pages for smaller files, and download the split PDFs as a zip file.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/pdf-to-jpg')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              PDF to JPG
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
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
          <p className="text-ink-muted">
            Convert single-page PDF files to high-quality JPG images. Perfect for sharing PDF content as images or creating image-based previews.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/jpg-to-pdf')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              JPG to PDF
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
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
          <p className="text-ink-muted">
            Convert JPG and PNG images to PDF files. Perfect for creating documents from images while maintaining quality and dimensions.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/image-resizer')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              Image Resizer
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
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
          <p className="text-ink-muted">
            Resize images to a specific target file size. Perfect for optimizing images for web or meeting upload requirements.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/pdf-resizer')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              PDF Resizer
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
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
          <p className="text-ink-muted">
            Compress PDF files to a specific target size. Ideal for meeting email attachment limits or reducing storage usage.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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

        {/* PDF Unlock Tool */}
        <div
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/pdf-unlock')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              PDF Unlock
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-ink-muted">
            Remove password protection from PDF files. Enter the password to unlock and download a password-free copy. All processing happens in your browser.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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

        {/* PDF Lock Tool */}
        <div
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/pdf-lock')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              PDF Lock
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <p className="text-ink-muted">
            Add password protection to PDF files. Set a password and download an encrypted copy. Uses AES-256 encryption. All processing happens in your browser.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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

        {/* PDF Rotate/Reorder Tool */}
        <div
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/pdf-rearrange')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              PDF Rotate/Reorder
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>
          <p className="text-ink-muted">
            Rotate, reorder, or remove pages in your PDF. Drag-and-drop for small files or type page order for large ones. All processing happens in your browser.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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

        {/* PDF OCR Tool */}
        <div
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/pdf-ocr')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              PDF OCR
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.243 3 3 0 00-4.243 4.243z"
              />
            </svg>
          </div>
          <p className="text-ink-muted">
            Extract text from scanned PDFs using OCR. Get copyable text or create searchable PDFs. All processing happens in your browser.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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

        {/* PDF Page Numbers Tool */}
        <div
          className="card-skin tile-skin p-6 cursor-pointer"
          onClick={() => handleToolClick('/tools/pdf-page-numbers')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="display-skin text-lg leading-tight text-ink">
              PDF Page Numbers
            </h2>
            <svg
              className="w-6 h-6 shrink-0 ml-3 text-accent-tools"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
          </div>
          <p className="text-ink-muted">
            Add page numbers to your PDF files. Choose position, format, font, size, and color. Optionally skip cover pages. All processing happens in your browser.
          </p>
          <div className="mt-4 flex items-center font-labmono text-xs font-bold tracking-widest uppercase text-ink">
            Try it now
            <svg
              className="w-4 h-4 ml-1 text-accent-tools"
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
