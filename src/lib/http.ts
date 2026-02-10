/**
 * HTTP utilities - HTTP/HTTPS request helpers
 */

import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';
import { VerboseOptions } from './types.js';

export interface RequestOptions extends VerboseOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  apiKey?: string;
  apiKeyHeader?: string;
}

export interface HttpResult {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
}

/**
 * Make HTTP/HTTPS request (returns body only)
 */
export async function makeRequest(options: RequestOptions): Promise<string> {
  const result = await rawRequest(options);
  return result.body;
}

/**
 * Make HTTP request and return full details
 */
export async function rawRequest(options: RequestOptions): Promise<HttpResult> {
  const {
    url,
    method = 'POST',
    headers = {},
    body,
    timeout = 10000,
    apiKey,
    apiKeyHeader = 'X-API-KEY',
    verbose = false,
  } = options;

  const parsedUrl = new URL(url);
  const client = parsedUrl.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const requestHeaders = { ...headers };

    // Add API key if provided
    if (apiKey) {
      requestHeaders[apiKeyHeader] = apiKey;
      if (verbose) {
        console.error(`INFO: Using API key header: ${apiKeyHeader}`);
      }
    }

    // Set default content type
    if (!requestHeaders['Content-Type'] && body) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const req = client.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        headers: requestHeaders,
        timeout,
      },
      (res) => {
        let data = '';
        const responseHeaders: Record<string, string> = {};

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          // Collect response headers
          res.rawHeaders?.forEach((header: string, index: number) => {
            if (index % 2 === 0 && res.headers[header.toLowerCase()]) {
              responseHeaders[header.toLowerCase()] = String(res.headers[header.toLowerCase()]);
            }
          });

          if (verbose) {
            console.error(`INFO: Response status: ${res.statusCode}`);
          }

          resolve({
            statusCode: res.statusCode || 0,
            body: data,
            headers: responseHeaders,
          });
        });
      }
    );

    req.on('error', (err) => {
      if (verbose) {
        console.error(`ERROR: Request failed: ${err.message}`);
      }
      reject(err);
    });

    req.on('timeout', () => {
      if (verbose) {
        console.error('ERROR: Request timed out');
      }
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

/**
 * Simple GET request
 */
export function getRequest(url: string, headers?: Record<string, string>): Promise<string> {
  return makeRequest({
    url,
    method: 'GET',
    headers,
  });
}

/**
 * Simple POST request with JSON body
 */
export function postRequest(
  url: string,
  body: Record<string, unknown> | string,
  headers?: Record<string, string>
): Promise<string> {
  const jsonBody = typeof body === 'string' ? body : JSON.stringify(body);
  return makeRequest({
    url,
    method: 'POST',
    body: jsonBody,
    headers,
  });
}
