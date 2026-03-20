/**
 * PDF OCR Component
 *
 * Extracts text from scanned/image-based PDFs using Tesseract.js OCR.
 *
 * How it works:
 * 1. User uploads a scanned or image-based PDF
 * 2. User selects output mode (extract text or create searchable PDF) and language
 * 3. Each page is rendered to a canvas via pdfjs-dist (at 2x scale for accuracy)
 * 4. Tesseract.js runs OCR on each rendered page image
 * 5. Output is either:
 *    a) Extracted text displayed in a textarea (copy/download as .txt)
 *    b) A searchable PDF with invisible text layer overlaid on original pages
 *
 * All processing happens in the browser — no files are uploaded to any server.
 * Uses Tesseract.js v5 (WASM-based, runs in a Web Worker).
 * Language data (~2-4 MB for English) is downloaded from CDN on first use and cached.
 *
 * Pattern references:
 * - PDFLock: dropzone pattern, progress states, file info display, formatSize helper
 * - PDFToJPG: pdfjs-dist page rendering to canvas
 *
 * @component
 * @returns {React.ReactElement} The PDF OCR tool page
 */

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import { PDFDocument } from 'pdf-lib';
import PageWrapper from '../../layout/PageWrapper';
import SEO from '../../common/SEO';

// Configure pdfjs worker — same pattern as all other PDF tools
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/static/js/pdf.worker.min.js`;

// ─── Supported languages ────────────────────────────────────────────────────
// Curated list of commonly used languages for OCR.
// Tesseract supports 100+ languages, but we show a practical subset.
// The value is the Tesseract language code used for worker initialization.
const LANGUAGES = [
    { code: 'eng', label: 'English' },
    { code: 'hin', label: 'Hindi' },
    { code: 'kan', label: 'Kannada' },
    { code: 'tam', label: 'Tamil' },
    { code: 'tel', label: 'Telugu' },
    { code: 'mar', label: 'Marathi' },
    { code: 'ben', label: 'Bengali' },
    { code: 'guj', label: 'Gujarati' },
    { code: 'mal', label: 'Malayalam' },
    { code: 'pan', label: 'Punjabi' },
    { code: 'fra', label: 'French' },
    { code: 'deu', label: 'German' },
    { code: 'spa', label: 'Spanish' },
    { code: 'por', label: 'Portuguese' },
    { code: 'ara', label: 'Arabic' },
    { code: 'jpn', label: 'Japanese' },
    { code: 'kor', label: 'Korean' },
    { code: 'chi_sim', label: 'Chinese (Simplified)' },
];

// ─── Constants ──────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 50 * 1024 * 1024;  // 50 MB — OCR is memory-intensive
const MAX_PAGES = 50;                     // Limit to prevent browser memory issues
const RENDER_SCALE = 2.0;                 // 2x scale for better OCR accuracy

const PDFOcr = () => {

    // =============================================
    // STATE MANAGEMENT
    // =============================================

    // --- File state ---
    const [pdfFile, setPdfFile] = useState(null);       // The uploaded PDF File object
    const [fileName, setFileName] = useState('');        // Display name of the file
    const [fileSize, setFileSize] = useState(0);         // File size in bytes
    const [pageCount, setPageCount] = useState(0);       // Total pages in the PDF

    // --- Options state ---
    const [outputMode, setOutputMode] = useState('text');    // 'text' or 'searchable-pdf'
    const [language, setLanguage] = useState('eng');          // Tesseract language code

    // --- Processing state ---
    const [isProcessing, setIsProcessing] = useState(false); // True during OCR
    const [currentPage, setCurrentPage] = useState(0);       // Page currently being processed (1-based)
    const [progress, setProgress] = useState('');             // Human-readable status message
    const [ocrProgress, setOcrProgress] = useState(0);        // 0-100 percentage for current page

    // --- Result state ---
    const [extractedText, setExtractedText] = useState('');         // Full extracted text
    const [searchablePdfBlob, setSearchablePdfBlob] = useState(null); // Searchable PDF Blob
    const [resultSize, setResultSize] = useState(0);                  // Output file size

    // --- Warning state (for PDFs that already contain text) ---
    const [, setHasExistingText] = useState(false);   // True if PDF already has text
    const [showTextWarning, setShowTextWarning] = useState(false);    // Show warning dialog

    // --- Copied state (for copy-to-clipboard feedback) ---
    const [copied, setCopied] = useState(false);

    // --- Error state ---
    const [error, setError] = useState('');

    // --- Ref to track if processing should be cancelled ---
    const cancelledRef = useRef(false);
    const workerRef = useRef(null);

    // =============================================
    // HELPER FUNCTIONS
    // =============================================

    /**
     * Formats a byte count into a human-readable string (e.g., "1.5 MB")
     * Same helper used across all PDF/image tools for consistency.
     *
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size string (e.g., "512 KB", "2.3 MB")
     */
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    /**
     * Renders a single PDF page to an offscreen canvas at the specified scale.
     * Used to create images for Tesseract OCR input.
     *
     * @param {Object} pdfDoc - The pdfjs-dist document object
     * @param {number} pageNum - 1-based page number
     * @returns {Promise<{canvas: HTMLCanvasElement, width: number, height: number}>}
     */
    const renderPageToCanvas = async (pdfDoc, pageNum) => {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: RENDER_SCALE });

        // Create an offscreen canvas for rendering
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        // Render the PDF page onto the canvas
        await page.render({ canvasContext: ctx, viewport }).promise;

        console.log(`[PDFOcr] Rendered page ${pageNum}: ${viewport.width}x${viewport.height}px`);
        return {
            canvas,
            width: viewport.width,
            height: viewport.height,
        };
    };

    /**
     * Checks if a PDF page already contains extractable text.
     * Used to warn users that OCR is designed for scanned/image PDFs.
     *
     * @param {Object} pdfDoc - The pdfjs-dist document object
     * @returns {Promise<boolean>} True if the first page has text content
     */
    const checkForExistingText = async (pdfDoc) => {
        try {
            const page = await pdfDoc.getPage(1);
            const textContent = await page.getTextContent();
            // If there are text items with actual content, the PDF has text
            const hasText = textContent.items.some(item => item.str && item.str.trim().length > 0);
            console.log(`[PDFOcr] Existing text check: ${hasText ? 'text found' : 'no text (scanned)'}`);
            return hasText;
        } catch (err) {
            console.warn('[PDFOcr] Could not check for existing text:', err);
            return false;
        }
    };

    /**
     * Merges Tesseract's text-only OCR PDFs with the original PDF pages.
     *
     * Strategy:
     * - Tesseract generates a text-only PDF for each page (pdfTextOnly: true)
     *   containing invisible text with proper rendering mode 3 (selectable but not visible)
     * - We load the original PDF and each Tesseract text-only PDF
     * - For each page, we overlay the Tesseract text layer on top of the original page
     *   by copying its content streams into the original page
     *
     * This approach is reliable because Tesseract's built-in PDF renderer
     * handles font encoding, text positioning, and rendering mode correctly.
     *
     * @param {ArrayBuffer} originalPdfBytes - The original PDF file bytes
     * @param {Array<Uint8Array>} pagePdfBuffers - Per-page text-only PDF buffers from Tesseract
     * @returns {Promise<Blob>} The searchable PDF as a Blob
     */
    const mergeOcrTextLayer = async (originalPdfBytes, pagePdfBuffers) => {
        console.log(`[PDFOcr] Merging OCR text layer: ${pagePdfBuffers.length} page PDFs`);

        // Load the original PDF
        const originalDoc = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true });
        const originalPages = originalDoc.getPages();

        for (let i = 0; i < originalPages.length && i < pagePdfBuffers.length; i++) {
            if (!pagePdfBuffers[i]) {
                console.warn(`[PDFOcr] No OCR PDF buffer for page ${i + 1}, skipping`);
                continue;
            }

            try {
                // Load the Tesseract text-only PDF for this page
                const ocrDoc = await PDFDocument.load(pagePdfBuffers[i]);
                const ocrPages = ocrDoc.getPages();

                if (ocrPages.length === 0) {
                    console.warn(`[PDFOcr] OCR PDF for page ${i + 1} has no pages, skipping`);
                    continue;
                }

                // Embed the OCR page as a form XObject in the original document
                const [embeddedPage] = await originalDoc.embedPdf(ocrDoc, [0]);

                // Draw the embedded OCR page on top of the original page
                // This overlays the invisible text layer onto the original content
                const origPage = originalPages[i];
                origPage.drawPage(embeddedPage, {
                    x: 0,
                    y: 0,
                    width: origPage.getWidth(),
                    height: origPage.getHeight(),
                });

                console.log(`[PDFOcr] Merged OCR text layer for page ${i + 1}`);
            } catch (mergeErr) {
                console.warn(`[PDFOcr] Failed to merge page ${i + 1}:`, mergeErr.message);
            }
        }

        const pdfBytes = await originalDoc.save();
        console.log(`[PDFOcr] Searchable PDF created: ${pdfBytes.length} bytes`);
        return new Blob([pdfBytes], { type: 'application/pdf' });
    };

    // =============================================
    // FILE HANDLING
    // =============================================

    /**
     * Handles file drop/selection. Validates the file and loads page count.
     * Checks if the PDF already contains text to warn the user.
     *
     * @param {File[]} acceptedFiles - Files from react-dropzone
     */
    const onDrop = useCallback(async (acceptedFiles) => {
        // Clear previous state
        setError('');
        setExtractedText('');
        setSearchablePdfBlob(null);
        setResultSize(0);
        setHasExistingText(false);
        setShowTextWarning(false);
        setCopied(false);

        if (acceptedFiles.length === 0) {
            console.log('[PDFOcr] No files dropped');
            return;
        }

        const file = acceptedFiles[0];
        console.log(`[PDFOcr] File selected: ${file.name} (${formatSize(file.size)})`);

        // Validate file type
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setError('Please select a PDF file.');
            console.warn('[PDFOcr] Rejected non-PDF file:', file.type);
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File is too large. Please select a PDF smaller than 50 MB.');
            console.warn('[PDFOcr] Rejected oversized file:', formatSize(file.size));
            return;
        }

        try {
            // Load the PDF to get page count and check for existing text.
            // IMPORTANT: pdfjs-dist transfers the ArrayBuffer to its web worker,
            // which detaches it. We must pass a COPY (.slice()) not just a view.
            const arrayBuffer = await file.arrayBuffer();
            const dataCopy = new Uint8Array(arrayBuffer).slice();
            const pdfDoc = await pdfjsLib.getDocument({ data: dataCopy }).promise;
            const numPages = pdfDoc.numPages;

            console.log(`[PDFOcr] PDF loaded: ${numPages} pages`);

            // Validate page count
            if (numPages === 0) {
                setError('This PDF has no pages to process.');
                return;
            }
            if (numPages > MAX_PAGES) {
                setError(`This PDF has ${numPages} pages. OCR is limited to ${MAX_PAGES} pages to prevent browser memory issues.`);
                return;
            }

            // Check if the PDF already contains text
            const existingText = await checkForExistingText(pdfDoc);

            // Store file info
            setPdfFile(file);
            setFileName(file.name);
            setFileSize(file.size);
            setPageCount(numPages);
            setHasExistingText(existingText);
            if (existingText) {
                setShowTextWarning(true);
            }

        } catch (err) {
            // Handle password-protected PDFs
            if (err.name === 'PasswordException' || (err.message && err.message.includes('password'))) {
                setError('This PDF is password-protected. Please unlock it first using our PDF Unlock tool.');
                console.warn('[PDFOcr] Password-protected PDF detected');
            } else {
                setError('Failed to load the PDF file. It may be corrupted or invalid.');
                console.error('[PDFOcr] PDF load error:', err);
            }
        }
    }, []);

    // Configure react-dropzone — accept only PDFs, single file at a time
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    // =============================================
    // OCR PROCESSING
    // =============================================

    /**
     * Main OCR processing function. Orchestrates the entire flow:
     * 1. Initialize Tesseract worker
     * 2. Load PDF with pdfjs-dist
     * 3. For each page: render to canvas → run OCR → collect results
     * 4. Produce output (text or searchable PDF)
     */
    const handleProcess = async () => {
        if (!pdfFile) {
            setError('Please select a PDF file first.');
            return;
        }

        console.log(`[PDFOcr] Starting OCR — mode: ${outputMode}, language: ${language}, pages: ${pageCount}`);
        setError('');
        setIsProcessing(true);
        setExtractedText('');
        setSearchablePdfBlob(null);
        setResultSize(0);
        setCurrentPage(0);
        setOcrProgress(0);
        setCopied(false);
        cancelledRef.current = false;

        let worker = null;

        try {
            // ─── Step 1: Initialize Tesseract worker ────────────────────
            setProgress('Loading OCR engine...');
            console.log(`[PDFOcr] Creating Tesseract worker for language: ${language}`);

            worker = await createWorker(language, 1, {
                // Logger callback — updates progress during recognition
                logger: (info) => {
                    if (info.status === 'recognizing text') {
                        // info.progress is 0.0 to 1.0 for the current page
                        setOcrProgress(Math.round(info.progress * 100));
                    }
                },
            });
            workerRef.current = worker;
            console.log('[PDFOcr] Tesseract worker ready');

            // ─── Step 2: Load PDF with pdfjs-dist ───────────────────────
            // Pass a sliced copy to avoid ArrayBuffer detachment by pdfjs worker
            setProgress('Loading PDF...');
            const arrayBuffer = await pdfFile.arrayBuffer();
            const dataCopy = new Uint8Array(arrayBuffer).slice();
            const pdfDoc = await pdfjsLib.getDocument({ data: dataCopy }).promise;

            // ─── Step 3: Process each page ──────────────────────────────
            let allText = '';                           // Accumulated text for text mode
            const pagePdfBuffers = [];                   // Per-page PDF buffers for searchable PDF mode

            for (let i = 1; i <= pageCount; i++) {
                // Check if cancelled
                if (cancelledRef.current) {
                    console.log('[PDFOcr] Processing cancelled by user');
                    break;
                }

                setCurrentPage(i);
                setOcrProgress(0);
                setProgress(`Processing page ${i} of ${pageCount}...`);

                // Render page to canvas at 2x scale
                const { canvas } = await renderPageToCanvas(pdfDoc, i);

                // Run OCR on the rendered page image
                // For searchable PDF mode, request Tesseract's built-in PDF output
                // which creates a proper invisible text layer (rendering mode 3)
                console.log(`[PDFOcr] Running OCR on page ${i}...`);
                const outputOptions = outputMode === 'searchable-pdf'
                    ? { text: true, pdf: true }
                    : { text: true };
                const recognizeOptions = outputMode === 'searchable-pdf'
                    ? { pdfTitle: fileName, pdfTextOnly: true }
                    : {};

                const result = await worker.recognize(canvas, recognizeOptions, outputOptions);

                // Collect text
                const pageText = result.data.text || '';
                allText += `--- Page ${i} ---\n${pageText}\n\n`;

                // Collect per-page PDF for searchable PDF mode
                if (outputMode === 'searchable-pdf' && result.data.pdf) {
                    pagePdfBuffers.push(result.data.pdf);
                    console.log(`[PDFOcr] Page ${i} PDF buffer: ${result.data.pdf.length} bytes`);
                }

                console.log(`[PDFOcr] Page ${i} complete: ${pageText.length} chars extracted`);

                // Release canvas memory
                canvas.width = 0;
                canvas.height = 0;
            }

            // Check if cancelled before producing output
            if (cancelledRef.current) {
                setIsProcessing(false);
                setProgress('');
                return;
            }

            // ─── Step 4: Produce output ─────────────────────────────────
            if (outputMode === 'text') {
                // Text mode — display extracted text
                const trimmedText = allText.trim();
                if (!trimmedText || trimmedText.replace(/--- Page \d+ ---/g, '').trim().length === 0) {
                    setError('No text was detected. The document may contain only images without readable text, or the scan quality may be too low.');
                    console.warn('[PDFOcr] No text detected in any page');
                } else {
                    setExtractedText(trimmedText);
                    console.log(`[PDFOcr] Text extraction complete: ${trimmedText.length} chars total`);
                }
            } else {
                // Searchable PDF mode — merge Tesseract's per-page text-only PDFs
                // with the original PDF pages using pdf-lib
                setProgress('Creating searchable PDF...');
                const blob = await mergeOcrTextLayer(arrayBuffer, pagePdfBuffers);
                setSearchablePdfBlob(blob);
                setResultSize(blob.size);
                console.log(`[PDFOcr] Searchable PDF complete: ${formatSize(blob.size)}`);
            }

        } catch (err) {
            if (!cancelledRef.current) {
                console.error('[PDFOcr] OCR failed:', err);
                if (err.message && err.message.includes('memory')) {
                    setError('Processing failed due to memory limitations. Try a smaller document or fewer pages.');
                } else if (err.message && err.message.includes('network')) {
                    setError('Failed to load the OCR engine. Please check your internet connection and try again.');
                } else {
                    setError(err.message || 'OCR processing failed. Please try again.');
                }
            }
        } finally {
            // Clean up Tesseract worker
            if (worker) {
                try {
                    await worker.terminate();
                    console.log('[PDFOcr] Tesseract worker terminated');
                } catch (e) {
                    console.warn('[PDFOcr] Worker termination warning:', e);
                }
            }
            workerRef.current = null;
            setIsProcessing(false);
            setProgress('');
            setOcrProgress(0);
            setCurrentPage(0);
        }
    };

    /**
     * Cancels the ongoing OCR processing.
     */
    const handleCancel = async () => {
        console.log('[PDFOcr] Cancel requested');
        cancelledRef.current = true;
        setProgress('Cancelling...');

        // Terminate the worker immediately
        if (workerRef.current) {
            try {
                await workerRef.current.terminate();
                console.log('[PDFOcr] Worker terminated during cancel');
            } catch (e) {
                console.warn('[PDFOcr] Cancel termination warning:', e);
            }
            workerRef.current = null;
        }

        setIsProcessing(false);
        setProgress('');
        setOcrProgress(0);
        setCurrentPage(0);
    };

    // =============================================
    // DOWNLOAD & COPY HANDLERS
    // =============================================

    /**
     * Triggers download of the searchable PDF file.
     * Generates a filename like "original_ocr.pdf".
     */
    const handleDownloadPdf = () => {
        if (!searchablePdfBlob) return;

        const url = URL.createObjectURL(searchablePdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName.replace(/\.pdf$/i, '_ocr.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`[PDFOcr] PDF download triggered: ${link.download}`);
    };

    /**
     * Downloads the extracted text as a .txt file.
     */
    const handleDownloadText = () => {
        if (!extractedText) return;

        const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName.replace(/\.pdf$/i, '_ocr.txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`[PDFOcr] Text download triggered: ${link.download}`);
    };

    /**
     * Copies the extracted text to the clipboard.
     * Shows a brief "Copied!" feedback.
     */
    const handleCopyText = async () => {
        if (!extractedText) return;

        try {
            await navigator.clipboard.writeText(extractedText);
            setCopied(true);
            console.log('[PDFOcr] Text copied to clipboard');
            // Reset "Copied!" feedback after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('[PDFOcr] Clipboard copy failed:', err);
            setError('Failed to copy text to clipboard. Please select and copy manually.');
        }
    };

    /**
     * Resets the tool to its initial state for a new file.
     */
    const resetTool = () => {
        setPdfFile(null);
        setFileName('');
        setFileSize(0);
        setPageCount(0);
        setOutputMode('text');
        setLanguage('eng');
        setIsProcessing(false);
        setCurrentPage(0);
        setProgress('');
        setOcrProgress(0);
        setExtractedText('');
        setSearchablePdfBlob(null);
        setResultSize(0);
        setHasExistingText(false);
        setShowTextWarning(false);
        setCopied(false);
        setError('');
        cancelledRef.current = false;
        console.log('[PDFOcr] Tool reset');
    };

    // =============================================
    // RENDER
    // =============================================

    return (
        <PageWrapper>
            <SEO routeKey="/tools/pdf-ocr" />
            <div className="max-w-4xl mx-auto">
                {/* Page title */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    PDF OCR
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Extract text from scanned PDFs using OCR. Get copyable text or create searchable PDFs — all processing happens in your browser.
                </p>

                {/* ─── Section 1: File Upload (Drop Zone) ─────────────────── */}
                {!pdfFile ? (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                            ${isDragActive
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                            }`}
                    >
                        <input {...getInputProps()} />
                        {/* OCR/document-search icon */}
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
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
                        {isDragActive ? (
                            <p className="text-blue-600 dark:text-blue-400 font-medium">
                                Drop your PDF here...
                            </p>
                        ) : (
                            <>
                                <p className="text-gray-600 dark:text-gray-300 font-medium">
                                    Drag & drop a scanned PDF here for OCR text extraction
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                    or click to browse (PDF files only, max 50 MB, max 50 pages)
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    /* ─── File selected: show options + processing + results ──── */
                    <div className="space-y-6">
                        {/* File info bar */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {/* PDF file icon */}
                                <svg
                                    className="h-8 w-8 text-red-500"
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
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                        {fileName}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatSize(fileSize)} · {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                                    </p>
                                </div>
                            </div>
                            {/* Remove file button — disabled during processing */}
                            {!isProcessing && (
                                <button
                                    onClick={resetTool}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    title="Remove file"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Warning: PDF already contains text */}
                        {showTextWarning && !isProcessing && !extractedText && !searchablePdfBlob && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <div className="flex items-start">
                                    {/* Warning icon */}
                                    <svg className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div>
                                        <p className="text-yellow-800 dark:text-yellow-300 font-medium text-sm">
                                            This PDF already contains text
                                        </p>
                                        <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                                            OCR works best on scanned or image-based PDFs. This file appears to already have selectable text. You can still proceed, but the results may be redundant or less accurate.
                                        </p>
                                        <button
                                            onClick={() => setShowTextWarning(false)}
                                            className="mt-2 text-sm text-yellow-800 dark:text-yellow-300 underline hover:no-underline"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error display */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg p-4">
                                <p className="font-medium">{error}</p>
                                {/* Show link to PDF Unlock if password-protected */}
                                {error.includes('password') && (
                                    <p className="text-sm mt-2">
                                        <a href="/tools/pdf-unlock" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                                            Go to PDF Unlock tool →
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ─── Section 2: Options + Start Button ─────────────────── */}
                        {!isProcessing && !extractedText && !searchablePdfBlob && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                {/* Output Mode Selection */}
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Output Format
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                    {/* Extract Text option */}
                                    <button
                                        onClick={() => setOutputMode('text')}
                                        className={`flex-1 p-4 rounded-lg border-2 transition-colors text-left
                                            ${outputMode === 'text'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center mb-1">
                                            {/* Text icon */}
                                            <svg className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className={`font-medium ${outputMode === 'text' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                                                Extract Text
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                                            Get plain text you can copy or download
                                        </p>
                                    </button>

                                    {/* Searchable PDF option */}
                                    <button
                                        onClick={() => setOutputMode('searchable-pdf')}
                                        className={`flex-1 p-4 rounded-lg border-2 transition-colors text-left
                                            ${outputMode === 'searchable-pdf'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center mb-1">
                                            {/* PDF download icon */}
                                            <svg className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className={`font-medium ${outputMode === 'searchable-pdf' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                                                Searchable PDF
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                                            Create a PDF with selectable text layer
                                        </p>
                                    </button>
                                </div>

                                {/* Language Selection */}
                                <label htmlFor="ocr-language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Document Language
                                </label>
                                <select
                                    id="ocr-language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        transition-colors"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Select the primary language of the document for better accuracy
                                </p>

                                {/* Start OCR Button */}
                                <button
                                    onClick={handleProcess}
                                    className="mt-6 w-full py-3 px-6 rounded-lg font-medium text-white transition-colors
                                        bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer"
                                >
                                    Start OCR
                                </button>
                            </div>
                        )}

                        {/* ─── Section 3: Processing Progress ────────────────────── */}
                        {isProcessing && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="text-center">
                                    {/* Spinning loader */}
                                    <svg className="animate-spin mx-auto h-10 w-10 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>

                                    {/* Status message */}
                                    <p className="text-gray-900 dark:text-white font-medium mb-2">
                                        {progress || 'Processing...'}
                                    </p>

                                    {/* Page progress indicator */}
                                    {currentPage > 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            Page {currentPage} of {pageCount}
                                        </p>
                                    )}

                                    {/* Per-page progress bar */}
                                    {currentPage > 0 && ocrProgress > 0 && (
                                        <div className="w-full max-w-md mx-auto">
                                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                                                <div
                                                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${ocrProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {ocrProgress}% — Recognizing text...
                                            </p>
                                        </div>
                                    )}

                                    {/* Overall progress bar (pages completed) */}
                                    {currentPage > 0 && (
                                        <div className="w-full max-w-md mx-auto mt-4">
                                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${((currentPage - 1) / pageCount) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Overall: {currentPage - 1} of {pageCount} pages complete
                                            </p>
                                        </div>
                                    )}

                                    {/* Cancel button */}
                                    <button
                                        onClick={handleCancel}
                                        className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ─── Section 4a: Text Results ──────────────────────────── */}
                        {extractedText && (
                            <div className="space-y-4">
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                                    {/* Success icon */}
                                    <svg className="mx-auto h-10 w-10 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                                        Text Extracted Successfully!
                                    </h3>
                                    <p className="text-green-700 dark:text-green-400 text-sm">
                                        {extractedText.length.toLocaleString()} characters extracted from {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                                    </p>
                                </div>

                                {/* Extracted text textarea */}
                                <textarea
                                    readOnly
                                    value={extractedText}
                                    className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                                        bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100
                                        font-mono text-sm resize-y
                                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />

                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleCopyText}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                                            text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        {copied ? (
                                            <>
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Copy to Clipboard
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDownloadText}
                                        className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600
                                            text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                                        </svg>
                                        Download as .txt
                                    </button>
                                    <button
                                        onClick={resetTool}
                                        className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                                            text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                                    >
                                        Process Another PDF
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ─── Section 4b: Searchable PDF Results ────────────────── */}
                        {searchablePdfBlob && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
                                {/* Success icon */}
                                <svg className="mx-auto h-12 w-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">
                                    Searchable PDF Created!
                                </h3>
                                <p className="text-green-700 dark:text-green-400 text-sm mb-4">
                                    Output size: {formatSize(resultSize)} · {pageCount} {pageCount === 1 ? 'page' : 'pages'} processed
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={handleDownloadPdf}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600
                                            text-white font-medium rounded-lg transition-colors"
                                    >
                                        Download Searchable PDF
                                    </button>
                                    <button
                                        onClick={resetTool}
                                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                                            text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                                    >
                                        Process Another PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Section 5: Disclaimers & Instructions ──────────────── */}
                <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 mt-8">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        How to use
                    </h3>
                    <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                        <li>Upload a scanned or image-based PDF (drag & drop or click to browse)</li>
                        <li>Choose output format: plain text or searchable PDF</li>
                        <li>Select the document language for better accuracy</li>
                        <li>Click "Start OCR" and wait for processing</li>
                        <li>Copy/download the extracted text, or download the searchable PDF</li>
                    </ol>

                    {/* Disclaimers */}
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-gray-600">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-2">
                            Important Notes
                        </h4>
                        <ul className="text-gray-500 dark:text-gray-400 text-xs space-y-1.5">
                            <li className="flex items-start">
                                <svg className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                                </svg>
                                OCR accuracy depends on scan quality, resolution, and font clarity. Results may contain errors — always review the output.
                            </li>
                            <li className="flex items-start">
                                <svg className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                                </svg>
                                Works best with printed text. Handwriting recognition is limited and may produce poor results.
                            </li>
                            <li className="flex items-start">
                                <svg className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                                </svg>
                                Large documents may take several minutes to process (approximately 2–5 seconds per page).
                            </li>
                            <li className="flex items-start">
                                <svg className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                First use downloads a small language model (~2–4 MB) which is cached by your browser for future use.
                            </li>
                        </ul>
                    </div>

                    {/* Privacy note */}
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-gray-600">
                        <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center">
                            {/* Shield/privacy icon */}
                            <svg className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Your files are processed entirely in your browser. Nothing is uploaded to any server.
                        </p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default PDFOcr;
