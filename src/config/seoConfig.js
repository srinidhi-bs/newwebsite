/**
 * seoConfig.js
 *
 * Centralized SEO metadata for every route on srinidhibs.com.
 *
 * Each route key maps to an object containing:
 *   - title:       Browser tab title + OG/Twitter title
 *   - description: Meta description + OG/Twitter description (120-155 chars for Google snippets)
 *   - canonical:   Full canonical URL (auto-generated from route key if omitted)
 *   - ogType:      Open Graph type (defaults to 'website')
 *   - ogImage:     OG image URL (defaults to logo512.png)
 *   - jsonLd:      Optional JSON-LD structured data object for rich snippets
 *
 * Usage:
 *   import { seoConfig, defaults } from '../config/seoConfig';
 *   const pageData = seoConfig['/tools/pdf-merger'];
 *
 * Adding a new page:
 *   1. Add a new entry keyed by the route path
 *   2. Fill in title, description, canonical, and optionally jsonLd
 *   3. Use <SEO routeKey="/your/route" /> in the page component
 */

// ─── Constants ──────────────────────────────────────────────────────────────────
const SITE_URL = 'https://www.srinidhibs.com';
const SITE_NAME = 'Srinidhi BS';
const DEFAULT_IMAGE = `${SITE_URL}/logo512.png`;

/**
 * Default values used when a page key is missing or a field is undefined.
 * The SEO component falls back to these if a route isn't found in the config.
 */
export const defaults = {
  title: `${SITE_NAME} — Finance, Tech & Trading`,
  description: 'Free PDF tools, financial calculators, and market insights from an accountant who codes.',
  siteUrl: SITE_URL,
  siteName: SITE_NAME,
  ogImage: DEFAULT_IMAGE,
};

/**
 * Per-route SEO configuration.
 * Keys must match the route paths defined in AnimatedRoutes.js.
 */
export const seoConfig = {

  // ─── 1. Home ──────────────────────────────────────────────────────────────────
  '/': {
    title: `${SITE_NAME} — Finance, Tech & Trading`,
    description: 'Srinidhi BS — Accountant, tax consultant and tech enthusiast. Explore free PDF tools, financial calculators, and market insights.',
    canonical: `${SITE_URL}/`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: 'Personal website of Srinidhi BS — Accountant, tax consultant, stock trader and tech enthusiast.',
      author: {
        '@type': 'Person',
        name: 'Srinidhi BS',
        jobTitle: 'Accountant & Tax Consultant',
        url: `${SITE_URL}/`,
      },
    },
  },

  // ─── 2. Finance Hub ───────────────────────────────────────────────────────────
  '/finance': {
    title: `Finance Tools | ${SITE_NAME}`,
    description: 'Free financial calculators for EMI, income tax, HRA, and more. Plan your finances with easy-to-use tools by Srinidhi BS.',
    canonical: `${SITE_URL}/finance`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Finance Tools',
      url: `${SITE_URL}/finance`,
      description: 'Collection of free financial calculators including EMI and income tax calculators.',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
  },

  // ─── 3. EMI Calculator ────────────────────────────────────────────────────────
  '/finance/emi-calculator': {
    title: `EMI Calculator — Loan EMI & Amortization | ${SITE_NAME}`,
    description: 'Calculate your monthly loan EMI, total interest, and view a full amortization schedule. Free online EMI calculator for home, car, and personal loans.',
    canonical: `${SITE_URL}/finance/emi-calculator`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'EMI Calculator',
      url: `${SITE_URL}/finance/emi-calculator`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Calculate monthly loan EMI, total interest payable, and view amortization schedule.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 4. Income Tax Calculator ─────────────────────────────────────────────────
  '/finance/income-tax-calculator': {
    title: `Income Tax Calculator — Old & New Regime | ${SITE_NAME}`,
    description: 'Compare old and new income tax regimes for FY 2025-26. Calculate tax liability, deductions, and find which regime saves you more.',
    canonical: `${SITE_URL}/finance/income-tax-calculator`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Income Tax Calculator',
      url: `${SITE_URL}/finance/income-tax-calculator`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Compare old and new income tax regimes for Indian taxpayers. Calculate tax liability with slab breakdown.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 5. Trading & Markets ─────────────────────────────────────────────────────
  '/trading': {
    title: `Trading & Markets | ${SITE_NAME}`,
    description: 'Insights on stock trading, fundamental analysis, technical analysis, and investment philosophy by Srinidhi BS.',
    canonical: `${SITE_URL}/trading`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Trading & Markets',
      url: `${SITE_URL}/trading`,
      description: 'Stock trading insights covering fundamental analysis, technical analysis, and investment philosophy.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 6. Tools Hub ─────────────────────────────────────────────────────────────
  '/tools': {
    title: `Free Online Tools — PDF, Image & More | ${SITE_NAME}`,
    description: 'Free browser-based tools: merge, split, convert, resize, lock, and unlock PDFs. No upload to servers — 100% client-side processing.',
    canonical: `${SITE_URL}/tools`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Free Online Tools',
      url: `${SITE_URL}/tools`,
      description: 'Collection of free browser-based PDF and image tools. All processing happens locally in your browser.',
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    },
  },

  // ─── 7. PDF Merger ────────────────────────────────────────────────────────────
  '/tools/pdf-merger': {
    title: `PDF Merger — Combine PDF Files Online Free | ${SITE_NAME}`,
    description: 'Merge multiple PDF files into one. Drag and drop, reorder pages, and download — free and private. No files uploaded to any server.',
    canonical: `${SITE_URL}/tools/pdf-merger`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PDF Merger',
      url: `${SITE_URL}/tools/pdf-merger`,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Merge multiple PDF files into one document. Drag-and-drop interface with page reordering.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 8. PDF Splitter ──────────────────────────────────────────────────────────
  '/tools/pdf-splitter': {
    title: `PDF Splitter — Extract Pages from PDF Online | ${SITE_NAME}`,
    description: 'Split a PDF into multiple files by page ranges. Select pages visually and download as individual PDFs or a ZIP — free and private.',
    canonical: `${SITE_URL}/tools/pdf-splitter`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PDF Splitter',
      url: `${SITE_URL}/tools/pdf-splitter`,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Split PDF files by page ranges. Extract specific pages into new PDF documents.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 9. PDF to JPG ────────────────────────────────────────────────────────────
  '/tools/pdf-to-jpg': {
    title: `PDF to JPG — Convert PDF Pages to Images | ${SITE_NAME}`,
    description: 'Convert each page of a PDF to high-quality JPG or PNG images. Download individually or as a ZIP — free, fast, and private.',
    canonical: `${SITE_URL}/tools/pdf-to-jpg`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PDF to JPG Converter',
      url: `${SITE_URL}/tools/pdf-to-jpg`,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Convert PDF pages to high-quality JPG or PNG images. Process files locally in your browser.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 10. JPG to PDF ───────────────────────────────────────────────────────────
  '/tools/jpg-to-pdf': {
    title: `JPG to PDF — Convert Images to PDF Online | ${SITE_NAME}`,
    description: 'Convert JPG, PNG, and other images to a single PDF document. Arrange pages and set orientation — free and runs in your browser.',
    canonical: `${SITE_URL}/tools/jpg-to-pdf`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'JPG to PDF Converter',
      url: `${SITE_URL}/tools/jpg-to-pdf`,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Convert JPG, PNG, and other image formats into a single PDF document.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 11. Image Resizer ────────────────────────────────────────────────────────
  '/tools/image-resizer': {
    title: `Image Resizer — Compress & Resize Images Online | ${SITE_NAME}`,
    description: 'Compress and resize JPG, PNG images to a target file size. Maintain quality — free, fast, and processes entirely in your browser.',
    canonical: `${SITE_URL}/tools/image-resizer`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Image Resizer',
      url: `${SITE_URL}/tools/image-resizer`,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Compress and resize images to a target file size while maintaining quality.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 12. PDF Resizer ──────────────────────────────────────────────────────────
  '/tools/pdf-resizer': {
    title: `PDF Resizer — Compress PDF File Size Online | ${SITE_NAME}`,
    description: 'Reduce PDF file size by compressing images and optimizing content. Free, private, and runs entirely in your browser.',
    canonical: `${SITE_URL}/tools/pdf-resizer`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PDF Resizer',
      url: `${SITE_URL}/tools/pdf-resizer`,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Compress PDF file size by optimizing images and content. All processing happens locally.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 13. PDF Unlock ───────────────────────────────────────────────────────────
  '/tools/pdf-unlock': {
    title: `PDF Unlock — Remove PDF Password Online | ${SITE_NAME}`,
    description: 'Remove password protection from PDF files. Unlock PDFs for printing and copying — free, secure, and processed entirely in your browser.',
    canonical: `${SITE_URL}/tools/pdf-unlock`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PDF Unlock',
      url: `${SITE_URL}/tools/pdf-unlock`,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Remove password protection from PDF files. All processing happens locally in your browser.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 14. PDF Lock ─────────────────────────────────────────────────────────────
  '/tools/pdf-lock': {
    title: `PDF Lock — Password Protect PDF Online | ${SITE_NAME}`,
    description: 'Add password protection to your PDF files with AES-256 encryption. Set open and permission passwords — free and processed in your browser.',
    canonical: `${SITE_URL}/tools/pdf-lock`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PDF Lock',
      url: `${SITE_URL}/tools/pdf-lock`,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Add password protection and AES-256 encryption to PDF files. Encrypted locally in your browser.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 15. PDF Rotate & Reorder ─────────────────────────────────────────────────
  '/tools/pdf-rearrange': {
    title: `PDF Rotate & Reorder — Rearrange PDF Pages | ${SITE_NAME}`,
    description: 'Rotate individual pages and reorder PDF pages by drag-and-drop or manual input. Free, private, and runs entirely in your browser.',
    canonical: `${SITE_URL}/tools/pdf-rearrange`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PDF Rotate & Reorder',
      url: `${SITE_URL}/tools/pdf-rearrange`,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      description: 'Rotate and reorder PDF pages with drag-and-drop or manual page number input.',
      author: { '@type': 'Person', name: 'Srinidhi BS' },
    },
  },

  // ─── 16. Contact ──────────────────────────────────────────────────────────────
  '/contact': {
    title: `Contact | ${SITE_NAME}`,
    description: 'Get in touch with Srinidhi BS. Reach out for finance, tax, trading queries or collaboration opportunities.',
    canonical: `${SITE_URL}/contact`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Srinidhi BS',
      url: `${SITE_URL}/contact`,
      description: 'Contact page for Srinidhi BS — accountant, tax consultant, and tech enthusiast.',
    },
  },

  // ─── 404 Not Found ────────────────────────────────────────────────────────────
  // Special key for the catch-all route; canonical points to home
  '/404': {
    title: `Page Not Found | ${SITE_NAME}`,
    description: 'The page you are looking for does not exist. Browse our free PDF tools and financial calculators.',
    canonical: `${SITE_URL}/`,
  },
};
