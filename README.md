# cc-devkits

A Claude Code plugin providing ntfy notifications and Serper web search/scraping skills.

## 🚀 Quick Start

### Install the Plugin

```bash
# Add marketplace
/plugin marketplace add tan-yong-sheng/cc-devkits

# Install plugin
/plugin install cc-devkits@tan-yong-sheng
```

### Set up API Keys

- **Serper API Key** (for web search): Get a free key at https://serper.dev (2,500 searches/month)
  ```bash
  export SERPER_API_KEY="your-key-here"
  ```

- **ntfy** (optional, for notifications):
  ```bash
  export NTFY_TOPIC="your-topic"
  export NTFY_API_KEY="your-api-key"  # if using private server
  ```

## Features

- **ntfy Hooks** - Get push notifications for Claude Code events (Session started, Task completed, etc.)
- **Serper Skills** - Google Search and web scraping with markdown extraction

## Usage

### Serper Skill

The skill activates automatically when you ask Claude to search the web:

```
You: Search for "TypeScript best practices"
Claude: [Uses serper skill automatically]
```

Or reference it directly:
```
@serper search --query "AI news" --num 5
```

## 📚 Documentation

- **[Installation Guide](./docs/INSTALLATION.md)** - How to install the plugin
- **[Environment Variables](./docs/ENVIRONMENT.md)** - Required API keys and configuration
- **[Development Guide](./docs/DEVELOPMENT.md)** - Project structure and contributing
- **[Architecture](./AGENTS.md)** - Deep dive into the plugin architecture

## License

MIT - See LICENSE file

## Author

tan-yong-sheng

## Resources

- **Serper API**: https://serper.dev
- **ntfy**: https://ntfy.sh
- **Claude Code**: https://claude.com/code
