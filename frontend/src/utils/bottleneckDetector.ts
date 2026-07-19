import { usePerformanceStore } from '../store/performanceStore';

/**
 * Runs rule-based diagnostic analysis across current request, image, and page metrics,
 * generating actionable performance recommendations.
 */
export function analyzeBottlenecks() {
  const store = usePerformanceStore.getState();
  const { requests, images } = store;

  // 1. Check Slow APIs (> 1000ms)
  requests.forEach((req) => {
    if (req.totalDuration > 1000) {
      store.addRecommendation(
        `Slow API Warning: Endpoint "${req.method} ${req.url}" took ${req.totalDuration}ms. Check backend execution or network latency.`
      );
    }

    // 2. Check Slow Database Queries (> 500ms)
    if (req.dbDuration > 500) {
      store.addRecommendation(
        `Slow DB Warning: Database queries on "${req.url}" took ${req.dbDuration}ms (>500ms). Consider adding PostgreSQL indexes or payload field projections.`
      );
    }

    // 3. Check Duplicate Requests
    if (req.isDuplicate) {
      store.addRecommendation(
        `Duplicate Request: Identical API call to "${req.url}" was made within 3s. Consider enabling React Query staleTime caching.`
      );
    }

    // 4. Check Large Payloads (> 500KB)
    if (req.payloadSize > 500 * 1024) {
      const kb = Math.round(req.payloadSize / 1024);
      store.addRecommendation(
        `Large Payload: "${req.url}" returned ${kb} KB. Consider adding pagination or excluding large content fields.`
      );
    }
  });

  // 5. Check Image Bottlenecks
  images.forEach((img) => {
    const filename = img.src.split('/').pop() || img.src;

    if (img.isOver1MB) {
      const mb = (img.size / (1024 * 1024)).toFixed(1);
      store.addRecommendation(
        `Oversized Image: Cover asset "${filename}" is ${mb} MB. Convert to WebP format for 80%+ savings.`
      );
    }

    if (img.isOver1s) {
      store.addRecommendation(
        `Slow Image Load: "${filename}" took ${img.duration}ms to render. Consider adding loading="lazy" and decoding="async".`
      );
    }

    if (!img.isWebP && img.format !== 'SVG') {
      store.addRecommendation(
        `Unoptimized Image Format: Asset "${filename}" is in legacy format (${img.format}). Upgrade to WebP.`
      );
    }
  });
}
