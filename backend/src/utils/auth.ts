import { Response } from 'express';
import jwt from 'jsonwebtoken';

export const generateToken = (id: string, sessionId: string) => {
  return jwt.sign({ id, sessionId }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

export const setTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Use lax for better cross-origin support on localhost
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  });
};
