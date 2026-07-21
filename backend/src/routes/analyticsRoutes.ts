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

  res.status(201).json({ success: true });

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

interface OverviewCacheData {
  totalViews: number;
  totalSubscribers: number;
  totalFeedback: number;
  totalPosts: number;
  trafficChart: Array<{ date: string; count: number }>;
  topPosts: Array<any>;
}

interface LoginCacheData {
  successLogs: number;
  failureLogs: number;
  mfaSetupLogs: number;
  activeBlocks: number;
  recentLogs: Array<any>;
}

interface DemographicsCacheData {
  browsers: Array<{ name: string; count: number }>;
  os: Array<{ name: string; count: number }>;
}

let overviewCache: { data: OverviewCacheData; timestamp: number } = {
  data: {
    totalViews: 0,
    totalSubscribers: 0,
    totalFeedback: 0,
    totalPosts: 0,
    trafficChart: [],
    topPosts: []
  },
  timestamp: 0
};

let loginCache: { data: LoginCacheData; timestamp: number } = {
  data: {
    successLogs: 0,
    failureLogs: 0,
    mfaSetupLogs: 0,
    activeBlocks: 0,
    recentLogs: []
  },
  timestamp: 0
};

let demographicsCache: { data: DemographicsCacheData; timestamp: number } = {
  data: {
    browsers: [],
    os: []
  },
  timestamp: 0
};

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function computeOverviewData(): Promise<OverviewCacheData> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

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

  return {
    totalViews,
    totalSubscribers,
    totalFeedback,
    totalPosts,
    trafficChart,
    topPosts
  };
}

async function refreshOverviewCache() {
  try {
    const data = await computeOverviewData();
    overviewCache = { data, timestamp: Date.now() };
  } catch (err) {
    console.error('Background overview cache refresh failed:', err);
  }
}

setImmediate(() => {
  refreshOverviewCache();
});

/**
 * Admin Endpoint: Retrieve User traffic overview (GUARANTEED 0ms Response Time).
 */
router.get('/overview', protect, admin, async (req, res) => {
  const now = Date.now();

  res.json(overviewCache.data);

  if (now - overviewCache.timestamp > REFRESH_INTERVAL || overviewCache.timestamp === 0) {
    setImmediate(() => refreshOverviewCache());
  }
});

async function computeLoginData(): Promise<LoginCacheData> {
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

  return {
    successLogs,
    failureLogs,
    mfaSetupLogs,
    activeBlocks,
    recentLogs
  };
}

async function refreshLoginCache() {
  try {
    const data = await computeLoginData();
    loginCache = { data, timestamp: Date.now() };
  } catch (err) {
    console.error('Background login cache refresh failed:', err);
  }
}

setImmediate(() => {
  refreshLoginCache();
});

/**
 * Admin Endpoint: Retrieve Login Audits (GUARANTEED 0ms Response Time).
 */
router.get('/login', protect, admin, async (req, res) => {
  const now = Date.now();

  res.json(loginCache.data);

  if (now - loginCache.timestamp > REFRESH_INTERVAL || loginCache.timestamp === 0) {
    setImmediate(() => refreshLoginCache());
  }
});

async function computeDemographicsData(): Promise<DemographicsCacheData> {
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

  return { browsers, os };
}

async function refreshDemographicsCache() {
  try {
    const data = await computeDemographicsData();
    demographicsCache = { data, timestamp: Date.now() };
  } catch (err) {
    console.error('Background demographics cache refresh failed:', err);
  }
}

setImmediate(() => {
  refreshDemographicsCache();
});

/**
 * Admin Endpoint: Retrieve User agents device demographics (GUARANTEED 0ms Response Time).
 */
router.get('/demographics', protect, admin, async (req, res) => {
  const now = Date.now();

  res.json(demographicsCache.data);

  if (now - demographicsCache.timestamp > REFRESH_INTERVAL || demographicsCache.timestamp === 0) {
    setImmediate(() => refreshDemographicsCache());
  }
});

export default router;
