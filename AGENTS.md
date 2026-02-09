# cc-devkits Core Library Architecture

This document describes the library architecture for wrapping shared utilities into a publishable npm library.

## Overview

cc-devkits uses a **monorepo architecture** with a core library containing shared utilities that all skills depend on. This allows:
- DRY (Don't Repeat Yourself) principle
- Centralized updates to shared logic
- Easy addition of new skills with common dependencies
- Global installation via npm for command-line usage

## Package Registry

All packages are published to **GitHub Packages** under the `@tan-yong-sheng` scope:

- `@tan-yong-sheng/core` - Core shared utilities
- `@tan-yong-sheng/serper` - Serper API wrapper (Google Search & web scraping)
- `@tan-yong-sheng/ntfy` - ntfy notification client

### Installing from GitHub Packages

```bash
# Configure npm to use GitHub Packages for @tan-yong-sheng scope
npm config set @tan-yong-sheng:registry https://npm.pkg.github.com

# Authenticate with GitHub (requires Personal Access Token with read:packages scope)
npm login --registry=https://npm.pkg.github.com --scope=@tan-yong-sheng

# Install packages globally for CLI usage
npm install -g @tan-yong-sheng/serper
npm install -g @tan-yong-sheng/ntfy

# Or install locally in a project
npm install @tan-yong-sheng/core @tan-yong-sheng/serper @tan-yong-sheng/ntfy
```

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
│   │   ├── package.json               # Depends on: @tan-yong-sheng/core
│   │   ├── src/
│   │   │   ├── index.ts               # Exports search(), scrape()
│   │   │   ├── cli.ts                 # CLI entry point
│   │   │   └── types.ts               # Serper-specific types
│   │   └── dist/
│   │
│   └── ntfy/                         # ntfy notification client
│       ├── package.json               # Depends on: @tan-yong-sheng/core
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

## Core Library Exports (`@tan-yong-sheng/core`)

The core library provides reusable utilities for all skills. When building new skills that require CLI execution, you **must** build and publish them as npm packages to enable global installation.

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

### Using @tan-yong-sheng/core

```typescript
import { retry, randomUserAgent, anonymizeKey } from '@tan-yong-sheng/core';

const result = await retry({
  fn: () => makeRequest({ url: 'https://api.example.com' }),
  maxAttempts: 3,
  initialDelay: 1000,
});
```

### Using @tan-yong-sheng/serper

```typescript
import { search, scrape } from '@tan-yong-sheng/serper';

const results = await search('TypeScript best practices', {
  num: 10,
  gl: 'us',
  hl: 'en',
});

const page = await scrape('https://example.com', {
  markdown: true,
});
```

### Using @tan-yong-sheng/ntfy

```typescript
import { send } from '@tan-yong-sheng/ntfy';

await send({
  title: 'Task Complete',
  message: 'Build finished successfully',
  priority: 'high',
  tags: ['white_check_mark'],
});
```

## Adding a New Skill

**IMPORTANT:** When creating new skills that require command-line execution (CLI tools), you **MUST** build them as npm packages and publish to GitHub Packages. This enables:
- Global installation via `npm install -g`
- Easy distribution and version management
- Dependency management through npm
- Consistent CLI interface across all skills

### Workflow for Creating New Skills with CLI

1. **Create Package Structure** - Set up TypeScript package in `packages/`
2. **Implement Functionality** - Use `@tan-yong-sheng/core` utilities
3. **Add CLI Wrapper** - Create executable CLI entry point
4. **Build & Test** - Compile TypeScript and verify locally
5. **Publish to GitHub Packages** - Make available for global install
6. **Create Skill Definition** - Add SKILL.md with installation instructions

### 1. Create the skill package

```bash
mkdir -p packages/my-skill/src
```

### 2. Create package.json

```json
{
  "name": "@tan-yong-sheng/my-skill",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@tan-yong-sheng/core": "^1.0.0"
  }
}
```

### 3. Implement using core utilities

```typescript
// packages/my-skill/src/index.ts
import { retry, randomUserAgent } from '@tan-yong-sheng/core';

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
import { myFeature } from '@tan-yong-sheng/my-skill';
import { parseArgs } from '@tan-yong-sheng/core';

async function main() {
  const args = parseArgs(process.argv, {
    query: { type: 'string', required: true },
  });

  const result = await myFeature({ query: args.query });
  console.log(result);
}

main();
```

### 5. Add CLI binary configuration

Update `package.json` to include bin field:

```json
{
  "name": "@tan-yong-sheng/my-skill",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "my-skill": "dist/cli.js"
  },
  "files": [
    "dist/"
  ],
  "dependencies": {
    "@tan-yong-sheng/core": "^1.0.0"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```

### 6. Build and publish

```bash
# Build the package
cd packages/my-skill
npm run build

# Test locally
npm link
my-skill --help

# Publish to GitHub Packages
npm publish

# Users can now install globally
npm install -g @tan-yong-sheng/my-skill
```

### 7. Create skill documentation

Create `skills/my-skill/SKILL.md` with installation instructions:

```markdown
## Setup

### Install from GitHub Packages (Recommended)

\`\`\`bash
# Configure npm to use GitHub Packages
npm config set @tan-yong-sheng:registry https://npm.pkg.github.com

# Authenticate with GitHub
npm login --registry=https://npm.pkg.github.com --scope=@tan-yong-sheng

# Install globally
npm install -g @tan-yong-sheng/my-skill
\`\`\`

Now `my-skill` command is available globally!
```

## Publishing

### Automated Publishing via GitHub Actions

Packages are automatically built, tested, and published when you create a version tag:

```bash
# Create and push a version tag
git tag v1.0.3
git push origin v1.0.3
```

This triggers the `.github/workflows/publish.yml` workflow which:
1. **Builds** all packages in the monorepo
2. **Tests** CLI functionality and package imports
3. **Publishes** to GitHub Packages (https://npm.pkg.github.com)

### Manual Publishing

If you need to publish manually:

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

### 2. Publish to GitHub Packages

```bash
# Configure npm for GitHub Packages
npm config set @tan-yong-sheng:registry https://npm.pkg.github.com

# Login with GitHub Personal Access Token (needs write:packages scope)
npm login --registry=https://npm.pkg.github.com --scope=@tan-yong-sheng

# Publish each package (core first)
cd packages/core
npm publish

cd ../serper
npm publish

cd ../ntfy
npm publish
```

### 3. Verify publication

Check packages at: https://github.com/tan-yong-sheng?tab=packages

### 4. Install and test globally

```bash
# Install published package globally
npm install -g @tan-yong-sheng/serper

# Test CLI
serper --help
serper search "test query" --json
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
| `@tan-yong-sheng/core` | >=18.0.0 | None |
| `@tan-yong-sheng/serper` | >=18.0.0 | @tan-yong-sheng/core |
| `@tan-yong-sheng/ntfy` | >=18.0.0 | @tan-yong-sheng/core |

## Migration Guide

### From inline code to library

1. Identify shared utilities in your skill
2. Move them to `@tan-yong-sheng/core`
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
import { randomJitter } from '@tan-yong-sheng/core';
```
