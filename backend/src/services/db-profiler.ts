import { PrismaClient } from '@prisma/client';
import { requestStore } from '../middleware/performance.middleware';

/**
 * Attaches query timing extensions to a Prisma Client instance.
 * Measures query start/end time, execution duration (ms), row count,
 * and flags slow queries (>500ms).
 */
export function createProfiledPrismaClient(basePrisma: PrismaClient) {
  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const startTime = Date.now();
          const startIso = new Date().toISOString();
          let result: any;
          let errorOccurred: any = null;

          try {
            result = await query(args);
          } catch (err) {
            errorOccurred = err;
            throw err;
          } finally {
            const endTime = Date.now();
            const duration = endTime - startTime;
            const isSlow = duration > 500;

            // Estimate row count
            let rows = 0;
            if (Array.isArray(result)) {
              rows = result.length;
            } else if (result && typeof result === 'object') {
              if (typeof result.count === 'number') {
                rows = result.count;
              } else {
                rows = 1;
              }
            }

            const queryLabel = `${model}.${operation}`;

            // Add to active request context if available
            const context = requestStore.getStore();
            if (context) {
              context.dbDuration += duration;
              context.dbQueries.push({
                query: queryLabel,
                model,
                action: operation,
                duration,
                rows,
                isSlow,
                timestamp: startIso,
              });
            }

            if (isSlow || process.env.NODE_ENV === 'development') {
              const slowBadge = isSlow ? '⚠️ [SLOW QUERY >500ms]' : '⚡ [DB Query]';
              console.log(
                `${slowBadge} ${queryLabel} | Duration: ${duration} ms | Rows: ${rows} | Started: ${startIso.split('T')[1]}`
              );
            }
          }

          return result;
        },
      },
    },
  });
}
