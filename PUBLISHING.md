# Publishing Guide - cc-devkits

Complete guide for publishing and installing the cc-devkits npm package.

## 📦 Published Package

Available at: https://www.npmjs.com/package/@tan-yong-sheng/cc-devkits

| Package | Version | Description |
|---------|---------|-------------|
| `@tan-yong-sheng/cc-devkits` | 2.0.0 | Google Search, web scraping, and push notifications |

## 🚀 Quick Start - Global Installation

No authentication required for public packages on npmjs.com:

```bash
# Install globally
npm install -g @tan-yong-sheng/cc-devkits

# Verify installation
cc-serper --help
cc-ntfy --help
```

This provides two CLI commands:
- `cc-serper` - Google Search and web scraping
- `cc-ntfy` - Push notifications via ntfy

## 🔨 Alternative: Build from Source

For development or contributing:

```bash
# Clone and build
git clone https://github.com/tan-yong-sheng/cc-devkits.git
cd cc-devkits
npm install
npm run build

# Link for global use
npm link

# Verify
cc-serper --help
cc-ntfy --help
```

## 🔧 Usage Examples

### cc-serper (Google Search & Web Scraping)

```bash
# Search Google
cc-serper search --query "TypeScript best practices" --gl us --hl en --num 10

# Get JSON output
cc-serper search --query "AI news" --json | jq '.organic[].title'

# Scrape webpage with markdown
cc-serper scrape --url "https://example.com" --markdown

# Regional search
cc-serper search --query "restaurants" --gl my --location "Kuala Lumpur"
```

### cc-ntfy (Push Notifications)

```bash
# Send notification
cc-ntfy --title "Build Complete" --message "All tests passed" --priority high

# With tags
cc-ntfy --title "Alert" --message "High CPU usage" --tags warning,computer

# With URL click action
cc-ntfy --title "New PR" --message "Review needed" --click "https://github.com/..."
```

## 📝 Environment Variables

### Serper

```bash
# Add to ~/.bashrc or ~/.zshrc
export SERPER_API_KEY="your-api-key-from-serper.dev"

# OR use multiple keys for rotation
export SERPER_API_KEYS="key1;key2;key3"
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
npm run build

# Commit changes
git add .
git commit -m "Your changes"
git push origin main

# Create and push version tag
git tag v2.0.0
git push origin v2.0.0
```

The workflow will:
1. ✅ Build the package
2. ✅ Test CLI commands
3. ✅ Publish to npmjs.com

Monitor at: https://github.com/tan-yong-sheng/cc-devkits/actions

### Manual Publishing

```bash
# 1. Build
npm run build

# 2. Login to npm (if not already logged in)
npm login

# 3. Publish
npm publish --access public
```

## 🛠️ Development Setup

### Local Development

```bash
# Clone repository
git clone https://github.com/tan-yong-sheng/cc-devkits.git
cd cc-devkits

# Install dependencies
npm install

# Build
npm run build

# Test locally with npm link
npm link
cc-serper --help
cc-ntfy --help

# Unlink when done
npm unlink -g @tan-yong-sheng/cc-devkits
```

### Testing Before Publishing

```bash
# Build
npm run build

# Test CLI help commands
node dist/cli/serper.js --help
node dist/cli/ntfy.js --help

# Test library imports
node -e "import('./dist/lib/index.js').then(m => console.log(Object.keys(m)))"
node -e "import('./dist/serper/index.js').then(m => console.log(Object.keys(m)))"
node -e "import('./dist/ntfy/index.js').then(m => console.log(Object.keys(m)))"
```

## 📚 Adding New Features

To add a new feature to the consolidated package:

### 1. Create Library Code

```bash
mkdir -p src/<feature>
```

Create `src/<feature>/index.ts`:
```typescript
export async function myFeature(options: MyOptions): Promise<Result> {
  // Implementation
}
```

Create `src/<feature>/types.ts`:
```typescript
export interface MyOptions {
  // Type definitions
}
```

### 2. Create CLI Entry Point

Create `src/cli/<feature>.ts`:
```typescript
#!/usr/bin/env node
import { myFeature } from '../<feature>/index.js';
import { parseArgs } from '../lib/index.js';

async function main() {
  const args = parseArgs(process.argv.slice(2), {
    query: { type: 'string', required: true },
    verbose: { type: 'boolean', short: 'v' },
  });

  const result = await myFeature(args);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
```

### 3. Update package.json

Add to `bin` field:
```json
{
  "bin": {
    "cc-serper": "dist/cli/serper.js",
    "cc-ntfy": "dist/cli/ntfy.js",
    "cc-<feature>": "dist/cli/<feature>.js"
  }
}
```

Add to `exports` field:
```json
{
  "exports": {
    "./<feature>": {
      "import": "./dist/<feature>/index.js",
      "types": "./dist/<feature>/index.d.ts"
    }
  }
}
```

### 4. Build and Test

```bash
npm run build
node dist/cli/<feature>.js --help
```

### 5. Publish

```bash
git add .
git commit -m "Add <feature> feature"
git push origin main
git tag v2.0.1
git push origin v2.0.1
```

## 🔍 Troubleshooting

### Package Not Found

```bash
# Clear npm cache
npm cache clean --force

# Verify package exists
npm view @tan-yong-sheng/cc-devkits
```

### Build Failures

```bash
# Clean and rebuild
npm run clean
rm -rf node_modules
npm install
npm run build
```

### Permission Denied

Ensure you're logged in to npm:
```bash
npm whoami
npm login
```

## 📊 CI/CD Workflows

### Publish Workflow (`.github/workflows/publish.yml`)

Runs when version tags are pushed:
- ✅ Builds the package
- ✅ Tests CLI commands
- ✅ Publishes to npmjs.com

Monitor workflows: https://github.com/tan-yong-sheng/cc-devkits/actions

## 📖 Resources

- **npm Package**: https://www.npmjs.com/package/@tan-yong-sheng/cc-devkits
- **npm Documentation**: https://docs.npmjs.com
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Serper API**: https://serper.dev
- **ntfy Documentation**: https://ntfy.sh

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Build and test locally: `npm run build`
5. Submit a pull request

All pull requests trigger CI checks automatically.

## 📄 License

MIT - See LICENSE file for details
