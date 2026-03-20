/**
 * Breadcrumbs Component
 *
 * Auto-generates breadcrumb navigation based on the current URL path.
 * Hidden on Home (/) and 404 pages. Includes JSON-LD structured data
 * for SEO (BreadcrumbList schema).
 *
 * Route hierarchy:
 *   Home  >  Hub (Tools/Finance)  >  Tool/Calculator page
 *
 * @component
 * @returns {React.ReactElement|null} Breadcrumb nav or null if on Home/404
 */
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// ─── Route label mapping ─────────────────────────────────────────────────────
// Maps each known route path to a short, human-readable breadcrumb label.
// Keep this in sync with AnimatedRoutes.js when adding new pages.
const ROUTE_LABELS = {
  '/': 'Home',
  '/finance': 'Finance',
  '/finance/emi-calculator': 'EMI Calculator',
  '/finance/income-tax-calculator': 'Income Tax Calculator',
  '/finance/capital-gains-calculator': 'Capital Gains Calculator',
  '/trading': 'Trading & Markets',
  '/tools': 'Tools',
  '/tools/pdf-merger': 'PDF Merger',
  '/tools/pdf-splitter': 'PDF Splitter',
  '/tools/pdf-to-jpg': 'PDF to JPG',
  '/tools/jpg-to-pdf': 'JPG to PDF',
  '/tools/image-resizer': 'Image Resizer',
  '/tools/pdf-resizer': 'PDF Resizer',
  '/tools/pdf-unlock': 'PDF Unlock',
  '/tools/pdf-lock': 'PDF Lock',
  '/tools/pdf-rearrange': 'PDF Rotate & Reorder',
  '/contact': 'Contact',
};

// ─── Site URL for JSON-LD ────────────────────────────────────────────────────
const SITE_URL = 'https://www.srinidhibs.com';

/**
 * Builds an array of breadcrumb items from the current pathname.
 *
 * Example: "/tools/pdf-merger" produces:
 *   [{ label: "Home", path: "/" }, { label: "Tools", path: "/tools" }, { label: "PDF Merger", path: "/tools/pdf-merger" }]
 *
 * @param {string} pathname - Current URL path
 * @returns {Array<{label: string, path: string}>} Breadcrumb items
 */
const buildBreadcrumbs = (pathname) => {
  // Always start with Home
  const crumbs = [{ label: 'Home', path: '/' }];

  // Split path into segments, filter out empty strings
  // e.g. "/tools/pdf-merger" → ["tools", "pdf-merger"]
  const segments = pathname.split('/').filter(Boolean);

  // Build cumulative paths for each segment
  // e.g. segments ["tools", "pdf-merger"] → paths ["/tools", "/tools/pdf-merger"]
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = ROUTE_LABELS[currentPath];

    // Only add known routes (skip unknown segments gracefully)
    if (label) {
      crumbs.push({ label, path: currentPath });
    }
  }

  return crumbs;
};

/**
 * Generates JSON-LD BreadcrumbList structured data for search engines.
 * See: https://schema.org/BreadcrumbList
 *
 * @param {Array<{label: string, path: string}>} crumbs - Breadcrumb items
 * @returns {Object} JSON-LD object
 */
const buildJsonLd = (crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.label,
    item: `${SITE_URL}${crumb.path}`,
  })),
});

const Breadcrumbs = () => {
  const { pathname } = useLocation();

  // Memoize breadcrumb computation — only recalculate when path changes
  const crumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname]);

  // ─── Hide on Home page and unknown routes (404) ────────────────────────────
  // If there's only the Home crumb, we're on "/" → hide
  // If the last segment isn't a known route, it's likely a 404 → hide
  const isHomePage = pathname === '/';
  const isUnknownRoute = !ROUTE_LABELS[pathname];

  if (isHomePage || isUnknownRoute) {
    return null;
  }

  // JSON-LD structured data for SEO
  const jsonLd = buildJsonLd(crumbs);

  return (
    <>
      {/* JSON-LD BreadcrumbList for search engines */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      {/* Visible breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 text-sm"
      >
        <ol className="flex flex-wrap items-center gap-1">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <li key={crumb.path} className="flex items-center gap-1">
                {/* Separator chevron (skip before first item) */}
                {index > 0 && (
                  <span
                    className="text-gray-400 dark:text-gray-500 select-none"
                    aria-hidden="true"
                  >
                    ›
                  </span>
                )}

                {isLast ? (
                  // Current page — plain text, not clickable
                  <span
                    className="font-medium text-gray-700 dark:text-gray-200"
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  // Ancestor pages — clickable links
                  <Link
                    to={crumb.path}
                    className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
