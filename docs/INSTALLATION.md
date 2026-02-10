# Installation Guide

This document covers how to install and set up `cc-devkits`.

## 📦 Published Package

A single unified package is available on **npmjs.com**:

| Package | Description | Version |
|---------|-------------|---------|
| [@tan-yong-sheng/cc-devkits](https://www.npmjs.com/package/@tan-yong-sheng/cc-devkits) | Google Search, web scraping, and push notifications | 2.0.0 |

## 🚀 Install from npm

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

## 📚 Library Usage

Install as a dependency in your project:

```bash
npm install @tan-yong-sheng/cc-devkits
```

Import specific modules:

```typescript
// Core utilities
import { retry, randomUserAgent } from '@tan-yong-sheng/cc-devkits';

// Serper (Google Search & scraping)
import { search, scrape } from '@tan-yong-sheng/cc-devkits/serper';

// ntfy (push notifications)
import { send, sendWithDedupe } from '@tan-yong-sheng/cc-devkits/ntfy';
```

## 🛠️ Build from Source

For development or contributing:

```bash
git clone https://github.com/tan-yong-sheng/cc-devkits.git
cd cc-devkits
npm install
npm run build

# Link for global CLI usage
npm link

# Test
cc-serper --help
cc-ntfy --help
```

## 🔧 Next Steps

- **[Environment Variables](./ENVIRONMENT.md)** - Configure API keys
- **[Development Guide](./DEVELOPMENT.md)** - Contributing guidelines
