import React from 'react';

const PageWrapper = ({ children }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  );
};

export default PageWrapper;
