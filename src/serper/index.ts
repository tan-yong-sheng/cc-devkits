/**
 * @tan-yong-sheng/cc-devkits/serper - Serper API wrapper for Google Search and web scraping
 */

import { makeRequest, retry, anonymizeKey, rotateKeys } from '../lib/index.js';
import type { RequestOptions } from '../lib/index.js';
import type {
  SearchOptions,
  ScrapeOptions,
  SearchResponse,
  ScrapeResponse,
} from './types.js';

export * from './types.js';

const SERPER_API_BASE = 'https://google.serper.dev';
const SCRAPE_API_BASE = 'https://scrape.serper.dev';

function getApiKey(providedKey?: string): string {
  // 1. Priority: Provided key
  if (providedKey) return providedKey;

  // 2. Next: Rotated keys from SERPER_API_KEYS
  const rotatedKey = rotateKeys('SERPER_API_KEYS', 'serper');
  if (rotatedKey) return rotatedKey;

  // 3. Fallback: Single SERPER_API_KEY
  const apiKey = process.env.SERPER_API_KEY || '';
  if (!apiKey) {
    throw new Error(
      'SERPER_API_KEY or SERPER_API_KEYS environment variable is required. Get a free API key at: https://serper.dev'
    );
  }
  return apiKey;
}

async function serperRequest(
  url: string,
  data: object,
  apiKey: string,
  verbose?: boolean
): Promise<string> {
  const requestOptions: RequestOptions = {
    url,
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    verbose,
  };

  if (verbose) {
    console.error(`INFO: API Key: ${anonymizeKey(apiKey)}`);
    console.error('INFO: Sending request...');
  }

  return makeRequest(requestOptions);
}

/**
 * Search Google using Serper API
 */
export async function search(
  query: string,
  options: Omit<SearchOptions, 'query'> = {}
): Promise<SearchResponse> {
  const {
    num = 10,
    gl = 'us',
    hl = 'en',
    location,
    page = 1,
    apiKey: providedKey,
    verbose,
  } = options;

  const apiKey = getApiKey(providedKey);

  const requestBody = {
    q: query,
    num,
    gl,
    hl,
    page,
    ...(location && { location }),
  };

  const result = await retry({
    fn: () =>
      serperRequest(
        `${SERPER_API_BASE}/search`,
        requestBody,
        apiKey,
        verbose
      ),
    maxAttempts: 3,
    onRetry: (error, attempt) => {
      if (verbose) {
        console.error(
          `Attempt ${attempt} failed: ${error.message}. Retrying...`
        );
      }
    },
  });

  return JSON.parse(result) as SearchResponse;
}

/**
 * Scrape a webpage using Serper API
 */
export async function scrape(
  url: string,
  options: Omit<ScrapeOptions, 'url'> = {}
): Promise<ScrapeResponse> {
  const { markdown = false, apiKey: providedKey, verbose } = options;

  const apiKey = getApiKey(providedKey);

  const requestBody = {
    url,
    includeMarkdown: markdown,
  };

  const result = await retry({
    fn: () =>
      serperRequest(
        `${SCRAPE_API_BASE}`,
        requestBody,
        apiKey,
        verbose
      ),
    maxAttempts: 3,
    onRetry: (error, attempt) => {
      if (verbose) {
        console.error(
          `Attempt ${attempt} failed: ${error.message}. Retrying...`
        );
      }
    },
  });

  return JSON.parse(result) as ScrapeResponse;
}
