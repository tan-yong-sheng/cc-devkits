# cc-devkits Package Architecture

This document describes the unified package architecture for cc-devkits.

## Overview

cc-devkits is now a **single unified npm package** (`@tan-yong-sheng/cc-devkits`) that provides:
- Google Search and web scraping via Serper API
- Push notifications via ntfy
- Claude Code hooks for notifications

## Package Registry

Published to **npmjs.com** (public registry):

```bash
npm install -g @tan-yong-sheng/cc-devkits
```

This provides two CLI commands:
- `cc-serper` - Google Search and web scraping
- `cc-ntfy` - Push notifications

## Directory Structure

```
cc-devkits/
├── src/
│   ├── lib/                    # Core utilities (internal)
│   │   ├── index.ts            # Main exports
│   │   ├── http.ts             # HTTP request utilities
│   │   ├── retry.ts            # Retry with exponential backoff
│   │   ├── cli.ts              # CLI argument parsing
│   │   ├── user-agent.ts       # User agent rotation
│   │   ├── anonymize.ts        # API key redaction
│   │   ├── deduplicate.ts      # Deduplication logic
│   │   ├── rotate.ts           # API key rotation
│   │   └── types.ts            # Shared TypeScript types
│   │
│   ├── serper/                 # Serper library
│   │   ├── index.ts            # search(), scrape() functions
│   │   └── types.ts            # Serper types
│   │
│   ├── ntfy/                   # ntfy library
│   │   ├── index.ts            # send(), sendWithDedupe() functions
│   │   └── types.ts            # ntfy types
│   │
│   ├── cli/
│   │   ├── serper.ts           # cc-serper CLI entry point
│   │   └── ntfy.ts             # cc-ntfy CLI entry point
│   │
│   ├── hooks/
│   │   └── ntfy/
│   │       └── notify.ts       # Claude Code hook script
│   │
│   └── skills/
│       └── serper/
│           └── scripts/
│               └── serper.ts   # Legacy skill script
│
├── hooks/
│   └── hooks.json              # Claude Code hook configuration
│
├── skills/
│   └── serper/
│       └── SKILL.md            # Skill documentation
│
├── dist/                       # Compiled output
│   ├── lib/                    # Core utilities
│   ├── serper/                 # Serper library
│   ├── ntfy/                   # ntfy library
│   ├── cli/                    # CLI binaries
│   └── hooks/                  # Hook scripts
│
├── package.json                # Single package config
├── tsconfig.json               # TypeScript config
└── README.md                   # Documentation
```

## Package Exports

The package uses conditional exports:

```json
{
  "exports": {
    ".": {
      "import": "./dist/lib/index.js",
      "types": "./dist/lib/index.d.ts"
    },
    "./serper": {
      "import": "./dist/serper/index.js",
      "types": "./dist/serper/index.d.ts"
    },
    "./ntfy": {
      "import": "./dist/ntfy/index.js",
      "types": "./dist/ntfy/index.d.ts"
    }
  }
}
```

## CLI Binaries

```json
{
  "bin": {
    "cc-serper": "dist/cli/serper.js",
    "cc-ntfy": "dist/cli/ntfy.js"
  }
}
```

## Usage Examples

### CLI Commands

```bash
# Search Google
cc-serper search --query "AI news" --gl us --hl en --num 10

# Scrape webpage
cc-serper scrape --url "https://example.com" --markdown

# Send notification
cc-ntfy --title "Done" --message "Task complete" --priority high
```

### Library Imports

```typescript
// Import core utilities
import { retry, randomUserAgent } from '@tan-yong-sheng/cc-devkits';

// Import Serper
import { search, scrape } from '@tan-yong-sheng/cc-devkits/serper';

// Import ntfy
import { send, sendWithDedupe } from '@tan-yong-sheng/cc-devkits/ntfy';
```

## Core Library (`src/lib/`)

### HTTP Utilities

```typescript
// http.ts
export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  apiKey?: string;
  apiKeyHeader?: string;
}

export function makeRequest(options: RequestOptions): Promise<string>;
export function rawRequest(options: RequestOptions): Promise<HttpResult>;
```

### Retry Logic

```typescript
// retry.ts
export interface RetryOptions<T> {
  fn: () => Promise<T>;
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  jitter?: number;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

export async function retry<T>(options: RetryOptions<T>): Promise<T>;
```

### CLI Utilities

```typescript
// cli.ts
export interface ArgOption {
  type: 'string' | 'number' | 'boolean';
  short?: string;
  long?: string;
  required?: boolean;
  description?: string;
  default?: string | number | boolean;
}

export function parseArgs<T>(
  args: string[],
  options: Record<string, ArgOption>
): T;
```

### User Agent Rotation

```typescript
// user-agent.ts
export const USER_AGENTS: readonly string[];
export function randomUserAgent(): string;
export function rotateUserAgent(): string;
```

### API Key Anonymization

```typescript
// anonymize.ts
export function anonymizeKey(key: string, visibleChars?: number): string;
export function redactApiKey(key: string, replacement?: string): string;
```

### Deduplication

```typescript
// deduplicate.ts
export function checkDedupe(key: string, cooldownSeconds: number): boolean;
export function createDedupeChecker(options: DedupeOptions): DedupeChecker;
```

### Key Rotation

```typescript
// rotate.ts
export function rotateKeys(envVar: string, stateKey: string): string;
```

## Adding New Features

To add a new feature to the consolidated package:

1. **Add library code** in `src/<feature>/`
   - `index.ts` - Main exports
   - `types.ts` - TypeScript types

2. **Add CLI** in `src/cli/<feature>.ts`
   - Create CLI entry point
   - Update `package.json` bin field

3. **Add export** in `package.json`
   ```json
   "exports": {
     "./<feature>": {
       "import": "./dist/<feature>/index.js",
       "types": "./dist/<feature>/index.d.ts"
     }
   }
   ```

4. **Build and test**
   ```bash
   npm run build
   node dist/cli/<feature>.js --help
   ```

## Publishing

### Automated Publishing via GitHub Actions

Create and push a version tag:

```bash
git tag v2.0.0
git push origin v2.0.0
```

This triggers the `.github/workflows/publish.yml` workflow which:
1. Builds the package
2. Tests CLI functionality
3. Publishes to npmjs.com

### Manual Publishing

```bash
# Build
npm run build

# Test locally
npm link
cc-serper --help
cc-ntfy --help

# Publish to npmjs.com
npm login
npm publish --access public
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SERPER_API_KEY` | API key for Serper.dev |
| `SERPER_API_KEYS` | Multiple keys for rotation (semicolon-separated) |
| `NTFY_BASE_URL` | ntfy server URL (default: https://ntfy.sh) |
| `NTFY_TOPIC` | ntfy topic |
| `NTFY_API_KEY` | ntfy authentication token |

## Version Compatibility

| Package | Required Node |
|---------|---------------|
| `@tan-yong-sheng/cc-devkits` | >=18.0.0 |

## Migration from v1.x

If you were using the old separate packages:

**Before (v1.x):**
```bash
npm install -g @tan-yong-sheng/serper @tan-yong-sheng/ntfy
serper search "query"
ntfy --title "Test" --message "Hello"
```

**After (v2.x):**
```bash
npm install -g @tan-yong-sheng/cc-devkits
cc-serper search --query "query"
cc-ntfy --title "Test" --message "Hello"
```

Library imports:
```typescript
// Before
import { search } from '@tan-yong-sheng/serper';
import { send } from '@tan-yong-sheng/ntfy';

// After
import { search } from '@tan-yong-sheng/cc-devkits/serper';
import { send } from '@tan-yong-sheng/cc-devkits/ntfy';
```
