import React from 'react';

const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative">
        {/* Dot pattern overlay - only visible in light mode */}
        <div className="absolute inset-0 dark:hidden">
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: `radial-gradient(#94A3B8 1.5px, transparent 1.5px)`,
                 backgroundSize: '20px 20px',
                 opacity: 0.5
               }}>
          </div>
        </div>
        
        {/* Content container */}
        <div className="relative container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageWrapper;
