/**
 * Deduplication utilities - Prevent duplicate notifications
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export interface DedupeOptions {
  cooldownSeconds: number;
  stateDir?: string;
}

export interface DedupeResult {
  shouldSend: boolean;
  elapsed: number;
  message: string;
}

const DEFAULT_STATE_DIR = '/tmp/.cc-devkits-dedupe';

/**
 * Create a deduplication checker
 */
export function createDedupeChecker(options: DedupeOptions) {
  const { cooldownSeconds, stateDir = DEFAULT_STATE_DIR } = options;

  return {
    check: (key: string): DedupeResult => {
      if (!existsSync(stateDir)) {
        mkdirSync(stateDir, { recursive: true });
      }

      const hash = createHash('md5').update(key).digest('hex');
      const lastFile = join(stateDir, hash);
      const now = Math.floor(Date.now() / 1000);

      if (existsSync(lastFile)) {
        try {
          const lastTime = parseInt(readFileSync(lastFile, 'utf-8'), 10);
          const elapsed = now - lastTime;

          if (elapsed < cooldownSeconds) {
            return {
              shouldSend: false,
              elapsed,
              message: `Skipped duplicate notification (${elapsed}s ago, cooldown: ${cooldownSeconds}s)`,
            };
          }
        } catch {
          // File read error, allow sending
        }
      }

      // Update timestamp
      try {
        writeFileSync(lastFile, now.toString());
      } catch {
        // Write error, still allow sending
      }

      return {
        shouldSend: true,
        elapsed: 0,
        message: 'Notification allowed',
      };
    },

    /**
     * Clear the deduplication cache
     */
    clear: (key?: string): void => {
      if (key) {
        const hash = createHash('md5').update(key).digest('hex');
        const lastFile = join(stateDir, hash);
        try {
          readFileSync(lastFile);
          writeFileSync(lastFile, '0');
        } catch {
          // Ignore errors
        }
      } else {
        // Clear all
        try {
          mkdirSync(stateDir, { recursive: true });
        } catch {
          // Ignore errors
        }
      }
    },
  };
}

/**
 * Check if we should send a notification (simple version)
 */
export function checkDedupe(
  key: string,
  cooldownSeconds: number,
  stateDir?: string
): boolean {
  const checker = createDedupeChecker({ cooldownSeconds, stateDir });
  const result = checker.check(key);
  return result.shouldSend;
}

/**
 * Record a notification was sent
 */
export function recordNotification(key: string, stateDir?: string): void {
  const dir = stateDir || DEFAULT_STATE_DIR;

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const hash = createHash('md5').update(key).digest('hex');
  const lastFile = join(dir, hash);
  const now = Math.floor(Date.now() / 1000);

  try {
    writeFileSync(lastFile, now.toString());
  } catch {
    // Ignore errors
  }
}

/**
 * Get deduplication status
 */
export function getDedupeStatus(
  key: string,
  cooldownSeconds: number,
  stateDir?: string
): DedupeResult {
  const checker = createDedupeChecker({ cooldownSeconds, stateDir });
  return checker.check(key);
}
