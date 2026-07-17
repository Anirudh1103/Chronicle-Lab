import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { EmailService } from '../services/email.service';

const router = Router();
const prisma = new PrismaClient();

// Email validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 1. Subscribe Endpoint
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    if (subscriber) {
      if (subscriber.status === 'active') {
        return res.status(400).json({ error: "You're already subscribed to Chronicle Lab." });
      }

      if (subscriber.status === 'pending') {
        // Cooldown protection: limit resending confirmation emails to once per 60 seconds
        const timeSinceUpdate = Date.now() - new Date(subscriber.updatedAt).getTime();
        if (timeSinceUpdate < 60 * 1000) {
          return res.status(429).json({
            error: "We've already sent a confirmation email. Please check your inbox.",
          });
        }

        // Generate new token and update expiration
        await prisma.newsletterSubscriber.update({
          where: { id: subscriber.id },
          data: {
            verificationToken: hashedToken,
            verificationTokenExpiresAt: tokenExpiry,
          },
        });

        // Send email
        const emailSent = await EmailService.sendVerificationEmail(normalizedEmail, rawToken);
        if (!emailSent) {
          return res.status(500).json({ error: 'Failed to send confirmation email. Please try again.' });
        }

        return res.json({
          message: "We've already sent a confirmation email. Please check your inbox.",
        });
      }

      if (subscriber.status === 'unsubscribed') {
        // Allow user to subscribe again
        await prisma.newsletterSubscriber.update({
          where: { id: subscriber.id },
          data: {
            status: 'pending',
            verificationToken: hashedToken,
            verificationTokenExpiresAt: tokenExpiry,
            unsubscribedAt: null,
          },
        });

        const emailSent = await EmailService.sendVerificationEmail(normalizedEmail, rawToken);
        if (!emailSent) {
          return res.status(500).json({ error: 'Failed to send confirmation email. Please try again.' });
        }

        return res.json({
          message: "Almost there! We've sent a confirmation link to your email. Please check your inbox to complete your subscription.",
        });
      }
    } else {
      // Create a new pending subscriber
      await prisma.newsletterSubscriber.create({
        data: {
          email: normalizedEmail,
          status: 'pending',
          verificationToken: hashedToken,
          verificationTokenExpiresAt: tokenExpiry,
        },
      });

      const emailSent = await EmailService.sendVerificationEmail(normalizedEmail, rawToken);
      if (!emailSent) {
        return res.status(500).json({ error: 'Failed to send confirmation email. Please try again.' });
      }

      return res.status(201).json({
        message: "Almost there! We've sent a confirmation link to your email. Please check your inbox to complete your subscription.",
      });
    }
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
});

// 2. Double Opt-in Verification Endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { verificationToken: hashedToken },
    });

    if (!subscriber) {
      return res.status(400).json({ error: 'The verification link is invalid or has already been used.' });
    }

    if (subscriber.verificationTokenExpiresAt && new Date(subscriber.verificationTokenExpiresAt) < new Date()) {
      return res.status(400).json({ error: 'The verification link has expired. Please subscribe again.' });
    }

    // Generate a secure unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'active',
        verifiedAt: new Date(),
        verificationToken: null,
        verificationTokenExpiresAt: null,
        unsubscribeToken: unsubscribeToken,
      },
    });

    res.json({
      message: "You're officially subscribed.",
      email: subscriber.email,
    });
  } catch (error) {
    console.error('Newsletter verify error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

// 3. Unsubscribe Endpoint
router.post('/unsubscribe', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Unsubscribe token is required.' });
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return res.status(400).json({ error: 'Invalid or expired unsubscribe link.' });
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        unsubscribeToken: null, // Revoke the token once used
      },
    });

    res.json({
      message: "You've been unsubscribed.",
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

export default router;
