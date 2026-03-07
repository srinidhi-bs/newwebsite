/**
 * SEO Component
 *
 * Centralized SEO meta tag manager using react-helmet-async.
 * Reads metadata from seoConfig.js and injects the appropriate
 * <title>, <meta>, <link>, and <script type="application/ld+json">
 * tags into the document <head> for the current page.
 *
 * This replaces the old useDocumentTitle hook by managing not just
 * the title, but also description, canonical URL, Open Graph tags,
 * Twitter Card tags, and structured data (JSON-LD).
 *
 * Usage:
 *   import SEO from '../common/SEO';
 *   // Inside your page component's JSX:
 *   <SEO routeKey="/tools/pdf-merger" />
 *
 * @param {Object} props
 * @param {string} props.routeKey - Route path key matching a key in seoConfig.js
 * @returns {React.ReactElement} Helmet element with SEO meta tags
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { seoConfig, defaults } from '../../config/seoConfig';

const SEO = ({ routeKey }) => {
  // Look up page-specific config from the centralized SEO config.
  // If the route key doesn't exist, fall back to an empty object
  // so we gracefully use defaults for everything.
  const page = seoConfig[routeKey] || {};

  // Resolve each field with fallback to defaults
  const title = page.title || defaults.title;
  const description = page.description || defaults.description;
  const canonical = page.canonical || `${defaults.siteUrl}${routeKey}`;
  const ogImage = page.ogImage || defaults.ogImage;
  const ogType = page.ogType || 'website';
  const jsonLd = page.jsonLd || null;

  return (
    <Helmet>
      {/* ─── Primary Meta Tags ──────────────────────────────────────────── */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* ─── Open Graph (Facebook, LinkedIn, etc.) ──────────────────────── */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={defaults.siteName} />
      <meta property="og:locale" content="en_IN" />

      {/* ─── Twitter Card ───────────────────────────────────────────────── */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ─── JSON-LD Structured Data (only rendered if provided) ─────── */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
