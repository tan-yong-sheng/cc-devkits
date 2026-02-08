# cc-devkits

A Claude Code plugin providing ntfy notifications, Serper web search/scraping skills, and AI Vision MCP integration.

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

## Installation

### 1. Clone and Build

```bash
git clone https://github.com/tan-yong-sheng/cc-devkits.git
cd cc-devkits
npm install
npm run build
```

### 2. Configure Environment Variables

Create a `.env` file or set environment variables:

```bash
# ntfy Configuration
export NTFY_BASE_URL="https://ntfy.tanyongsheng.site"
export NTFY_TOPIC="openclaw"
export NTFY_API_KEY="your-ntfy-api-key"

# Serper Configuration
export SERPER_API_KEY="your-serper-api-key"

# AI Vision MCP Configuration (if using Google provider)
export GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Install the Plugin

```bash
claude plugin install /path/to/cc-devkits
```

Or add to your `~/.config/claude/settings.json`:

```json
{
  "enabledPlugins": {
    "cc-devkits@cc-devkits": true
  }
}
```

## Project Structure

```
cc-devkits/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── hooks/
│   └── ntfy/
│       ├── hook.json        # Hook registrations
│       ├── notify.ts        # TypeScript source
│       └── README.md        # Hook documentation
├── skills/
│   └── serper/
│       ├── SKILL.md         # Skill definition
│       └── scripts/
│           └── serper.ts    # TypeScript source
├── src/                     # TypeScript source files
│   ├── hooks/
│   │   └── ntfy/
│   │       └── notify.ts
│   └── skills/
│       └── serper/
│           └── scripts/
│               └── serper.ts
├── dist/                    # Compiled JavaScript (after build)
├── .mcp.json               # MCP server configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Clean

```bash
npm run clean
```

## Usage

### ntfy Hooks

Hooks are automatically triggered by Claude Code events. Configure them in your `~/.config/claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/cc-devkits/dist/hooks/ntfy/notify.js --priority high --emoji white_check_mark --title \"Claude Code - Task Complete\" --message \"Task is completed\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Serper Skills

Use the skill in Claude Code:

```
/search for "TypeScript best practices"
/scrape https://example.com with markdown
```

### AI Vision MCP

The MCP server is automatically configured via `.mcp.json`. Use the vision tools:

```
Analyze this image: https://example.com/image.jpg
Compare these two images and tell me the differences
Detect objects in this image
```

## Environment Variables Reference

| Variable | Required For | Description |
|----------|--------------|-------------|
| `NTFY_BASE_URL` | ntfy hooks | ntfy server URL |
| `NTFY_TOPIC` | ntfy hooks | Notification topic |
| `NTFY_API_KEY` | ntfy hooks | API key for authentication |
| `SERPER_API_KEY` | serper skills | Serper.dev API key |
| `GEMINI_API_KEY` | ai-vision-mcp | Google AI Studio API key |

## License

MIT

## Author

tan-yong-sheng
