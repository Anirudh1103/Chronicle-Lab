import { SECURITY_CONFIG } from '../constants/security.constants';

interface AttemptRecord {
  count: number;
  lastAttempt: number;
  lockedUntil: number;
}

class LoginRateLimiter {
  private attempts = new Map<string, AttemptRecord>();

  private getRecord(key: string): AttemptRecord {
    let record = this.attempts.get(key);
    if (!record) {
      record = { count: 0, lastAttempt: 0, lockedUntil: 0 };
      this.attempts.set(key, record);
    }
    return record;
  }

  /**
   * Check if a given key (IP/email) is currently blocked.
   */
  public isLocked(key: string): { locked: boolean; remainingMs: number } {
    const record = this.getRecord(key);
    const now = Date.now();
    if (record.lockedUntil > now) {
      return { locked: true, remainingMs: record.lockedUntil - now };
    }
    return { locked: false, remainingMs: 0 };
  }

  /**
   * Log a failed login attempt and calculate locking time frames.
   */
  public recordFailure(key: string): { count: number; lockedUntil: number } {
    const record = this.getRecord(key);
    const now = Date.now();
    record.count++;
    record.lastAttempt = now;

    const limits = SECURITY_CONFIG.RATE_LIMIT;
    if (record.count >= limits.FAIL_THRESHOLD_LOCKOUT) {
      // 20+ attempts: lock for 1 hour
      record.lockedUntil = now + 60 * 60 * 1000;
    } else if (record.count >= limits.FAIL_THRESHOLD_COOLDOWN_LONG) {
      // 10+ attempts: lock for 5 minutes
      record.lockedUntil = now + limits.COOLDOWN_LONG_MS;
    } else if (record.count >= limits.FAIL_THRESHOLD_COOLDOWN_SHORT) {
      // 5+ attempts: lock for 30 seconds
      record.lockedUntil = now + limits.COOLDOWN_SHORT_MS;
    }

    return { count: record.count, lockedUntil: record.lockedUntil };
  }

  /**
   * Clear failure counters upon successful verification.
   */
  public reset(key: string) {
    this.attempts.delete(key);
  }

  /**
   * Count how many keys are currently locked.
   */
  public getActiveBlocksCount(): number {
    const now = Date.now();
    let count = 0;
    this.attempts.forEach((record) => {
      if (record.lockedUntil > now) {
        count++;
      }
    });
    return count;
  }
}

export const loginRateLimiter = new LoginRateLimiter();
