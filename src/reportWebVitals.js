/**
 * Core Web Vitals Reporter
 *
 * Measures and logs key performance metrics:
 * - CLS (Cumulative Layout Shift): Visual stability — should be < 0.1
 * - FID (First Input Delay): Interactivity — should be < 100ms
 * - FCP (First Contentful Paint): First visible content — should be < 1.8s
 * - LCP (Largest Contentful Paint): Main content loaded — should be < 2.5s
 * - TTFB (Time to First Byte): Server response time — should be < 800ms
 *
 * Metrics are logged to the console in development for easy monitoring.
 * In production, these could be sent to an analytics endpoint.
 *
 * Usage: Called from index.js with the logMetric callback.
 */

// Thresholds for "good" scores (from web.dev/vitals)
const THRESHOLDS = {
  CLS: 0.1,       // Cumulative Layout Shift (unitless)
  FID: 100,       // First Input Delay (ms)
  FCP: 1800,      // First Contentful Paint (ms)
  LCP: 2500,      // Largest Contentful Paint (ms)
  TTFB: 800,      // Time to First Byte (ms)
};

/**
 * Logs a single Web Vital metric with color-coded rating.
 * Green = good, Orange = needs improvement, Red = poor.
 *
 * @param {Object} metric - Web Vital metric object from web-vitals library
 * @param {string} metric.name - Metric name (CLS, FID, FCP, LCP, TTFB)
 * @param {number} metric.value - Measured value
 * @param {string} metric.rating - Rating: 'good', 'needs-improvement', or 'poor'
 */
const logMetric = ({ name, value, rating }) => {
  // Color-code based on rating provided by web-vitals library
  const color =
    rating === 'good' ? '#0CCE6B' :           // Green
    rating === 'needs-improvement' ? '#FFA400' : // Orange
    '#FF4E42';                                   // Red

  const threshold = THRESHOLDS[name];
  const unit = name === 'CLS' ? '' : 'ms';
  const displayValue = name === 'CLS' ? value.toFixed(4) : Math.round(value);

  console.log(
    `%c[Web Vitals] ${name}: ${displayValue}${unit} (${rating}) — threshold: ${threshold}${unit}`,
    `color: ${color}; font-weight: bold;`
  );
};

/**
 * Registers all Web Vital metric observers.
 * Each metric calls the provided callback when measured.
 *
 * @param {Function} onPerfEntry - Callback invoked with each metric result
 */
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export { logMetric };
export default reportWebVitals;
