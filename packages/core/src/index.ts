/**
 * @cc-devkits/core - Core utilities for cc-devkits
 *
 * HTTP requests, retry logic, CLI parsing, user-agent rotation, and more.
 */

// HTTP utilities
export * from './http';

// Retry with exponential backoff
export * from './retry';

// CLI argument parsing
export * from './cli';

// User agent rotation
export { USER_AGENTS, randomUserAgent } from './user-agent';

// API key anonymization
export { anonymizeKey, redactApiKey } from './anonymize';

// Deduplication
export { checkDedupe, createDedupeChecker } from './deduplicate';

// Key rotation
export { rotateKeys } from './rotate';

// Common types
export * from './types';
