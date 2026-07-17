import crypto from 'crypto';

/**
 * Standard Base32 decoding implementation for TOTP compatibility.
 */
function base32Decode(str: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = str.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let val = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = alphabet.indexOf(cleaned[i]);
    if (idx === -1) {
      throw new Error('Invalid base32 character in key');
    }
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((val >> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * Generates HOTP code for a given counter.
 */
export function generateHOTP(secretBase32: string, counter: number): string {
  const key = base32Decode(secretBase32);
  const buffer = Buffer.alloc(8);
  
  // Write counter as 64-bit integer
  buffer.writeUInt32BE(0, 0); // High 32 bits
  buffer.writeUInt32BE(counter, 4); // Low 32 bits

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(buffer);
  const hmacResult = hmac.digest();

  // Dynamic truncation (RFC 4226)
  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code = ((hmacResult[offset] & 0x7f) << 24) |
               ((hmacResult[offset + 1] & 0xff) << 16) |
               ((hmacResult[offset + 2] & 0xff) << 8) |
               (hmacResult[offset + 3] & 0xff);

  const otp = code % 1000000;
  return String(otp).padStart(6, '0');
}

/**
 * Generates TOTP code based on current timestamp divided by 30 seconds.
 */
export function generateTOTP(secretBase32: string): string {
  const counter = Math.floor(Date.now() / 1000 / 30);
  return generateHOTP(secretBase32, counter);
}

/**
 * Verifies standard 6-digit TOTP code allowing for clock drift window.
 */
export function verifyTOTP(secretBase32: string, token: string, windowSteps = 1): boolean {
  const counter = Math.floor(Date.now() / 1000 / 30);
  
  for (let i = -windowSteps; i <= windowSteps; i++) {
    if (generateHOTP(secretBase32, counter + i) === token) {
      return true;
    }
  }
  return false;
}

/**
 * Generates secure, cryptographically random base32 keys.
 */
export function generateSecretBase32(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = crypto.randomBytes(20); // 160 bits secret
  let result = '';
  let val = 0;
  let bits = 0;

  for (let i = 0; i < bytes.length; i++) {
    val = (val << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      result += alphabet[(val >> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    result += alphabet[(val << (5 - bits)) & 31];
  }
  return result;
}

/**
 * Generates standard OTPAuth URI for scanning QR codes.
 */
export function getOtpAuthUri(secret: string, email: string): string {
  return `otpauth://totp/Chronicle%20Lab:${encodeURIComponent(email)}?secret=${secret}&issuer=Chronicle%20Lab`;
}
