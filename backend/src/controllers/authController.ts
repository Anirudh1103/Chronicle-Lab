import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { generateToken, setTokenCookie } from '../utils/auth';
import { z } from 'zod';
import { SECURITY_CONFIG } from '../security/constants/security.constants';
import { verifyTOTP, generateSecretBase32, getOtpAuthUri } from '../security/mfa/mfa.service';
import { loginRateLimiter } from '../security/ratelimit/rateLimiter';
import { logSecurityEvent } from '../security/logging/security.logger';
import { loginSchema, mfaVerifySchema } from '../security/validation/validation.helper';

const prisma = new PrismaClient();

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

    const token = generateToken(user.id);
    setTokenCookie(res, token);

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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
    if (user.role === 'ADMIN' && user.email.toLowerCase() !== SECURITY_CONFIG.ADMIN_EMAIL.toLowerCase()) {
      loginRateLimiter.recordFailure(rateLimitKey);
      await logSecurityEvent('UNAUTHORIZED_ACCESS', email, req);
      return res.status(403).json({ message: 'Authentication failed. Administrative access blocked.' });
    }

    // Reset rate limits on valid credentials
    loginRateLimiter.reset(rateLimitKey);

    // 5. Multi-factor authentication routing
    if (user.mfaEnabled && user.mfaSecret) {
      const mfaToken = jwt.sign(
        { id: user.id, requiresMfa: true }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '5m' }
      );
      return res.json({ requireMfa: true, mfaToken });
    }

    // Standard session initiation
    await logSecurityEvent('LOGIN_SUCCESS', email, req);
    const token = generateToken(user.id);
    setTokenCookie(res, token);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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

    const verified = verifyTOTP(user.mfaSecret, code);
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
    const token = generateToken(user.id);
    setTokenCookie(res, token);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecret: secret }
    });

    return res.json({ secret, otpAuthUri });
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

    const verified = verifyTOTP(dbUser.mfaSecret, code);
    if (!verified) {
      await logSecurityEvent('MFA_SETUP_FAILURE', dbUser.email, req);
      return res.status(400).json({ message: 'Invalid confirmation code.' });
    }

    // Generate 10 alphanumeric backup codes (each 8 hex chars)
    const recoveryCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      recoveryCodes.push(crypto.randomBytes(4).toString('hex'));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
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

    const verified = verifyTOTP(dbUser.mfaSecret, code);
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
export const logout = (req: Request, res: Response) => {
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
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: { id: true, name: true, email: true, role: true, mfaEnabled: true },
    });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
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
