/**
 * PDF Page Numbers Component
 *
 * Adds page numbers to PDF files entirely client-side.
 *
 * How it works:
 * 1. User uploads a PDF
 * 2. User configures numbering options (position, format, font, size, color, etc.)
 * 3. pdf-lib embeds the chosen standard font, computes text coordinates per page,
 *    draws optional background rectangles, and stamps page numbers
 * 4. The numbered PDF is offered for download
 *
 * All processing happens in the browser — no files are uploaded to any server.
 * Uses pdf-lib (already installed) with standard PDF fonts (no extra dependencies).
 *
 * Configurable options:
 * - Position: Top/Bottom x Left/Center/Right (6 positions)
 * - Format: "1", "Page 1", "Page 1 of 5", "1/5", custom pattern with {n} and {total}
 * - Font: Helvetica, Times Roman, Courier (standard 14 PDF fonts)
 * - Font size: 8–24pt
 * - Color: Black, Gray, Blue, Red, White
 * - Margin: Distance from page edge (10–100pt)
 * - Start number: Custom starting page number
 * - Skip first page: Toggle for cover pages
 * - Background strip: Optional colored rectangle behind numbers for readability
 *
 * Pattern references:
 * - PDFLock: dropzone pattern, file info display, formatSize helper, download pattern
 * - All PDF tools: consistent UI layout, dark mode, error handling, logging
 *
 * @component
 * @returns {React.ReactElement} The PDF Page Numbers tool page
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import PageWrapper from '../../layout/PageWrapper';
import SEO from '../../common/SEO';

// ─── Constants ────────────────────────────────────────────────────────────────

// Position options for page number placement
// Each position is a combination of vertical (top/bottom) and horizontal (left/center/right)
const POSITIONS = [
    { id: 'top-left', label: 'Top Left', short: 'TL' },
    { id: 'top-center', label: 'Top Center', short: 'TC' },
    { id: 'top-right', label: 'Top Right', short: 'TR' },
    { id: 'bottom-left', label: 'Bottom Left', short: 'BL' },
    { id: 'bottom-center', label: 'Bottom Center', short: 'BC' },
    { id: 'bottom-right', label: 'Bottom Right', short: 'BR' },
];

// Format options for page number text
// {n} = current page number, {total} = total page count
const FORMATS = [
    { id: 'number', label: '1', template: '{n}' },
    { id: 'page-n', label: 'Page 1', template: 'Page {n}' },
    { id: 'page-n-of-total', label: 'Page 1 of 5', template: 'Page {n} of {total}' },
    { id: 'n-slash-total', label: '1/5', template: '{n}/{total}' },
    { id: 'dash-n-dash', label: '- 1 -', template: '- {n} -' },
];

// Standard PDF fonts available without embedding custom font files
const FONTS = [
    { id: 'Helvetica', label: 'Helvetica', pdfFont: StandardFonts.Helvetica },
    { id: 'TimesRoman', label: 'Times Roman', pdfFont: StandardFonts.TimesRoman },
    { id: 'Courier', label: 'Courier', pdfFont: StandardFonts.Courier },
];

// Color presets with their RGB values for pdf-lib
const COLORS = [
    { id: 'black', label: 'Black', rgb: [0, 0, 0] },
    { id: 'gray', label: 'Gray', rgb: [0.5, 0.5, 0.5] },
    { id: 'blue', label: 'Blue', rgb: [0, 0, 0.8] },
    { id: 'red', label: 'Red', rgb: [0.8, 0, 0] },
    { id: 'white', label: 'White', rgb: [1, 1, 1] },
];

// Background strip color presets (semi-transparent effect via light shading)
const BG_COLORS = [
    { id: 'light-gray', label: 'Light Gray', rgb: [0.92, 0.92, 0.92] },
    { id: 'light-blue', label: 'Light Blue', rgb: [0.9, 0.93, 1] },
    { id: 'light-yellow', label: 'Light Yellow', rgb: [1, 0.98, 0.9] },
    { id: 'dark', label: 'Dark', rgb: [0.2, 0.2, 0.2] },
];

const PDFPageNumbers = () => {

    // =============================================
    // STATE MANAGEMENT
    // =============================================

    // --- File state ---
    const [pdfFile, setPdfFile] = useState(null);       // The uploaded PDF File object
    const [fileName, setFileName] = useState('');        // Display name of the file
    const [fileSize, setFileSize] = useState(0);         // File size in bytes
    const [pageCount, setPageCount] = useState(0);       // Total number of pages in the PDF

    // --- Numbering options state ---
    const [position, setPosition] = useState('bottom-center');  // Where to place the number
    const [format, setFormat] = useState('page-n-of-total');    // Number format template
    const [customFormat, setCustomFormat] = useState('');        // Custom format string (when format is 'custom')
    const [fontId, setFontId] = useState('Helvetica');          // Font family
    const [fontSize, setFontSize] = useState(12);               // Font size in points
    const [colorId, setColorId] = useState('black');            // Text color
    const [margin, setMargin] = useState(30);                   // Distance from page edge in points
    const [startNumber, setStartNumber] = useState(1);          // Starting page number
    const [skipFirst, setSkipFirst] = useState(false);          // Whether to skip the first page
    const [showBackground, setShowBackground] = useState(false); // Whether to show background strip
    const [bgColorId, setBgColorId] = useState('light-gray');   // Background strip color

    // --- Processing state ---
    const [isProcessing, setIsProcessing] = useState(false); // True while pdf-lib is working
    const [progress, setProgress] = useState('');             // Status message for user feedback

    // --- Result state ---
    const [resultBlob, setResultBlob] = useState(null);  // The numbered PDF as a Blob
    const [resultSize, setResultSize] = useState(0);      // Output file size in bytes

    // --- Error state ---
    const [error, setError] = useState('');  // Error message string

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
        // Determine which unit to use (Bytes, KB, MB, or GB)
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    /**
     * Generates the page number text for a given page using the selected format.
     *
     * @param {number} pageNum - The current page number (1-based, accounting for startNumber)
     * @param {number} totalPages - Total number of pages in the PDF
     * @returns {string} Formatted page number text (e.g., "Page 3 of 10")
     */
    const getPageText = (pageNum, totalPages) => {
        // Find the selected format template
        const selectedFormat = FORMATS.find(f => f.id === format);

        // Use custom format if selected, otherwise use the template from FORMATS
        let template;
        if (format === 'custom' && customFormat.trim()) {
            template = customFormat;
        } else if (selectedFormat) {
            template = selectedFormat.template;
        } else {
            template = '{n}'; // Fallback
        }

        // Replace placeholders with actual values
        return template
            .replace(/\{n\}/g, String(pageNum))
            .replace(/\{total\}/g, String(totalPages));
    };

    /**
     * Computes the x,y coordinates for placing text on a page based on position,
     * margin, text width, and page dimensions.
     *
     * PDF coordinate system: origin (0,0) is at bottom-left corner.
     * x increases to the right, y increases upward.
     *
     * @param {string} pos - Position ID (e.g., 'bottom-center')
     * @param {number} pageWidth - Page width in PDF points
     * @param {number} pageHeight - Page height in PDF points
     * @param {number} textWidth - Measured width of the text string in points
     * @param {number} textHeight - Font size (approximate text height) in points
     * @param {number} mgn - Margin from page edge in points
     * @returns {{x: number, y: number}} Coordinates for drawText
     */
    const computePosition = (pos, pageWidth, pageHeight, textWidth, textHeight, mgn) => {
        let x, y;

        // Vertical position: top or bottom
        if (pos.startsWith('top')) {
            // Top: pageHeight minus margin minus text height (so text sits below the margin line)
            y = pageHeight - mgn - textHeight;
        } else {
            // Bottom: margin from the bottom edge
            y = mgn;
        }

        // Horizontal position: left, center, or right
        if (pos.endsWith('left')) {
            x = mgn;
        } else if (pos.endsWith('center')) {
            // Center: middle of page minus half the text width
            x = (pageWidth - textWidth) / 2;
        } else {
            // Right: page width minus margin minus text width
            x = pageWidth - mgn - textWidth;
        }

        return { x, y };
    };

    // =============================================
    // FILE HANDLING
    // =============================================

    /**
     * Handles file drop/selection. Validates the file is a PDF, reads page count,
     * and stores file info. Resets any previous results.
     *
     * @param {File[]} acceptedFiles - Files from react-dropzone
     */
    const onDrop = useCallback(async (acceptedFiles) => {
        // Clear previous state
        setError('');
        setResultBlob(null);
        setResultSize(0);

        if (acceptedFiles.length === 0) {
            console.log('[PDFPageNumbers] No files dropped');
            return;
        }

        const file = acceptedFiles[0];
        console.log(`[PDFPageNumbers] File selected: ${file.name} (${file.size} bytes)`);

        // Validate file type — only accept PDFs
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setError('Please select a PDF file.');
            console.warn('[PDFPageNumbers] Rejected non-PDF file:', file.type);
            return;
        }

        // Validate file size — limit to 100 MB to prevent browser memory issues
        const maxSize = 100 * 1024 * 1024; // 100 MB
        if (file.size > maxSize) {
            setError('File is too large. Please select a PDF file smaller than 100 MB.');
            console.warn('[PDFPageNumbers] Rejected oversized file:', file.size);
            return;
        }

        // Read the PDF to get page count (for preview and format display)
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const count = pdfDoc.getPageCount();
            console.log(`[PDFPageNumbers] PDF loaded: ${count} pages`);

            // Store file info
            setPdfFile(file);
            setFileName(file.name);
            setFileSize(file.size);
            setPageCount(count);
        } catch (err) {
            console.error('[PDFPageNumbers] Failed to read PDF:', err);
            setError('Failed to read the PDF file. It may be corrupted or encrypted.');
        }
    }, []);

    // Configure react-dropzone — accept only PDFs, single file at a time
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    // =============================================
    // NUMBERING LOGIC
    // =============================================

    /**
     * Main processing function. Loads the PDF with pdf-lib, iterates through pages,
     * and stamps page numbers at the configured position with optional background.
     */
    const handleAddNumbers = async () => {
        // Validate inputs
        if (!pdfFile) {
            setError('Please select a PDF file first.');
            return;
        }

        // Validate custom format has placeholders
        if (format === 'custom' && !customFormat.trim()) {
            setError('Please enter a custom format. Use {n} for page number and {total} for total pages.');
            return;
        }

        console.log(`[PDFPageNumbers] Starting numbering for: ${fileName}`);
        console.log(`[PDFPageNumbers] Options: position=${position}, format=${format}, font=${fontId}, size=${fontSize}, color=${colorId}`);
        setError('');
        setIsProcessing(true);
        setResultBlob(null);
        setResultSize(0);

        try {
            // Step 1: Read the uploaded file
            setProgress('Reading PDF file...');
            const arrayBuffer = await pdfFile.arrayBuffer();
            console.log(`[PDFPageNumbers] File read: ${arrayBuffer.byteLength} bytes`);

            // Step 2: Load PDF with pdf-lib
            setProgress('Loading PDF...');
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            const totalPages = pages.length;
            console.log(`[PDFPageNumbers] PDF loaded: ${totalPages} pages`);

            // Step 3: Embed the selected font
            setProgress('Embedding font...');
            const selectedFont = FONTS.find(f => f.id === fontId);
            const font = await pdfDoc.embedFont(selectedFont ? selectedFont.pdfFont : StandardFonts.Helvetica);
            console.log(`[PDFPageNumbers] Font embedded: ${fontId}`);

            // Step 4: Get the selected text color
            const selectedColor = COLORS.find(c => c.id === colorId);
            const textColor = selectedColor
                ? rgb(selectedColor.rgb[0], selectedColor.rgb[1], selectedColor.rgb[2])
                : rgb(0, 0, 0); // Default to black

            // Step 5: Get background color (if enabled)
            const selectedBgColor = BG_COLORS.find(c => c.id === bgColorId);
            const bgColor = selectedBgColor
                ? rgb(selectedBgColor.rgb[0], selectedBgColor.rgb[1], selectedBgColor.rgb[2])
                : rgb(0.92, 0.92, 0.92); // Default to light gray

            // Step 6: Calculate total pages for numbering
            // If skipFirst is enabled, the total in the format still reflects all numbered pages
            const numberedTotal = skipFirst ? totalPages - 1 : totalPages;

            // Step 7: Iterate through pages and add numbers
            setProgress('Adding page numbers...');
            let currentNumber = startNumber; // Track the running page number

            for (let i = 0; i < totalPages; i++) {
                // Skip the first page if option is enabled
                if (skipFirst && i === 0) {
                    console.log(`[PDFPageNumbers] Skipping page 1 (cover page)`);
                    continue;
                }

                const page = pages[i];
                const { width, height } = page.getSize();

                // Generate the text for this page
                const text = getPageText(currentNumber, numberedTotal);

                // Measure the text width for accurate positioning
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                const textHeight = fontSize; // Approximate height using font size

                // Compute x,y coordinates based on position and margin
                const { x, y } = computePosition(position, width, height, textWidth, textHeight, margin);

                // Draw background strip if enabled
                if (showBackground) {
                    // Add padding around the text for the background rectangle
                    const padX = 6;  // Horizontal padding in points
                    const padY = 3;  // Vertical padding in points

                    page.drawRectangle({
                        x: x - padX,
                        y: y - padY,
                        width: textWidth + (padX * 2),
                        height: textHeight + (padY * 2),
                        color: bgColor,
                    });
                }

                // Draw the page number text
                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: textColor,
                });

                // Increment the running page number
                currentNumber++;
            }

            console.log(`[PDFPageNumbers] Numbers added to ${skipFirst ? totalPages - 1 : totalPages} pages`);

            // Step 8: Save the modified PDF
            setProgress('Saving PDF...');
            const pdfBytes = await pdfDoc.save();
            console.log(`[PDFPageNumbers] Output size: ${pdfBytes.length} bytes`);

            // Step 9: Create a Blob for download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            setResultBlob(blob);
            setResultSize(pdfBytes.length);

            console.log('[PDFPageNumbers] Numbering complete!');
        } catch (err) {
            console.error('[PDFPageNumbers] Numbering failed:', err);
            setError(err.message || 'Failed to add page numbers. Please try again.');
        } finally {
            setIsProcessing(false);
            setProgress('');
        }
    };

    /**
     * Triggers download of the numbered PDF file.
     * Generates a filename like "original_numbered.pdf".
     */
    const handleDownload = () => {
        if (!resultBlob) return;

        // Create download link — same pattern as all other PDF tools
        const url = URL.createObjectURL(resultBlob);
        const link = document.createElement('a');
        link.href = url;
        // Generate filename: "document.pdf" -> "document_numbered.pdf"
        link.download = fileName.replace(/\.pdf$/i, '_numbered.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`[PDFPageNumbers] Download triggered: ${link.download}`);
    };

    /**
     * Resets the tool to its initial state for a new file.
     * Preserves user's numbering preferences (position, format, font, etc.)
     * so they don't have to reconfigure for multiple files.
     */
    const resetTool = () => {
        setPdfFile(null);
        setFileName('');
        setFileSize(0);
        setPageCount(0);
        setIsProcessing(false);
        setProgress('');
        setResultBlob(null);
        setResultSize(0);
        setError('');
        console.log('[PDFPageNumbers] Tool reset (preferences preserved)');
    };

    // =============================================
    // RENDER
    // =============================================

    return (
        <PageWrapper>
            <SEO routeKey="/tools/pdf-page-numbers" />
            <div className="max-w-4xl mx-auto">
                {/* Page title */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    PDF Page Numbers
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Add page numbers to your PDF files. Choose position, format, font, and style. All processing happens in your browser — your files are never uploaded.
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
                        {/* Upload icon — document with hash/number symbol */}
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
                                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                            />
                        </svg>
                        {isDragActive ? (
                            <p className="text-blue-600 dark:text-blue-400 font-medium">
                                Drop your PDF here...
                            </p>
                        ) : (
                            <>
                                <p className="text-gray-600 dark:text-gray-300 font-medium">
                                    Drag & drop a PDF file here to add page numbers
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                    or click to browse (PDF files only, max 100 MB)
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    /* ─── File selected: show file info + options + results ──── */
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
                                        {formatSize(fileSize)} &middot; {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                                    </p>
                                </div>
                            </div>
                            {/* Remove file button */}
                            <button
                                onClick={resetTool}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                title="Remove file"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Error display */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg p-4">
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        {/* ─── Section 2: Numbering Options ───────────────────── */}
                        {!resultBlob && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Numbering Options
                                </h3>

                                {/* ── Position Picker (6-button grid) ──────────────── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Position
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {POSITIONS.map(pos => (
                                            <button
                                                key={pos.id}
                                                onClick={() => setPosition(pos.id)}
                                                disabled={isProcessing}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors
                                                    ${position === pos.id
                                                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }
                                                    disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {pos.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Mini Preview ─────────────────────────────────── */}
                                {/* A small CSS mock showing where the number will appear */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Preview
                                    </label>
                                    <div className="flex justify-center">
                                        <div className="w-32 h-44 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 relative">
                                            {/* Page lines (decorative) */}
                                            <div className="absolute inset-x-3 top-4 space-y-1.5">
                                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                            </div>
                                            {/* Page number indicator dot */}
                                            <div
                                                className={`absolute text-[9px] font-bold text-blue-600 dark:text-blue-400
                                                    ${position.startsWith('top') ? 'top-0.5' : 'bottom-0.5'}
                                                    ${position.endsWith('left') ? 'left-1.5' : ''}
                                                    ${position.endsWith('center') ? 'left-1/2 -translate-x-1/2' : ''}
                                                    ${position.endsWith('right') ? 'right-1.5' : ''}
                                                `}
                                            >
                                                {/* Show a sample page number using current format */}
                                                {getPageText(startNumber, pageCount)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Format & Custom Format ───────────────────────── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Format
                                    </label>
                                    <select
                                        value={format}
                                        onChange={(e) => setFormat(e.target.value)}
                                        disabled={isProcessing}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {FORMATS.map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.label}
                                            </option>
                                        ))}
                                        <option value="custom">Custom format...</option>
                                    </select>

                                    {/* Custom format input — shown only when "Custom" is selected */}
                                    {format === 'custom' && (
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                value={customFormat}
                                                onChange={(e) => setCustomFormat(e.target.value)}
                                                placeholder="e.g., Page {n} of {total}"
                                                disabled={isProcessing}
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                    placeholder-gray-400 dark:placeholder-gray-500
                                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Use <code className="bg-gray-100 dark:bg-gray-600 px-1 rounded">{'{n}'}</code> for page number and <code className="bg-gray-100 dark:bg-gray-600 px-1 rounded">{'{total}'}</code> for total pages
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* ── Font & Size (side by side) ────────────────────── */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Font family */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Font
                                        </label>
                                        <select
                                            value={fontId}
                                            onChange={(e) => setFontId(e.target.value)}
                                            disabled={isProcessing}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                                                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {FONTS.map(f => (
                                                <option key={f.id} value={f.id}>{f.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Font size */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Size ({fontSize}pt)
                                        </label>
                                        <input
                                            type="range"
                                            min="8"
                                            max="24"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(Number(e.target.value))}
                                            disabled={isProcessing}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer
                                                accent-blue-600 dark:accent-blue-400
                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* ── Color & Margin (side by side) ─────────────────── */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Text color */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Color
                                        </label>
                                        <select
                                            value={colorId}
                                            onChange={(e) => setColorId(e.target.value)}
                                            disabled={isProcessing}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                                                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {COLORS.map(c => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Margin */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Margin ({margin}pt)
                                        </label>
                                        <input
                                            type="range"
                                            min="10"
                                            max="100"
                                            value={margin}
                                            onChange={(e) => setMargin(Number(e.target.value))}
                                            disabled={isProcessing}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer
                                                accent-blue-600 dark:accent-blue-400
                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* ── Start Number & Skip First (side by side) ─────── */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Starting page number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Start Number
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="9999"
                                            value={startNumber}
                                            onChange={(e) => setStartNumber(Math.max(0, parseInt(e.target.value) || 0))}
                                            disabled={isProcessing}
                                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                                                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        />
                                    </div>

                                    {/* Skip first page toggle */}
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={skipFirst}
                                                onChange={(e) => setSkipFirst(e.target.checked)}
                                                disabled={isProcessing || pageCount <= 1}
                                                className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700
                                                    border-gray-300 dark:border-gray-600 rounded
                                                    focus:ring-blue-500 focus:ring-2
                                                    disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Skip first page
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* ── Background Strip Toggle & Color ──────────────── */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Background toggle */}
                                    <div className="flex items-center">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={showBackground}
                                                onChange={(e) => setShowBackground(e.target.checked)}
                                                disabled={isProcessing}
                                                className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700
                                                    border-gray-300 dark:border-gray-600 rounded
                                                    focus:ring-blue-500 focus:ring-2
                                                    disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Background strip
                                            </span>
                                        </label>
                                    </div>

                                    {/* Background color — only shown if background is enabled */}
                                    {showBackground && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Strip Color
                                            </label>
                                            <select
                                                value={bgColorId}
                                                onChange={(e) => setBgColorId(e.target.value)}
                                                disabled={isProcessing}
                                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {BG_COLORS.map(c => (
                                                    <option key={c.id} value={c.id}>{c.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* ── Add Numbers Button ───────────────────────────── */}
                                <button
                                    onClick={handleAddNumbers}
                                    disabled={isProcessing}
                                    className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors
                                        ${isProcessing
                                            ? 'bg-blue-400 dark:bg-blue-500/50 opacity-50 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer'
                                        }`}
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center justify-center">
                                            {/* Spinning loader */}
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            {progress || 'Processing...'}
                                        </span>
                                    ) : (
                                        'Add Page Numbers'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* ─── Success: Download Section ──────────────────────── */}
                        {resultBlob && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
                                {/* Success icon — checkmark */}
                                <svg
                                    className="mx-auto h-12 w-12 text-green-500 mb-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">
                                    Page Numbers Added!
                                </h3>
                                <p className="text-green-700 dark:text-green-400 text-sm mb-4">
                                    {skipFirst ? pageCount - 1 : pageCount} pages numbered &middot; Output size: {formatSize(resultSize)}
                                </p>

                                {/* Download + Number another buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={handleDownload}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600
                                            text-white font-medium rounded-lg transition-colors"
                                    >
                                        Download Numbered PDF
                                    </button>
                                    <button
                                        onClick={resetTool}
                                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                                            text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                                    >
                                        Number Another PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Section 3: Instructions ────────────────────────────── */}
                <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 mt-8">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        How to use
                    </h3>
                    <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                        <li>Upload a PDF file (drag & drop or click to browse)</li>
                        <li>Choose where to place page numbers (top/bottom, left/center/right)</li>
                        <li>Select a format, font, size, and color</li>
                        <li>Optionally skip the first page (for cover pages) or add a background strip</li>
                        <li>Click "Add Page Numbers" and download the result</li>
                    </ol>
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

export default PDFPageNumbers;
