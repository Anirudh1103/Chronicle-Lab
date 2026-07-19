import { usePerformanceStore } from '../store/performanceStore';

/**
 * Monitors Web Vitals and DOM render performance metrics.
 */
export function initWebVitalsObserver() {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const store = usePerformanceStore.getState();

  // Measure Navigation Timing (TTI, Page Ready)
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries && navEntries.length > 0) {
        const nav = navEntries[0];
        const tti = Math.round(nav.domInteractive || nav.responseEnd);
        const pageReadyTime = Math.round(nav.loadEventEnd || nav.duration);

        store.setPageTimings({ tti, pageReadyTime });
        store.addLog('PERFORMANCE', `Page Ready: Total load time ${pageReadyTime} ms (TTI: ${tti} ms)`);
      }
    }, 0);
  });

  // Measure FCP & LCP via PerformanceObserver
  if ('PerformanceObserver' in window) {
    try {
      // FCP Observer
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const fcp = Math.round(entry.startTime);
            store.setPageTimings({ fcp });
            store.addLog('PERFORMANCE', `First Contentful Paint (FCP): ${fcp} ms`);
          }
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });

      // LCP Observer
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          const lcp = Math.round(lastEntry.startTime);
          store.setPageTimings({ lcp });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // Ignore unsupported observers
    }
  }
}
