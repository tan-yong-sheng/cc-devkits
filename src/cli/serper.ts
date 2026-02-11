#!/usr/bin/env node
/**
 * cc-serper CLI - Google Search & Web Scraping
 */

import { search, scrape } from '../serper/index.js';
import { parseArgs } from '../lib/index.js';
import type { ArgOption } from '../lib/index.js';

const VERSION = '1.0.0';


const searchOptions: Record<string, ArgOption> = {
  query: { long: 'query', type: 'string' },
  num: { short: 'n', long: 'num', type: 'number' },
  gl: { short: 'g', long: 'gl', type: 'string' },
  hl: { short: 'l', long: 'hl', type: 'string' },
  location: { long: 'location', type: 'string' },
  page: { long: 'page', type: 'number' },
  json: { short: 'j', long: 'json', type: 'boolean' },
  verbose: { short: 'v', long: 'verbose', type: 'boolean' },
};

const scrapeOptions: Record<string, ArgOption> = {
  url: { long: 'url', type: 'string' },
  markdown: { short: 'm', long: 'markdown', type: 'boolean' },
  json: { short: 'j', long: 'json', type: 'boolean' },
  offset: { long: 'offset', type: 'number' },
  lines: { long: 'lines', type: 'number' },
  verbose: { short: 'v', long: 'verbose', type: 'boolean' },
};

async function cmdSearch(args: string[]): Promise<void> {
  const parsed = parseArgs(args, searchOptions);

  // Use --query flag if provided, otherwise use first positional argument
  let query = parsed.query as string | undefined;
  if (!query) {
    const positional = parsed._ as string[] | undefined;
    query = positional?.[0];
  }

  if (!query) {
    throw new Error('Query is required. Usage: cc-serper search --query <query> [options]');
  }
  const num = parsed.num as number | undefined;
  const gl = parsed.gl as string | undefined;
  const hl = parsed.hl as string | undefined;
  const location = parsed.location as string | undefined;
  const page = parsed.page as number | undefined;
  const json = parsed.json as boolean | undefined;
  const verbose = parsed.verbose as boolean | undefined;

  const result = await search(query, {
    num,
    gl,
    hl,
    location,
    page,
    verbose,
  });

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\n🔍 Search: "${query}"\n`);
    if (result.organic) {
      for (const item of result.organic) {
        console.log(`${item.position}. ${item.title}`);
        console.log(`   ${item.link}`);
        console.log(`   ${item.snippet}\n`);
      }
    }
  }
}

async function cmdScrape(args: string[]): Promise<void> {
  const parsed = parseArgs(args, scrapeOptions);

  // Use --url flag if provided, otherwise use first positional argument
  let url = parsed.url as string | undefined;
  if (!url) {
    const positional = parsed._ as string[] | undefined;
    url = positional?.[0];
  }

  if (!url) {
    throw new Error('URL is required. Usage: cc-serper scrape --url <url> [options]');
  }
  const markdown = parsed.markdown as boolean | undefined;
  const json = parsed.json as boolean | undefined;
  const offset = parsed.offset as number | undefined;
  const lines = parsed.lines as number | undefined;
  const verbose = parsed.verbose as boolean | undefined;

  const result = await scrape(url, {
    markdown,
    verbose,
  });

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\n📄 Scraped: ${url}\n`);
    const content =
      markdown && result.markdown
        ? result.markdown
        : result.text || '';

    if (offset || lines) {
      const allLines = content.split('\n');
      const start = offset || 0;
      const end = lines ? start + lines : allLines.length;
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
  console.log('cc-serper CLI - Google Search & Web Scraping');
  console.log('Usage: cc-serper <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  search --query <query>    Search Google');
  console.log('  scrape --url <url>        Scrape webpage');
  console.log('');
  console.log('Search Options:');
  console.log('  -n, --num <number>     Results count (default: 10)');
  console.log('  -g, --gl <code>        Country code (default: us)');
  console.log('  -l, --hl <code>        Language code (default: en)');
  console.log('  --location <location>  Geographic location');
  console.log('  --page <number>        Page number (default: 1)');
  console.log('  -j, --json             Raw JSON output');
  console.log('  -v, --verbose          Verbose logging');
  console.log('');
  console.log('Scrape Options:');
  console.log('  -m, --markdown         Include markdown output');
  console.log('  -j, --json             Raw JSON output');
  console.log('  --offset <n>           Start from line n');
  console.log('  --lines <n>            Return n lines');
  console.log('  -v, --verbose          Verbose logging');
  console.log('');
  console.log('Environment:');
  console.log('  SERPER_API_KEY         API key for Serper.dev');
  console.log('');
  console.log('Examples:');
  console.log('  cc-serper search --query "AI news" --gl us --hl en');
  console.log('  cc-serper scrape --url "https://example.com" --markdown');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '-v' || command === '--version') {
    console.log(`cc-serper version ${VERSION}`);
    process.exit(0);
  }

  if (command === '-h' || command === '--help' || !command) {
    showHelp();
    process.exit(0);
  }

  try {
    if (command === 'search') {
      await cmdSearch(args.slice(1));
    } else if (command === 'scrape') {
      await cmdScrape(args.slice(1));
    } else {
      console.error(`Error: Unknown command '${command}'`);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

main();
