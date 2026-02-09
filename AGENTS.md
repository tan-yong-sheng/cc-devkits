# cc-devkits Core Library Architecture

This document describes the library architecture for wrapping shared utilities into a publishable npm library.

## Overview

cc-devkits uses a **monorepo architecture** with a core library containing shared utilities that all skills depend on. This allows:
- DRY (Don't Repeat Yourself) principle
- Centralized updates to shared logic
- Easy addition of new skills with common dependencies

## Directory Structure

```
cc-devkits/
├── packages/                          # Monorepo for libraries
│   ├── core/                          # Core shared utilities
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts               # Main exports
│   │   │   ├── http.ts                # HTTP request utilities
│   │   │   ├── retry.ts               # Retry with exponential backoff
│   │   │   ├── user-agent.ts          # User agent rotation
│   │   │   ├── cli.ts                 # CLI argument parsing
│   │   │   ├── anonymize.ts           # API key redaction
│   │   │   ├── deduplicate.ts         # Deduplication logic
│   │   │   └── types.ts               # Shared TypeScript types
│   │   └── dist/                      # Compiled output
│   │
│   ├── serper/                        # Serper API wrapper
│   │   ├── package.json               # Depends on: @cc-devkits/core
│   │   ├── src/
│   │   │   ├── index.ts               # Exports search(), scrape()
│   │   │   ├── cli.ts                 # CLI entry point
│   │   │   └── types.ts               # Serper-specific types
│   │   └── dist/
│   │
│   └── ntfy/                         # ntfy notification client
│       ├── package.json               # Depends on: @cc-devkits/core
│       ├── src/
│       │   ├── index.ts               # Exports send()
│       │   ├── cli.ts                 # CLI entry point
│       │   └── types.ts               # ntfy-specific types
│       └── dist/
│
├── skills/                            # Claude Code skills
│   └── serper/                       # Serper skill (uses packages/serper)
│
├── hooks/                            # Claude Code hooks
│   └── ntfy/                        # ntfy hooks (uses packages/ntfy)
│
└── package.json                      # Main plugin package
```

## Core Library Exports (`@cc-devkits/core`)

### HTTP Utilities

```typescript
// http.ts
export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  verbose?: boolean;
}

export function makeRequest(options: RequestOptions): Promise<string>;
```

### Retry Logic

```typescript
// retry.ts
export interface RetryOptions {
  fn: () => Promise<T>;
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  jitter?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function retry<T>(options: RetryOptions): Promise<T>;
```

### User Agent Rotation

```typescript
// user-agent.ts
export const USER_AGENTS: readonly string[];

export function randomUserAgent(): string;
export function rotateUserAgent(): string;
```

### CLI Utilities

```typescript
// cli.ts
export interface ArgOption {
  short?: string;
  long: string;
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
  description?: string;
}

export function parseArgs<T>(
  args: string[],
  options: Record<string, ArgOption>
): T;
```

### API Key Anonymization

```typescript
// anonymize.ts
export function anonymizeKey(key: string, visibleChars?: number): string;
export function redactApiKey(key: string): string;
```

### Deduplication

```typescript
// deduplicate.ts
export interface DedupeOptions {
  cooldownSeconds: number;
  stateDir?: string;
}

export function checkDedupe(
  key: string,
  options: DedupeOptions
): boolean;
```

## Usage Examples

### Using @cc-devkits/core

```typescript
import { retry, randomUserAgent, anonymizeKey } from '@cc-devkits/core';

const result = await retry({
  fn: () => makeRequest({ url: 'https://api.example.com' }),
  maxAttempts: 3,
  initialDelay: 1000,
});
```

### Using @cc-devkits/serper

```typescript
import { search, scrape } from '@cc-devkits/serper';

const results = await search('TypeScript best practices', {
  num: 10,
  gl: 'us',
  hl: 'en',
});

const page = await scrape('https://example.com', {
  markdown: true,
});
```

### Using @cc-devkits/ntfy

```typescript
import { send } from '@cc-devkits/ntfy';

await send({
  title: 'Task Complete',
  message: 'Build finished successfully',
  priority: 'high',
  tags: ['white_check_mark'],
});
```

## Adding a New Skill

### 1. Create the skill package

```bash
mkdir -p packages/my-skill/src
```

### 2. Create package.json

```json
{
  "name": "@cc-devkits/my-skill",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@cc-devkits/core": "^1.0.0"
  }
}
```

### 3. Implement using core utilities

```typescript
// packages/my-skill/src/index.ts
import { retry, randomUserAgent } from '@cc-devkits/core';

export async function myFeature(options: MyOptions): Promise<Result> {
  return retry({
    fn: () => makeApiCall(options),
    maxAttempts: 3,
  });
}
```

### 4. Create skill wrapper

```typescript
// skills/my-skill/scripts/my-skill.ts
import { myFeature } from '@cc-devkits/my-skill';
import { parseArgs } from '@cc-devkits/core';

async function main() {
  const args = parseArgs(process.argv, {
    query: { type: 'string', required: true },
  });

  const result = await myFeature({ query: args.query });
  console.log(result);
}

main();
```

## Publishing

### 1. Build all packages

```bash
# Build core first
cd packages/core
npm run build

# Build dependent packages
cd ../serper
npm run build

cd ../ntfy
npm run build
```

### 2. Publish to npm

```bash
# Publish each package (core first)
cd packages/core
npm publish

cd ../serper
npm publish

cd ../ntfy
npm publish
```

### 3. Update main plugin

```bash
# Update main plugin to use published packages
npm install @cc-devkits/core @cc-devkits/serper @cc-devkits/ntfy
```

## Environment Variables

All packages support these environment variables:

| Variable | Description |
|----------|-------------|
| `SERPER_API_KEY` | API key for Serper.dev |
| `NTFY_BASE_URL` | ntfy server URL |
| `NTFY_TOPIC` | ntfy topic |
| `NTFY_API_KEY` | ntfy authentication token |

## Version Compatibility

| Package | Required Node | Dependencies |
|---------|---------------|--------------|
| `@cc-devkits/core` | >=18.0.0 | None |
| `@cc-devkits/serper` | >=18.0.0 | @cc-devkits/core |
| `@cc-devkits/ntfy` | >=18.0.0 | @cc-devkits/core |

## Migration Guide

### From inline code to library

1. Identify shared utilities in your skill
2. Move them to `@cc-devkits/core`
3. Update skill to import from core
4. Publish core package
5. Update skill's package.json to depend on core
6. Rebuild and test

### Example migration

**Before (inline):**

```typescript
// skills/my-skill/src/index.ts
function randomJitter() {
  const jitter = 100 + Math.floor(Math.random() * 400);
  return new Promise(r => setTimeout(r, jitter));
}
```

**After (using core):**

```typescript
// skills/my-skill/src/index.ts
import { randomJitter } from '@cc-devkits/core';
```
