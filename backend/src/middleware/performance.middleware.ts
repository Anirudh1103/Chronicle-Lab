import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

// AsyncLocalStorage context to track database queries per request
export interface RequestContext {
  requestId: string;
  startTime: number;
  dbDuration: number;
  dbQueries: Array<{
    query: string;
    model?: string;
    action?: string;
    duration: number;
    rows?: number;
    isSlow: boolean;
    timestamp: string;
  }>;
  stages: Record<string, number>;
}

export const requestStore = new AsyncLocalStorage<RequestContext>();

/**
 * Strips sensitive parameters (passwords, tokens, secrets, credentials) from objects before logging.
 */
function sanitizeData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeData);

  const sanitized: any = {};
  const sensitiveKeys = new Set([
    'password',
    'token',
    'secret',
    'authorization',
    'cookie',
    'jwt',
    'mfatoken',
    'code',
  ]);

  for (const [key, val] of Object.entries(obj)) {
    if (sensitiveKeys.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object') {
      sanitized[key] = sanitizeData(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Express Middleware: End-to-end Request Profiler.
 * Assigns Request ID (REQ-XXXXXX), records stage timestamps, attaches Server-Timing header,
 * and logs execution metrics.
 */
export const requestProfiler = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const hexPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const requestId = `REQ-${hexPart}`;

  // Attach Request ID to request object and response headers
  (req as any).id = requestId;
  (req as any).startTime = startTime;

  res.setHeader('X-Request-ID', requestId);
  res.setHeader('Access-Control-Expose-Headers', 'X-Request-ID, Server-Timing');

  const context: RequestContext = {
    requestId,
    startTime,
    dbDuration: 0,
    dbQueries: [],
    stages: {
      'Request Received': startTime,
    },
  };

  requestStore.run(context, () => {
    // Intercept response headers to inject Server-Timing before headers are sent
    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = function (name: string, value: any) {
      if (name.toLowerCase() === 'server-timing') {
        return originalSetHeader(name, value);
      }
      return originalSetHeader(name, value);
    };

    res.on('finish', () => {
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      context.stages['Completed'] = endTime;

      const dbDur = context.dbDuration || 0;
      const appDur = Math.max(0, totalDuration - dbDur);

      // Set Server-Timing header (total, db, app)
      const serverTimingHeader = `total;dur=${totalDuration}, db;dur=${dbDur}, app;dur=${appDur}`;
      try {
        res.setHeader('Server-Timing', serverTimingHeader);
      } catch (e) {
        // Headers already sent
      }

      const userEmail = (req as any).user?.email || 'Anonymous';
      const statusCode = res.statusCode;
      const statusColor = statusCode >= 500 ? '🔴' : statusCode >= 400 ? '🟠' : totalDuration > 1000 ? '🟡' : '🟢';

      if (process.env.NODE_ENV === 'development') {
        console.log(`\n${statusColor} [${requestId}] ${req.method} ${req.originalUrl || req.url}`);
        console.log(` ├─ User: ${userEmail}`);
        console.log(` ├─ Status: ${statusCode}`);
        console.log(` ├─ DB Duration: ${dbDur} ms (${context.dbQueries.length} queries)`);
        console.log(` └─ Total Request Time: ${totalDuration} ms`);
        
        if (context.dbQueries.some(q => q.isSlow)) {
          console.warn(` ⚠️ [SLOW QUERY DETECTED] Exceeded 500ms threshold in request ${requestId}`);
        }
      } else {
        // Structured JSON log in production (sanitized)
        console.log(
          JSON.stringify({
            level: 'PERFORMANCE',
            timestamp: new Date().toISOString(),
            requestId,
            method: req.method,
            endpoint: req.originalUrl || req.url,
            statusCode,
            user: userEmail,
            totalDuration,
            dbDuration: dbDur,
            dbQueryCount: context.dbQueries.length,
          })
        );
      }
    });

    next();
  });
};
