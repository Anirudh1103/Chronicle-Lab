import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';



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

  if (user && user.role === 'ADMIN') {
    next();
  } else {
    console.warn('Admin Access Denied for user:', user);
    res.status(403).json({
      message: 'Access Denied: You are not authorized to perform this action.'
    });
  }
};
