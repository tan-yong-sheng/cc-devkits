# Installation Guide

This document covers how to install and set up `cc-devkits` as a Claude Code plugin.

## 🚀 Quick Install

Install directly via Claude Code:

```bash
# Add marketplace (one-time)
/plugin marketplace add tan-yong-sheng/cc-devkits

# Install plugin
/plugin install cc-devkits@tan-yong-sheng
```

## 📋 What's Included

After installation, you get:

- **ntfy Hooks** - Push notifications for Claude Code events
- **Serper Skills** - Web search and scraping via skill invocation

## 🔧 Configuration

### ntfy Notifications (Optional)

Set environment variables for push notifications:

```bash
export NTFY_TOPIC="your-topic"
export NTFY_API_KEY="your-api-key"  # if using private server
```

### Serper API Key (Required for search/scrape)

Get a free key at https://serper.dev (2,500 searches/month):

```bash
export SERPER_API_KEY="your-key-here"
# or multiple keys for rotation:
export SERPER_API_KEYS="key1;key2;key3"
```

Or create `.env` files (see [Environment Variables](./ENVIRONMENT.md)).

## 🔧 Next Steps

- **[Environment Variables](./ENVIRONMENT.md)** - Configure API keys
- **[Architecture](../AGENTS.md)** - Plugin architecture overview
