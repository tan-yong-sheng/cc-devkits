#!/usr/bin/env node
/**
 * ntfy CLI - Send push notifications via ntfy
 */

import { send, sendWithDedupe } from './index.js';
import { parseArgs } from '@cc-devkits/core';
import type { ArgOption } from '@cc-devkits/core';
import type { NtfyPriority } from './types';

const VERSION = '1.0.0';

interface NtfyCliArgs {
  title: string;
  message: string;
  priority?: NtfyPriority;
  tags?: string;
  click?: string;
  attach?: string;
  timeout?: number;
  topic?: string;
  baseUrl?: string;
  apiKey?: string;
  dedupe?: boolean;
}

const argOptions: Record<string, ArgOption> = {
  title: { long: 'title', type: 'string', required: true },
  message: { long: 'message', type: 'string', required: true },
  priority: { long: 'priority', type: 'string' },
  tags: { long: 'tags', type: 'string' },
  click: { long: 'click', type: 'string' },
  attach: { long: 'attach', type: 'string' },
  timeout: { long: 'timeout', type: 'number' },
  topic: { long: 'topic', type: 'string' },
  baseUrl: { long: 'base-url', type: 'string' },
  apiKey: { long: 'api-key', type: 'string' },
  dedupe: { long: 'dedupe', type: 'boolean' },
};

function showHelp(): void {
  console.log('ntfy CLI - Send push notifications');
  console.log('Usage: ntfy [options]');
  console.log('');
  console.log('Required Options:');
  console.log('  --title <title>        Notification title');
  console.log('  --message <message>    Notification message');
  console.log('');
  console.log('Optional Options:');
  console.log(
    '  --priority <level>     Priority: min, low, default, high, max, urgent (default: default)'
  );
  console.log('  --tags <tags>          Comma-separated list of tags/emojis');
  console.log('  --click <url>          URL to open when clicked');
  console.log('  --attach <url>         URL to attach file/image');
  console.log('  --timeout <seconds>    Request timeout (default: 10)');
  console.log('  --topic <topic>        ntfy topic (default: from env)');
  console.log('  --base-url <url>       ntfy server URL (default: from env)');
  console.log('  --api-key <key>        API key for authentication');
  console.log('  --dedupe               Enable deduplication');
  console.log('');
  console.log('Environment Variables:');
  console.log('  NTFY_BASE_URL          ntfy server URL (default: https://ntfy.sh)');
  console.log('  NTFY_TOPIC             Default topic');
  console.log('  NTFY_API_KEY           API key for authentication');
  console.log('');
  console.log('Examples:');
  console.log('  ntfy --title "Hello" --message "World"');
  console.log('  ntfy --title "Alert" --message "High CPU" --priority high --tags warning');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    console.log(`ntfy version ${VERSION}`);
    process.exit(0);
  }

  try {
    const parsed = parseArgs(args, argOptions);

    const title = parsed.title as string;
    const message = parsed.message as string;
    const priority = parsed.priority as NtfyPriority | undefined;
    const tags = parsed.tags as string | undefined;
    const click = parsed.click as string | undefined;
    const attach = parsed.attach as string | undefined;
    const timeout = parsed.timeout as number | undefined;
    const topic = parsed.topic as string | undefined;
    const baseUrl = parsed.baseUrl as string | undefined;
    const apiKey = parsed.apiKey as string | undefined;
    const dedupe = parsed.dedupe as boolean | undefined;

    const ntfyOptions = {
      title,
      message,
      priority,
      tags: tags ? tags.split(',') : undefined,
      click,
      attach,
      timeout,
      topic,
      baseUrl,
      apiKey,
    };

    let result;
    if (dedupe) {
      result = await sendWithDedupe(ntfyOptions);
      if (result === null) {
        console.error('[ntfy] Skipped duplicate notification');
        process.exit(0);
      }
    } else {
      result = await send(ntfyOptions);
    }

    console.error(`[ntfy] Notification sent successfully (${result.id})`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(`[ntfy] Error: ${errorMessage}`);
    process.exit(1);
  }
}

main();
