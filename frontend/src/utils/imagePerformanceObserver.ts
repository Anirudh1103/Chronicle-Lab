import { usePerformanceStore, ImageMetric } from '../store/performanceStore';

/**
 * Initializes PerformanceObserver to track all image network downloads and render performance.
 */
export function initImagePerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const store = usePerformanceStore.getState();

      for (const entry of entries) {
        const resEntry = entry as PerformanceResourceTiming;

        const isImg =
          resEntry.initiatorType === 'img' ||
          /\.(png|jpe?g|webp|gif|svg|avif)($|\?)/i.test(resEntry.name);

        if (!isImg) continue;

        const src = resEntry.name;
        const duration = Math.round(resEntry.duration);
        const size = resEntry.transferSize || resEntry.encodedBodySize || 0;

        const extMatch = src.match(/\.(png|jpe?g|webp|gif|svg|avif)/i);
        const format = (extMatch ? extMatch[1] : 'IMG').toUpperCase();
        const isWebP = format === 'WEBP';

        const isOver1MB = size > 1024 * 1024;
        const isOver1s = duration > 1000;

        const metric: ImageMetric = {
          src,
          size,
          format,
          duration,
          isWebP,
          isOver1MB,
          isOver1s,
        };

        store.addImageMetric(metric);

        if (isOver1MB) {
          const mb = (size / (1024 * 1024)).toFixed(1);
          const filename = src.split('/').pop() || src;
          store.addLog(
            'WARNING',
            `Large Image Warning: "${filename}" is ${mb} MB. Consider WebP optimization.`
          );
        }

        if (isOver1s) {
          const filename = src.split('/').pop() || src;
          store.addLog(
            'WARNING',
            `Slow Image Download: "${filename}" took ${duration} ms to download.`
          );
        }
      }
    });

    observer.observe({ type: 'resource', buffered: true });
  } catch (e) {
    // Ignore PerformanceObserver initialization error if unsupported
  }
}
