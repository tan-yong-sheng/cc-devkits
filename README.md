# cc-devkits

A Claude Code plugin providing ntfy notifications, Serper web search/scraping skills, and AI Vision MCP integration.

## 📦 Published Packages

All packages are available on **GitHub Packages**. Install globally for CLI usage:

| Package | Description | Version |
|---------|-------------|---------|
| [@tan-yong-sheng/core](https://github.com/tan-yong-sheng?tab=packages&repo_name=cc-devkits) | Core utilities (HTTP, retry, CLI parsing) | 1.0.0 |
| [@tan-yong-sheng/serper](https://github.com/tan-yong-sheng?tab=packages&repo_name=cc-devkits) | Google Search & web scraping | 1.0.0 |
| [@tan-yong-sheng/ntfy](https://github.com/tan-yong-sheng?tab=packages&repo_name=cc-devkits) | Push notifications via ntfy | 1.0.0 |

## 🚀 Quick Start

### Option 1: Install from GitHub Packages (Recommended)

```bash
# Configure npm for GitHub Packages
npm config set @tan-yong-sheng:registry https://npm.pkg.github.com

# Login with GitHub Personal Access Token (needs read:packages scope)
npm login --registry=https://npm.pkg.github.com --scope=@tan-yong-sheng

# Install globally
npm install -g @tan-yong-sheng/serper
npm install -g @tan-yong-sheng/ntfy

# Verify installation
serper --help
ntfy --help
```

**Get Personal Access Token:**
1. Go to https://github.com/settings/tokens
2. Generate new token with `read:packages` scope
3. Use it when prompted for password during `npm login`

### Option 2: Build from Source

```bash
git clone https://github.com/tan-yong-sheng/cc-devkits.git
cd cc-devkits
npm install
npm run build:all
```

## Features

- **ntfy Hooks** - Get push notifications for Claude Code events:
  - Session started
  - Task completed
  - Permission needed
  - Plan ready for review
  - Input needed

- **Serper Skills** - Google Search and web scraping:
  - Search Google with advanced operators
  - Scrape webpages with markdown extraction
  - Retry logic with exponential backoff

- **AI Vision MCP** - Image and video analysis via MCP:
  - Analyze images
  - Compare images
  - Detect objects in images
  - Analyze videos

## Usage Examples

### Serper CLI

```bash
# Search Google
serper search "TypeScript best practices" --gl us --hl en --num 10

# Regional search
serper search "restaurants" --gl my --location "Kuala Lumpur"

# Date-filtered news
serper search "AI news after:2026-01-28" --json

# Scrape webpage with markdown
serper scrape "https://example.com" --markdown
```

### ntfy CLI

```bash
# Send notification
ntfy --title "Build Complete" --message "All tests passed" --priority high

# With tags and click action
ntfy --title "New PR" --message "Review needed" \
  --tags "white_check_mark" \
  --click "https://github.com/user/repo/pull/123"
```

## Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc

# Serper API (get from https://serper.dev)
export SERPER_API_KEY="your-api-key"

# ntfy Configuration
export NTFY_BASE_URL="https://ntfy.sh"
export NTFY_TOPIC="your-topic"
export NTFY_API_KEY="your-api-key"  # optional

# AI Vision (if using Google provider)
export GEMINI_API_KEY="your-gemini-api-key"
```

## Project Structure

```
cc-devkits/
├── packages/                    # Monorepo packages
│   ├── core/                   # Core utilities
│   │   ├── src/
│   │   │   ├── http.ts        # HTTP requests
│   │   │   ├── retry.ts       # Retry with backoff
│   │   │   ├── cli.ts         # CLI parsing
│   │   │   └── ...
│   │   └── dist/              # Compiled output
│   ├── serper/                # Serper API wrapper
│   │   ├── src/
│   │   │   ├── index.ts       # search(), scrape()
│   │   │   └── cli.ts         # CLI entry point
│   │   └── dist/
│   └── ntfy/                  # ntfy client
│       ├── src/
│       │   ├── index.ts       # send()
│       │   └── cli.ts         # CLI entry point
│       └── dist/
├── skills/
│   └── serper/
│       └── SKILL.md           # Skill documentation
├── hooks/
│   └── ntfy/
│       ├── hook.json         # Hook registrations
│       └── README.md         # Hook documentation
├── .github/
│   └── workflows/
│       ├── ci.yml            # Build & test
│       └── publish.yml       # Publish to GitHub Packages
├── PUBLISHING.md             # Publishing guide
├── AGENTS.md                 # Architecture docs
└── package.json
```

## 📚 Documentation

- **[PUBLISHING.md](./PUBLISHING.md)** - Complete installation & publishing guide
- **[AGENTS.md](./AGENTS.md)** - Monorepo architecture & development workflow
- **[skills/serper/SKILL.md](./skills/serper/SKILL.md)** - Serper CLI reference
- **[hooks/ntfy/README.md](./hooks/ntfy/README.md)** - ntfy hooks setup

## Development

### Build All Packages

```bash
npm run build:all
```

### Watch Mode

```bash
npm run dev
```

### Test Locally

```bash
# Link package for testing
cd packages/serper
npm link
serper --help

# Unlink when done
npm unlink -g @tan-yong-sheng/serper
```

### Publishing

Packages are automatically published via GitHub Actions when you push a version tag:

```bash
git tag v1.0.3
git push origin v1.0.3
```

See [PUBLISHING.md](./PUBLISHING.md) for manual publishing instructions.

## CI/CD

GitHub Actions workflows:
- **CI** - Runs on every push/PR (build, test, verify)
- **Publish** - Runs on version tags (build, test, publish to GitHub Packages)

Monitor: https://github.com/tan-yong-sheng/cc-devkits/actions

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Build and test: `npm run build:all`
5. Submit pull request

## License

MIT - See LICENSE file

## Author

tan-yong-sheng

## Resources

- **Serper API**: https://serper.dev
- **ntfy**: https://ntfy.sh
- **GitHub Packages**: https://docs.github.com/en/packages
- **Claude Code**: https://claude.com/code
