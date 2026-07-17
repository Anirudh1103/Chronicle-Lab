import { z } from 'zod';

/**
 * Validation schema for email password authentication payloads.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

/**
 * Validation schema for TOTP second factor code verification.
 */
export const mfaVerifySchema = z.object({
  code: z.string().length(6, 'Passcode must be exactly 6 digits'),
  mfaToken: z.string().min(1, 'Short-lived MFA token context is required'),
});

/**
 * Validation schema for dynamic glossary inputs.
 */
export const glossaryTermSchema = z.object({
  term: z.string().min(1, 'Glossary term is required'),
  definition: z.string().min(1, 'Definition description is required'),
  category: z.enum(['history', 'technology', 'cybersecurity']),
});
