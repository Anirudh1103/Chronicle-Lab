import prisma from '../../config/db';
import { Request } from 'express';



export async function logSecurityEvent(
  event: 
    | 'LOGIN_SUCCESS' 
    | 'LOGIN_FAILURE' 
    | 'MFA_SETUP_SUCCESS' 
    | 'MFA_SETUP_FAILURE' 
    | 'MFA_VERIFY_SUCCESS' 
    | 'MFA_VERIFY_FAILURE' 
    | 'LOGOUT' 
    | 'UNAUTHORIZED_ACCESS',
  email: string,
  req?: Request
) {
  setImmediate(async () => {
    try {
      let ipAddress: string | null = null;
      let userAgent: string | null = null;

      if (req) {
        ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
        userAgent = req.headers['user-agent'] || null;
      }

      let browser: string | null = null;
      let os: string | null = null;

      if (userAgent) {
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('Opera')) browser = 'Opera';
        else browser = 'Unknown Browser';

        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Macintosh')) os = 'macOS';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else os = 'Unknown OS';
      }

      await prisma.securityLog.create({
        data: {
          event,
          email,
          ipAddress,
          userAgent,
          browser,
          os
        }
      });
    } catch (err) {
      console.error('Failed to log security event:', err);
    }
  });
}
