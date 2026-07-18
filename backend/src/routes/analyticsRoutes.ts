import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, admin } from '../security/middleware/auth.middleware';
import { loginRateLimiter } from '../security/ratelimit/rateLimiter';

const router = Router();
const prisma = new PrismaClient();

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
 * Public Endpoint: Record a page view on a blog post.
 */
router.post('/view', async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) {
      return res.status(400).json({ message: 'Slug is required to record view.' });
    }

    const post = await prisma.post.findUnique({
      where: { slug }
    });

    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || undefined;
    const { browser, os } = parseUserAgent(userAgent);

    // Create PageView log
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

    // Increment views field on Post model for backwards compatibility
    if (post) {
      await prisma.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } }
      });
    }

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Failed to log page view:', error);
    return res.status(500).json({ message: 'Failed to record page view.' });
  }
});

/**
 * Admin Endpoint: Retrieve User traffic overview and daily charts.
 */
router.get('/overview', protect, admin, async (req, res) => {
  try {
    // 1. Total Page Views
    const totalViews = await prisma.pageView.count();

    // 2. Total active newsletter subscribers
    const totalSubscribers = await prisma.newsletterSubscriber.count({
      where: { status: 'active' }
    });

    // 3. Total feedback comments
    const totalFeedback = await prisma.feedback.count();

    // 4. Total blogs count
    const totalPosts = await prisma.post.count();

    // 5. Daily traffic trend over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const rawViews = await prisma.pageView.findMany({
      where: {
        timestamp: { gte: thirtyDaysAgo }
      },
      select: {
        timestamp: true
      }
    });

    // Group daily counts
    const dailyMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
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

    // 6. Top performing articles by view count
    const topPosts = await prisma.post.findMany({
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
        category: { select: { name: true } }
      }
    });

    return res.json({
      totalViews,
      totalSubscribers,
      totalFeedback,
      totalPosts,
      trafficChart,
      topPosts
    });
  } catch (error) {
    console.error('Failed to load traffic overview metrics:', error);
    return res.status(500).json({ message: 'Failed to retrieve analytics overview.' });
  }
});

/**
 * Admin Endpoint: Retrieve Login Audits and brute-force events.
 */
router.get('/login', protect, admin, async (req, res) => {
  try {
    const successLogs = await prisma.securityLog.count({
      where: { event: { in: ['LOGIN_SUCCESS', 'MFA_VERIFY_SUCCESS'] } }
    });

    const failureLogs = await prisma.securityLog.count({
      where: { event: { in: ['LOGIN_FAILURE', 'MFA_VERIFY_FAILURE', 'UNAUTHORIZED_ACCESS'] } }
    });

    const mfaSetupLogs = await prisma.securityLog.count({
      where: { event: 'MFA_SETUP_SUCCESS' }
    });

    const activeBlocks = loginRateLimiter.getActiveBlocksCount();

    // Recent login events timeline
    const recentLogs = await prisma.securityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 15
    });

    return res.json({
      successLogs,
      failureLogs,
      mfaSetupLogs,
      activeBlocks,
      recentLogs
    });
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
    const browsersGroup = await prisma.pageView.groupBy({
      by: ['browser'],
      _count: {
        id: true
      }
    });

    const osGroup = await prisma.pageView.groupBy({
      by: ['os'],
      _count: {
        id: true
      }
    });

    const browsers = browsersGroup.map(item => ({
      name: item.browser || 'Unknown',
      count: item._count.id
    }));

    const os = osGroup.map(item => ({
      name: item.os || 'Unknown',
      count: item._count.id
    }));

    return res.json({ browsers, os });
  } catch (error) {
    console.error('Failed to load device demographics:', error);
    return res.status(500).json({ message: 'Failed to retrieve demographics.' });
  }
});

export default router;
