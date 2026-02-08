#!/usr/bin/env node
/**
 * Serper CLI - TypeScript Implementation
 * Google Search and web scraping via Serper API
 */

import https from 'node:https';
import { URL } from 'node:url';

const VERSION = '1.0.0';

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function randomJitter(): Promise<void> {
  const jitter = 100 + Math.floor(Math.random() * 400);
  return new Promise(resolve => setTimeout(resolve, jitter));
}

function anonymizeApiKey(key: string): string {
  if (key.length <= 8) return '***';
  return `${key.slice(0, 3)}***${key.slice(-3)}`;
}

interface RetryOptions {
  url: string;
  data: string;
  maxAttempts?: number;
  verbose?: boolean;
  apiKey: string;
}

async function retryRequest(options: RetryOptions): Promise<string> {
  const { url, data, maxAttempts = 3, verbose = false, apiKey } = options;
  let attempt = 1;
  let delay = 1000;

  while (attempt <= maxAttempts) {
    await randomJitter();

    try {
      const result = await makeRequest(url, data, apiKey, verbose);
      return result;
    } catch (error) {
      const statusCode = (error as Error & { statusCode?: number }).statusCode;

      if (statusCode === 401 || statusCode === 403) {
        throw new Error(`Authentication failed (HTTP ${statusCode}) - API key: ${anonymizeApiKey(apiKey)}`);
      }

      if (attempt < maxAttempts) {
        console.error(`Attempt ${attempt} failed (HTTP ${statusCode || 'unknown'}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }

      attempt++;
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts`);
}

function makeRequest(url: string, data: string, apiKey: string, verbose: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': randomUserAgent(),
      },
    };

    if (verbose) {
      console.error(`INFO: API Key: ${anonymizeApiKey(apiKey)}`);
      console.error('INFO: Sending request...');
    }

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(body);
        } else {
          const error = new Error(`HTTP ${res.statusCode}`) as Error & { statusCode?: number };
          error.statusCode = res.statusCode;
          reject(error);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

interface SearchOptions {
  query: string;
  num?: number;
  gl?: string;
  hl?: string;
  location?: string;
  page?: number;
  json?: boolean;
  retries?: number;
  verbose?: boolean;
}

async function cmdSearch(options: SearchOptions, apiKey: string): Promise<void> {
  const {
    query,
    num = 10,
    gl = 'us',
    hl = 'en',
    location = '',
    page = 1,
    json = false,
    retries = 3,
    verbose = false,
  } = options;

  if (!query) {
    console.error('Error: Query is required');
    process.exit(1);
  }

  const jsonData = JSON.stringify({
    q: query,
    num,
    gl,
    hl,
    page,
    ...(location && { location }),
  });

  const result = await retryRequest({
    url: 'https://google.serper.dev/search',
    data: jsonData,
    maxAttempts: retries,
    verbose,
    apiKey,
  });

  if (json) {
    console.log(result);
  } else {
    console.log(`\n🔍 Search: "${query}"\n`);
    const parsed = JSON.parse(result);
    if (parsed.organic) {
      for (const item of parsed.organic) {
        console.log(`${item.position}. ${item.title}`);
        console.log(`   ${item.link}`);
        console.log(`   ${item.snippet}\n`);
      }
    }
  }
}

interface ScrapeOptions {
  url: string;
  markdown?: boolean;
  json?: boolean;
  retries?: number;
  verbose?: boolean;
  offset?: number;
  lines?: number;
}

async function cmdScrape(options: ScrapeOptions, apiKey: string): Promise<void> {
  const {
    url: targetUrl,
    markdown = false,
    json = false,
    retries = 3,
    verbose = false,
    offset = 0,
    lines = 0,
  } = options;

  if (!targetUrl) {
    console.error('Error: URL is required');
    process.exit(1);
  }

  const jsonData = JSON.stringify({
    url: targetUrl,
    includeMarkdown: markdown,
  });

  const result = await retryRequest({
    url: 'https://scrape.serper.dev',
    data: jsonData,
    maxAttempts: retries,
    verbose,
    apiKey,
  });

  if (json) {
    console.log(result);
  } else {
    console.log(`\n📄 Scraped: ${targetUrl}\n`);
    const parsed = JSON.parse(result);
    const content = markdown && parsed.markdown ? parsed.markdown : parsed.text || '';

    if (offset > 0 || lines > 0) {
      const allLines = content.split('\n');
      const start = offset;
      const end = lines > 0 ? offset + lines : allLines.length;
      console.log(allLines.slice(start, end).join('\n'));
    } else {
      if (content.length > 2000) {
        console.log(content.substring(0, 2000));
        console.log('\n... (truncated, use --lines or --offset for pagination)');
      } else {
        console.log(content);
      }
    }
  }
}

function showHelp(): void {
  console.log('Serper CLI - Google Search & Web Scraping (TypeScript)');
  console.log('Usage: serper <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  search <query>    Search Google');
  console.log('  scrape <url>      Scrape webpage');
  console.log('');
  console.log('Search Options:');
  console.log('  -n, --num <number>     Results count (default: 10)');
  console.log('  -g, --gl <code>        Country code (default: us)');
  console.log('  -l, --hl <code>        Language code (default: en)');
  console.log('  --location <location>  Geographic location');
  console.log('  --page <number>        Page number (default: 1)');
  console.log('  -j, --json             Raw JSON output');
  console.log('  --retries <number>     Retry attempts (default: 3)');
  console.log('');
  console.log('Scrape Options:');
  console.log('  -m, --markdown         Include markdown output');
  console.log('  -j, --json             Raw JSON output');
  console.log('  --offset <n>           Start from line n');
  console.log('  --lines <n>, -l <n>    Return n lines');
  console.log('  --retries <number>     Retry attempts (default: 3)');
  console.log('');
  console.log('Environment:');
  console.log('  SERPER_API_KEY         API key for Serper.dev');
  console.log('');
  console.log('Examples:');
  console.log('  serper search "AI news" --gl us --hl en');
  console.log('  serper scrape "https://example.com" --markdown');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  // Handle version and help
  if (command === '-v' || command === '--version') {
    console.log(`serper version ${VERSION}`);
    process.exit(0);
  }

  if (command === '-h' || command === '--help' || !command) {
    showHelp();
    process.exit(0);
  }

  // Get API key from environment
  const apiKey = process.env.SERPER_API_KEY || '';

  // Check API key for actual commands
  if (!apiKey) {
    console.error('Error: SERPER_API_KEY environment variable is required');
    console.error('Get a free API key at: https://serper.dev');
    process.exit(1);
  }

  try {
    if (command === 'search') {
      const queryArgs = args.slice(1);
      const options: SearchOptions = { query: '' };

      for (let i = 0; i < queryArgs.length; i++) {
        const arg = queryArgs[i];
        switch (arg) {
          case '-n':
          case '--num':
            options.num = parseInt(queryArgs[++i], 10);
            break;
          case '-g':
          case '--gl':
            options.gl = queryArgs[++i];
            break;
          case '-l':
          case '--hl':
            options.hl = queryArgs[++i];
            break;
          case '--location':
            options.location = queryArgs[++i];
            break;
          case '--page':
            options.page = parseInt(queryArgs[++i], 10);
            break;
          case '-j':
          case '--json':
            options.json = true;
            break;
          case '--retries':
            options.retries = parseInt(queryArgs[++i], 10);
            break;
          case '-v':
          case '--verbose':
            options.verbose = true;
            break;
          default:
            if (!arg.startsWith('-')) {
              options.query = arg;
            }
            break;
        }
      }

      await cmdSearch(options, apiKey);
    } else if (command === 'scrape') {
      const scrapeArgs = args.slice(1);
      const options: ScrapeOptions = { url: '' };

      for (let i = 0; i < scrapeArgs.length; i++) {
        const arg = scrapeArgs[i];
        switch (arg) {
          case '-m':
          case '--markdown':
            options.markdown = true;
            break;
          case '-j':
          case '--json':
            options.json = true;
            break;
          case '--retries':
            options.retries = parseInt(scrapeArgs[++i], 10);
            break;
          case '-v':
          case '--verbose':
            options.verbose = true;
            break;
          case '--offset':
            options.offset = parseInt(scrapeArgs[++i], 10);
            break;
          case '--lines':
          case '-l':
            options.lines = parseInt(scrapeArgs[++i], 10);
            break;
          default:
            if (!arg.startsWith('-')) {
              options.url = arg;
            }
            break;
        }
      }

      await cmdScrape(options, apiKey);
    } else {
      console.error(`Error: Unknown command '${command}'`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
