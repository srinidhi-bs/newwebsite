/**
 * PDF Resizer Component
 *
 * Compresses PDF files to a user-specified target file size.
 *
 * How it works:
 * 1. User uploads a PDF and enters a target file size (in KB or MB)
 * 2. Each page is rendered to a canvas using pdfjs-dist, then converted to a JPEG image
 * 3. A new PDF is built from those JPEG images using pdf-lib
 * 4. The algorithm iteratively adjusts JPEG quality and render scale to hit the target size
 * 5. The compressed PDF is offered for download
 *
 * Trade-off: Text in the output PDF is NOT selectable (pages become images).
 * This is intentional — it allows reliable file size control.
 *
 * Pattern references:
 * - ImageResizer: iterative compression loop, target size UI, formatSize helper
 * - PDFToJPG: pdfjs-dist page rendering to canvas
 * - JPGToPDF: pdf-lib PDF creation from JPEG images
 *
 * @component
 * @returns {React.ReactElement} The PDF Resizer tool page
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import { PDFDocument } from 'pdf-lib';
import PageWrapper from '../../layout/PageWrapper';

// Configure the PDF.js web worker for rendering PDF pages
// This must match the path where the worker file is served from
// Using process.env.PUBLIC_URL for compatibility when deployed to a sub-path
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/static/js/pdf.worker.min.js`;

const PDFResizer = () => {
    // =============================================
    // STATE MANAGEMENT
    // =============================================

    // --- File state ---
    const [pdfFile, setPdfFile] = useState(null);       // The uploaded PDF File object
    const [pageCount, setPageCount] = useState(0);      // Number of pages in the PDF
    const [originalSize, setOriginalSize] = useState(0); // Original file size in bytes

    // --- Target size settings ---
    const [targetSize, setTargetSize] = useState('');    // User-entered target value (string for input field)
    const [targetUnit, setTargetUnit] = useState('KB');  // 'KB' or 'MB' unit selector

    // --- Processing state ---
    const [isProcessing, setIsProcessing] = useState(false); // True while compression is running
    const [progress, setProgress] = useState('');             // Status message (e.g., "Attempt 2/8 — Current: 2.8 MB")

    // --- Result state ---
    const [resizedPdfBlob, setResizedPdfBlob] = useState(null); // The final compressed PDF as a Blob
    const [resizedSize, setResizedSize] = useState(0);           // Final file size in bytes

    // --- Error state ---
    const [error, setError] = useState(''); // Error message string, shown in red alert box

    // =============================================
    // HELPER FUNCTIONS
    // =============================================

    /**
     * Formats a byte count into a human-readable string (e.g., "1.5 MB")
     * Copied from ImageResizer for consistency across tools
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
     * Renders a single PDF page to a JPEG blob using pdfjs-dist.
     *
     * The process:
     * 1. Get the page from the PDF document
     * 2. Create a canvas at the desired scale (smaller scale = smaller image = smaller file)
     * 3. Render the PDF page onto the canvas
     * 4. Convert the canvas to a JPEG blob at the desired quality (lower quality = smaller file)
     *
     * Also captures the ORIGINAL page dimensions (at scale 1.0) so the output PDF
     * can maintain the same physical page size regardless of render scale.
     *
     * @param {Object} pdfDoc - The loaded pdfjs-dist document
     * @param {number} pageNumber - 1-based page number to render
     * @param {number} scale - Render scale (1.0 = original resolution, 0.5 = half)
     * @param {number} quality - JPEG quality (0.0 to 1.0, where 1.0 is best quality)
     * @returns {Promise<{blob: Blob, originalWidth: number, originalHeight: number}>}
     */
    const renderPageToJpegBlob = async (pdfDoc, pageNumber, scale, quality) => {
        // Get the specific page from the PDF
        const page = await pdfDoc.getPage(pageNumber);

        // Get ORIGINAL dimensions (at scale 1.0) — used for output PDF page sizing
        // This ensures the output PDF has the same physical page size as the input
        const originalViewport = page.getViewport({ scale: 1.0 });

        // Get SCALED viewport — this determines the canvas (image) resolution
        // Lower scale = fewer pixels = smaller JPEG file size
        const viewport = page.getViewport({ scale });

        // Create an offscreen canvas to render the PDF page onto
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the PDF page onto the canvas
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Convert the canvas content to a JPEG blob
        // The quality parameter controls JPEG compression (0.0 = max compression, 1.0 = no compression)
        const blob = await new Promise(resolve =>
            canvas.toBlob(resolve, 'image/jpeg', quality)
        );

        // Clean up the canvas to free memory (important for multi-page PDFs)
        canvas.width = 0;
        canvas.height = 0;

        return {
            blob,
            originalWidth: originalViewport.width,
            originalHeight: originalViewport.height
        };
    };

    /**
     * Creates a new PDF from an array of JPEG blobs using pdf-lib.
     * Each JPEG becomes one page in the output PDF.
     *
     * The page dimensions are set to the ORIGINAL page sizes (not the rendered size),
     * so the output PDF has the same physical dimensions as the input.
     * The JPEG image is stretched to fill the page — since it was rendered from
     * the same page, the visual result looks correct even if the image resolution is lower.
     *
     * Pattern derived from JPGToPDF component.
     *
     * @param {Array<{blob: Blob, originalWidth: number, originalHeight: number}>} pages
     * @returns {Promise<Uint8Array>} The PDF file bytes
     */
    const buildPdfFromJpegBlobs = async (pages) => {
        // Create a brand new empty PDF document
        const pdfDoc = await PDFDocument.create();

        for (const pageData of pages) {
            // Convert the JPEG blob to an ArrayBuffer (required by pdf-lib)
            const imageBytes = await pageData.blob.arrayBuffer();

            // Embed the JPEG image into the PDF document
            const jpgImage = await pdfDoc.embedJpg(imageBytes);

            // Add a new page with the ORIGINAL dimensions (in PDF points)
            // This preserves the physical page size of the input PDF
            const page = pdfDoc.addPage([pageData.originalWidth, pageData.originalHeight]);

            // Draw the image to fill the entire page
            page.drawImage(jpgImage, {
                x: 0,
                y: 0,
                width: pageData.originalWidth,
                height: pageData.originalHeight,
            });
        }

        // Save the PDF and return the raw bytes
        return await pdfDoc.save();
    };

    // =============================================
    // FILE UPLOAD HANDLER
    // =============================================

    /**
     * Handles file drop/selection via react-dropzone.
     * Validates the file, loads it with pdfjs-dist to get page count,
     * and updates state for display.
     *
     * Pattern: same as PDFToJPG and PDFSplitter components
     */
    const onDrop = useCallback(async (acceptedFiles) => {
        // Clear any previous state
        setError('');
        setResizedPdfBlob(null);
        setResizedSize(0);
        setProgress('');

        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        // Validate file type
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }

        try {
            // Load the PDF to validate it and get page count
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

            console.log(`PDF loaded: ${file.name}, ${pdf.numPages} pages, ${file.size} bytes`);

            // Update state with file info
            setPdfFile(file);
            setPageCount(pdf.numPages);
            setOriginalSize(file.size);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Error loading PDF file: ' + err.message);
        }
    }, []);

    // Configure react-dropzone: accept only PDFs, single file only
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    // =============================================
    // CORE COMPRESSION ALGORITHM
    // =============================================

    /**
     * Main compression function — the heart of the PDF Resizer.
     *
     * Algorithm overview (quality-first strategy):
     * 1. ALWAYS start at full resolution (scale 1.0) to keep text sharp
     * 2. Only adjust JPEG quality to hit the target size (quality has less visual impact)
     * 3. Scale is reduced ONLY as an absolute last resort when quality alone can't reach the target
     * 4. Uses dampening factor (0.5) to prevent overshooting
     * 5. Tracks the best result across all attempts
     * 6. Maximum 10 attempts to allow more fine-tuning
     *
     * Why quality-first? Reducing resolution (scale) makes text blurry and unreadable.
     * Reducing JPEG quality preserves sharpness — you get artifacts but text stays legible.
     *
     * Inspired by ImageResizer's iterative compression approach.
     */
    const processPdf = async () => {
        // --- Validation ---
        if (!pdfFile || !targetSize) {
            setError('Please upload a PDF and specify a target size.');
            return;
        }

        const targetSizeNum = parseFloat(targetSize);
        if (isNaN(targetSizeNum) || targetSizeNum <= 0) {
            setError('Please enter a valid target size greater than 0.');
            return;
        }

        // Reset state for new processing run
        setIsProcessing(true);
        setError('');
        setResizedPdfBlob(null);
        setResizedSize(0);

        try {
            // Convert user's target to bytes
            // e.g., 500 KB = 500 * 1024 = 512,000 bytes
            const targetSizeBytes = targetSizeNum * (targetUnit === 'MB' ? 1024 * 1024 : 1024);

            // Tolerance: ±5% of target
            // Wider than ImageResizer's 1% because multi-page PDF compression
            // is less predictable — each page's JPEG compresses differently
            const tolerance = 0.05;
            const minTarget = targetSizeBytes * (1 - tolerance);
            const maxTarget = targetSizeBytes * (1 + tolerance);

            // Warn if target is larger than original (still allow it)
            if (targetSizeBytes >= originalSize) {
                setError('Target size is larger than the original. The file will be converted but may not shrink.');
            }

            // Load the PDF with pdfjs-dist for rendering pages
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

            console.log(`Starting compression: target=${formatSize(targetSizeBytes)}, original=${formatSize(originalSize)}`);

            // --- Initial parameter estimation ---
            // ALWAYS start at full resolution (scale 1.0) to keep text sharp and readable
            // We only reduce quality first — scale is a last resort
            let currentScale = 1.0;

            // Estimate initial JPEG quality from the size ratio
            // If target is much smaller than original, start with lower quality
            // If target is close to original, start with high quality
            const sizeRatio = targetSizeBytes / originalSize;
            let currentQuality;
            if (sizeRatio >= 0.8) {
                currentQuality = 0.85;  // Target is close to original — start high
            } else if (sizeRatio >= 0.4) {
                currentQuality = 0.6;   // Moderate compression needed
            } else if (sizeRatio >= 0.2) {
                currentQuality = 0.35;  // Significant compression needed
            } else {
                currentQuality = 0.15;  // Extreme compression — quality will be low
            }

            console.log(`Initial parameters: quality=${currentQuality.toFixed(2)}, scale=${currentScale.toFixed(2)}, sizeRatio=${sizeRatio.toFixed(2)}`);

            const maxAttempts = 10;  // More attempts for finer quality tuning
            let bestPdfBytes = null; // Best result found so far
            let bestDiff = Infinity; // How close the best result is to the target

            // --- Iterative compression loop ---
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                // Update progress for user feedback
                setProgress(`Attempt ${attempt + 1}/${maxAttempts} — Rendering ${pageCount} pages...`);

                console.log(`Attempt ${attempt + 1}: quality=${currentQuality.toFixed(3)}, scale=${currentScale.toFixed(3)}`);

                // Step 1: Render ALL pages to JPEG at current quality and scale
                const pageDataArray = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const pageData = await renderPageToJpegBlob(pdf, i, currentScale, currentQuality);
                    pageDataArray.push(pageData);
                }

                // Step 2: Build a new PDF from the JPEG images
                const pdfBytes = await buildPdfFromJpegBlobs(pageDataArray);

                const currentSize = pdfBytes.length;
                const diff = Math.abs(currentSize - targetSizeBytes);

                // Update progress with current size info
                setProgress(
                    `Attempt ${attempt + 1}/${maxAttempts} — Current: ${formatSize(currentSize)} (target: ${formatSize(targetSizeBytes)})`
                );

                console.log(`Attempt ${attempt + 1} result: ${formatSize(currentSize)} (diff: ${formatSize(diff)})`);

                // Step 3: Track the best result across all attempts
                // (In case we never hit the exact target, we use the closest result)
                if (diff < bestDiff) {
                    bestDiff = diff;
                    bestPdfBytes = pdfBytes;
                }

                // Step 4: Check if we're within the tolerance range — if so, we're done!
                if (currentSize >= minTarget && currentSize <= maxTarget) {
                    console.log(`Target reached on attempt ${attempt + 1}!`);
                    break;
                }

                // Step 5: Adjust parameters for the next iteration
                // We use a dampening factor to prevent oscillation
                // (Without dampening, adjustments can overshoot back and forth)
                const ratio = targetSizeBytes / currentSize;
                const dampening = 0.5;

                if (currentSize > maxTarget) {
                    // --- File is TOO LARGE: need to reduce size ---
                    // Strategy: exhaust quality reduction FIRST (down to 0.05)
                    // Only touch scale as an absolute last resort — scale reduction makes text blurry
                    if (currentQuality > 0.05) {
                        // Reduce JPEG quality with dampening
                        const qualityAdjustment = 1 + (ratio - 1) * dampening;
                        currentQuality = Math.max(0.05, currentQuality * qualityAdjustment);
                        console.log(`  -> Reducing quality to ${currentQuality.toFixed(3)}`);
                    } else {
                        // Quality is at rock bottom — reluctantly reduce scale
                        // Use a high minimum (0.5) to keep text somewhat readable
                        const scaleAdjustment = 1 + (Math.sqrt(ratio) - 1) * dampening;
                        currentScale = Math.max(0.5, currentScale * scaleAdjustment);
                        console.log(`  -> Quality exhausted, reducing scale to ${currentScale.toFixed(3)}`);
                    }
                } else {
                    // --- File is TOO SMALL: need to increase size ---
                    // Strategy: increase quality first, then scale
                    if (currentQuality < 0.95) {
                        const qualityAdjustment = 1 + (ratio - 1) * dampening;
                        currentQuality = Math.min(1.0, currentQuality * qualityAdjustment);
                        console.log(`  -> Increasing quality to ${currentQuality.toFixed(3)}`);
                    } else {
                        // Quality already maxed — increase render scale
                        const scaleAdjustment = 1 + (Math.sqrt(ratio) - 1) * dampening;
                        currentScale = Math.min(2.0, currentScale * scaleAdjustment);
                        console.log(`  -> Quality maxed, increasing scale to ${currentScale.toFixed(3)}`);
                    }
                }
            }

            // --- Use the best result we found across all attempts ---
            if (bestPdfBytes) {
                const blob = new Blob([bestPdfBytes], { type: 'application/pdf' });
                setResizedPdfBlob(blob);
                setResizedSize(bestPdfBytes.length);
                setProgress('');
                console.log(`Compression complete: ${formatSize(bestPdfBytes.length)}`);
            } else {
                setError('Could not compress the PDF to the target size.');
            }

        } catch (err) {
            console.error('PDF resize error:', err);
            setError('An error occurred while processing the PDF: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // =============================================
    // DOWNLOAD HANDLER
    // =============================================

    /**
     * Downloads the compressed PDF file.
     * Creates a temporary <a> element, triggers the download, then cleans up.
     * Same pattern used across all tools (ImageResizer, PDFMerger, etc.)
     */
    const handleDownload = () => {
        if (resizedPdfBlob) {
            const url = URL.createObjectURL(resizedPdfBlob);
            const link = document.createElement('a');
            link.href = url;
            // Add _resized suffix to the original filename
            link.download = pdfFile.name.replace('.pdf', '_resized.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // Clean up the blob URL to free memory
            URL.revokeObjectURL(url);
        }
    };

    // =============================================
    // RENDER
    // =============================================

    return (
        <PageWrapper>
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">PDF Resizer</h2>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    {/* === SECTION 1: File Upload Area (react-dropzone) === */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select PDF
                        </label>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                                ${isDragActive
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600'}
                                hover:border-blue-500 dark:hover:border-blue-400`}
                        >
                            <input {...getInputProps()} />
                            {pdfFile ? (
                                // Show file info after upload
                                <div className="flex flex-col items-center">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                        {pdfFile.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {pageCount} pages — Original Size: {formatSize(originalSize)}
                                    </p>
                                </div>
                            ) : (
                                // Show upload prompt before any file is selected
                                <div>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {isDragActive
                                            ? 'Drop your PDF file here'
                                            : 'Drag & drop your PDF file here, or click to select'}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                        PDF files only
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* === SECTION 2: Settings + Result (shown only after file upload) === */}
                    {pdfFile && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* --- Left Column: Settings --- */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Settings</h3>

                                {/* Target File Size input (same structure as ImageResizer) */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Target File Size
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="number"
                                            value={targetSize}
                                            onChange={(e) => setTargetSize(e.target.value)}
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="e.g. 500"
                                        />
                                        <select
                                            value={targetUnit}
                                            onChange={(e) => setTargetUnit(e.target.value)}
                                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 sm:text-sm"
                                        >
                                            <option value="KB">KB</option>
                                            <option value="MB">MB</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Resize button — disabled during processing or if no target set */}
                                <button
                                    onClick={processPdf}
                                    disabled={isProcessing || !targetSize}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(isProcessing || !targetSize) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isProcessing ? 'Processing...' : 'Resize PDF'}
                                </button>

                                {/* Progress indicator — shows during compression iterations */}
                                {isProcessing && progress && (
                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm">
                                        {progress}
                                    </div>
                                )}

                                {/* Error display — same pattern as ImageResizer */}
                                {error && (
                                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* --- Right Column: Result --- */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Result</h3>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] bg-gray-50 dark:bg-gray-900/50">
                                    {resizedPdfBlob ? (
                                        // Show result after successful compression
                                        <div className="text-center w-full">
                                            {/* Green checkmark document icon */}
                                            <svg className="mx-auto h-16 w-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                New Size: {formatSize(resizedSize)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                Reduced by {Math.round((1 - resizedSize / originalSize) * 100)}%
                                            </p>
                                            {/* Download button — same style as ImageResizer */}
                                            <button
                                                onClick={handleDownload}
                                                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download Resized PDF
                                            </button>
                                        </div>
                                    ) : (
                                        // Placeholder before processing
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Compressed PDF will appear here
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* === SECTION 3: Instructions === */}
                <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Instructions</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                        <li>Upload a PDF file by dragging and dropping or clicking the upload area</li>
                        <li>Enter your desired target file size in KB or MB</li>
                        <li>Click "Resize PDF" to compress the file</li>
                        <li>The tool will iteratively adjust image quality to reach your target size</li>
                        <li>Important: Text in the resized PDF will not be selectable (pages become images)</li>
                        <li>Download the resized PDF when processing completes</li>
                    </ul>
                </div>
            </div>
        </PageWrapper>
    );
};

export default PDFResizer;
