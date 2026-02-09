/**
 * User agent utilities - Rotation and selection
 */

/**
 * Realistic user agents for web scraping
 */
export const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
] as const;

export type UserAgent = (typeof USER_AGENTS)[number];

/**
 * Get a random user agent
 */
export function randomUserAgent(): UserAgent {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Rotate to next user agent (cycles through list)
 */
let lastUserAgentIndex = -1;

export function rotateUserAgent(): UserAgent {
  lastUserAgentIndex = (lastUserAgentIndex + 1) % USER_AGENTS.length;
  return USER_AGENTS[lastUserAgentIndex];
}

/**
 * Get random jitter delay (100-500ms by default)
 */
export function randomJitter(maxJitter = 500): number {
  return 100 + Math.floor(Math.random() * (maxJitter - 100));
}

/**
 * Get random delay in milliseconds
 */
export function randomDelay(minMs = 100, maxMs = 1000): number {
  return minMs + Math.floor(Math.random() * (maxMs - minMs));
}

/**
 * Async sleep with random jitter
 */
export function sleepWithJitter(maxJitterMs = 500): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, randomJitter(maxJitterMs));
  });
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
