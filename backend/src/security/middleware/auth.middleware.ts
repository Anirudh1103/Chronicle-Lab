import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { SECURITY_CONFIG } from '../constants/security.constants';
import { logSecurityEvent } from '../logging/security.logger';

const prisma = new PrismaClient();

/**
 * Protect route middleware: Decrypts JWT cookies and attaches user context.
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Stateful session verification
    if (decoded.sessionId) {
      const session = await prisma.session.findUnique({
        where: { token: decoded.sessionId }
      });
      
      if (!session || !session.isValid) {
        return res.status(401).json({ message: 'Not authorized, session revoked or invalid.' });
      }
      
      // Update lastActivity timestamp on active session
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActivity: new Date() }
      });
    } else {
      return res.status(401).json({ message: 'Not authorized, session expired.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, name: true, email: true, mfaEnabled: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Strict administrative email restriction checks
    if (user.role === 'ADMIN' && !SECURITY_CONFIG.ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
      await logSecurityEvent('UNAUTHORIZED_ACCESS', user.email, req);
      return res.status(403).json({ message: 'Access Denied: Administrative authority not authorized.' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

/**
 * Admin check middleware: Restricts actions to verified admin sessions.
 */
export const admin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user && user.role === 'ADMIN' && SECURITY_CONFIG.ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase())) {
    next();
  } else {
    const email = user ? user.email : 'anonymous';
    logSecurityEvent('UNAUTHORIZED_ACCESS', email, req);
    return res.status(403).json({
      message: 'Access Denied: You are not authorized to perform this action.'
    });
  }
};
