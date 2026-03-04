/**
 * PDF Rearrange Component
 *
 * Lets users reorder, remove, rotate, and rearrange pages in a PDF file.
 * Supports two modes:
 *
 * 1. Visual Mode (default for ≤100 pages):
 *    - Drag-and-drop page thumbnails using @dnd-kit
 *    - Click to select, Shift+click for range selection
 *    - Delete individual or selected pages
 *    - Rotate pages 90° clockwise (per-page or bulk via selection)
 *    - Lazy thumbnail loading via IntersectionObserver
 *
 * 2. Manual Input Mode (default for >100 pages):
 *    - Type page order using a simple syntax (e.g., "1-10, 25, 12-20")
 *    - Supports forward ranges (1-50), reverse ranges (50-1), and individual pages
 *    - Live validation and result count
 *
 * All processing happens in the browser — no files are uploaded to any server.
 * Uses pdf-lib for PDF manipulation and pdfjs-dist for page thumbnails.
 *
 * Pattern references:
 * - PDFLock: dropzone pattern, file info display, formatSize helper, layout
 * - PDFMerger: @dnd-kit drag-and-drop, SortablePagePreview, thumbnailCache
 *
 * @component
 * @returns {React.ReactElement} The PDF Rearrange tool page
 */

import React, { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PageWrapper from '../../layout/PageWrapper';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

// ─── Configure PDF.js worker ────────────────────────────────────────────────
// The worker file is copied to this path by craco.config.js at build time.
// It runs PDF parsing in a Web Worker thread to keep the UI responsive.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/js/pdf.worker.min.js';


// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Formats a byte count into a human-readable string (e.g., "1.5 MB").
 * Same helper used across all PDF/image tools for consistency.
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string (e.g., "512 KB", "2.3 MB")
 */
const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    // Determine which unit to use based on magnitude
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Parses user input string into an array of 1-based page numbers.
 * Supports:
 *   - Single pages: "5" or "3, 7, 1"
 *   - Forward ranges: "1-10" → [1, 2, 3, ..., 10]
 *   - Reverse ranges: "10-1" → [10, 9, 8, ..., 1]
 *   - Mixed: "1-5, 10, 8-6" → [1, 2, 3, 4, 5, 10, 8, 7, 6]
 *
 * @param {string} input - The user's page order string
 * @param {number} totalPageCount - Total pages in the PDF (for validation)
 * @returns {{ pages: number[], error: string|null }} Parsed pages or error message
 */
const parsePageInput = (input, totalPageCount) => {
    // Handle empty input
    if (!input.trim()) {
        return { pages: [], error: null };
    }

    const result = [];

    // Split by comma to get individual tokens
    const tokens = input.split(',');

    for (let t = 0; t < tokens.length; t++) {
        const token = tokens[t].trim();

        // Skip empty tokens (handles trailing commas, double commas, etc.)
        if (!token) continue;

        // Check if token is a range (e.g., "1-10" or "10-1")
        const rangeMatch = token.match(/^(\d+)\s*-\s*(\d+)$/);

        if (rangeMatch) {
            // ─── Range token ───
            const start = parseInt(rangeMatch[1], 10);
            const end = parseInt(rangeMatch[2], 10);

            // Validate both endpoints are within bounds
            if (start < 1 || start > totalPageCount) {
                return { pages: [], error: `Page ${start} is out of range (1-${totalPageCount})` };
            }
            if (end < 1 || end > totalPageCount) {
                return { pages: [], error: `Page ${end} is out of range (1-${totalPageCount})` };
            }

            // Generate the range (forward or reverse)
            if (start <= end) {
                // Forward range: 1-5 → [1, 2, 3, 4, 5]
                for (let i = start; i <= end; i++) {
                    result.push(i);
                }
            } else {
                // Reverse range: 5-1 → [5, 4, 3, 2, 1]
                for (let i = start; i >= end; i--) {
                    result.push(i);
                }
            }
        } else if (/^\d+$/.test(token)) {
            // ─── Single page number ───
            const num = parseInt(token, 10);

            // Validate within bounds
            if (num < 1 || num > totalPageCount) {
                return { pages: [], error: `Page ${num} is out of range (1-${totalPageCount})` };
            }

            result.push(num);
        } else {
            // ─── Invalid syntax ───
            return { pages: [], error: `Invalid syntax near: "${token}"` };
        }
    }

    // Check if we got any pages
    if (result.length === 0) {
        return { pages: [], error: 'No pages specified' };
    }

    return { pages: result, error: null };
};


// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * PageThumbnail — Renders a single page thumbnail in the visual mode grid.
 *
 * Shows either:
 * - A real thumbnail image (if loaded and visible)
 * - A grey placeholder with page number (if not yet loaded)
 * - A loading spinner (if currently generating)
 *
 * @param {Object} props
 * @param {string} props.id - Unique sortable ID for this page
 * @param {number} props.pageNum - The original page number (1-based)
 * @param {number} props.position - Current position in the reordered list (1-based)
 * @param {string|null} props.thumbnailUrl - Data URL of the thumbnail, or null if not loaded
 * @param {boolean} props.isSelected - Whether this page is currently selected
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @param {Function} props.onClick - Callback when the thumbnail is clicked (for selection)
 * @param {Function} props.onThumbnailNeeded - Callback to request thumbnail generation
 */
const PageThumbnail = memo(({ id, pageNum, position, thumbnailUrl, isSelected, rotation, onDelete, onRotate, onClick, onThumbnailNeeded }) => {
    // Ref for IntersectionObserver to track visibility
    const cellRef = useRef(null);
    // Ref to always hold the latest onThumbnailNeeded callback,
    // so the IntersectionObserver closure doesn't go stale
    const onThumbnailNeededRef = useRef(onThumbnailNeeded);
    onThumbnailNeededRef.current = onThumbnailNeeded;

    // Track whether we've already requested this thumbnail
    const requestedRef = useRef(false);

    // ─── Lazy loading via IntersectionObserver ───
    // Only generate the thumbnail when this cell scrolls into view.
    // The rootMargin buffer (200px) starts loading slightly before visible.
    useEffect(() => {
        const el = cellRef.current;
        if (!el || thumbnailUrl || requestedRef.current) return; // Already loaded or requested

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !requestedRef.current) {
                        requestedRef.current = true;
                        // This cell is now visible — request its thumbnail
                        // Uses ref to always call the latest callback version
                        console.log(`[PDFRearrange] Thumbnail needed for page ${pageNum}`);
                        onThumbnailNeededRef.current(pageNum);
                        observer.unobserve(el); // Only need to trigger once
                    }
                });
            },
            { rootMargin: '200px 0px' } // Start loading 200px before visible
        );

        observer.observe(el);

        // Cleanup: disconnect when component unmounts
        return () => observer.disconnect();
    }, [pageNum, thumbnailUrl]); // Removed onThumbnailNeeded — using ref instead

    return (
        <div
            ref={cellRef}
            className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer
                ${isSelected
                    ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
            onClick={onClick}
        >
            {/* Thumbnail image or placeholder */}
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {thumbnailUrl ? (
                    // Real thumbnail loaded — CSS transform shows user-applied rotation
                    // 90°/270° rotations need scale(0.75) because a 3:4 image rotated
                    // sideways doesn't fit in a 3:4 container at full size (3/4 = 0.75)
                    <img
                        src={thumbnailUrl}
                        alt={`Page ${pageNum}`}
                        className="w-full h-full object-contain"
                        draggable={false}
                        style={{
                            transform: rotation
                                ? `rotate(${rotation}deg)${rotation === 90 || rotation === 270 ? ' scale(0.75)' : ''}`
                                : undefined,
                            transition: 'transform 0.2s ease',
                        }}
                    />
                ) : (
                    // Placeholder with loading spinner
                    <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                        <svg className="animate-spin h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-xs">Page {pageNum}</span>
                    </div>
                )}
            </div>

            {/* Page number overlay at bottom — flexbox layout with rotate button */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-1.5 flex items-center">
                {/* Rotation indicator badge — shows degree value when rotated */}
                {rotation !== 0 && (
                    <span className="text-yellow-300 text-[10px] font-medium mr-1 flex-shrink-0">
                        {rotation}°
                    </span>
                )}

                {/* Page number (centered, takes remaining space) */}
                <span className="flex-1 text-center truncate">
                    Page {pageNum}
                    {/* Show position if different from original page number */}
                    {position !== pageNum && (
                        <span className="text-gray-300 ml-1">(#{position})</span>
                    )}
                </span>

                {/* Rotate button — rotates page 90° clockwise on each click */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Don't trigger page selection
                        onRotate(id);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20
                        transition-colors flex-shrink-0 ml-1"
                    title={`Rotate page ${pageNum} (currently ${rotation}°)`}
                >
                    {/* Clockwise rotation arrow icon — circular arc with arrowhead */}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                </button>
            </div>

            {/* Delete button — appears on hover (top-right corner) */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Don't trigger selection when deleting
                    onDelete(id);
                }}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full
                    w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100
                    transition-opacity"
                title={`Remove page ${pageNum}`}
            >
                ×
            </button>

            {/* Selection checkmark — shown when selected */}
            {isSelected && (
                <div className="absolute top-1 left-1 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if these specific props change
    return (
        prevProps.id === nextProps.id &&
        prevProps.pageNum === nextProps.pageNum &&
        prevProps.position === nextProps.position &&
        prevProps.thumbnailUrl === nextProps.thumbnailUrl &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.rotation === nextProps.rotation
    );
});


/**
 * SortablePageThumbnail — Wraps PageThumbnail with @dnd-kit's useSortable hook.
 * This enables drag-and-drop reordering of individual page thumbnails.
 *
 * Pattern from PDFMerger's SortablePagePreview component.
 */
const SortablePageThumbnail = (props) => {
    // useSortable gives us drag handle attributes and transform styles
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.id });

    // Apply transform and transition styles from the sortable hook
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // Make the original item semi-transparent while dragging
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <PageThumbnail {...props} />
        </div>
    );
};


/**
 * DragOverlayThumbnail — Lightweight preview shown while dragging a page.
 * Renders a smaller, elevated version of the page thumbnail.
 * Pattern from PDFMerger's DragPreview component.
 */
const DragOverlayThumbnail = memo(({ pageNum, thumbnailUrl, rotation }) => {
    return (
        <div className="w-24 rounded-lg overflow-hidden shadow-2xl border-2 border-blue-500 rotate-3">
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={`Page ${pageNum}`}
                        className="w-full h-full object-contain"
                        draggable={false}
                        style={{
                            transform: rotation
                                ? `rotate(${rotation}deg)${rotation === 90 || rotation === 270 ? ' scale(0.75)' : ''}`
                                : undefined,
                        }}
                    />
                ) : (
                    <span className="text-xs text-gray-400">Page {pageNum}</span>
                )}
            </div>
            <div className="bg-black/60 text-white text-xs text-center py-0.5">
                Page {pageNum}
            </div>
        </div>
    );
});


// =============================================================================
// MAIN COMPONENT
// =============================================================================

const PDFRearrange = () => {
    useDocumentTitle('PDF Rearrange');

    // =============================================
    // STATE MANAGEMENT
    // =============================================

    // --- File state ---
    const [pdfFile, setPdfFile] = useState(null);           // The uploaded PDF File object
    const [fileName, setFileName] = useState('');            // Display name of the file
    const [fileSize, setFileSize] = useState(0);             // File size in bytes
    const [totalPageCount, setTotalPageCount] = useState(0); // Total pages in the original PDF

    // --- Mode state ---
    // 'visual' = drag-and-drop thumbnails, 'manual' = text input for page order
    const [mode, setMode] = useState('visual');

    // --- Page ordering state ---
    // Array of objects: [{ id: 'page-1', pageNum: 1 }, { id: 'page-3', pageNum: 3 }, ...]
    // The 'id' field is required by @dnd-kit for sortable items.
    // The 'pageNum' is the original 1-based page number in the source PDF.
    // The array order represents the desired output order.
    const [pages, setPages] = useState([]);

    // --- Manual mode input ---
    const [manualInput, setManualInput] = useState('');      // Raw text input from user
    const [manualError, setManualError] = useState('');       // Validation error for manual input
    const [manualPageCount, setManualPageCount] = useState(0); // Parsed result count

    // --- Selection state (for visual mode) ---
    const [selectedIds, setSelectedIds] = useState(new Set()); // Set of selected page IDs
    const [lastClickedIndex, setLastClickedIndex] = useState(null); // For shift+click range selection

    // --- Drag state ---
    const [activeId, setActiveId] = useState(null); // ID of the page currently being dragged

    // --- Thumbnail cache ---
    // Maps original page number → data URL string
    // Persists across reorders so thumbnails don't need to be regenerated
    const [thumbnailCache, setThumbnailCache] = useState({});

    // Ref mirror of thumbnailCache — used in generateThumbnail to check
    // if a thumbnail already exists without adding thumbnailCache as a
    // dependency (which would cause the callback to change on every render
    // and break the IntersectionObserver in memoized children).
    const thumbnailCacheRef = useRef({});

    // Queue of page numbers that were requested (via IntersectionObserver)
    // before pdfDoc was ready. Flushed as soon as pdfDoc loads.
    const pendingThumbnailsRef = useRef(new Set());

    // --- PDF.js document reference ---
    // Loaded once when a file is uploaded, shared across all thumbnail generations
    const [pdfDoc, setPdfDoc] = useState(null);

    // --- Processing state ---
    const [isProcessing, setIsProcessing] = useState(false); // True while generating output PDF
    const [progress, setProgress] = useState('');             // Status message during processing

    // --- Error state ---
    const [error, setError] = useState('');  // Error message string

    // =============================================
    // DND-KIT SENSORS
    // =============================================

    // PointerSensor with a 5px activation distance prevents accidental drags
    // when the user just wants to click (for selection)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    // =============================================
    // FILE HANDLING
    // =============================================

    /**
     * Handles file drop/selection from react-dropzone.
     * Reads the PDF to get page count, initializes the pages array,
     * and auto-selects the appropriate mode.
     *
     * @param {File[]} acceptedFiles - Files from react-dropzone
     */
    const onDrop = useCallback(async (acceptedFiles) => {
        // Clear previous state
        setError('');
        setPages([]);
        setManualInput('');
        setManualError('');
        setManualPageCount(0);
        setSelectedIds(new Set());
        setLastClickedIndex(null);
        setActiveId(null);
        setThumbnailCache({});
        thumbnailCacheRef.current = {};
        pendingThumbnailsRef.current.clear();
        setPdfDoc(null);

        if (acceptedFiles.length === 0) {
            console.log('[PDFRearrange] No files dropped');
            return;
        }

        const file = acceptedFiles[0];
        console.log(`[PDFRearrange] File selected: ${file.name} (${formatSize(file.size)})`);

        // Validate file type — only accept PDFs
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setError('Please select a PDF file.');
            console.warn('[PDFRearrange] Rejected non-PDF file:', file.type);
            return;
        }

        // Validate file size — limit to 100 MB to prevent browser memory issues
        const maxSize = 100 * 1024 * 1024; // 100 MB
        if (file.size > maxSize) {
            setError('File is too large. Please select a PDF file smaller than 100 MB.');
            console.warn('[PDFRearrange] Rejected oversized file:', formatSize(file.size));
            return;
        }

        // Store file info
        setPdfFile(file);
        setFileName(file.name);
        setFileSize(file.size);

        try {
            // Read the PDF to determine page count using pdf-lib
            const arrayBuffer = await file.arrayBuffer();
            const pdfDocument = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pageCount = pdfDocument.getPageCount();
            console.log(`[PDFRearrange] PDF has ${pageCount} pages`);

            setTotalPageCount(pageCount);

            // Initialize pages array — all pages in original order
            // Each page gets a unique ID for @dnd-kit (format: "page-{originalPageNum}")
            const initialPages = Array.from({ length: pageCount }, (_, i) => ({
                id: `page-${i + 1}`,
                pageNum: i + 1,
                rotation: 0, // User-applied rotation in degrees (0, 90, 180, 270)
            }));
            setPages(initialPages);

            // Auto-select mode based on page count
            // Visual mode for ≤100 pages (thumbnails are manageable)
            // Manual mode for >100 pages (too many thumbnails)
            if (pageCount > 100) {
                setMode('manual');
                // Pre-fill manual input with all pages in order
                setManualInput(`1-${pageCount}`);
                setManualPageCount(pageCount);
                console.log('[PDFRearrange] Auto-selected manual mode (>100 pages)');
            } else {
                setMode('visual');
                console.log('[PDFRearrange] Auto-selected visual mode (≤100 pages)');
            }

            // Load the pdfjs-dist document for thumbnail rendering
            // This is loaded ONCE and shared across all thumbnails
            const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
            const pdfjsDoc = await loadingTask.promise;
            setPdfDoc(pdfjsDoc);
            console.log('[PDFRearrange] PDF.js document loaded for thumbnails');

        } catch (err) {
            console.error('[PDFRearrange] Failed to read PDF:', err);
            setError('Failed to read PDF file. It may be corrupted or password-protected.');
            setPdfFile(null);
            setFileName('');
            setFileSize(0);
        }
    }, []);

    // Configure react-dropzone — accept only PDFs, single file at a time
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    // =============================================
    // THUMBNAIL GENERATION
    // =============================================

    /**
     * Generates a thumbnail for a specific page using the cached pdfjs document.
     * Called lazily when a page thumbnail scrolls into view (via IntersectionObserver).
     * The generated thumbnail is cached so it persists across reorders.
     *
     * @param {number} pageNum - The original 1-based page number to render
     */
    const generateThumbnail = useCallback(async (pageNum) => {
        // Skip if already cached (check the ref, not the state, so this
        // callback's identity stays stable and doesn't break memoized children)
        if (thumbnailCacheRef.current[pageNum]) return;

        // If pdfDoc isn't ready yet, queue the request.
        // A useEffect below will flush the queue once pdfDoc loads.
        if (!pdfDoc) {
            pendingThumbnailsRef.current.add(pageNum);
            return;
        }

        // Mark as in-progress immediately to prevent duplicate renders
        // if multiple IntersectionObserver callbacks fire for the same page
        thumbnailCacheRef.current[pageNum] = 'loading';

        try {
            // Get the page from the pdfjs document
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 0.3 }); // Small scale for thumbnails

            // Create an offscreen canvas to render the page
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            // Render the page to the canvas
            await page.render({ canvasContext: ctx, viewport }).promise;

            // Convert canvas to data URL and cache it
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // JPEG for smaller size

            // Update both the ref (for future checks) and state (to trigger re-render)
            thumbnailCacheRef.current[pageNum] = dataUrl;
            setThumbnailCache((prev) => ({
                ...prev,
                [pageNum]: dataUrl,
            }));

        } catch (err) {
            console.error(`[PDFRearrange] Failed to generate thumbnail for page ${pageNum}:`, err);
            // Remove the "loading" marker so it can be retried
            delete thumbnailCacheRef.current[pageNum];
        }
    }, [pdfDoc]); // Only depends on pdfDoc — NOT thumbnailCache

    // ─── Flush pending thumbnail queue when pdfDoc becomes available ─────────
    // IntersectionObserver may fire before pdfDoc finishes loading (it's async).
    // Those requests are queued in pendingThumbnailsRef. This effect runs once
    // pdfDoc is set and generates all the queued thumbnails.
    useEffect(() => {
        if (!pdfDoc || pendingThumbnailsRef.current.size === 0) return;

        console.log(`[PDFRearrange] Flushing ${pendingThumbnailsRef.current.size} queued thumbnails`);
        const queued = new Set(pendingThumbnailsRef.current);
        pendingThumbnailsRef.current.clear();

        queued.forEach((pageNum) => {
            generateThumbnail(pageNum);
        });
    }, [pdfDoc, generateThumbnail]);

    // =============================================
    // DRAG AND DROP HANDLERS
    // =============================================

    /**
     * Called when the user starts dragging a page thumbnail.
     * Stores the active drag ID for the DragOverlay component.
     */
    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
        console.log(`[PDFRearrange] Drag started: ${event.active.id}`);
    }, []);

    /**
     * Called when the user drops a page thumbnail in a new position.
     * Uses arrayMove from @dnd-kit to reorder the pages array.
     */
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        setActiveId(null);

        // If dropped outside a valid target, do nothing
        if (!over || active.id === over.id) return;

        setPages((prev) => {
            // Find the old and new positions
            const oldIndex = prev.findIndex((p) => p.id === active.id);
            const newIndex = prev.findIndex((p) => p.id === over.id);

            console.log(`[PDFRearrange] Moved page from position ${oldIndex + 1} to ${newIndex + 1}`);
            return arrayMove(prev, oldIndex, newIndex);
        });
    }, []);

    /**
     * Called when a drag operation is cancelled (e.g., user presses Escape).
     * Clears the active drag ID.
     */
    const handleDragCancel = useCallback(() => {
        setActiveId(null);
        console.log('[PDFRearrange] Drag cancelled');
    }, []);

    // =============================================
    // SELECTION HANDLERS (VISUAL MODE)
    // =============================================

    /**
     * Handles clicking a page thumbnail for selection.
     * - Normal click: toggle single page selection
     * - Shift+click: select/deselect range from last clicked to current
     *
     * @param {string} id - The page ID that was clicked
     * @param {number} index - The current index in the pages array
     * @param {Object} event - The click event (to check for Shift key)
     */
    const handlePageClick = useCallback((id, index, event) => {
        if (event.shiftKey && lastClickedIndex !== null) {
            // ─── Shift+click: range selection ───
            const start = Math.min(lastClickedIndex, index);
            const end = Math.max(lastClickedIndex, index);

            setSelectedIds((prev) => {
                const next = new Set(prev);
                for (let i = start; i <= end; i++) {
                    next.add(pages[i].id);
                }
                return next;
            });
            console.log(`[PDFRearrange] Range selected: positions ${start + 1} to ${end + 1}`);
        } else {
            // ─── Normal click: toggle single selection ───
            setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
        }

        // Always update last clicked index for future shift+clicks
        setLastClickedIndex(index);
    }, [lastClickedIndex, pages]);

    /**
     * Selects all pages in the current order.
     */
    const handleSelectAll = useCallback(() => {
        setSelectedIds(new Set(pages.map((p) => p.id)));
        console.log('[PDFRearrange] All pages selected');
    }, [pages]);

    /**
     * Deselects all pages.
     */
    const handleDeselectAll = useCallback(() => {
        setSelectedIds(new Set());
        setLastClickedIndex(null);
        console.log('[PDFRearrange] All pages deselected');
    }, []);

    // =============================================
    // PAGE DELETION
    // =============================================

    /**
     * Removes a single page from the pages array by its ID.
     * Also removes it from the selection set if selected.
     *
     * @param {string} id - The page ID to delete
     */
    const handleDeletePage = useCallback((id) => {
        setPages((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        console.log(`[PDFRearrange] Deleted page: ${id}`);
    }, []);

    /**
     * Removes all currently selected pages from the pages array.
     * Clears the selection set afterwards.
     */
    const handleDeleteSelected = useCallback(() => {
        if (selectedIds.size === 0) return;

        console.log(`[PDFRearrange] Deleting ${selectedIds.size} selected pages`);
        setPages((prev) => prev.filter((p) => !selectedIds.has(p.id)));
        setSelectedIds(new Set());
        setLastClickedIndex(null);
    }, [selectedIds]);

    // =============================================
    // PAGE ROTATION
    // =============================================

    /**
     * Rotates a single page by 90 degrees clockwise.
     * Cycles through: 0 → 90 → 180 → 270 → 0
     * Same pattern as Adobe Acrobat and macOS Preview.
     *
     * @param {string} id - The page ID to rotate
     */
    const handleRotatePage = useCallback((id) => {
        setPages((prev) => prev.map((p) =>
            p.id === id
                ? { ...p, rotation: (p.rotation + 90) % 360 }
                : p
        ));
        console.log(`[PDFRearrange] Rotated page: ${id}`);
    }, []);

    /**
     * Rotates all currently selected pages by 90 degrees clockwise.
     * Each selected page advances independently through the 0/90/180/270 cycle.
     */
    const handleRotateSelected = useCallback(() => {
        if (selectedIds.size === 0) return;

        setPages((prev) => prev.map((p) =>
            selectedIds.has(p.id)
                ? { ...p, rotation: (p.rotation + 90) % 360 }
                : p
        ));
        console.log(`[PDFRearrange] Rotated ${selectedIds.size} selected pages`);
    }, [selectedIds]);

    // =============================================
    // MANUAL INPUT HANDLING
    // =============================================

    /**
     * Handles changes to the manual page input field.
     * Parses the input, validates it, and updates the result count.
     * Uses debounce-like behavior by parsing on every change
     * (parsing is fast enough to not need actual debouncing).
     *
     * @param {string} value - The raw input string from the text field
     */
    const handleManualInputChange = useCallback((value) => {
        setManualInput(value);

        if (!value.trim()) {
            setManualError('');
            setManualPageCount(0);
            return;
        }

        // Parse the input to validate and count pages
        const { pages: parsedPages, error: parseError } = parsePageInput(value, totalPageCount);

        if (parseError) {
            setManualError(parseError);
            setManualPageCount(0);
        } else {
            setManualError('');
            setManualPageCount(parsedPages.length);
        }
    }, [totalPageCount]);

    /**
     * Applies the manual input to the pages array.
     * This converts the text input into the same page objects format
     * used by visual mode, enabling seamless switching between modes.
     */
    const applyManualInput = useCallback(() => {
        const { pages: parsedPages, error: parseError } = parsePageInput(manualInput, totalPageCount);

        if (parseError) {
            setManualError(parseError);
            return;
        }

        if (parsedPages.length === 0) {
            setManualError('No pages specified');
            return;
        }

        // Convert parsed page numbers to page objects
        // Each gets a unique ID using index to handle duplicate page numbers
        const newPages = parsedPages.map((pageNum, index) => ({
            id: `page-${pageNum}-${index}`,
            pageNum,
            rotation: 0, // No rotation support in manual mode
        }));

        setPages(newPages);
        setSelectedIds(new Set());
        setLastClickedIndex(null);
        console.log(`[PDFRearrange] Manual input applied: ${parsedPages.length} pages`);
    }, [manualInput, totalPageCount]);

    // =============================================
    // PDF GENERATION
    // =============================================

    /**
     * Generates a new PDF with pages in the current order and rotation.
     * Uses pdf-lib to copy pages from the source PDF to a new document.
     * Applies user-specified rotation (combined with any existing page rotation).
     * Triggers browser download when complete.
     */
    const generateReorderedPDF = useCallback(async () => {
        // Build page entries with rotation info: [{ pageNum, rotation }]
        let pageEntries;

        if (mode === 'manual') {
            // Manual mode: parse input, no rotation support
            const { pages: parsedPages, error: parseError } = parsePageInput(manualInput, totalPageCount);
            if (parseError) {
                setError(parseError);
                return;
            }
            if (parsedPages.length === 0) {
                setError('No pages specified. Enter page numbers or ranges.');
                return;
            }
            pageEntries = parsedPages.map((num) => ({ pageNum: num, rotation: 0 }));
        } else {
            // Visual mode — use the pages array order with rotation
            if (pages.length === 0) {
                setError('No pages to generate. All pages have been removed.');
                return;
            }
            pageEntries = pages.map((p) => ({ pageNum: p.pageNum, rotation: p.rotation }));
        }

        console.log(`[PDFRearrange] Generating PDF with ${pageEntries.length} pages`);
        setIsProcessing(true);
        setError('');

        try {
            // Step 1: Read the original PDF file
            setProgress('Reading PDF...');
            const arrayBuffer = await pdfFile.arrayBuffer();
            const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            // Step 2: Create a new empty PDF document
            setProgress('Creating rearranged PDF...');
            const newPdf = await PDFDocument.create();

            // Step 3: Copy pages in the desired order, applying rotation
            for (let i = 0; i < pageEntries.length; i++) {
                const { pageNum, rotation: userRotation } = pageEntries[i];
                const pageIndex = pageNum - 1; // Convert 1-based to 0-based index
                const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageIndex]);

                // Apply rotation if user rotated this page
                // Combines with any existing rotation in the source PDF (e.g., scanned docs)
                if (userRotation !== 0) {
                    const existingRotation = copiedPage.getRotation().angle;
                    const totalRotation = (existingRotation + userRotation) % 360;
                    copiedPage.setRotation(degrees(totalRotation));
                    console.log(`[PDFRearrange] Page ${pageNum}: existing=${existingRotation}° + user=${userRotation}° = ${totalRotation}°`);
                }

                newPdf.addPage(copiedPage);

                // Update progress every 10 pages to keep UI responsive
                if (i % 10 === 0) {
                    setProgress(`Copying page ${i + 1} of ${pageEntries.length}...`);
                }
            }

            // Step 4: Save and trigger download
            setProgress('Saving PDF...');
            const pdfBytes = await newPdf.save();

            // Create download link — same pattern as all other PDF tools
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Generate filename: "document.pdf" → "document_rearranged.pdf"
            link.download = fileName.replace(/\.pdf$/i, '_rearranged.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log(`[PDFRearrange] PDF generated and download triggered: ${link.download}`);

        } catch (err) {
            console.error('[PDFRearrange] Generation failed:', err);
            setError(err.message || 'Failed to generate PDF. Please try again.');
        } finally {
            setIsProcessing(false);
            setProgress('');
        }
    }, [pdfFile, pages, mode, manualInput, totalPageCount, fileName]);

    // =============================================
    // RESET
    // =============================================

    /**
     * Resets the tool to its initial state for a new file.
     * Clears all state: file, pages, thumbnails, selections, errors.
     */
    const resetTool = useCallback(() => {
        setPdfFile(null);
        setFileName('');
        setFileSize(0);
        setTotalPageCount(0);
        setMode('visual');
        setPages([]);
        setManualInput('');
        setManualError('');
        setManualPageCount(0);
        setSelectedIds(new Set());
        setLastClickedIndex(null);
        setActiveId(null);
        setThumbnailCache({});
        thumbnailCacheRef.current = {};
        pendingThumbnailsRef.current.clear();
        setPdfDoc(null);
        setIsProcessing(false);
        setProgress('');
        setError('');
        console.log('[PDFRearrange] Tool reset');
    }, []);

    // =============================================
    // MEMOIZED VALUES
    // =============================================

    // Find the active page data for DragOverlay rendering
    const activePage = useMemo(() => {
        if (!activeId) return null;
        return pages.find((p) => p.id === activeId);
    }, [activeId, pages]);

    // List of sortable IDs for SortableContext
    const sortableIds = useMemo(() => pages.map((p) => p.id), [pages]);

    // =============================================
    // RENDER
    // =============================================

    return (
        <PageWrapper>
            <div className="max-w-5xl mx-auto">
                {/* Page title */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    PDF Page Rearrange
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Reorder, remove, or rearrange pages in your PDF. All processing happens in your browser — your files are never uploaded.
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
                        {/* Upload icon — arrows indicating page rearrangement */}
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
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                        </svg>
                        {isDragActive ? (
                            <p className="text-blue-600 dark:text-blue-400 font-medium">
                                Drop your PDF here...
                            </p>
                        ) : (
                            <>
                                <p className="text-gray-600 dark:text-gray-300 font-medium">
                                    Drag & drop a PDF file here to rearrange its pages
                                </p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                    or click to browse (PDF files only, max 100 MB)
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    /* ─── File selected: show controls ──────────────────── */
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
                                        {formatSize(fileSize)} · {totalPageCount} pages
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

                        {/* ─── Mode Toggle ─────────────────────────────────── */}
                        <div>
                            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 w-fit">
                                {/* Visual Mode button */}
                                <button
                                    onClick={() => setMode('visual')}
                                    className={`px-4 py-2 text-sm font-medium transition-colors
                                        ${mode === 'visual'
                                            ? 'bg-blue-600 text-white dark:bg-blue-500'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    Visual Mode
                                </button>
                                {/* Manual Mode button */}
                                <button
                                    onClick={() => setMode('manual')}
                                    className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600
                                        ${mode === 'manual'
                                            ? 'bg-blue-600 text-white dark:bg-blue-500'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    Manual Mode
                                </button>
                            </div>
                            {/* Auto-detection note */}
                            {totalPageCount > 100 && mode === 'manual' && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Manual mode was auto-selected because your PDF has more than 100 pages.
                                </p>
                            )}
                        </div>

                        {/* ─── Visual Mode ─────────────────────────────────── */}
                        {mode === 'visual' && (
                            <div>
                                {/* Selection toolbar */}
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <button
                                        onClick={handleSelectAll}
                                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700
                                            text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200
                                            dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={handleDeselectAll}
                                        className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700
                                            text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200
                                            dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Deselect All
                                    </button>
                                    {selectedIds.size > 0 && (
                                        <>
                                            <button
                                                onClick={handleDeleteSelected}
                                                className="px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30
                                                    text-red-700 dark:text-red-300 rounded-md hover:bg-red-200
                                                    dark:hover:bg-red-900/50 transition-colors"
                                            >
                                                Delete Selected ({selectedIds.size})
                                            </button>
                                            <button
                                                onClick={handleRotateSelected}
                                                className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30
                                                    text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200
                                                    dark:hover:bg-blue-900/50 transition-colors"
                                            >
                                                Rotate Selected ({selectedIds.size})
                                            </button>
                                        </>
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                        {pages.length} pages · Drag to reorder · Click to select · Shift+click for range
                                    </span>
                                </div>

                                {/* Drag-and-drop grid */}
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onDragCancel={handleDragCancel}
                                >
                                    <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {pages.map((page, index) => (
                                                <SortablePageThumbnail
                                                    key={page.id}
                                                    id={page.id}
                                                    pageNum={page.pageNum}
                                                    position={index + 1}
                                                    thumbnailUrl={thumbnailCache[page.pageNum] || null}
                                                    isSelected={selectedIds.has(page.id)}
                                                    rotation={page.rotation}
                                                    onDelete={handleDeletePage}
                                                    onRotate={handleRotatePage}
                                                    onClick={(e) => handlePageClick(page.id, index, e)}
                                                    onThumbnailNeeded={generateThumbnail}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>

                                    {/* Drag overlay — shown while dragging */}
                                    <DragOverlay>
                                        {activePage ? (
                                            <DragOverlayThumbnail
                                                pageNum={activePage.pageNum}
                                                thumbnailUrl={thumbnailCache[activePage.pageNum] || null}
                                                rotation={activePage.rotation}
                                            />
                                        ) : null}
                                    </DragOverlay>
                                </DndContext>

                                {/* Empty state — all pages deleted */}
                                {pages.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <p className="font-medium">All pages have been removed.</p>
                                        <p className="text-sm mt-1">Click "Start Over" to try again.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Manual Mode ─────────────────────────────────── */}
                        {mode === 'manual' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="mb-4">
                                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                                        Your PDF has <span className="text-blue-600 dark:text-blue-400 font-bold">{totalPageCount}</span> pages
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Enter the page order using the syntax below. Pages not listed will be excluded.
                                    </p>
                                </div>

                                {/* Page order input */}
                                <label
                                    htmlFor="page-order-input"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Page Order
                                </label>
                                <textarea
                                    id="page-order-input"
                                    value={manualInput}
                                    onChange={(e) => handleManualInputChange(e.target.value)}
                                    placeholder={`e.g., 1-${Math.min(5, totalPageCount)}, ${Math.min(10, totalPageCount)}, ${Math.min(8, totalPageCount)}-${Math.min(6, totalPageCount)}`}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                        placeholder-gray-400 dark:placeholder-gray-500
                                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        font-mono text-sm transition-colors resize-none"
                                />

                                {/* Validation feedback */}
                                <div className="mt-2 min-h-[1.5rem]">
                                    {manualError ? (
                                        <p className="text-red-500 dark:text-red-400 text-sm">{manualError}</p>
                                    ) : manualPageCount > 0 ? (
                                        <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                                            Result: {manualPageCount} page{manualPageCount !== 1 ? 's' : ''}
                                        </p>
                                    ) : null}
                                </div>

                                {/* Apply button — updates the internal pages array */}
                                <button
                                    onClick={applyManualInput}
                                    disabled={!!manualError || manualPageCount === 0}
                                    className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${manualError || manualPageCount === 0
                                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer'
                                        }`}
                                >
                                    Apply Page Order
                                </button>

                                {/* Syntax help */}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Syntax Guide:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                        <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">1-10</code> — Pages 1 through 10</div>
                                        <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">10-1</code> — Pages 10 down to 1 (reverse)</div>
                                        <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">5, 3, 1</code> — Individual pages</div>
                                        <div><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">1-5, 10, 8-6</code> — Mix ranges and pages</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── Action Buttons ──────────────────────────────── */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Download button */}
                            <button
                                onClick={generateReorderedPDF}
                                disabled={isProcessing || (mode === 'visual' && pages.length === 0) || (mode === 'manual' && (!!manualError || manualPageCount === 0))}
                                className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors
                                    ${isProcessing || (mode === 'visual' && pages.length === 0) || (mode === 'manual' && (!!manualError || manualPageCount === 0))
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
                                    `Download Rearranged PDF${mode === 'manual' && manualPageCount > 0 ? ` (${manualPageCount} pages)` : mode === 'visual' && pages.length > 0 ? ` (${pages.length} pages)` : ''}`
                                )}
                            </button>

                            {/* Start over button */}
                            <button
                                onClick={resetTool}
                                disabled={isProcessing}
                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                                    text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Start Over
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Section: Instructions ──────────────────────────────── */}
                <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 mt-8">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        How to use
                    </h3>
                    <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
                        <li>Upload a PDF file (drag & drop or click to browse)</li>
                        <li><strong>Visual Mode:</strong> Drag pages to reorder, click to select, use Delete to remove pages</li>
                        <li><strong>Rotate:</strong> Click the rotate button on any page to rotate it 90° clockwise, or select multiple pages and use "Rotate Selected"</li>
                        <li><strong>Manual Mode:</strong> Type the desired page order (e.g., "3, 1, 2, 5-10")</li>
                        <li>Click "Download Rearranged PDF" to save the result</li>
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

export default PDFRearrange;
