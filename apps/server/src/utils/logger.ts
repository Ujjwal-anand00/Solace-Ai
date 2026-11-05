/**
 * Sensitive field names to redact from logs
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'content', // Private journal content
  'note', // Private mood note
  'answers', // Assessment answers
  'secret',
]);

/**
 * Deep redaction of sensitive objects before logging
 */
export const redactSensitive = (obj: unknown, depth = 0): unknown => {
  if (depth > 5) return '[DepthLimit]';
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Redact JWT or Bearer tokens in plain strings
    if (obj.startsWith('Bearer ') || obj.includes('eyJhbGciOi')) {
      return '[REDACTED_TOKEN]';
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitive(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitive(value, depth + 1);
      }
    }
    return redacted;
  }

  return obj;
};

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    const safeArgs = args.map((arg) => redactSensitive(arg));
    console.info(`[${new Date().toISOString()}] [INFO] ${message}`, ...safeArgs);
  },
  warn: (message: string, ...args: unknown[]) => {
    const safeArgs = args.map((arg) => redactSensitive(arg));
    console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, ...safeArgs);
  },
  error: (message: string, ...args: unknown[]) => {
    const safeArgs = args.map((arg) => redactSensitive(arg));
    console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, ...safeArgs);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      const safeArgs = args.map((arg) => redactSensitive(arg));
      console.info(`[${new Date().toISOString()}] [DEBUG] ${message}`, ...safeArgs);
    }
  },
};
