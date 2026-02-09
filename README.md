# cc-devkits

A Claude Code plugin providing ntfy notifications, Serper web search/scraping skills, and AI Vision MCP integration.

## 🚀 Quick Start

### Step 1: Install Plugin (Required)

Install `cc-devkits` as a Claude Code plugin to enable all features:

```bash
# 1. Clone the repository
git clone https://github.com/tan-yong-sheng/cc-devkits.git
cd cc-devkits

# 2. Install dependencies and build
npm install
npm run build:all

# 3. Add to Claude Code
# Replace [absolute-path] with the full path to this directory
claude mcp add cc-devkits -- [absolute-path]/packages/serper/bin/serper
```

## Features

- **ntfy Hooks** - Get push notifications for Claude Code events (Session started, Task completed, etc.)
- **Serper Skills** - Google Search and web scraping with markdown extraction
- **AI Vision MCP** - Image and video analysis, object detection, and visual comparison

## 📚 Documentation

Detailed documentation has been moved to the `docs/` directory:

- **[Installation Guide](./docs/INSTALLATION.md)** - How to install from GitHub Packages or Build from Source
- **[Environment Variables](./docs/ENVIRONMENT.md)** - Required API keys and configuration
- **[Development Guide](./docs/DEVELOPMENT.md)** - Project structure and contributing instructions
- **[Publishing Guide](./PUBLISHING.md)** - Guide for publishing to GitHub Packages
- **[Architecture](./AGENTS.md)** - Deep dive into the monorepo architecture

## Usage Examples

### Serper CLI
```bash
serper search "TypeScript best practices" --gl us --hl en --num 10
serper scrape "https://example.com" --markdown
```

### ntfy CLI
```bash
ntfy --title "Build Complete" --message "All tests passed" --priority high
```

## License

MIT - See LICENSE file

## Author

tan-yong-sheng

## Resources

- **Serper API**: https://serper.dev
- **ntfy**: https://ntfy.sh
- **Claude Code**: https://claude.com/code
