/**
 * @cc-devkits/ntfy - ntfy notification client
 */

import { makeRequest, checkDedupe } from '@cc-devkits/core';
import type { NtfyOptions, NtfyConfig, NtfyResponse, NtfyPriority } from './types';

export * from './types';

const DEFAULT_TIMEOUT = 10;
const COOLDOWN_SECONDS = 12;

function getConfig(options: NtfyOptions): NtfyConfig {
  const baseUrl =
    options.baseUrl || process.env.NTFY_BASE_URL || 'https://ntfy.sh';
  const topic = options.topic || process.env.NTFY_TOPIC || 'openclaw';
  const apiKey = options.apiKey || process.env.NTFY_API_KEY;

  if (!topic) {
    throw new Error(
      'ntfy topic is required. Set NTFY_TOPIC environment variable or pass topic option.'
    );
  }

  return {
    baseUrl,
    topic,
    apiKey,
  };
}

function priorityToNumber(priority: NtfyPriority): number {
  const mapping: Record<NtfyPriority, number> = {
    min: 1,
    low: 2,
    default: 3,
    high: 4,
    max: 5,
    urgent: 5,
  };
  return mapping[priority] || 3;
}

/**
 * Send a notification via ntfy
 */
export async function send(options: NtfyOptions): Promise<NtfyResponse> {
  const config = getConfig(options);
  const timeout = options.timeout || DEFAULT_TIMEOUT;

  // Build headers
  const headers: Record<string, string> = {
    Title: options.title,
    Priority: String(priorityToNumber(options.priority || 'default')),
  };

  if (options.tags && options.tags.length > 0) {
    headers['Tags'] = options.tags.join(',');
  }

  if (options.click) {
    headers['Click'] = options.click;
  }

  if (options.attach) {
    headers['Attach'] = options.attach;
  }

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const url = `${config.baseUrl.replace(/\/$/, '')}/${config.topic}`;

  const result = await makeRequest({
    url,
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'text/plain',
    },
    body: options.message,
    timeout: timeout * 1000,
  });

  return JSON.parse(result) as NtfyResponse;
}

/**
 * Send notification with deduplication (prevents duplicate notifications within cooldown period)
 */
export async function sendWithDedupe(
  options: NtfyOptions,
  dedupeKey?: string
): Promise<NtfyResponse | null> {
  const key = dedupeKey || `${options.title}:${options.message}`;

  const shouldSend = checkDedupe(key, COOLDOWN_SECONDS);
  if (!shouldSend) {
    return null;
  }

  return send(options);
}
