# cc-devkits

A Claude Code plugin providing ntfy notifications, Serper web search/scraping skills, and AI Vision MCP integration.

## 🚀 Quick Start

Get up and running in under 2 minutes:

### Step 1: Install the Plugin
```bash
# Add marketplace
/plugin marketplace add affaan-m/everything-claude-code

# Install plugin
/plugin install everything-claude-code@everything-claude-code
```

### Step 2: Install Dependencies
The Serper skill requires the `@tan-yong-sheng/serper` CLI tool for web search and scraping. Follow the instructions in **[skills/serper/SKILL.md](./skills/serper/SKILL.md)** to:
- Configure GitHub Packages authentication
- Install the CLI globally: `npm install -g @tan-yong-sheng/serper`
- Set up your `SERPER_API_KEY`

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
