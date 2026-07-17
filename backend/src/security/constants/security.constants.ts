export const SECURITY_CONFIG = {
  // Only email address allowed to access Admin Portal
  ADMIN_EMAIL: 'cmanirudh03@gmail.com',

  // Session activity timeouts (15 minutes in milliseconds)
  SESSION_TIMEOUT_MS: 15 * 60 * 1000,

  // Authentication Lockout controls
  RATE_LIMIT: {
    FAIL_THRESHOLD_COOLDOWN_SHORT: 5,   // 5 attempts
    COOLDOWN_SHORT_MS: 30 * 1000,       // 30 second penalty
    
    FAIL_THRESHOLD_COOLDOWN_LONG: 10,   // 10 attempts
    COOLDOWN_LONG_MS: 5 * 60 * 1000,    // 5 minutes penalty

    FAIL_THRESHOLD_LOCKOUT: 20,         // 20 attempts -> account lock
  },

  // Password rules
  PASSWORD_RULES: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },

  // Security Headers Configuration
  HEADERS: {
    CSP: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';",
    HSTS_MAX_AGE_SECONDS: 31536000 // 1 year
  }
};
