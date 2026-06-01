/**
 * PDF Merger Component
 *
 * Client-side tool to combine PDFs and images (JPG/PNG) into a single PDF.
 *
 * Reorder model (unified page grid):
 * - Every page of every uploaded file becomes ONE draggable tile in a single grid.
 * - You can drag ANY page to ANY position — e.g. move an image to sit between two
 *   PDF pages. The merged PDF follows the exact left-to-right / top-to-bottom order
 *   of the grid.
 * - Click a tile to include/exclude it. The big number on a tile is the page number
 *   it will have in the FINAL merged PDF (only selected pages are numbered).
 * - Each JPG/PNG is a single page, fitted (centred, aspect-preserved) onto an A4 page.
 *
 * Technical Implementation:
 * - pdf-lib for PDF assembly (copyPages for PDF pages; embedJpg/embedPng for images)
 * - pdfjs-dist for PDF page thumbnails; FileReader data URLs for image thumbnails
 * - @dnd-kit for the single drag-and-drop sortable grid
 *
 * @component
 */

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import { CheckIcon } from '@heroicons/react/24/solid';
import SEO from '../../common/SEO';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PageWrapper from '../../../components/layout/PageWrapper';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/js/pdf.worker.min.js';

/**
 * File MIME types this merger accepts.
 *
 * - PDFs are merged page-by-page (pdf-lib copyPages).
 * - JPG/PNG images are each embedded as a single new page (pdf-lib embedJpg/embedPng).
 *
 * NOTE: only JPG and PNG are listed because those are the *only* raster formats
 * pdf-lib can embed. WebP / HEIC / GIF are intentionally NOT accepted — pdf-lib
 * has no decoder for them, so they would fail at merge time.
 */
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// A4 page geometry in PDF points (1 pt = 1/72 inch). 595.28 x 841.89 pt = 210 x 297 mm.
// Images are placed on A4 pages so they sit uniformly alongside the PDF pages.
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
// Blank margin left around an image on its page (~0.5 inch on every side).
const IMAGE_PAGE_MARGIN = 36;

/**
 * Animation configuration for the drag overlay
 */
const dropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

/**
 * PagePreview Component
 *
 * Renders a single page tile (one page of a PDF, or a whole image) with:
 * - Thumbnail (pdf.js canvas for PDFs; data-URL <img> for images)
 * - The page's position in the FINAL merged PDF (big number; only when selected)
 * - A small source caption (which file / which source page this came from)
 * - Selection state, loading state, error handling, and a drag handle
 *
 * @param {Object} props
 * @param {string} props.cacheId - Stable unique id for this page (used for thumbnail caching)
 * @param {number} props.pageNum - Source page number within its file (1-based; for pdf.js render)
 * @param {File} props.pdfFile - The source File object (PDF or image)
 * @param {boolean} props.selected - Whether this page is included in the merge
 * @param {number|null} props.position - This page's number in the final PDF (null if excluded)
 * @param {string} props.caption - Small source label, e.g. "report.pdf · p3" or "scan.jpg"
 * @param {Function} props.onClick - Toggle selection
 * @param {Object} props.dragHandleProps - Props for the drag handle
 * @param {Function} props.onThumbnailLoad - Callback(cacheId, dataUrl) when thumbnail is ready
 */
const PagePreview = memo(({ cacheId, pageNum, pdfFile, selected, position, caption, onClick, dragHandleProps = {}, onThumbnailLoad }) => {
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // --- Image thumbnail effect ------------------------------------------------
  // For JPG/PNG files there is no PDF to render — we simply display the image
  // itself. We read the file into a base64 `data:` URL (the SAME kind of value
  // the PDF path produces via canvas.toDataURL).
  //
  // Why a data URL and not URL.createObjectURL? The thumbnail is cached in the
  // parent (onThumbnailLoad → thumbnailCache) so the drag overlay can reuse it.
  // A blob/object URL would have to be revoked when this component unmounts,
  // which would leave a DEAD url sitting in that cache. A data URL has no
  // revocation lifecycle, so it is always safe to cache. No-op for PDFs.
  useEffect(() => {
    if (!pdfFile || !pdfFile.type || !pdfFile.type.startsWith('image/')) {
      return; // Not an image — let the pdf.js effect render the preview.
    }

    let cancelled = false;
    const reader = new FileReader();

    reader.onload = (e) => {
      if (cancelled) return;
      const dataUrl = e.target.result;
      setThumbnail(dataUrl);
      setLoading(false);
      if (onThumbnailLoad) {
        onThumbnailLoad(cacheId, dataUrl);
      }
    };

    reader.onerror = () => {
      if (cancelled) return;
      console.error(`PDFMerger: could not read image "${pdfFile.name}" for preview`);
      setError('Could not read image');
      setLoading(false);
    };

    reader.readAsDataURL(pdfFile);

    return () => {
      // If the component unmounts before the read finishes, ignore the result.
      cancelled = true;
    };
  }, [pdfFile, cacheId, onThumbnailLoad]);

  // --- PDF thumbnail effect --------------------------------------------------
  // Render the requested page of a PDF to a canvas, then snapshot it to a data URL.
  //
  // IMPORTANT: we keep a handle to the pdf.js `renderTask` and CANCEL it on cleanup.
  // Without this, React's StrictMode double-invoke (and rapid re-mounts) can start a
  // second render() on the same <canvas> before the first finishes — pdf.js then
  // throws "Cannot use the same canvas during multiple render() operations". The
  // cancel makes the superseded render bail cleanly (RenderingCancelledException).
  useEffect(() => {
    let cancelled = false;
    let renderTask = null;
    const canvas = canvasRef.current;

    const loadPreview = async () => {
      if (thumbnail || !pdfFile || !canvas) return;
      // Images are handled by the dedicated effect above — skip pdf.js for them.
      if (pdfFile.type && pdfFile.type.startsWith('image/')) return;

      try {
        setLoading(true);
        setError(null);

        const arrayBuffer = await pdfFile.arrayBuffer();
        if (cancelled) return;

        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdfDoc = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 0.5 });

        const context = canvas.getContext('2d', { alpha: false });
        if (!context || cancelled) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        });
        await renderTask.promise;

        if (cancelled) return;

        const dataUrl = canvas.toDataURL();

        // Clean up
        canvas.width = 0;
        canvas.height = 0;

        if (isMountedRef.current && !cancelled) {
          setThumbnail(dataUrl);
          setLoading(false);
          if (onThumbnailLoad) {
            onThumbnailLoad(cacheId, dataUrl);
          }
        }
      } catch (err) {
        // A cancelled render is expected (cleanup / StrictMode) — not an error.
        if (err && err.name === 'RenderingCancelledException') return;
        console.error('Error rendering PDF preview:', err);
        if (isMountedRef.current && !cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
      // Abort any in-flight render so it can't collide with the next one on this canvas.
      if (renderTask) {
        try { renderTask.cancel(); } catch (e) { /* already settled */ }
      }
    };
    // Excluding thumbnail from deps as it's used as a cached value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pdfFile, cacheId, onThumbnailLoad]);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`relative group p-1 rounded-lg transition-all ${selected
          ? 'bg-emerald-50 dark:bg-emerald-900/30'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
      >
        {/* Selection indicator circle */}
        <div
          className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full
            shadow-sm transition-all duration-200 ease-in-out flex items-center justify-center
            z-10
            ${selected
              ? 'bg-emerald-400 dark:bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-700 ring-opacity-50'
              : 'bg-gray-300 dark:bg-gray-600 opacity-60 hover:opacity-80'
            }`}
        >
          {selected && (
            <CheckIcon className="w-2.5 h-2.5 text-white" />
          )}
        </div>
        {/* Thumbnail — dimmed when this page is excluded from the merge */}
        <div className={`relative aspect-[1/1.4] w-32 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 transition-opacity ${selected ? '' : 'opacity-40'}`}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {loading && !thumbnail ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <p className="text-xs text-red-500 text-center">{error}</p>
            </div>
          ) : thumbnail ? (
            <>
              <img
                src={thumbnail}
                alt={caption || `Page ${position || pageNum}`}
                className="absolute inset-0 h-full w-full object-contain"
              />
              {/* Big number = position in the FINAL merged PDF (only for selected pages) */}
              {selected && position != null && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-emerald-700/90">
                    {position}
                  </span>
                </div>
              )}
              {/* Source caption strip (which file / source page this tile came from) */}
              {caption && (
                <div
                  className="absolute bottom-0 inset-x-0 px-1 py-0.5 text-center text-[9px] leading-tight truncate bg-white/80 dark:bg-gray-900/70 text-gray-600 dark:text-gray-300"
                  title={caption}
                >
                  {caption}
                </div>
              )}
            </>
          ) : null}
        </div>
      </button>

      {/* Drag handle circle */}
      <div
        {...dragHandleProps}
        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full
          shadow-sm transition-all duration-200 ease-in-out flex items-center justify-center
          z-10 cursor-grab active:cursor-grabbing
          bg-gray-400 dark:bg-gray-500 hover:bg-gray-500 dark:hover:bg-gray-400
          ${dragHandleProps['aria-pressed'] ? 'scale-95' : ''}`}
      >
        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these props change.
  // NOTE: `onClick` is intentionally NOT compared. It is passed as a fresh arrow
  // `() => togglePageSelected(p.uid)` each parent render, but togglePageSelected is
  // stable (useCallback []) and p.uid is fixed per tile — so the behaviour never
  // changes. Comparing it would bust this memo on every parent render.
  return (
    prevProps.cacheId === nextProps.cacheId &&
    prevProps.pageNum === nextProps.pageNum &&
    prevProps.selected === nextProps.selected &&
    prevProps.position === nextProps.position &&
    prevProps.caption === nextProps.caption &&
    prevProps.pdfFile === nextProps.pdfFile &&
    prevProps.dragHandleProps === nextProps.dragHandleProps
  );
});

/**
 * DragPreview Component
 *
 * A lightweight clone of a tile shown in the drag overlay while dragging.
 * Uses the cached thumbnail so it doesn't re-render the page during the drag.
 *
 * @param {Object} props
 * @param {string} props.thumbnail - The cached thumbnail data URL
 * @param {string} props.caption - Source caption
 * @param {number|null} props.position - Final-PDF position number (if selected)
 */
const DragPreview = memo(({ thumbnail, caption, position }) => {
  return (
    <div className="relative">
      <div className="relative p-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 shadow-xl">
        <div className="relative aspect-[1/1.4] w-32 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={caption || 'page'}
              className="absolute inset-0 h-full w-full object-contain"
            />
          )}
          {position != null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-emerald-700/90">
                {position}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

/**
 * SortablePagePreview Component
 *
 * Wraps PagePreview with dnd-kit sortable behaviour, keyed by the page's stable uid.
 */
const SortablePagePreview = ({ uid, pageNum, pdfFile, selected, position, caption, onClick, onThumbnailLoad }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: uid,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 999 : undefined,
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PagePreview
        cacheId={uid}
        pageNum={pageNum}
        pdfFile={pdfFile}
        selected={selected}
        position={position}
        caption={caption}
        onClick={onClick}
        dragHandleProps={{ ...attributes, ...listeners }}
        onThumbnailLoad={onThumbnailLoad}
      />
    </div>
  );
};

/**
 * PDFMerger Component
 *
 * Main component. Holds two pieces of state:
 * - `files`: the uploaded source files (for the file chips / remove buttons).
 * - `pages`: a SINGLE ordered list of page descriptors across ALL files. This list
 *   IS the merge order — reordering a tile reorders this array.
 *
 * @component
 */
const PDFMerger = () => {
  // Source files: { id, name, file, isImage, pageCount }
  const [files, setFiles] = useState([]);
  // Flat, ordered list of every page across every file. THIS is the merge order.
  // { uid, fileId, fileName, file, isImage, pageNum, selected }
  const [pages, setPages] = useState([]);
  // Cached thumbnails keyed by page uid (used by the drag overlay).
  const [thumbnailCache, setThumbnailCache] = useState({});
  // uid of the page currently being dragged (for the DragOverlay).
  const [activeId, setActiveId] = useState(null);

  const [merging, setMerging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleBoxClick = (event) => {
    // Don't trigger if clicking on a button (chips, tiles, handles handle themselves)
    if (event.target.closest('button')) {
      return;
    }
    fileInputRef.current?.click();
  };

  /**
   * Processes added files: validates type, reads PDF page counts, and APPENDS each
   * file's pages to the flat `pages` list (so new files land at the end of the order).
   * @param {FileList|File[]} incoming - The files to process
   */
  const processFiles = async (incoming) => {
    // Keep only the file types we can actually merge (PDF / JPG / PNG); ignore the rest.
    const acceptedFiles = Array.from(incoming).filter(file => ACCEPTED_FILE_TYPES.includes(file.type));

    const newFiles = [];
    const newPages = [];

    for (const file of acceptedFiles) {
      const isImage = file.type.startsWith('image/');
      // Unique per added file (name + timestamp + index within this batch).
      const fileId = `${file.name}-${Date.now()}-${newFiles.length}`;

      try {
        if (isImage) {
          // Images are always exactly one page — one tile, no pdf.js/pdf-lib needed here.
          console.log(`PDFMerger: added image "${file.name}" (${file.type})`);
          newFiles.push({ id: fileId, name: file.name, file, isImage: true, pageCount: 1 });
          newPages.push({
            uid: `${fileId}#1`, fileId, fileName: file.name, file,
            isImage: true, pageNum: 1, selected: true,
          });
        } else {
          // PDF: load with pdf-lib to read the real page count, then add one tile per page.
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(arrayBuffer);
          const pageCount = pdf.getPageCount();
          console.log(`PDFMerger: added PDF "${file.name}" (${pageCount} pages)`);

          newFiles.push({ id: fileId, name: file.name, file, isImage: false, pageCount });
          for (let i = 1; i <= pageCount; i++) {
            newPages.push({
              uid: `${fileId}#${i}`, fileId, fileName: file.name, file,
              isImage: false, pageNum: i, selected: true,
            });
          }
        }
      } catch (error) {
        console.error(`PDFMerger: error loading file "${file.name}":`, error);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setPages(prev => [...prev, ...newPages]);
  };

  /**
   * Handles file selection from the hidden <input>.
   */
  const handleFileSelect = async (event) => {
    const incoming = Array.from(event.target.files);
    await processFiles(incoming);

    // Reset the file input value so selecting the same file again still fires onChange.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragCounter(prev => prev + 1);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragCounter(prev => prev - 1);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragCounter(0);
    await processFiles(event.dataTransfer.files);
  };

  /**
   * Caches a page's thumbnail (keyed by uid) so the drag overlay can reuse it.
   */
  const handleThumbnailLoad = useCallback((uid, thumbnail) => {
    setThumbnailCache(prev => (prev[uid] === thumbnail ? prev : { ...prev, [uid]: thumbnail }));
  }, []);

  /**
   * Toggles whether a page is included in the merge.
   */
  const togglePageSelected = useCallback((uid) => {
    setPages(prev => prev.map(p => (p.uid === uid ? { ...p, selected: !p.selected } : p)));
  }, []);

  // --- Single sortable grid: drag any page anywhere -------------------------
  const handleGridDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleGridDragCancel = () => {
    setActiveId(null);
  };

  const handleGridDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setPages(prev => {
        const oldIndex = prev.findIndex(p => p.uid === active.id);
        const newIndex = prev.findIndex(p => p.uid === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  /**
   * Removes a whole file (and all of its pages) from the grid.
   */
  const removeFile = (fileId) => {
    setFiles(prev => {
      const next = prev.filter(f => f.id !== fileId);
      if (next.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return next;
    });
    setPages(prev => prev.filter(p => p.fileId !== fileId));
    // Prune this file's cached thumbnails (uids start with `${fileId}#`) so they
    // don't accumulate in memory across repeated add/remove cycles.
    setThumbnailCache(prev => {
      const next = {};
      for (const [uid, thumb] of Object.entries(prev)) {
        if (!uid.startsWith(`${fileId}#`)) next[uid] = thumb;
      }
      return next;
    });
  };

  /**
   * Clears everything.
   */
  const removeAllFiles = () => {
    setFiles([]);
    setPages([]);
    setThumbnailCache({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Merges the selected pages, in the grid's order, into one PDF and downloads it.
   * Iterates the flat `pages` list so pages from different files can be interleaved.
   * @returns {Promise<void>}
   */
  const mergePDFs = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 files (PDF, JPG or PNG) to merge.');
      return;
    }

    const orderedSelected = pages.filter(p => p.selected);
    if (orderedSelected.length === 0) {
      alert('No pages are selected. Click a page to include it in the merge.');
      return;
    }

    setMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();

      // Cache loaded source PDFs by fileId so a multi-page PDF is parsed only once,
      // even though its pages may now be interleaved with pages from other files.
      const pdfDocCache = {};

      for (const p of orderedSelected) {
        if (p.isImage) {
          // ---- IMAGE: embed onto a standard A4 page (fit + centered) -------------
          try {
            const imageBytes = await p.file.arrayBuffer();

            // Decode with the matching pdf-lib decoder for the format.
            const image = p.file.type === 'image/png'
              ? await mergedPdf.embedPng(imageBytes)
              : await mergedPdf.embedJpg(imageBytes);

            // Auto-orient the page so we waste the least space: landscape page for a
            // wide image, portrait page for a tall (or square) image.
            const isLandscape = image.width > image.height;
            const pageWidth = isLandscape ? A4_HEIGHT : A4_WIDTH;
            const pageHeight = isLandscape ? A4_WIDTH : A4_HEIGHT;

            const page = mergedPdf.addPage([pageWidth, pageHeight]);

            // Usable area after subtracting the margin on all four sides.
            const availableWidth = pageWidth - IMAGE_PAGE_MARGIN * 2;
            const availableHeight = pageHeight - IMAGE_PAGE_MARGIN * 2;

            // Scale to FIT inside the usable area while preserving aspect ratio.
            // Math.min picks the limiting dimension so the whole image always fits
            // (no cropping); the smaller dimension keeps its proportion.
            const scale = Math.min(
              availableWidth / image.width,
              availableHeight / image.height
            );
            const drawWidth = image.width * scale;
            const drawHeight = image.height * scale;

            // Center the scaled image on the page.
            const x = (pageWidth - drawWidth) / 2;
            const y = (pageHeight - drawHeight) / 2;

            page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
            console.log(`PDFMerger: embedded image "${p.fileName}" on a ${isLandscape ? 'landscape' : 'portrait'} A4 page`);
          } catch (error) {
            console.error(`PDFMerger: error embedding image "${p.fileName}":`, error);
            throw new Error(`Failed to add image ${p.fileName}. The file may be corrupted or in an unsupported format.`);
          }
        } else {
          // ---- PDF: copy this single source page --------------------------------
          try {
            // Load (and cache) the source document once.
            if (!pdfDocCache[p.fileId]) {
              const buf = await p.file.arrayBuffer();
              pdfDocCache[p.fileId] = await PDFDocument.load(buf);
            }
            const srcDoc = pdfDocCache[p.fileId];

            // Copy the one page (0-based index) and append it in grid order.
            const [copied] = await mergedPdf.copyPages(srcDoc, [p.pageNum - 1]);
            mergedPdf.addPage(copied);
            console.log(`PDFMerger: added "${p.fileName}" page ${p.pageNum}`);
          } catch (error) {
            console.error(`PDFMerger: error copying "${p.fileName}" page ${p.pageNum}:`, error);
            throw new Error(`Failed to copy page ${p.pageNum} from ${p.fileName}. Please ensure the file is not corrupted.`);
          }
        }
      }

      // Safety net: should never happen given the checks above.
      if (mergedPdf.getPageCount() === 0) {
        throw new Error('No pages were selected to merge. Please select at least one page.');
      }

      const mergedPdfFile = await mergedPdf.save();

      // Create blob and download
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error merging files:', error);
      alert(error.message || 'Error merging files. Please try again.');
    } finally {
      setMerging(false);
    }
  };

  // Compute each page's display fields for this render:
  // - `position`: its page number in the final PDF (only selected pages are counted)
  // - `caption`: a short source label
  let outputPos = 0;
  const renderPages = pages.map((p) => ({
    ...p,
    position: p.selected ? ++outputPos : null,
    caption: p.isImage ? p.fileName : `${p.fileName} · p${p.pageNum}`,
  }));
  const selectedCount = outputPos; // total selected pages = final page count
  const activePage = activeId ? renderPages.find(p => p.uid === activeId) : null;

  return (
    <PageWrapper>
      <SEO routeKey="/tools/pdf-merger" />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            PDF Merger
          </h1>
          <div className="flex space-x-4">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
              Select Files
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            {files.length > 0 && (
              <button
                onClick={removeAllFiles}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete All
              </button>
            )}
            <button
              onClick={mergePDFs}
              disabled={files.length < 2 || selectedCount === 0 || merging}
              className={`px-4 py-2 rounded-lg transition-colors ${files.length < 2 || selectedCount === 0 || merging
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                } text-white`}
            >
              {merging ? 'Merging...' : 'Merge Files'}
            </button>
          </div>
        </div>

        <div
          ref={dropZoneRef}
          onClick={handleBoxClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative transition-all duration-200 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer ${dragCounter > 0 ? 'ring-2 ring-blue-500 ring-opacity-100 border-blue-500 dark:border-blue-500' : 'ring-0 ring-opacity-0'
            }`}
        >
          {dragCounter > 0 && (
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center pointer-events-none z-20">
              <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                Drop PDF or image files here
              </div>
            </div>
          )}

          {pages.length === 0 ? (
            <div className="text-center py-8 space-y-2">
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
              <p className="text-gray-500 dark:text-gray-400">
                Select or drag & drop PDF, JPG or PNG files to merge.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Click anywhere in this box or use the "Select Files" button
              </p>
            </div>
          ) : (
            // Stop clicks inside the arrange area from re-opening the file picker.
            <div onClick={(e) => e.stopPropagation()}>
              {/* Header: counts + how-to hint */}
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Arrange pages
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCount} of {pages.length} pages · {files.length} files
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Drag any page (handle below it) to set the final order — even across files.
                Click a page to include or exclude it.
              </p>

              {/* File chips with per-file remove */}
              <div className="flex flex-wrap gap-2 mb-4">
                {files.map(f => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <span className="font-semibold text-[10px] text-gray-500 dark:text-gray-400">
                      {f.isImage ? 'IMG' : 'PDF'}
                    </span>
                    <span className="truncate max-w-[10rem]" title={f.name}>{f.name}</span>
                    <span className="text-gray-400 dark:text-gray-500">
                      ({f.pageCount} {f.pageCount === 1 ? 'pg' : 'pgs'})
                    </span>
                    <button
                      onClick={() => removeFile(f.id)}
                      className="ml-0.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      title={`Remove ${f.name}`}
                      aria-label={`Remove ${f.name}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>

              {/* Single unified page grid */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleGridDragStart}
                onDragEnd={handleGridDragEnd}
                onDragCancel={handleGridDragCancel}
              >
                <SortableContext
                  items={renderPages.map(p => p.uid)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-6 justify-items-center mx-auto">
                    {renderPages.map(p => (
                      <SortablePagePreview
                        key={p.uid}
                        uid={p.uid}
                        pageNum={p.pageNum}
                        pdfFile={p.file}
                        selected={p.selected}
                        position={p.position}
                        caption={p.caption}
                        onClick={() => togglePageSelected(p.uid)}
                        onThumbnailLoad={handleThumbnailLoad}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay dropAnimation={dropAnimation}>
                  {activePage ? (
                    <DragPreview
                      thumbnail={thumbnailCache[activePage.uid]}
                      caption={activePage.caption}
                      position={activePage.position}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Instructions
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Add PDF or image files (PDF, JPG, PNG) in one of these ways:
              <ul className="list-none pl-6 pt-1 space-y-1">
                <li>• Click the "Select Files" button</li>
                <li>• Click anywhere in the dashed box above</li>
                <li>• Drag & drop files from your computer into the box</li>
              </ul>
            </li>
            <li>Every page of every file appears as a tile in one grid</li>
            <li>Drag any page (using the handle below it) to set the final order — you can move an image in between PDF pages</li>
            <li>Click a page to include/exclude it (faded = excluded). The big number is its page number in the final PDF</li>
            <li>Each JPG/PNG is added as a single page, fitted onto an A4 page</li>
            <li>Remove a whole file with the ✕ on its name chip, or use "Delete All"</li>
            <li>Click "Merge Files" to download the combined PDF</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PDFMerger;
