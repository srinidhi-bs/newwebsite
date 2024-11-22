import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Contact = () => {
  return (
    <PageWrapper>
      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Contact Us</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Contact Information</h3>
              <div className="space-y-2 dark:text-gray-300">
                <p><strong className="dark:text-gray-100">Phone:</strong> 96635 88865</p>
                <p><strong className="dark:text-gray-100">Email:</strong> srinidhibs@outlook.com</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Office Hours</h3>
              <div className="space-y-2 dark:text-gray-300">
                <p><strong className="dark:text-gray-100">Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
                <p><strong className="dark:text-gray-100">Saturday:</strong> 9:00 AM - 2:00 PM</p>
                <p><strong className="dark:text-gray-100">Sunday:</strong> Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Contact;