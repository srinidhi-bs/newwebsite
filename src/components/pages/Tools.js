import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Tools = ({ setCurrentPage }) => {
  const handleToolClick = (tool) => {
    setCurrentPage(tool);
  };

  return (
    <PageWrapper>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Tools
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* PDF Merger Tool */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleToolClick('pdf-merger')}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                PDF Merger
              </h2>
              <svg 
                className="w-6 h-6 text-gray-600 dark:text-gray-300" 
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
        </div>
      </div>
    </PageWrapper>
  );
};

export default Tools;
