/**
 * PDF Merger Component
 * 
 * Advanced PDF manipulation tool that enables:
 * - Multiple PDF file merging
 * - Page reordering via drag & drop
 * - Page selection and deletion
 * - Page preview with thumbnails
 * 
 * Features:
 * - Drag and drop file upload
 * - Interactive page thumbnails
 * - Real-time page reordering
 * - Page selection state
 * - Dark mode support
 * 
 * Technical Implementation:
 * - Uses pdf-lib for PDF manipulation
 * - Uses pdfjs-dist for page previews
 * - Uses @dnd-kit for drag and drop
 * - Implements thumbnail caching
 * - Optimizes render performance
 * 
 * @component
 * @example
 * return (
 *   <PDFMerger />
 * )
 */

/**
 * PDF Merger Component
 * 
 * A React component that allows users to:
 * - Upload multiple PDF files
 * - Preview PDF pages
 * - Select specific pages from each PDF
 * - Reorder pages using drag and drop
 * - Merge selected pages into a new PDF
 * 
 * Features:
 * - Drag and drop page reordering
 * - Page selection with visual feedback
 * - Dark mode support
 * - Responsive design
 * - PDF preview caching for performance
 */

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import { CheckIcon } from '@heroicons/react/24/solid';
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
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PageWrapper from '../../../components/layout/PageWrapper';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/static/js/pdf.worker.min.js';

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
 * Renders a preview of a single PDF page with:
 * - Page thumbnail
 * - Page number overlay
 * - Selection state
 * - Loading state
 * - Error handling
 * 
 * @param {Object} props
 * @param {number} props.pageNum - The page number to display
 * @param {File} props.pdfFile - The PDF file object
 * @param {boolean} props.selected - Whether the page is selected
 * @param {Function} props.onClick - Click handler for page selection
 * @param {Object} props.dragHandleProps - Props for the drag handle
 * @param {Function} props.onThumbnailLoad - Callback when thumbnail is generated
 */
const PagePreview = memo(({ pageNum, pdfFile, selected, onClick, dragHandleProps = {}, onThumbnailLoad }) => {
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

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      if (thumbnail || !pdfFile || !canvasRef.current) return;

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

        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const context = canvas.getContext('2d', { alpha: false });
        if (!context || cancelled) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        if (cancelled) return;

        const dataUrl = canvas.toDataURL();

        // Clean up
        canvas.width = 0;
        canvas.height = 0;

        if (isMountedRef.current && !cancelled) {
          setThumbnail(dataUrl);
          setLoading(false);
          if (onThumbnailLoad) {
            onThumbnailLoad(pageNum, dataUrl);
          }
        }
      } catch (err) {
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
    };
    // Excluding thumbnail from deps as it's used as a cached value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pdfFile, onThumbnailLoad]);

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
        <div className="relative aspect-[1/1.4] w-32 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
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
                alt={`Page ${pageNum}`}
                className="absolute inset-0 h-full w-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-6xl font-bold ${selected
                  ? 'text-emerald-700/90'
                  : 'text-gray-700/90'
                  }`}>
                  {pageNum}
                </span>
              </div>
            </>
          ) : null}

          {/* <div className={`absolute bottom-0 inset-x-0 p-1 text-center text-xs
            ${selected
              ? 'text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/50'
              : 'text-gray-600 dark:text-gray-300 bg-gray-50/90 dark:bg-gray-800/90'
            }`}
          >
            Page {pageNum}
          </div> */}
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
  // Only re-render if these props change
  return (
    prevProps.pageNum === nextProps.pageNum &&
    prevProps.selected === nextProps.selected &&
    prevProps.pdfFile === nextProps.pdfFile &&
    prevProps.dragHandleProps === nextProps.dragHandleProps
  );
});

/**
 * DragPreview Component
 * 
 * A lightweight version of PagePreview used during drag operations.
 * Uses cached thumbnails to prevent re-rendering during drag.
 * 
 * @param {Object} props
 * @param {number} props.pageNum - The page number
 * @param {string} props.thumbnail - The cached thumbnail data URL
 * @param {boolean} props.selected - Whether the page is selected
 */
const DragPreview = memo(({ pageNum, thumbnail, selected }) => {
  return (
    <div className="relative">
      <div className={`relative group p-1 rounded-lg transition-all ${selected
        ? 'bg-emerald-50 dark:bg-emerald-900/30'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}>
        <div className="relative aspect-[1/1.4] w-32 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
          <img
            src={thumbnail}
            alt={`Page ${pageNum}`}
            className="absolute inset-0 h-full w-full object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-6xl font-bold ${selected
              ? 'text-emerald-700/90'
              : 'text-gray-700/90'
              }`}>
              {pageNum}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * SortablePagePreview Component
 * 
 * Wraps PagePreview with drag-and-drop functionality using dnd-kit.
 * 
 * @param {Object} props
 * @param {number} props.id - Unique identifier for the sortable item
 * @param {number} props.pageNum - The page number
 * @param {File} props.pdfFile - The PDF file
 * @param {boolean} props.selected - Selection state
 * @param {Function} props.onClick - Click handler
 * @param {Function} props.onThumbnailLoad - Thumbnail load callback
 */
const SortablePagePreview = ({ id, pageNum, pdfFile, selected, onClick, onThumbnailLoad }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: pageNum,
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
        pageNum={pageNum}
        pdfFile={pdfFile}
        selected={selected}
        onClick={onClick}
        dragHandleProps={{ ...attributes, ...listeners }}
        onThumbnailLoad={onThumbnailLoad}
      />
    </div>
  );
};

/**
 * SortableItem Component
 * 
 * Manages a collection of PDF pages with:
 * - Page selection
 * - Page reordering
 * - Thumbnail caching
 * - Drag and drop functionality
 * 
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the PDF file
 * @param {string} props.name - Display name of the PDF
 * @param {number} props.index - Index in the list of PDFs
 * @param {number} props.pageCount - Total number of pages
 * @param {number[]} props.selectedPages - Array of selected page numbers
 * @param {Function} props.onRemove - Callback to remove the PDF
 * @param {Function} props.onPageSelectionChange - Callback when page selection changes
 * @param {Function} props.onPagesReorder - Callback when pages are reordered
 * @param {File} props.file - The PDF file object
 */
const SortableItem = ({ id, name, index, pageCount, selectedPages, onRemove, onPageSelectionChange, onPagesReorder, file }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: index + 1
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    position: 'relative',
    zIndex: isDragging ? 999 : undefined
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState(() => Array.from({ length: pageCount }, (_, i) => i + 1));
  const [thumbnailCache, setThumbnailCache] = useState({});

  const handleThumbnailLoad = useCallback((pageNum, thumbnail) => {
    setThumbnailCache(prev => ({
      ...prev,
      [pageNum]: thumbnail
    }));
  }, []);

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

  /**
   * Handles the start of a drag operation
   * @param {Object} event - The drag start event
   */
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  /**
   * Handles the end of a drag operation
   * Updates the page order and selection state
   * @param {Object} event - The drag end event
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id && over) {
      setItems(prevItems => {
        const oldIndex = prevItems.indexOf(active.id);
        const newIndex = prevItems.indexOf(over.id);

        const newItems = arrayMove(prevItems, oldIndex, newIndex);

        // Update selected pages based on the new order
        const newSelectedPages = selectedPages.map(pageNum => {
          const oldPosition = prevItems.indexOf(pageNum);
          return newItems[oldPosition];
        });

        onPageSelectionChange(id, newSelectedPages);
        return newItems;
      });
    }
  };

  /**
   * Handles drag cancellation
   */
  const handleDragCancel = () => {
    setActiveId(null);
  };

  /**
   * Toggles selection of all pages
   */
  const toggleAllPages = () => {
    const newSelection = selectedPages.length === pageCount
      ? []
      : Array.from({ length: pageCount }, (_, i) => i + 1);
    onPageSelectionChange(id, newSelection);
  };

  /**
   * Toggles selection of a single page
   * @param {number} pageNum - The page number to toggle
   */
  const togglePageSelection = (pageNum) => {
    const newSelection = selectedPages.includes(pageNum)
      ? selectedPages.filter(p => p !== pageNum)
      : [...selectedPages, pageNum].sort((a, b) => a - b);
    onPageSelectionChange(id, newSelection);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border transition-all overflow-hidden
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md`}
    >
      {/* File header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3 flex-grow">
          <span className="text-gray-500 dark:text-gray-400 select-none">
            {index + 1}.
          </span>
          <span className="text-gray-800 dark:text-white truncate flex-grow">
            {name}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {selectedPages.length} of {pageCount} pages
          </span>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2"
          >
            <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            {...attributes}
            {...listeners}
            className="text-gray-400 dark:text-gray-500 cursor-move px-2 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 1 0 0 4 2 2 0 1 0 0-4zM16 6a2 2 0 1 0 0 4 2 2 0 1 0 0-4zM8 14a2 2 0 1 0 0 4 2 2 0 1 0 0-4zM16 14a2 2 0 1 0 0 4 2 2 0 1 0 0-4z" />
            </svg>
          </div>
          <button
            onClick={() => onRemove(id)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleAllPages}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                ${selectedPages.length === pageCount
                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {selectedPages.length === pageCount ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedPages.length} pages selected
            </span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={items}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 justify-items-center mx-auto">
                {items.map(pageNum => (
                  <SortablePagePreview
                    key={pageNum}
                    id={pageNum}
                    pageNum={pageNum}
                    pdfFile={file}
                    selected={selectedPages.includes(pageNum)}
                    onClick={() => togglePageSelection(pageNum)}
                    onThumbnailLoad={handleThumbnailLoad}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeId && thumbnailCache[activeId] ? (
                <DragPreview
                  pageNum={activeId}
                  thumbnail={thumbnailCache[activeId]}
                  selected={selectedPages.includes(activeId)}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
};

/**
 * PDFMerger Component
 * 
 * Main component that handles:
 * - PDF file selection
 * - Page management
 * - PDF merging
 * - Error handling
 * 
 * @component
 */
const PDFMerger = () => {
  useEffect(() => {
    // PDF.js is already configured at the top of the file
  }, []);

  const [selectedFiles, setSelectedFiles] = useState([]);
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
    // Don't trigger if clicking on a file item or button
    if (event.target.closest('.file-item') || event.target.closest('button')) {
      return;
    }
    fileInputRef.current?.click();
  };

  /**
   * Processes the dropped files
   * @param {FileList|File[]} files - The files to process
   */
  const processFiles = async (files) => {
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');

    const newFiles = [];
    for (const file of pdfFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();

        newFiles.push({
          id: `${file.name}-${Date.now()}-${newFiles.length}`,
          name: file.name,
          file: file,
          pageCount,
          selectedPages: Array.from({ length: pageCount }, (_, i) => i + 1)
        });
      } catch (error) {
        console.error(`Error loading PDF ${file.name}:`, error);
      }
    }

    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  /**
   * Handles file selection from input
   * @param {Object} event - The file selection event
   */
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    await processFiles(files);

    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handles drag enter event
   * @param {Object} event - The drag enter event
   */
  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragCounter(prev => prev + 1);
  };

  /**
   * Handles drag leave event
   * @param {Object} event - The drag leave event
   */
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragCounter(prev => prev - 1);
  };

  /**
   * Handles drag over event
   * @param {Object} event - The drag over event
   */
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  };

  /**
   * Handles drop event
   * @param {Object} event - The drop event
   */
  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragCounter(0);

    const files = event.dataTransfer.files;
    await processFiles(files);
  };

  /**
   * Handles page reordering
   * @param {string} fileId - The ID of the PDF file
   * @param {number} oldIndex - The old index of the page
   * @param {number} newIndex - The new index of the page
   */
  const handlePagesReorder = (fileId, oldIndex, newIndex) => {
    setSelectedFiles(prevFiles => {
      return prevFiles.map(file => {
        if (file.id === fileId) {
          // Create a new array with all page numbers
          const pages = Array.from({ length: file.pageCount }, (_, i) => i + 1);
          // Move the page from old index to new index
          const newPages = arrayMove(pages, oldIndex, newIndex);
          // Map selected pages to their new positions
          const newSelectedPages = file.selectedPages.map(pageNum => {
            const oldPosition = pages.indexOf(pageNum);
            return newPages[oldPosition];
          });
          return { ...file, selectedPages: newSelectedPages };
        }
        return file;
      });
    });
  };

  /**
   * Handles the end of a drag operation
   * Updates the file order
   * @param {Object} event - The drag end event
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      const oldIndex = active.id - 1;
      const newIndex = over.id - 1;
      setSelectedFiles((items) => {
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  /**
   * Handles page selection changes
   * @param {string} fileId - The ID of the PDF file
   * @param {number[]} newSelectedPages - The new selected pages
   */
  const handlePageSelectionChange = (fileId, newSelectedPages) => {
    setSelectedFiles(prevFiles => {
      return prevFiles.map(file => {
        if (file.id === fileId) {
          return { ...file, selectedPages: newSelectedPages };
        }
        return file;
      });
    });
  };

  /**
   * Removes a PDF file
   * @param {string} fileId - The ID of the PDF file
   */
  const removeFile = (fileId) => {
    setSelectedFiles(files => {
      const newFiles = files.filter(file => file.id !== fileId);
      // Reset file input if all files are removed
      if (newFiles.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return newFiles;
    });
  };

  /**
   * Removes all PDF files
   */
  const removeAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Merges selected PDF files
   * @returns {Promise<void>}
   * @throws {Error} If no files are selected or merging fails
   */
  const mergePDFs = async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }

    setMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileObj of selectedFiles) {
        if (fileObj.selectedPages.length === 0) {
          continue; // Skip files with no pages selected
        }

        const fileArrayBuffer = await fileObj.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileArrayBuffer);

        // Convert 1-based page numbers to 0-based indices
        const pageIndices = fileObj.selectedPages.map(pageNum => pageNum - 1);

        try {
          const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (error) {
          console.error(`Error copying pages from ${fileObj.name}:`, error);
          throw new Error(`Failed to copy pages from ${fileObj.name}. Please ensure the file is not corrupted.`);
        }
      }

      // Check if any pages were added
      if (mergedPdf.getPageCount() === 0) {
        throw new Error('No pages were selected to merge. Please select at least one page from each PDF.');
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
      console.error('Error merging PDFs:', error);
      alert(error.message || 'Error merging PDFs. Please try again.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            PDF Merger
          </h1>
          <div className="flex space-x-4">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
              Select PDFs
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            {selectedFiles.length > 0 && (
              <button
                onClick={removeAllFiles}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete All
              </button>
            )}
            <button
              onClick={mergePDFs}
              disabled={selectedFiles.length < 2 || merging}
              className={`px-4 py-2 rounded-lg transition-colors ${selectedFiles.length < 2 || merging
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                } text-white`}
            >
              {merging ? 'Merging...' : 'Merge PDFs'}
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
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center pointer-events-none">
              <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                Drop PDF files here
              </div>
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Selected Files {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </h2>

          {selectedFiles.length === 0 ? (
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
                Select or drag & drop PDF files to merge. You can reorder them by dragging.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Click anywhere in this box or use the "Select PDFs" button
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedFiles.map((_, index) => index + 1)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <SortableItem
                      key={file.id}
                      id={file.id}
                      name={file.name}
                      index={index}
                      pageCount={file.pageCount}
                      selectedPages={file.selectedPages}
                      onRemove={removeFile}
                      onPageSelectionChange={handlePageSelectionChange}
                      onPagesReorder={handlePagesReorder}
                      file={file.file}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Instructions
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Add PDF files in one of these ways:
              <ul className="list-none pl-6 pt-1 space-y-1">
                <li>• Click the "Select PDFs" button</li>
                <li>• Click anywhere in the dashed box above</li>
                <li>• Drag & drop files from your computer into the box</li>
              </ul>
            </li>
            <li>Drag and drop files to reorder them as needed (use the drag handle on the right)</li>
            <li>Click on a file to select specific pages to merge</li>
            <li>Click "Merge PDFs" to combine files in the specified order</li>
            <li>The merged PDF will automatically download to your computer</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PDFMerger;
