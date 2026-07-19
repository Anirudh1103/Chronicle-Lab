import { usePerformanceStore } from '../store/performanceStore';

let isInitialized = false;

/**
 * Captures all browser console errors, React runtime exceptions, and unhandled promise rejections,
 * streaming them directly into the Developer Performance HUD Console Logs tab.
 */
export function initConsoleErrorObserver() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  const store = usePerformanceStore.getState();

  // 1. Intercept console.error
  const originalConsoleError = console.error.bind(console);
  console.error = (...args: any[]) => {
    originalConsoleError(...args);

    const message = args
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ');

    // Prevent duplicate noise from internal store logging
    if (!message.includes('[PERFORMANCE]')) {
      usePerformanceStore.getState().addLog('ERROR', `Console Error: ${message.slice(0, 300)}`);
    }
  };

  // 2. Global Uncaught Error Listener
  window.addEventListener('error', (event: ErrorEvent) => {
    const errorMsg = event.error
      ? `${event.error.name || 'Error'}: ${event.error.message}\nAt: ${event.filename || 'script'}:${event.lineno}:${event.colno}`
      : `Script Error: ${event.message}`;

    usePerformanceStore.getState().addLog('ERROR', `Uncaught Exception: ${errorMsg}`);
  });

  // 3. Unhandled Promise Rejection Listener
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    let errorMsg = 'Unhandled Promise Rejection';

    if (reason instanceof Error) {
      errorMsg = `${reason.name}: ${reason.message}`;
    } else if (typeof reason === 'string') {
      errorMsg = reason;
    } else if (reason) {
      try {
        errorMsg = JSON.stringify(reason);
      } catch {
        errorMsg = String(reason);
      }
    }

    usePerformanceStore.getState().addLog('ERROR', `Unhandled Promise Rejection: ${errorMsg}`);
  });
}
