# cc-devkits

A Claude Code plugin providing ntfy notifications, Serper web search/scraping skills, and AI Vision MCP integration.

## 🚀 Quick Start

Get up and running in under 2 minutes:

### Step 1: Install the Plugin
```bash
# Add marketplace
/plugin marketplace add tan-yong-sheng/cc-devkits

# Install plugin
/plugin install cc-devkits@tan-yong-sheng
```

### Step 2: Install the CLI Tools
Install the unified cc-devkits package from npm:

```bash
npm install -g @tan-yong-sheng/cc-devkits
```

### Step 3: Set up API Keys
- **Serper API Key**: Get a free key at https://serper.dev (2,500 searches/month)
  ```bash
  export SERPER_API_KEY="your-key-here"
  ```

- **ntfy (optional)**: Configure for push notifications
  ```bash
  export NTFY_TOPIC="your-topic"
  export NTFY_API_KEY="your-api-key"  # if using private server
  ```

## Features

- **ntfy Hooks** - Get push notifications for Claude Code events (Session started, Task completed, etc.)
- **Serper Skills** - Google Search and web scraping with markdown extraction
- **AI Vision MCP** - Image and video analysis, object detection, and visual comparison

## 📚 Documentation

Detailed documentation has been moved to the `docs/` directory:

- **[Installation Guide](./docs/INSTALLATION.md)** - How to install from npm
- **[Environment Variables](./docs/ENVIRONMENT.md)** - Required API keys and configuration
- **[Development Guide](./docs/DEVELOPMENT.md)** - Project structure and contributing instructions
- **[Publishing Guide](./PUBLISHING.md)** - Guide for publishing to npmjs.com
- **[Architecture](./AGENTS.md)** - Deep dive into the package architecture

## Usage Examples

### cc-serper CLI
```bash
# Search Google
cc-serper search --query "TypeScript best practices" --gl us --hl en --num 10

# Scrape webpage with markdown
cc-serper scrape --url "https://example.com" --markdown

# JSON output for scripting
cc-serper search --query "AI news" --json | jq '.organic[].title'
```

### cc-ntfy CLI
```bash
# Send notification
cc-ntfy --title "Build Complete" --message "All tests passed" --priority high

# With emoji and click action
cc-ntfy --title "PR Opened" --message "New pull request" --tags bell --click "https://github.com/..."
```

### Library Usage
```typescript
// Import specific modules
import { search, scrape } from '@tan-yong-sheng/cc-devkits/serper';
import { send } from '@tan-yong-sheng/cc-devkits/ntfy';

// Search Google
const results = await search('TypeScript best practices', { num: 10 });

// Scrape webpage
const page = await scrape('https://example.com', { markdown: true });

// Send notification
await send({ title: 'Done', message: 'Task complete', priority: 'high' });
```

## License

MIT - See LICENSE file

## Author

tan-yong-sheng

## Resources

- **npm Package**: https://www.npmjs.com/package/@tan-yong-sheng/cc-devkits
- **Serper API**: https://serper.dev
- **ntfy**: https://ntfy.sh
- **Claude Code**: https://claude.com/code
