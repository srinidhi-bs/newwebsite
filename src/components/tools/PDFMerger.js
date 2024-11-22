import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import PageWrapper from '../layout/PageWrapper';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, name, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-lg border transition-all
        ${isDragging 
          ? 'bg-gray-50 dark:bg-gray-700 border-blue-500 shadow-lg' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:shadow-md'
        }`}
    >
      <div className="flex items-center space-x-3 flex-grow">
        <span className="text-gray-500 dark:text-gray-400 select-none">
          {index + 1}.
        </span>
        <span className="text-gray-800 dark:text-white truncate">
          {name}
        </span>
      </div>
      <div className="flex items-center space-x-4 flex-shrink-0">
        <div 
          {...attributes}
          {...listeners}
          className="text-gray-400 dark:text-gray-500 cursor-move px-2 hover:text-gray-600 dark:hover:text-gray-300 select-none"
          aria-label="Drag handle"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2"
          aria-label="Remove file"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const PDFMerger = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [merging, setMerging] = useState(false);
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    setSelectedFiles(prevFiles => [
      ...prevFiles,
      ...pdfFiles.map((file, index) => ({
        id: `${file.name}-${Date.now()}-${index}`,
        name: file.name,
        file: file
      }))
    ]);

    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedFiles((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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

  const removeAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const mergePDFs = async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }

    setMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileObj of selectedFiles) {
        const fileArrayBuffer = await fileObj.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileArrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
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
      alert('Error merging PDFs. Please try again.');
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
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedFiles.length < 2 || merging
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 cursor-pointer'
              } text-white`}
            >
              {merging ? 'Merging...' : 'Merge PDFs'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Selected Files {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </h2>
          
          {selectedFiles.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Select PDF files to merge. You can reorder them by dragging.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedFiles.map(file => file.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <SortableItem
                      key={file.id}
                      id={file.id}
                      name={file.name}
                      index={index}
                      onRemove={removeFile}
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
            <li>Click "Select PDFs" to choose two or more PDF files</li>
            <li>Drag and drop files to reorder them as needed (use the drag handle on the right)</li>
            <li>Click "Merge PDFs" to combine files in the specified order</li>
            <li>The merged PDF will automatically download to your computer</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PDFMerger;
