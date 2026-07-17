import { Request, Response, NextFunction } from 'express';
import { SECURITY_CONFIG } from '../constants/security.constants';

/**
 * Express middleware to inject standard security headers.
 */
export const setSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent site loading inside sub-frame elements (Clickjacking defense)
  res.setHeader('X-Frame-Options', 'DENY');

  // Strict content sniffing protection
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Strict cross-origin referrer boundaries
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Legacy cross-site scripting filter block
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy (CSP)
  res.setHeader('Content-Security-Policy', SECURITY_CONFIG.HEADERS.CSP);

  // Strict Transport Security (HSTS) - only when accessed securely (HTTPS)
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (isHttps) {
    res.setHeader(
      'Strict-Transport-Security',
      `max-age=${SECURITY_CONFIG.HEADERS.HSTS_MAX_AGE_SECONDS}; includeSubDomains; preload`
    );
  }

  next();
};
