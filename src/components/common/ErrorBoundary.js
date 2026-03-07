/**
 * ErrorBoundary Component
 *
 * A custom React Error Boundary that catches JavaScript errors anywhere in its
 * child component tree and displays a fallback UI instead of crashing the app.
 *
 * NOTE: This is a class component because React 18 does not provide a hook-based
 * API for error boundaries. getDerivedStateFromError and componentDidCatch are
 * only available in class components. This is the only class component in the project.
 *
 * Usage:
 *   // With default fallback (ErrorFallback component)
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   // With custom fallback component
 *   <ErrorBoundary fallback={MyCustomFallback}>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   // With onReset callback
 *   <ErrorBoundary onReset={() => console.log('Error boundary reset')}>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 * Props:
 * - children {React.ReactNode} - The component tree to protect
 * - fallback {React.ComponentType} - Optional custom fallback component
 *     Receives { error, resetErrorBoundary } props
 * - onReset {Function} - Optional callback invoked when the boundary resets
 *
 * @component
 * @class
 */

import React, { Component } from 'react';
import ErrorFallback from './ErrorFallback';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // Track whether an error has been caught and store the error object
    this.state = { hasError: false, error: null };
    // Bind the reset method so it can be passed as a callback
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  /**
   * Called when a child component throws during rendering.
   * Updates state so the next render shows the fallback UI.
   *
   * @param {Error} error - The error thrown by a descendant component
   * @returns {Object} New state with hasError=true and the error object
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Called after an error has been thrown by a descendant component.
   * Used for logging — does NOT affect rendering (that's getDerivedStateFromError's job).
   *
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Contains componentStack trace showing which component threw
   */
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  /**
   * Resets the error boundary back to normal state.
   * Called by the fallback UI's "Try Again" button.
   * After reset, the boundary will attempt to render children again.
   */
  resetErrorBoundary() {
    this.setState({ hasError: false, error: null });
    // Call the optional onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    // If an error was caught, render the fallback UI
    if (this.state.hasError) {
      // Use the custom fallback component if provided, otherwise use default ErrorFallback
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    // No error — render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
