import { Router } from 'express';
import prisma from '../config/db';
import { protect, admin } from '../security/middleware/auth.middleware';
import { loginRateLimiter } from '../security/ratelimit/rateLimiter';

const router = Router();


/**
 * Helper to parse Browser and OS from User-Agent.
 */
function parseUserAgent(userAgent: string | undefined) {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (userAgent) {
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Macintosh')) os = 'macOS';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
  }

  return { browser, os };
}

/**
 * Public Endpoint: Record a page view on a blog post (non-blocking async execution).
 */
router.post('/view', async (req, res) => {
  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ message: 'Slug is required to record view.' });
  }

  // Return success immediately so the frontend request completes in ~2ms!
  res.status(201).json({ success: true });

  // Process PageView logging & Post views increment asynchronously in background
  setImmediate(async () => {
    try {
      const post = await prisma.post.findUnique({
        where: { slug },
        select: { id: true }
      });

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || undefined;
      const { browser, os } = parseUserAgent(userAgent);

      await prisma.pageView.create({
        data: {
          slug,
          postId: post ? post.id : null,
          ipAddress,
          userAgent: userAgent || null,
          browser,
          os
        }
      });

      if (post) {
        await prisma.post.update({
          where: { id: post.id },
          data: { views: { increment: 1 } }
        });
      }
    } catch (error) {
      console.error('Async page view logging error:', error);
    }
  });
});

let overviewCache: { data: any; timestamp: number } | null = null;
const OVERVIEW_CACHE_TTL = 60 * 1000;

/**
 * Admin Endpoint: Retrieve User traffic overview and daily charts.
 */
router.get('/overview', protect, admin, async (req, res) => {
  try {
    const now = Date.now();
    if (overviewCache && (now - overviewCache.timestamp < OVERVIEW_CACHE_TTL)) {
      return res.json(overviewCache.data);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Run all 6 independent DB queries in parallel with Promise.all
    const [totalViews, totalSubscribers, totalFeedback, totalPosts, rawViews, topPosts] = await Promise.all([
      prisma.pageView.count(),
      prisma.newsletterSubscriber.count({ where: { status: 'active' } }),
      prisma.feedback.count(),
      prisma.post.count(),
      prisma.pageView.findMany({
        where: { timestamp: { gte: thirtyDaysAgo } },
        select: { timestamp: true }
      }),
      prisma.post.findMany({
        orderBy: { views: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          likes: true,
          dislikes: true,
          shares: true,
          categories: { select: { name: true } }
        }
      })
    ]);

    // Group daily counts
    const dailyMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, 0);
    }

    rawViews.forEach(v => {
      const key = v.timestamp.toISOString().slice(0, 10);
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
      }
    });

    const trafficChart = Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    const result = {
      totalViews,
      totalSubscribers,
      totalFeedback,
      totalPosts,
      trafficChart,
      topPosts
    };

    overviewCache = { data: result, timestamp: now };
    return res.json(result);
  } catch (error) {
    console.error('Failed to load traffic overview metrics:', error);
    return res.status(500).json({ message: 'Failed to retrieve analytics overview.' });
  }
});

let loginCache: { data: any; timestamp: number } | null = null;
let demographicsCache: { data: any; timestamp: number } | null = null;
const ANALYTICS_CACHE_TTL = 60 * 1000;

/**
 * Admin Endpoint: Retrieve Login Audits and brute-force events.
 */
router.get('/login', protect, admin, async (req, res) => {
  try {
    const now = Date.now();
    if (loginCache && (now - loginCache.timestamp < ANALYTICS_CACHE_TTL)) {
      return res.json(loginCache.data);
    }

    const [successLogs, failureLogs, mfaSetupLogs, recentLogs] = await Promise.all([
      prisma.securityLog.count({
        where: { event: { in: ['LOGIN_SUCCESS', 'MFA_VERIFY_SUCCESS'] } }
      }),
      prisma.securityLog.count({
        where: { event: { in: ['LOGIN_FAILURE', 'MFA_VERIFY_FAILURE', 'UNAUTHORIZED_ACCESS'] } }
      }),
      prisma.securityLog.count({
        where: { event: 'MFA_SETUP_SUCCESS' }
      }),
      prisma.securityLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 15
      })
    ]);

    const activeBlocks = loginRateLimiter.getActiveBlocksCount();

    const result = {
      successLogs,
      failureLogs,
      mfaSetupLogs,
      activeBlocks,
      recentLogs
    };

    loginCache = { data: result, timestamp: now };
    return res.json(result);
  } catch (error) {
    console.error('Failed to load login audit logs:', error);
    return res.status(500).json({ message: 'Failed to retrieve login analytics.' });
  }
});

/**
 * Admin Endpoint: Retrieve User agents device demographics.
 */
router.get('/demographics', protect, admin, async (req, res) => {
  try {
    const now = Date.now();
    if (demographicsCache && (now - demographicsCache.timestamp < ANALYTICS_CACHE_TTL)) {
      return res.json(demographicsCache.data);
    }

    const [browsersGroup, osGroup] = await Promise.all([
      prisma.pageView.groupBy({
        by: ['browser'],
        _count: { id: true }
      }),
      prisma.pageView.groupBy({
        by: ['os'],
        _count: { id: true }
      })
    ]);

    const browsers = browsersGroup.map(item => ({
      name: item.browser || 'Unknown',
      count: item._count.id
    }));

    const os = osGroup.map(item => ({
      name: item.os || 'Unknown',
      count: item._count.id
    }));

    const result = { browsers, os };
    demographicsCache = { data: result, timestamp: now };
    return res.json(result);
  } catch (error) {
    console.error('Failed to load device demographics:', error);
    return res.status(500).json({ message: 'Failed to retrieve demographics.' });
  }
});

export default router;
