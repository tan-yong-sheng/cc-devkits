---
name: serper
description: Google Search and web scraping via Serper API - TypeScript implementation with retry and jitter. Use when you need to search Google, scrape webpages, or gather information from the web. Supports advanced search operators (site:, filetype:, date filters), regional/language targeting, and markdown extraction.
homepage: https://serper.dev
metadata: {"openclaw":{"emoji":"🔍","requires":{"bins":["node"],"env":["SERPER_API_KEY"]},"primaryEnv":"SERPER_API_KEY"}}
---

# 🔍 Serper

*Search Google, Scrape web, Go fast*

TypeScript Google Search and web scraping with built-in retry, exponential backoff, jitter, and user-agent rotation.

## Setup

**REOMMENDED: Define SERPER_API_KEY as global environment variable so we could directly execute the script**
```bash
npm install
npm run build
```

Get your API key from https://serper.dev (2500 free searches/month).

**API Key Priority:**
1. Global environment variable (`$SERPER_API_KEY`)

**Security Note:** Option 1 (global env) is more secure as the key never appears in command history or chat transcripts.

## Quick Start

1. **Search Malaysia news:**
```bash
serper search "Malaysia news after:2026-01-28" --gl my --hl en --num 10
```

2. **Scrape webpage:**
```bash
serper scrape "https://example.com" --markdown
```

3. **JSON output for scripting:**
```bash
serper search "AI" --json | jq '.organic[].title'
```

## Commands

### Search
```bash
serper search <query> [options]
```

**Options:**
- `-n, --num <number>` - Results count (default: 10)
- `-g, --gl <code>` - Country code (default: us)
- `-l, --hl <code>` - Language code (default: en)
- `--location <location>` - Geographic location
- `--page <number>` - Page number (default: 1)
- `-j, --json` - Raw JSON output
- `--retries <number>` - Retry attempts (default: 3)

**Examples:**
```bash
# Regional search
serper search "restaurants" --gl my --hl en --location "Kuala Lumpur"

# Date-filtered news
serper search "Malaysia news after:2026-01-28 before:2026-01-30" --gl my

# Site-specific
serper search "tutorial site:github.com"

# File type
serper search "report filetype:pdf"
```

### Scrape
```bash
serper scrape <url> [options]
```

**Options:**
- `-m, --markdown` - Include markdown
- `-j, --json` - Raw JSON output
- `--retries <number>` - Retry attempts (default: 3)

**Examples:**
```bash
serper scrape "https://docs.example.com" --markdown
serper scrape "https://blog.com" --json | jq -r '.text'
```

## Search Operators

| Operator | Usage | Example |
|----------|-------|---------|
| `site:` | Limit to domain | `"docs site:github.com"` |
| `filetype:` | File type filter | `"guide filetype:pdf"` |
| `after:` | Date after (YYYY-MM-DD) | `"news after:2026-01-28"` |
| `before:` | Date before | `"news before:2026-01-30"` |
| `"exact"` | Exact phrase | `'"machine learning"'` |
| `-exclude` | Exclude terms | `"python -snake"` |
| `OR` | Alternatives | `"tutorial OR guide"` |

## Response Format

### Search
```json
{
  "searchParameters": {"q": "query", "gl": "us", "hl": "en"},
  "organic": [
    {
      "title": "Page Title",
      "link": "https://example.com",
      "snippet": "Description...",
      "position": 1
    }
  ],
  "knowledgeGraph": {"title": "...", "description": "..."},
  "peopleAlsoAsk": [{"question": "...", "snippet": "..."}],
  "relatedSearches": [{"query": "..."}]
}
```

### Scrape
```json
{
  "text": "Plain text content...",
  "markdown": "# Markdown content...",
  "metadata": {"title": "...", "description": "..."}
}
```

## Features

- ✅ Retry with exponential backoff (1s → 2s → 4s)
- ✅ Random jitter (100-500ms)
- ✅ User-Agent rotation (4 realistic User Agents)
- ✅ Smart error handling (auth errors don't retry)
- ✅ TypeScript with type safety
- ✅ Compiled to JavaScript for Node.js

## Rate Limits

- **Free Plan:** 2,500 searches/month
- **Paid Plan:** $50/month for 5,000 searches

Dashboard: https://serper.dev/dashboard