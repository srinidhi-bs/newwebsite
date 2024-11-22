import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Blog = () => {
  return (
    <PageWrapper>
      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Blog</h2>
        <p className="mb-4 dark:text-gray-300">Latest blog posts and articles.</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder for blog posts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-300">Stay tuned for upcoming blog posts about finance, technology, and more!</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Blog;