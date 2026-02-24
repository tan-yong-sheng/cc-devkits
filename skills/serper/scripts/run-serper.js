#!/usr/bin/env node
/**
 * Serper Command Runner
 *
 * Executes Serper search/scrape directly from Claude Code skill runtime.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const STATE_FILE = path.join(os.homedir(), '.claude', 'serper-key-rotation.json');
const SEARCH_ENDPOINT = 'https://google.serper.dev/search';
const SCRAPE_ENDPOINT = 'https://scrape.serper.dev';
const DEFAULT_TIMEOUT_MS = 30000;

function loadEnvFiles(cwd = process.cwd()) {
  const envPaths = [
    path.join(cwd, '.claude', 'skills', 'serper', '.env'),
    path.join(cwd, '.claude', '.env'),
    path.join(cwd, '.env'),
    path.join(os.homedir(), '.claude', '.env')
  ];

  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;

    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) return;

      const key = match[1];
      const value = match[2].replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  }
}

function getApiKey() {
  loadEnvFiles();

  if (process.env.SERPER_API_KEYS) {
    const keys = process.env.SERPER_API_KEYS.split(';').filter((k) => k.trim());

    if (keys.length > 1) {
      let state = { currentIndex: 0 };

      if (fs.existsSync(STATE_FILE)) {
        try {
          state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        } catch {}
      }

      const key = keys[state.currentIndex % keys.length];
      state.currentIndex = (state.currentIndex + 1) % keys.length;

      fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

      return key.trim();
    }

    return keys[0]?.trim() || null;
  }

  return process.env.SERPER_API_KEY?.trim() || null;
}

function isValidKeyFormat(key) {
  return key && /^[a-f0-9]{40}$/i.test(key);
}

function anonymizeKey(key, visible = 8) {
  if (!key || key.length <= visible * 2) return '***';
  return `${key.slice(0, visible)}...${key.slice(-visible)}`;
}

function parseArgs(rawArgs) {
  const command = rawArgs[0];
  const options = {};

  for (let i = 1; i < rawArgs.length; i++) {
    const token = rawArgs[i];
    if (!token.startsWith('--')) continue;

    const eqIdx = token.indexOf('=');
    if (eqIdx > -1) {
      const key = token.slice(2, eqIdx);
      const value = token.slice(eqIdx + 1);
      options[key] = value === '' ? true : value;
      continue;
    }

    const key = token.slice(2);
    const next = rawArgs[i + 1];

    if (!next || next.startsWith('--')) {
      options[key] = true;
    } else {
      options[key] = next;
      i += 1;
    }
  }

  return { command, options };
}

function toInt(value, fallback) {
  if (value === undefined || value === true) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function toTimeout(value) {
  return toInt(value, DEFAULT_TIMEOUT_MS);
}

function ensureValidUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) {
      throw new Error('URL must start with http:// or https://');
    }
  } catch {
    throw new Error('Invalid URL. Usage: scrape --url "https://example.com" [--markdown] [--timeout 30000]');
  }
}

async function requestSerper(endpoint, apiKey, body, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    const text = await response.text();

    if (!response.ok) {
      const error = new Error(`Serper request failed with status ${response.status}`);
      error.status = response.status;
      error.body = text;
      throw error;
    }

    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Request timeout');
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runSearch(options, apiKey) {
  const query = typeof options.query === 'string' ? options.query.trim() : '';
  if (!query) {
    throw new Error('Query is required. Usage: search --query "text" [--gl us] [--hl en] [--num 10] [--page 1]');
  }

  const body = {
    q: query,
    gl: typeof options.gl === 'string' ? options.gl : 'us',
    hl: typeof options.hl === 'string' ? options.hl : 'en',
    num: Math.min(toInt(options.num, 10), 100),
    page: toInt(options.page, 1),
    ...(typeof options.location === 'string' && options.location.trim()
      ? { location: options.location.trim() }
      : {})
  };

  return requestSerper(SEARCH_ENDPOINT, apiKey, body, toTimeout(options.timeout));
}

async function runScrape(options, apiKey) {
  const url = typeof options.url === 'string' ? options.url.trim() : '';
  if (!url) {
    throw new Error('URL is required. Usage: scrape --url "https://example.com" [--markdown] [--timeout 30000]');
  }

  ensureValidUrl(url);

  const body = {
    url,
    includeMarkdown: Boolean(options.markdown)
  };

  return requestSerper(SCRAPE_ENDPOINT, apiKey, body, toTimeout(options.timeout));
}

function showUsage() {
  console.log('Usage: node run-serper.js [search|scrape] [options...]');
  console.log('');
  console.log('Commands:');
  console.log('  search --query "AI news" [--gl us] [--hl en] [--num 10] [--page 1] [--timeout 30000]');
  console.log('  scrape --url "https://example.com" [--markdown] [--timeout 30000]');
  console.log('');
  console.log('Environment:');
  console.log('  SERPER_API_KEY       Single API key');
  console.log('  SERPER_API_KEYS      Multiple keys for rotation (key1;key2;key3)');
}

function printApiError(error) {
  const stderr = String(error?.body || error?.message || '');

  if (error?.status === 401 || stderr.includes('Unauthorized')) {
    console.error('Error: Invalid API key (401 Unauthorized)');
    console.error('Please check your SERPER_API_KEY at https://serper.dev');
    return;
  }

  if (error?.status === 429 || stderr.includes('Rate limit')) {
    console.error('Error: Rate limit exceeded (429)');
    console.error('Free tier: 2500 queries/month | Paid tier: 50000 queries/month');
    if (process.env.SERPER_API_KEYS?.includes(';')) {
      console.error('');
      console.error('Tip: You have multiple keys. Retry to rotate to next key.');
    }
    return;
  }

  if (error?.status === 408 || stderr.includes('timeout') || stderr.includes('ENOTFOUND')) {
    console.error('Error: Network issue or timeout');
    console.error('Please check your internet connection');
    return;
  }

  console.error('Error:', stderr || 'Unknown request error');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('Error: SERPER_API_KEY not found');
    console.error('');
    console.error('Get a free API key at: https://serper.dev');
    console.error('');
    console.error('Set it via environment variable:');
    console.error('  export SERPER_API_KEY="your-key-here"');
    console.error('');
    console.error('Or create a .env file in your project root:');
    console.error('  SERPER_API_KEY=your-key-here');
    process.exit(1);
  }

  if (!isValidKeyFormat(apiKey)) {
    console.error(`Error: Invalid API key format: ${anonymizeKey(apiKey)}`);
    console.error('Expected: 40 character hex string');
    process.exit(1);
  }

  const { command, options } = parseArgs(args);

  console.error(`Key: ${anonymizeKey(apiKey)}`);
  console.error('');

  try {
    let result;

    if (command === 'search') {
      result = await runSearch(options, apiKey);
    } else if (command === 'scrape') {
      result = await runScrape(options, apiKey);
    } else {
      showUsage();
      process.exit(1);
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    printApiError(error);
    process.exit(error?.status || 1);
  }
}

main();
