import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, name: true, email: true },
    });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  // Strict check: Only user with ADMIN role AND specifically named Anirudh can pass
  // You can also use a specific email address for 100% certainty
  if (user && user.role === 'ADMIN' && (user.name === 'Anirudh' || user.email === 'anirudh@example.com')) {
    next();
  } else {
    res.status(403).json({
      message: 'Access Denied: You are not authorized to perform this action. Only Anirudh has write permissions.'
    });
  }
};
