---
name: serper
description: Search the web or scrape webpages via Serper using the plugin runtime script at skills/serper/scripts/run-serper.js.
---

# Serper Skill

This skill follows a **plugin-first, script-first** runtime model.

Canonical runtime entrypoint (Claude resolves paths relative to skill location):

```bash
node ./scripts/run-serper.js
```

Use this skill when you need:
- web search for current information
- webpage extraction from a URL
- structured JSON output for further processing

## Process (scheduler-style, adapted for on-demand API calls)

1. Determine operation: `search` or `scrape`.
2. Validate required input:
   - search: `--query`
   - scrape: `--url`
3. Execute the runtime script using the relative path.
4. Return JSON output directly.
5. Surface clear API/network/rate-limit errors.

## Commands

### Search

```bash
node ./scripts/run-serper.js search \
  --query "{{query}}" \
  [--gl us] \
  [--hl en] \
  [--num 10] \
  [--page 1] \
  [--location "{{location}}"] \
  [--timeout 30000]
```

Options:
- `--query` (required): search query string
- `--gl` (optional): country code, default `us`
- `--hl` (optional): language code, default `en`
- `--num` (optional): number of results, default `10`, max `100`
- `--page` (optional): page number, default `1`
- `--location` (optional): location context
- `--timeout` (optional): timeout in milliseconds, default `30000`

### Scrape

```bash
node ./scripts/run-serper.js scrape \
  --url "{{url}}" \
  [--markdown] \
  [--timeout 30000]
```

Options:
- `--url` (required): target URL
- `--markdown` (optional): request markdown content
- `--timeout` (optional): timeout in milliseconds, default `30000`

## Environment

Set one of:

```bash
SERPER_API_KEY=your_api_key_here
# or
SERPER_API_KEYS=key1;key2;key3
```

Env resolution precedence:
1. `process.env`
2. `.claude/skills/serper/.env`
3. `.claude/.env`
4. project `.env`
5. `~/.claude/.env`

## Output

Commands return JSON to stdout.

Search response typically includes:
- `organic[]`
- `knowledgeGraph`
- `answerBox`
- `relatedSearches[]`

Scrape response typically includes:
- `text`
- `markdown`
- `metadata`
- `links[]`
- `images[]`

## Error Handling

- `401`: invalid API key
- `429`: rate limit exceeded
- timeout/network errors: connectivity or remote latency issues
- missing required args: usage/help output

## Examples

```bash
node ./scripts/run-serper.js search --query "TypeScript best practices" --num 5
node ./scripts/run-serper.js scrape --url "https://example.com" --markdown
```
