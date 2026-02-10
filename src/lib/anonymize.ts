/**
 * Anonymization utilities - API key redaction
 */

/**
 * Anonymize an API key for logging
 */
export function anonymizeKey(key: string, visibleChars = 3): string {
  if (!key || key.length <= visibleChars * 2 + 3) {
    return '***';
  }
  return `${key.slice(0, visibleChars)}***${key.slice(-visibleChars)}`;
}

/**
 * Redact API key from output
 */
export function redactApiKey(key: string, replacement = '***'): string {
  // Replace the key with asterisks
  return replacement.repeat(key.length);
}

/**
 * Create a filter function to anonymize keys in output
 */
export function createAnonymizeFilter(
  keys: string[],
  replacement = '[REDACTED]'
): (output: string) => string {
  return (output: string): string => {
    let result = output;
    for (const key of keys) {
      result = redactApiKey(key, replacement);
    }
    return result;
  };
}

/**
 * Safe logging with API key redaction
 */
export function safeLog(
  message: string,
  apiKey?: string,
  logger: (msg: string) => void = console.error
): void {
  if (apiKey) {
    const anonymized = anonymizeApiKey(apiKey);
    logger(message.replace(apiKey, anonymized));
  } else {
    logger(message);
  }
}

/**
 * Anonymize API key (backward compatibility alias)
 */
export function anonymizeApiKey(key: string): string {
  return anonymizeKey(key);
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitive(
  data: string,
  patterns: RegExp[]
): string {
  let result = data;
  for (const pattern of patterns) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

/**
 * Common patterns for sensitive data
 */
export const SENSITIVE_PATTERNS = [
  /api[_-]?key["']?\s*[:=]\s*["']?([^"'\s,}]+)["']?/gi,
  /token["']?\s*[:=]\s*["']?([^"'\s,}]+)["']?/gi,
  /Bearer\s+([a-zA-Z0-9-_.]+)/gi,
  /password["']?\s*[:=]\s*["']?([^"'\s,}]+)["']?/gi,
];

/**
 * Mask common sensitive patterns in output
 */
export function maskSensitivePatterns(data: string): string {
  return maskSensitive(data, SENSITIVE_PATTERNS);
}
