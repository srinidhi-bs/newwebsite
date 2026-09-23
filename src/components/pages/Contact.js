/**
 * Contact Page Component
 * 
 * Contact information and form including:
 * - Contact form
 * - Social media links
 * - Professional profiles
 * - Email contact
 * 
 * Features:
 * - Form validation
 * - Success feedback
 * - Error handling
 * - Social links
 * - Dark mode support
 */

import React from 'react';
import PageWrapper from '../layout/PageWrapper';
import SEO from '../common/SEO';
import SectionHeader from '../common/SectionHeader';

const Contact = () => {
  return (
    <PageWrapper>
      <SEO routeKey="/contact" />
      {/* Magazine-voice header — same voice as the other section pages */}
      <SectionHeader kicker="Contact · Say hello" title="Contact" accent="text-accent-cta" />
      <div className="card-skin p-6">
        <div className="mb-6">
          <h3 className="display-skin text-lg leading-tight text-ink mb-3">Get in Touch</h3>
          <p className="text-ink-muted mb-4">
            Have questions or want to connect? Feel free to reach out:
          </p>
          <ul className="space-y-3 text-ink-muted">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3 shrink-0 text-accent-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email: <a href="mailto:srinidhibs@outlook.com" className="font-bold text-ink underline decoration-2 underline-offset-4 decoration-accent-cta hover:text-accent-cta">srinidhibs@outlook.com</a></span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-3 shrink-0 text-accent-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Mobile: <a href="tel:+919663588865" className="font-bold text-ink underline decoration-2 underline-offset-4 decoration-accent-cta hover:text-accent-cta">+91 96635 88865</a></span>
            </li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Contact;