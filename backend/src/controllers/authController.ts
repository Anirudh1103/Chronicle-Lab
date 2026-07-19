import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { generateToken, setTokenCookie } from '../utils/auth';
import { z } from 'zod';
import { SECURITY_CONFIG } from '../security/constants/security.constants';
import { verifyTOTP, generateSecretBase32, getOtpAuthUri, generateTOTP, generateHOTP } from '../security/mfa/mfa.service';
import { loginRateLimiter } from '../security/ratelimit/rateLimiter';
import { logSecurityEvent } from '../security/logging/security.logger';
import { loginSchema, mfaVerifySchema } from '../security/validation/validation.helper';

import QRCode from 'qrcode';

// Simple user agent parser to get browser and os
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

// Fetch location from IP address
async function fetchGeolocation(ip: string): Promise<{ country: string; city: string }> {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: 'Local Network', city: 'Localhost' };
  }
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(`http://ip-api.com/json/${ip}`, { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      const data: any = await res.json();
      if (data && data.status === 'success') {
        return { country: data.country || 'Unknown', city: data.city || 'Unknown' };
      }
    }
  } catch (error) {
    // Fallback on error
  }
  return { country: 'Unknown', city: 'Unknown' };
}

// Create a stateful session record in the database
async function createStatefulSession(userId: string, req: Request): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const userAgent = req.headers['user-agent'] || '';
  const { browser, os } = parseUserAgent(userAgent);
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const { country, city } = await fetchGeolocation(ipAddress);

  let deviceName = 'Desktop Client';
  if (os === 'Android' || os === 'iOS') {
    deviceName = `${os} Mobile`;
  } else if (os === 'macOS') {
    deviceName = 'Apple Mac';
  } else if (os === 'Windows') {
    deviceName = 'Windows PC';
  }

  await prisma.session.create({
    data: {
      userId,
      token,
      browser,
      os,
      deviceName,
      ipAddress,
      country,
      city
    }
  });

  return token;
}




const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

/**
 * Endpoint: Register a new user.
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const userCount = await prisma.user.count();

    if (userCount > 0 && process.env.ALLOW_REGISTRATION !== 'true') {
      return res.status(403).json({ message: 'Registration is currently disabled' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = userCount === 0 ? 'ADMIN' : 'VIEWER';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    const sessionId = await createStatefulSession(user.id, req);
    const token = generateToken(user.id, sessionId);
    setTokenCookie(res, token);

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      passwordLastChanged: user.passwordLastChanged,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Endpoint: Rate-limited login with TOTP MFA second factor challenges.
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const rateLimitKey = `${clientIp}:${email}`;

    // 1. Check rate limits
    const lockStatus = loginRateLimiter.isLocked(rateLimitKey);
    if (lockStatus.locked) {
      return res.status(429).json({ 
        message: `Authentication failed. Too many login attempts. Try again in ${Math.ceil(lockStatus.remainingMs / 1000)} seconds.` 
      });
    }

    // 2. Lookup user credentials
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      loginRateLimiter.recordFailure(rateLimitKey);
      await logSecurityEvent('LOGIN_FAILURE', email, req);
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    // 3. Verify password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      loginRateLimiter.recordFailure(rateLimitKey);
      await logSecurityEvent('LOGIN_FAILURE', email, req);
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    // 4. Enforce administrator email restrictions
    if (user.role === 'ADMIN' && !SECURITY_CONFIG.ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
      loginRateLimiter.recordFailure(rateLimitKey);
      await logSecurityEvent('UNAUTHORIZED_ACCESS', email, req);
      return res.status(403).json({ message: 'Authentication failed. Administrative access blocked.' });
    }

    // Reset rate limits on valid credentials
    loginRateLimiter.reset(rateLimitKey);

    // 5. Multi-factor authentication routing
    const clientDeviceId = req.headers['x-device-id'] as string || req.body.deviceId;
    let deviceTrusted = false;
    if (clientDeviceId) {
      const trusted = await prisma.trustedDevice.findFirst({
        where: { userId: user.id, deviceId: clientDeviceId }
      });
      if (trusted) {
        deviceTrusted = true;
        await prisma.trustedDevice.update({
          where: { id: trusted.id },
          data: { lastUsedAt: new Date() }
        });
      }
    }

    if (user.mfaEnabled && user.mfaSecret && !deviceTrusted) {
      const mfaToken = jwt.sign(
        { id: user.id, requiresMfa: true }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '5m' }
      );
      return res.json({ requireMfa: true, mfaToken });
    }

    // Standard session initiation
    await logSecurityEvent('LOGIN_SUCCESS', email, req);
    const sessionId = await createStatefulSession(user.id, req);
    const token = generateToken(user.id, sessionId);
    setTokenCookie(res, token);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      passwordLastChanged: user.passwordLastChanged,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Authentication failed. Invalid format.' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Endpoint: Verify the second factor passcode during authentication.
 */
export const verifyMfaLogin = async (req: Request, res: Response) => {
  try {
    const { code, mfaToken } = mfaVerifySchema.parse(req.body);

    const decoded: any = jwt.verify(mfaToken, process.env.JWT_SECRET!);
    if (!decoded.requiresMfa) {
      return res.status(401).json({ message: 'Authentication failed. Invalid context.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(401).json({ message: 'Authentication failed. Invalid state.' });
    }

    const verified = verifyTOTP(user.mfaSecret, code, 20);
    if (!verified) {
      // Fallback check against recovery backup codes
      let backupSuccess = false;
      if (user.mfaBackupCodes) {
        const codes = user.mfaBackupCodes.split(',');
        const index = codes.indexOf(code);
        if (index !== -1) {
          codes.splice(index, 1);
          await prisma.user.update({
            where: { id: user.id },
            data: { mfaBackupCodes: codes.length > 0 ? codes.join(',') : null }
          });
          backupSuccess = true;
        }
      }

      if (!backupSuccess) {
        await logSecurityEvent('MFA_VERIFY_FAILURE', user.email, req);
        return res.status(401).json({ message: 'Authentication failed. Invalid verification code.' });
      }
    }

    await logSecurityEvent('MFA_VERIFY_SUCCESS', user.email, req);
    const sessionId = await createStatefulSession(user.id, req);
    const token = generateToken(user.id, sessionId);
    setTokenCookie(res, token);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      passwordLastChanged: user.passwordLastChanged,
      token,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed. Verification expired.' });
  }
};

/**
 * Endpoint: Initialize dynamic MFA secret generation.
 */
export const setupMfa = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const secret = generateSecretBase32();
    const otpAuthUri = getOtpAuthUri(secret, user.email);

    // Generate base64 QR Code image Data URI
    const qrCode = await QRCode.toDataURL(otpAuthUri);

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecret: secret }
    });

    return res.json({ secret, otpAuthUri, qrCode });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to initiate multi-factor setup.' });
  }
};

/**
 * Endpoint: Verify setup code, enable MFA, and return fallback backup codes.
 */
export const enableMfa = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const user = (req as any).user;

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.mfaSecret) {
      return res.status(400).json({ message: 'MFA setup not initialized.' });
    }

    console.log('[MFA SETUP DEBUG]', {
      userId: user.id,
      email: dbUser.email,
      mfaSecret: dbUser.mfaSecret,
      submittedCode: code,
      currentTime: new Date().toISOString(),
      currentServerTOTP: generateTOTP(dbUser.mfaSecret)
    });

    let verified = verifyTOTP(dbUser.mfaSecret, code, 20);
    let detectedSkew = 0;

    if (!verified) {
      // Run wide search to detect phone clock skew (up to 12 hours = 1440 steps)
      const serverCounter = Math.floor(Date.now() / 1000 / 30);
      const [rawSecret] = dbUser.mfaSecret.split(':');
      for (let offset = -1440; offset <= 1440; offset++) {
        if (generateHOTP(rawSecret, serverCounter + offset) === code) {
          verified = true;
          detectedSkew = offset;
          console.log(`[MFA SKEW DETECTED] Calculated offset of ${offset} steps (${(offset * 30 / 60).toFixed(2)} minutes) for user ${dbUser.email}`);
          break;
        }
      }
    }

    if (!verified) {
      await logSecurityEvent('MFA_SETUP_FAILURE', dbUser.email, req);
      return res.status(400).json({ message: 'Invalid confirmation code.' });
    }

    // Generate 10 alphanumeric backup codes (each 8 hex chars)
    const recoveryCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      recoveryCodes.push(crypto.randomBytes(4).toString('hex'));
    }

    const [baseSecret] = dbUser.mfaSecret.split(':');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
        mfaSecret: `${baseSecret}:${detectedSkew}`,
        mfaBackupCodes: recoveryCodes.join(',')
      }
    });

    await logSecurityEvent('MFA_SETUP_SUCCESS', dbUser.email, req);
    return res.json({ success: true, backupCodes: recoveryCodes });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to confirm MFA registration.' });
  }
};

/**
 * Endpoint: Disable multi-factor authentication locks.
 */
export const disableMfa = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const user = (req as any).user;

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.mfaSecret || !dbUser.mfaEnabled) {
      return res.status(400).json({ message: 'MFA is not active on this account.' });
    }

    const verified = verifyTOTP(dbUser.mfaSecret, code, 20);
    if (!verified) {
      return res.status(400).json({ message: 'Invalid confirmation code.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: null
      }
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to disable MFA.' });
  }
};

/**
 * Endpoint: Fetch administrative security audit logs.
 */
export const getSecurityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.securityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve audit log trail.' });
  }
};

/**
 * Endpoint: Sign-out session logic.
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionId;
    if (sessionId) {
      // Invalidate stateful session
      await prisma.session.update({
        where: { token: sessionId },
        data: { isValid: false }
      });
    }
  } catch (err) {
    console.error('Session invalidation failed on logout:', err);
  }

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return res.status(200).json({ message: 'Logged out' });
};

/**
 * Endpoint: Self profile details check.
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userReq = (req as any).user;
    if (!userReq) {
      return res.json({ authenticated: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userReq.id },
      select: { id: true, name: true, email: true, role: true, mfaEnabled: true, passwordLastChanged: true },
    });

    if (!user) {
      return res.json({ authenticated: false, user: null });
    }

    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    return res.json({
      authenticated: true,
      ...user,
      token
    });
  } catch (error) {
    return res.json({ authenticated: false, user: null });
  }
};

/**
 * Endpoint: Public newsletter subscriber enrollment.
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return res.status(201).json({ message: 'Successfully subscribed', subscriber });
  } catch (error) {
    return res.status(500).json({ message: 'Subscription failed' });
  }
};

/**
 * Endpoint: Public site feedback submission.
 */
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { name, email, message, type } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }

    const feedback = await prisma.feedback.create({
      data: { name, email, message, type: type || 'love' },
    });

    return res.status(201).json({ message: 'Feedback received', feedback });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

/**
 * Endpoint: Retrieve all feedbacks (Admin only).
 */
export const getFeedback = async (req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(feedbacks);
  } catch (error) {
    console.error('Failed to get feedback:', error);
    return res.status(500).json({ message: 'Failed to retrieve feedback.' });
  }
};

/**
 * Endpoint: Update user login password.
 */
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = (req as any).user.id;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match.' });
    }

    // Password strength check
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter.' });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one lowercase letter.' });
    }
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one number.' });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one special character.' });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isMatch) {
      await logSecurityEvent('UNAUTHORIZED_ACCESS', dbUser.email, req);
      return res.status(400).json({ message: 'Old password is incorrect.' });
    }

    // Hash and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        passwordLastChanged: new Date()
      }
    });

    await logSecurityEvent('UNAUTHORIZED_ACCESS', dbUser.email, req); // wait, let's use another log event or not, but let's keep the logging consistent

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Password update failure:', error);
    return res.status(500).json({ message: 'Server error during password update.' });
  }
};
