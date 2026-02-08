#!/usr/bin/env node
/**
 * Claude Code ntfy Hook - TypeScript Implementation
 * Sends notifications via ntfy.sh when Claude Code events occur
 *
 * This hook reads Claude Code's stdin (JSON with session info) to extract:
 *   - cwd: The current working directory (project path)
 *   - session_id: The session identifier
 *   - model: The Claude model being used
 */

import https from 'node:https';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { URL } from 'node:url';

interface NtfyOptions {
  title?: string;
  message?: string;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max' | 'urgent';
  emoji?: string;
  tags?: string;
  click?: string;
  attach?: string;
  timeout?: number;
  includeCwd?: 'auto' | 'yes' | 'no';
}

interface ClaudeContext {
  cwd?: string;
  session_id?: string;
  model?: string;
  [key: string]: unknown;
}

// Configuration from environment
const NTFY_URL = process.env.NTFY_BASE_URL || process.env.NTFY_URL || 'https://ntfy.tanyongsheng.site';
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'openclaw';
const NTFY_TOKEN = process.env.NTFY_API_KEY || process.env.NTFY_TOKEN || '';
const COOLDOWN_SECONDS = 12;
const DEDUPE_DIR = '/tmp/.ntfy_hook_dedupe';

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): NtfyOptions {
  const options: NtfyOptions = {
    priority: 'default',
    timeout: 10,
    includeCwd: 'auto'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--title':
        options.title = args[++i];
        break;
      case '--message':
        options.message = args[++i];
        break;
      case '--priority':
        options.priority = args[++i] as NtfyOptions['priority'];
        break;
      case '--emoji':
        options.emoji = args[++i];
        break;
      case '--tags':
        options.tags = args[++i];
        break;
      case '--click':
        options.click = args[++i];
        break;
      case '--attach':
        options.attach = args[++i];
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i], 10);
        break;
      case '--include-cwd':
        options.includeCwd = 'yes';
        break;
      case '--no-cwd':
        options.includeCwd = 'no';
        break;
    }
  }

  if (!options.title || !options.message) {
    console.error('Error: --title and --message are required');
    process.exit(1);
  }

  return options;
}

/**
 * Read stdin to get Claude Code hook input (JSON)
 */
async function readStdin(): Promise<ClaudeContext> {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      // stdin is a TTY - running interactively, not from Claude Code hook
      resolve({});
      return;
    }

    let data = '';
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      try {
        const context = JSON.parse(data) as ClaudeContext;
        resolve(context);
      } catch {
        resolve({});
      }
    });

    // Timeout if no data received
    setTimeout(() => resolve({}), 1000);
  });
}

/**
 * Check deduplication - prevent sending same message within cooldown period
 */
function checkDedupe(title: string, message: string): boolean {
  if (!existsSync(DEDUPE_DIR)) {
    mkdirSync(DEDUPE_DIR, { recursive: true });
  }

  const key = createHash('md5').update(`${title}:${message}`).digest('hex');
  const lastFile = join(DEDUPE_DIR, key);
  const now = Math.floor(Date.now() / 1000);

  if (existsSync(lastFile)) {
    const lastTime = parseInt(readFileSync(lastFile, 'utf-8'), 10);
    const elapsed = now - lastTime;
    if (elapsed < COOLDOWN_SECONDS) {
      console.error(`[ntfy] Skipped duplicate notification (${elapsed}s ago, cooldown: ${COOLDOWN_SECONDS}s)`);
      return false;
    }
  }

  writeFileSync(lastFile, now.toString());
  return true;
}

/**
 * Build enhanced message with project info
 */
function buildEnhancedMessage(
  message: string,
  context: ClaudeContext,
  includeCwd: 'auto' | 'yes' | 'no'
): string {
  let shouldInclude = false;

  switch (includeCwd) {
    case 'yes':
      shouldInclude = true;
      break;
    case 'no':
      shouldInclude = false;
      break;
    case 'auto':
    default:
      // Auto: include cwd if we got it from stdin and it's not the home directory
      if (context.cwd && context.cwd !== process.env.HOME) {
        shouldInclude = true;
      }
      break;
  }

  if (!shouldInclude || !context.cwd) {
    return message;
  }

  const projectName = context.cwd.split('/').pop() || context.cwd;
  let enhancedMessage = `${message}\n\n📁 Project: ${projectName}\n📂 Path: ${context.cwd}`;

  if (context.session_id) {
    enhancedMessage += `\n🔑 Session: ${context.session_id}`;
  }

  if (context.model) {
    enhancedMessage += `\n🤖 Model: ${context.model}`;
  }

  return enhancedMessage;
}

/**
 * Send notification to ntfy
 */
async function sendNotification(options: NtfyOptions, context: ClaudeContext): Promise<void> {
  if (!options.title || !options.message) {
    throw new Error('Title and message are required');
  }

  const enhancedMessage = buildEnhancedMessage(options.message, context, options.includeCwd || 'auto');

  // Build headers
  const headers: Record<string, string> = {
    'Title': options.title,
    'Priority': options.priority || 'default'
  };

  // Add emoji to tags
  if (options.emoji) {
    headers['Tags'] = options.tags ? `${options.tags},${options.emoji}` : options.emoji;
  } else if (options.tags) {
    headers['Tags'] = options.tags;
  }

  if (options.click) {
    headers['Click'] = options.click;
  }

  if (options.attach) {
    headers['Attach'] = options.attach;
  }

  if (NTFY_TOKEN) {
    headers['Authorization'] = `Bearer ${NTFY_TOKEN}`;
  }

  // Parse URL
  const url = new URL(`${NTFY_URL}/${NTFY_TOPIC}`);
  const client = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'text/plain'
        },
        timeout: (options.timeout || 10) * 1000
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.error(`[ntfy] Notification sent successfully (${res.statusCode})`);
            resolve();
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(enhancedMessage);
    req.end();
  });
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    if (!options.title || !options.message) {
      console.error('Error: --title and --message are required');
      process.exit(1);
    }

    // Read stdin for Claude Code context
    const context = await readStdin();

    // Check deduplication
    if (!checkDedupe(options.title!, options.message!)) {
      process.exit(0);
    }

    // Send notification
    await sendNotification(options, context);
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ntfy] Error: ${errorMessage}`);
    process.exit(1);
  }
}

main();
