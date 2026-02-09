# Publishing Guide - cc-devkits

Complete guide for publishing npm packages to GitHub Packages and installing them globally.

## 📦 Published Packages

All packages are available at: https://github.com/tan-yong-sheng?tab=packages

| Package | Version | Description |
|---------|---------|-------------|
| `@tan-yong-sheng/core` | 1.0.0 | Core utilities (HTTP, retry, CLI parsing) |
| `@tan-yong-sheng/serper` | 1.0.0 | Google Search & web scraping |
| `@tan-yong-sheng/ntfy` | 1.0.0 | Push notifications via ntfy |

## 🚀 Quick Start - Global Installation

### Step 1: Configure npm for GitHub Packages

```bash
# Set registry for @tan-yong-sheng scope
npm config set @tan-yong-sheng:registry https://npm.pkg.github.com
```

### Step 2: Authenticate with GitHub

```bash
# Login using GitHub Personal Access Token
npm login --registry=https://npm.pkg.github.com --scope=@tan-yong-sheng
```

**Creating a Personal Access Token:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `read:packages` (for installing), `write:packages` (for publishing)
4. Copy the token and use it as password during `npm login`

### Step 3: Install Packages Globally

```bash
# Install Serper CLI globally
npm install -g @tan-yong-sheng/serper

# Install ntfy CLI globally
npm install -g @tan-yong-sheng/ntfy

# Verify installation
serper --help
ntfy --help
```

## 🔧 Usage Examples

### Serper (Google Search & Web Scraping)

```bash
# Search Google
serper search "TypeScript best practices" --gl us --hl en --num 10

# Get JSON output
serper search "AI news" --json | jq '.organic[].title'

# Scrape webpage with markdown
serper scrape "https://example.com" --markdown

# Regional search
serper search "restaurants" --gl my --location "Kuala Lumpur"
```

### ntfy (Push Notifications)

```bash
# Send notification
ntfy --title "Build Complete" --message "All tests passed" --priority high

# With tags
ntfy --title "Alert" --message "High CPU usage" --tags warning,computer

# With URL click action
ntfy --title "New PR" --message "Review needed" --click "https://github.com/..."
```

## 📝 Environment Variables

### Serper

```bash
# Add to ~/.bashrc or ~/.zshrc
export SERPER_API_KEY="your-api-key-from-serper.dev"
```

Get free API key: https://serper.dev (2500 searches/month)

### ntfy

```bash
# Add to ~/.bashrc or ~/.zshrc
export NTFY_BASE_URL="https://ntfy.sh"  # or your self-hosted instance
export NTFY_TOPIC="your-topic-name"
export NTFY_API_KEY="your-api-key"  # optional, for authenticated topics
```

## 🏗️ Publishing New Versions

### Automated Publishing (Recommended)

GitHub Actions automatically publishes when you push a version tag:

```bash
# Build and test locally first
npm run build:all

# Commit changes
git add .
git commit -m "Your changes"
git push origin main

# Create and push version tag
git tag v1.0.3
git push origin v1.0.3
```

The workflow will:
1. ✅ Build all packages
2. ✅ Run E2E tests
3. ✅ Publish to GitHub Packages

Monitor at: https://github.com/tan-yong-sheng/cc-devkits/actions

### Manual Publishing

```bash
# 1. Build all packages
npm run build:all

# 2. Configure npm (one-time setup)
npm config set @tan-yong-sheng:registry https://npm.pkg.github.com

# 3. Login with write:packages token
npm login --registry=https://npm.pkg.github.com --scope=@tan-yong-sheng

# 4. Publish packages (order matters - core first)
cd packages/core && npm publish && cd ../..
cd packages/serper && npm publish && cd ../..
cd packages/ntfy && npm publish && cd ../..
```

## 🛠️ Development Setup

### Local Development

```bash
# Clone repository
git clone https://github.com/tan-yong-sheng/cc-devkits.git
cd cc-devkits

# Install dependencies (uses workspaces)
npm install

# Build all packages
npm run build:all

# Test locally with npm link
cd packages/serper
npm link
serper --help

# Unlink when done
npm unlink -g @tan-yong-sheng/serper
```

### Testing Before Publishing

```bash
# Build packages
npm run build:all

# Test CLI help commands
node packages/serper/dist/cli.js --help
node packages/ntfy/dist/cli.js --help

# Test imports
node -e "import('@tan-yong-sheng/core').then(m => console.log(Object.keys(m)))"
```

## 📚 Creating New Skills

When creating new CLI-based skills, you **must** build them as npm packages:

### 1. Create Package Structure

```bash
mkdir -p packages/my-skill/src
cd packages/my-skill
```

### 2. Create package.json

```json
{
  "name": "@tan-yong-sheng/my-skill",
  "version": "1.0.0",
  "description": "My awesome skill",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "my-skill": "dist/cli.js"
  },
  "files": ["dist/"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@tan-yong-sheng/core": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 3. Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Implement Functionality

```typescript
// src/index.ts
import { retry, randomUserAgent } from '@tan-yong-sheng/core';

export async function myFeature(options: MyOptions): Promise<Result> {
  return retry({
    fn: () => makeApiCall(options),
    maxAttempts: 3,
  });
}
```

### 5. Create CLI Entry Point

```typescript
// src/cli.ts
#!/usr/bin/env node
import { myFeature } from './index.js';
import { parseArgs } from '@tan-yong-sheng/core';

async function main() {
  const args = parseArgs(process.argv.slice(2), {
    query: { type: 'string', required: true, description: 'Search query' },
    verbose: { type: 'boolean', short: 'v', description: 'Verbose output' },
  });

  const result = await myFeature(args);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
```

### 6. Build and Test

```bash
# Build
npm run build

# Test locally
npm link
my-skill --help

# Test functionality
my-skill --query "test"
```

### 7. Publish

```bash
# Add build script to main package.json
cd ../..
npm pkg set scripts.build:my-skill="cd packages/my-skill && npm run build"

# Add to build:all script
npm pkg set scripts.build:all="npm run build:core && npm run build:serper && npm run build:ntfy && npm run build:my-skill"

# Create version tag to trigger automated publish
git add .
git commit -m "Add my-skill package"
git push origin main
git tag v1.0.3
git push origin v1.0.3
```

### 8. Create Skill Documentation

```bash
mkdir -p skills/my-skill
```

Create `skills/my-skill/SKILL.md`:

```markdown
---
name: my-skill
description: Brief description of what your skill does
homepage: https://example.com
metadata: {"openclaw":{"emoji":"🎯","requires":{"bins":["node"],"env":["MY_SKILL_API_KEY"]},"primaryEnv":"MY_SKILL_API_KEY"}}
---

# 🎯 My Skill

## Setup

### Install from GitHub Packages (Recommended)

\`\`\`bash
npm config set @tan-yong-sheng:registry https://npm.pkg.github.com
npm login --registry=https://npm.pkg.github.com --scope=@tan-yong-sheng
npm install -g @tan-yong-sheng/my-skill
\`\`\`

## Usage

\`\`\`bash
my-skill --query "example"
\`\`\`
```

## 🔍 Troubleshooting

### Authentication Issues

```bash
# Check current registry configuration
npm config get @tan-yong-sheng:registry

# Check if logged in
npm whoami --registry=https://npm.pkg.github.com

# Re-login if needed
npm logout --registry=https://npm.pkg.github.com
npm login --registry=https://npm.pkg.github.com --scope=@tan-yong-sheng
```

### Package Not Found

```bash
# Verify package exists
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://npm.pkg.github.com/@tan-yong-sheng/serper

# Clear npm cache
npm cache clean --force
```

### Permission Denied

Ensure your Personal Access Token has:
- `read:packages` scope for installing
- `write:packages` scope for publishing

### Build Failures

```bash
# Clean and rebuild
npm run clean
rm -rf node_modules packages/*/node_modules
npm install
npm run build:all
```

## 📊 CI/CD Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request:
- ✅ Builds all packages
- ✅ Runs E2E verification tests
- ✅ Validates CLI help commands work

### Publish Workflow (`.github/workflows/publish.yml`)

Runs when version tags are pushed:
- ✅ Builds all packages
- ✅ Runs comprehensive tests
- ✅ Verifies package imports
- ✅ Publishes to GitHub Packages in parallel

Monitor workflows: https://github.com/tan-yong-sheng/cc-devkits/actions

## 📖 Resources

- **GitHub Packages Docs**: https://docs.github.com/en/packages
- **npm Packages Guide**: https://docs.npmjs.com/packages-and-modules
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Serper API**: https://serper.dev
- **ntfy Documentation**: https://ntfy.sh

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Build and test locally
5. Submit a pull request

All pull requests trigger CI checks automatically.

## 📄 License

MIT - See LICENSE file for details
