/**
 * PDF Lock Component
 *
 * Adds password protection to PDF files entirely client-side.
 *
 * How it works:
 * 1. User uploads an unprotected PDF
 * 2. User enters a password (and confirms it)
 * 3. The qpdf WASM module encrypts the PDF with AES-256 encryption
 * 4. The encrypted (locked) PDF is offered for download
 *
 * All processing happens in the browser — no files are uploaded to any server.
 * Uses @neslinesli93/qpdf-wasm (QPDF v12.2.0 compiled to WebAssembly via Emscripten).
 * Content is fully preserved: text, images, fonts, vectors remain intact.
 *
 * qpdf encryption command used:
 * qpdf --encrypt <user-password> <owner-password> 256 -- input.pdf output.pdf
 *
 * Pattern references:
 * - PDFUnlock: dropzone pattern, WASM loading, file info display, formatSize helper
 *
 * @component
 * @returns {React.ReactElement} The PDF Lock tool page
 */

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import createQpdfModule from '@neslinesli93/qpdf-wasm';
import PageWrapper from '../../layout/PageWrapper';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

// ─── Module-level cache ──────────────────────────────────────────────────────
// The WASM module (~1.3 MB) is loaded lazily on first use and cached here
// so subsequent locks don't re-download it.
let qpdfModuleCache = null;

const PDFLock = () => {
    useDocumentTitle('PDF Lock');

    // =============================================
    // STATE MANAGEMENT
    // =============================================

    // --- File state ---
    const [pdfFile, setPdfFile] = useState(null);       // The uploaded PDF File object
    const [fileName, setFileName] = useState('');        // Display name of the file
    const [fileSize, setFileSize] = useState(0);         // File size in bytes

    // --- Password state ---
    const [password, setPassword] = useState('');            // User-entered password
    const [confirmPassword, setConfirmPassword] = useState(''); // Confirm password to prevent typos
    const [showPassword, setShowPassword] = useState(false);    // Toggle password visibility

    // --- Processing state ---
    const [isProcessing, setIsProcessing] = useState(false); // True while WASM is working
    const [progress, setProgress] = useState('');             // Status message for user feedback

    // --- Result state ---
    const [lockedBlob, setLockedBlob] = useState(null);  // The encrypted PDF as a Blob
    const [lockedSize, setLockedSize] = useState(0);      // Encrypted file size in bytes

    // --- Error state ---
    const [error, setError] = useState('');  // Error message string

    // --- Ref for password input focus ---
    const passwordInputRef = useRef(null);

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
     * Lazily loads the qpdf WASM module. The module is cached after first load
     * so subsequent calls return immediately.
     *
     * @returns {Promise<Object>} The initialized qpdf WASM instance with FS and callMain
     */
    const loadQpdfModule = async () => {
        // Return cached module if already loaded
        if (qpdfModuleCache) {
            console.log('[PDFLock] Using cached WASM module');
            return qpdfModuleCache;
        }

        console.log('[PDFLock] Loading qpdf WASM module...');
        setProgress('Loading PDF library...');

        // Initialize the WASM module.
        // locateFile tells Emscripten where to fetch the .wasm binary from.
        // The file is copied to static/js/qpdf.wasm by craco.config.js at build time.
        const qpdf = await createQpdfModule({
            locateFile: (file) => {
                if (file.endsWith('.wasm')) {
                    return `${process.env.PUBLIC_URL}/static/js/qpdf.wasm`;
                }
                return file;
            },
        });

        // Cache the module for reuse
        qpdfModuleCache = qpdf;
        console.log('[PDFLock] WASM module loaded successfully');
        return qpdf;
    };

    // =============================================
    // FILE HANDLING
    // =============================================

    /**
     * Handles file drop/selection. Validates the file is a PDF and stores it.
     * Resets any previous results and focuses the password input.
     *
     * @param {File[]} acceptedFiles - Files from react-dropzone
     */
    const onDrop = useCallback((acceptedFiles) => {
        // Clear previous state
        setError('');
        setLockedBlob(null);
        setLockedSize(0);
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);

        if (acceptedFiles.length === 0) {
            console.log('[PDFLock] No files dropped');
            return;
        }

        const file = acceptedFiles[0];
        console.log(`[PDFLock] File selected: ${file.name} (${formatSize(file.size)})`);

        // Validate file type — only accept PDFs
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setError('Please select a PDF file.');
            console.warn('[PDFLock] Rejected non-PDF file:', file.type);
            return;
        }

        // Validate file size — limit to 100 MB to prevent browser memory issues
        const maxSize = 100 * 1024 * 1024; // 100 MB
        if (file.size > maxSize) {
            setError('File is too large. Please select a PDF file smaller than 100 MB.');
            console.warn('[PDFLock] Rejected oversized file:', formatSize(file.size));
            return;
        }

        // Store file info
        setPdfFile(file);
        setFileName(file.name);
        setFileSize(file.size);

        // Focus the password input after a short delay (to allow state update + render)
        setTimeout(() => {
            if (passwordInputRef.current) {
                passwordInputRef.current.focus();
            }
        }, 100);
    }, []);

    // Configure react-dropzone — accept only PDFs, single file at a time
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    // =============================================
    // LOCK LOGIC
    // =============================================

    /**
     * Main lock function. Loads the WASM module (if needed), writes the PDF
     * to Emscripten's virtual filesystem, runs qpdf --encrypt, and reads the output.
     */
    const handleLock = async () => {
        // Validate inputs
        if (!pdfFile) {
            setError('Please select a PDF file first.');
            return;
        }
        if (!password.trim()) {
            setError('Please enter a password.');
            return;
        }
        // Validate password confirmation
        if (password !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

        console.log(`[PDFLock] Starting lock for: ${fileName}`);
        setError('');
        setIsProcessing(true);
        setLockedBlob(null);
        setLockedSize(0);

        try {
            // Step 1: Load the WASM module (lazy, cached after first load)
            const qpdf = await loadQpdfModule();

            // Step 2: Read the uploaded file into a Uint8Array
            setProgress('Reading PDF file...');
            const arrayBuffer = await pdfFile.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            console.log(`[PDFLock] File read: ${uint8Array.length} bytes`);

            // Step 3: Write the PDF to Emscripten's virtual filesystem
            setProgress('Preparing file...');
            qpdf.FS.writeFile('/input.pdf', uint8Array);

            // Step 4: Run qpdf encrypt command
            // qpdf --encrypt <user-password> <owner-password> <key-length> -- input.pdf output.pdf
            // Using the same password for both user and owner password.
            // 256 = AES-256 encryption (strongest available).
            setProgress('Encrypting PDF...');
            console.log('[PDFLock] Running qpdf --encrypt (AES-256)...');
            try {
                qpdf.callMain([
                    '--encrypt',
                    password,       // user-password (required to open)
                    password,       // owner-password (required to change permissions)
                    '256',          // key-length: AES-256
                    '--',
                    '/input.pdf',
                    '/output.pdf'
                ]);
            } catch (qpdfError) {
                // callMain throws on failure (corrupt file, already encrypted, etc.)
                console.error('[PDFLock] qpdf error:', qpdfError);
                // Clean up the input file from virtual filesystem
                try { qpdf.FS.unlink('/input.pdf'); } catch (e) { /* ignore cleanup errors */ }
                throw new Error('Failed to encrypt the PDF. The file may be corrupted or already encrypted.');
            }

            // Step 5: Read the encrypted output from virtual filesystem
            setProgress('Preparing download...');
            const encryptedBytes = qpdf.FS.readFile('/output.pdf');
            console.log(`[PDFLock] Encrypted output: ${encryptedBytes.length} bytes`);

            // Step 6: Create a Blob for download
            const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
            setLockedBlob(blob);
            setLockedSize(encryptedBytes.length);

            // Step 7: Clean up virtual filesystem
            try {
                qpdf.FS.unlink('/input.pdf');
                qpdf.FS.unlink('/output.pdf');
            } catch (e) {
                console.warn('[PDFLock] Cleanup warning:', e);
            }

            console.log('[PDFLock] Lock successful!');
        } catch (err) {
            console.error('[PDFLock] Lock failed:', err);
            setError(err.message || 'Failed to lock PDF. Please try again.');
        } finally {
            setIsProcessing(false);
            setProgress('');
        }
    };

    /**
     * Triggers download of the locked PDF file.
     * Generates a filename like "original_locked.pdf".
     */
    const handleDownload = () => {
        if (!lockedBlob) return;

        // Create download link — same pattern as all other PDF tools
        const url = URL.createObjectURL(lockedBlob);
        const link = document.createElement('a');
        link.href = url;
        // Generate filename: "document.pdf" -> "document_locked.pdf"
        link.download = fileName.replace(/\.pdf$/i, '_locked.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`[PDFLock] Download triggered: ${link.download}`);
    };

    /**
     * Resets the tool to its initial state for a new file.
     */
    const resetTool = () => {
        setPdfFile(null);
        setFileName('');
        setFileSize(0);
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setIsProcessing(false);
        setProgress('');
        setLockedBlob(null);
        setLockedSize(0);
        setError('');
        console.log('[PDFLock] Tool reset');
    };

    /**
     * Handles Enter key press in the password inputs to trigger lock.
     * Only triggers if passwords match and are non-empty.
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isProcessing && password.trim() && password === confirmPassword) {
            handleLock();
        }
    };

    // =============================================
    // RENDER
    // =============================================

    return (
        <PageWrapper>
            <div className="max-w-4xl mx-auto">
                {/* Page title */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    PDF Lock
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Add password protection to PDF files. All processing happens in your browser — your files are never uploaded.
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
                        {/* Upload icon — closed lock SVG to indicate password protection */}
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
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        {isDragActive ? (
                            <p className="text-blue-600 dark:text-blue-400 font-medium">
                                Drop your PDF here...
                            </p>
                        ) : (
                            <>
                                <p className="text-gray-600 dark:text-gray-300 font-medium">
                                    Drag & drop a PDF file here to password-protect it
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                    or click to browse (PDF files only, max 100 MB)
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    /* ─── File selected: show file info + password + results ──── */
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
                                        {formatSize(fileSize)}
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

                        {/* ─── Section 2: Password Input + Lock Button ─────────── */}
                        {!lockedBlob && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                {/* Password field */}
                                <label
                                    htmlFor="pdf-password"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Set Password
                                </label>
                                {/* Password input with show/hide toggle */}
                                <div className="relative">
                                    <input
                                        ref={passwordInputRef}
                                        id="pdf-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter a password for the PDF"
                                        disabled={isProcessing}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg
                                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                            placeholder-gray-400 dark:placeholder-gray-500
                                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            transition-colors"
                                    />
                                    {/* Show/hide password toggle button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                                            dark:hover:text-gray-200 transition-colors"
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            // Eye-slash icon (password visible — click to hide)
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            // Eye icon (password hidden — click to show)
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Confirm Password field */}
                                <label
                                    htmlFor="pdf-password-confirm"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="pdf-password-confirm"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Re-enter the password"
                                    disabled={isProcessing}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                        placeholder-gray-400 dark:placeholder-gray-500
                                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-colors"
                                />

                                {/* Inline password mismatch warning */}
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                                        Passwords do not match
                                    </p>
                                )}

                                {/* Lock button */}
                                <button
                                    onClick={handleLock}
                                    disabled={isProcessing || !password.trim() || password !== confirmPassword}
                                    className={`mt-4 w-full py-3 px-6 rounded-lg font-medium text-white transition-colors
                                        ${isProcessing || !password.trim() || password !== confirmPassword
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
                                        'Lock PDF'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* ─── Success: Download Section ──────────────────────── */}
                        {lockedBlob && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
                                {/* Success icon — closed padlock (locked) */}
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
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">
                                    PDF Locked Successfully!
                                </h3>
                                <p className="text-green-700 dark:text-green-400 text-sm mb-4">
                                    Output size: {formatSize(lockedSize)}
                                </p>

                                {/* Download + Lock another buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={handleDownload}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600
                                            text-white font-medium rounded-lg transition-colors"
                                    >
                                        Download Locked PDF
                                    </button>
                                    <button
                                        onClick={resetTool}
                                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                                            text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                                    >
                                        Lock Another PDF
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
                        <li>Enter a password and confirm it</li>
                        <li>Click "Lock PDF" to add password protection</li>
                        <li>Download the locked PDF — it will require the password to open</li>
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

export default PDFLock;
