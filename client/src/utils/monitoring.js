// Simple performance monitoring
export function initMonitoring() {
  // Log app load time
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`[Performance] Page load: ${pageLoadTime}ms`);
  });

  // Log long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  // Track errors
  window.addEventListener('error', (event) => {
    console.error('[Error]', event.error);
    // In production, send to error tracking service
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
    // In production, send to error tracking service
  });
}

// Measure API call times
export function measureApiCall(name, promise) {
  const start = performance.now();
  
  return promise.finally(() => {
    const duration = performance.now() - start;
    console.log(`[API] ${name}: ${duration.toFixed(2)}ms`);
  });
}