import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { usePerformanceStore, ApiRequestMetric } from '../store/performanceStore';

const recentRequestCache = new Map<string, number>();

/**
 * Parses Server-Timing header strings (e.g. "total;dur=142, db;dur=45, app;dur=97").
 */
function parseServerTiming(headerVal?: string): { total: number; db: number; app: number } {
  const timings = { total: 0, db: 0, app: 0 };
  if (!headerVal) return timings;

  const parts = headerVal.split(',');
  for (const part of parts) {
    const [name, ...params] = part.trim().split(';');
    for (const p of params) {
      if (p.trim().startsWith('dur=')) {
        const dur = parseFloat(p.trim().split('=')[1]) || 0;
        if (name === 'total') timings.total = dur;
        else if (name === 'db') timings.db = dur;
        else if (name === 'app') timings.app = dur;
      }
    }
  }
  return timings;
}

export function setupPerformanceInterceptor(axiosInstance: AxiosInstance) {
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      (config as any).metadata = { startTime: Date.now() };

      const requestKey = `${config.method?.toUpperCase()}:${config.url}`;
      const lastTime = recentRequestCache.get(requestKey);
      const now = Date.now();

      if (lastTime && now - lastTime < 3000) {
        (config as any).metadata.isDuplicate = true;
      } else {
        recentRequestCache.set(requestKey, now);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      handleResponseMetrics(response);
      return response;
    },
    (error) => {
      if (error.response) {
        handleResponseMetrics(error.response, error);
      } else {
        const store = usePerformanceStore.getState();
        store.addLog('ERROR', `Network Error: ${error.message || 'Connection failed'}`);
      }
      return Promise.reject(error);
    }
  );
}

function handleResponseMetrics(response: AxiosResponse, error?: any) {
  const config = response.config || {};
  const metadata = (config as any).metadata || { startTime: Date.now() };
  const endTime = Date.now();
  const totalDuration = endTime - metadata.startTime;

  const requestId = String(response.headers['x-request-id'] || 'REQ-UNKNOWN');
  const serverTimingStr = String(response.headers['server-timing'] || '');
  const parsedServer = parseServerTiming(serverTimingStr);

  const backendDuration = parsedServer.total || totalDuration;
  const dbDuration = parsedServer.db || 0;
  const appDuration = parsedServer.app || Math.max(0, backendDuration - dbDuration);
  const networkLatency = Math.max(0, totalDuration - backendDuration);

  // Payload size calculation
  let payloadSize = 0;
  const contentLength = response.headers['content-length'];
  if (contentLength) {
    payloadSize = parseInt(String(contentLength), 10);
  } else if (response.data) {
    try {
      payloadSize = JSON.stringify(response.data).length;
    } catch (e) {
      payloadSize = 0;
    }
  }

  const isDuplicate = !!metadata.isDuplicate;

  const metric: ApiRequestMetric = {
    id: requestId,
    method: (config.method || 'GET').toUpperCase(),
    url: config.url || '',
    status: response.status,
    totalDuration,
    networkLatency,
    backendDuration,
    dbDuration,
    appDuration,
    isCacheHit: false, // Updated if React Query cache hit
    isDuplicate,
    payloadSize,
    timestamp: new Date().toLocaleTimeString(),
  };

  const store = usePerformanceStore.getState();
  store.addRequestMetric(metric);

  // Log in dev console
  const logType = response.status >= 400 ? 'ERROR' : totalDuration > 1000 ? 'WARNING' : 'PERFORMANCE';
  const logMsg = `${metric.method} ${metric.url} - ${response.status} (${totalDuration}ms total, ${dbDuration}ms DB, ${networkLatency}ms net)`;
  store.addLog(logType, logMsg, requestId);
}
