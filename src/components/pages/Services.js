import React from 'react';
import PageWrapper from '../layout/PageWrapper';

const Services = () => {
  return (
    <PageWrapper>
      <div>
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Our Services</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <ul className="space-y-6">
            <li>
              <b className="text-lg dark:text-gray-100">Accounting and Bookkeeping:</b>
              <ul className="list-disc ml-6 mt-2 space-y-1 dark:text-gray-300">
                <li>Preparation of Sales Invoices in confirmation to the GST rules</li>
                <li>Ongoing accounting of all cash and bank incomes and expenses</li>
                <li>Passing of monthly/yearly provisional/adjustment entries</li>
                <li>Passing of GST, PF, PT and TDS entries</li>
                <li>Preparation of financial statements</li>
                <li>Preparation of management reports</li>
              </ul>
            </li>
            <hr className="my-4 dark:border-gray-600"/>
            <li>
              <b className="text-lg dark:text-gray-100">Registrations:</b>
              <ul className="list-disc ml-6 mt-2 space-y-1 dark:text-gray-300">
                <li>Partnership Registration, Company and LLP Incorporation</li>
                <li>GST Registration</li>
                <li>Shops & Establishments Registration</li>
                <li>PF, ESI, PT and LWF Registration</li>
                <li>Trade and Food Licenses</li>
                <li>PAN and TAN Applications</li>
              </ul>
            </li>
            <hr className="my-4 dark:border-gray-600"/>
            <li>
              <b className="text-lg dark:text-gray-100">GST Compliances:</b>
              <ul className="list-disc ml-6 mt-2 space-y-1 dark:text-gray-300">
                <li>Consulting on the GST Act, Rules, Rates, and HSN Codes</li>
                <li>Monthly/Quarterly Sales and Summary Returns and Payment</li>
                <li>Annual Return</li>
              </ul>
            </li>
            <hr className="my-4 dark:border-gray-600"/>
            <li>
              <b className="text-lg dark:text-gray-100">Income Tax Compliances:</b>
              <ul className="list-disc ml-6 mt-2 space-y-1 dark:text-gray-300">
                <li>Consulting on the Income Tax Act and Rules</li>
                <li>Annual Income Tax Filing</li>
                <li>TDS Payments and Returns</li>
              </ul>
            </li>
            <hr className="my-4 dark:border-gray-600"/>
            <li>
              <b className="text-lg dark:text-gray-100">Labour Law Compliances:</b>
              <ul className="list-disc ml-6 mt-2 space-y-1 dark:text-gray-300">
                <li>PF, ESI, PT and LWF Computation, Payment and filing Monthly Returns</li>
                <li>Shops and Establishments Act Compliances</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Services;