import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Contact = () => {
  return (
    <PageWrapper>
      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Contact</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Contact Information</h3>
            <div className="space-y-2 dark:text-gray-300">
              <p><strong className="dark:text-gray-100">Phone:</strong> 96635 88865</p>
              <p><strong className="dark:text-gray-100">Email:</strong> srinidhibs@outlook.com</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Contact;