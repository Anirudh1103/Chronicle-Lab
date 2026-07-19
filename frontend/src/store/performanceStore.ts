import { create } from 'zustand';

export interface ApiRequestMetric {
  id: string;
  method: string;
  url: string;
  status: number;
  totalDuration: number;
  networkLatency: number;
  backendDuration: number;
  dbDuration: number;
  appDuration: number;
  isCacheHit: boolean;
  isDuplicate: boolean;
  payloadSize: number;
  timestamp: string;
}

export interface ImageMetric {
  src: string;
  size: number;
  format: string;
  duration: number;
  isWebP: boolean;
  isOver1MB: boolean;
  isOver1s: boolean;
}

export interface LogEntry {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'PERFORMANCE';
  message: string;
  timestamp: string;
  requestId?: string;
}

interface PerformanceState {
  isDeveloperMode: boolean;
  currentRoute: string;
  routeStartTime: number;
  pageReadyTime: number;
  fcp: number;
  lcp: number;
  tti: number;
  reactRenderTime: number;
  requests: ApiRequestMetric[];
  images: ImageMetric[];
  recommendations: string[];
  logs: LogEntry[];

  setDeveloperMode: (enabled: boolean) => void;
  setCurrentRoute: (route: string) => void;
  setPageTimings: (timings: Partial<{ pageReadyTime: number; fcp: number; lcp: number; tti: number; reactRenderTime: number }>) => void;
  addRequestMetric: (req: ApiRequestMetric) => void;
  addImageMetric: (img: ImageMetric) => void;
  addRecommendation: (rec: string) => void;
  addLog: (type: LogEntry['type'], message: string, requestId?: string) => void;
  clearMetricsForRoute: (route: string) => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  isDeveloperMode: typeof window !== 'undefined' ? localStorage.getItem('developer_perf_mode') === 'true' : false,
  currentRoute: '/',
  routeStartTime: Date.now(),
  pageReadyTime: 0,
  fcp: 0,
  lcp: 0,
  tti: 0,
  reactRenderTime: 0,
  requests: [],
  images: [],
  recommendations: [],
  logs: [],

  setDeveloperMode: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('developer_perf_mode', String(enabled));
    }
    set({ isDeveloperMode: enabled });
  },

  setCurrentRoute: (route) =>
    set({
      currentRoute: route,
      routeStartTime: Date.now(),
      requests: [],
      images: [],
      recommendations: [],
    }),

  setPageTimings: (timings) =>
    set((state) => ({
      ...state,
      ...timings,
    })),

  addRequestMetric: (req) =>
    set((state) => {
      const filtered = state.requests.filter((r) => r.id !== req.id);
      return { requests: [req, ...filtered].slice(0, 50) };
    }),

  addImageMetric: (img) =>
    set((state) => {
      const filtered = state.images.filter((i) => i.src !== img.src);
      return { images: [img, ...filtered].slice(0, 50) };
    }),

  addRecommendation: (rec) =>
    set((state) => {
      if (state.recommendations.includes(rec)) return state;
      return { recommendations: [...state.recommendations, rec] };
    }),

  addLog: (type, message, requestId) =>
    set((state) => {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
        requestId,
      };
      return { logs: [newLog, ...state.logs].slice(0, 100) };
    }),

  clearMetricsForRoute: (route) =>
    set({
      currentRoute: route,
      requests: [],
      images: [],
      recommendations: [],
    }),
}));
