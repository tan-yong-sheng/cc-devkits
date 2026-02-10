# Development Guide

This document provides information about the project structure and how to contribute to `cc-devkits`.

## 📂 Project Structure

```
cc-devkits/
├── src/
│   ├── lib/                    # Core utilities
│   │   ├── http.ts            # HTTP requests
│   │   ├── retry.ts           # Retry with backoff
│   │   ├── cli.ts             # CLI parsing
│   │   ├── user-agent.ts      # User agent rotation
│   │   ├── anonymize.ts       # API key redaction
│   │   ├── deduplicate.ts     # Deduplication logic
│   │   ├── rotate.ts          # API key rotation
│   │   ├── types.ts           # Shared types
│   │   └── index.ts           # Main exports
│   │
│   ├── serper/                # Serper library
│   │   ├── index.ts           # search(), scrape()
│   │   └── types.ts           # Serper types
│   │
│   ├── ntfy/                  # ntfy library
│   │   ├── index.ts           # send(), sendWithDedupe()
│   │   └── types.ts           # ntfy types
│   │
│   ├── cli/                   # CLI entry points
│   │   ├── serper.ts          # cc-serper CLI
│   │   └── ntfy.ts            # cc-ntfy CLI
│   │
│   ├── hooks/                 # Claude Code hooks
│   │   └── ntfy/
│   │       └── notify.ts      # Hook script
│   │
│   └── skills/                # Skill scripts
│       └── serper/
│           └── scripts/
│               └── serper.ts
│
├── dist/                      # Compiled output
├── hooks/
│   └── hooks.json            # Hook configuration
├── skills/
│   └── serper/
│       └── SKILL.md          # Skill documentation
├── .github/
│   └── workflows/
│       └── publish.yml       # Publish to npmjs.com
├── docs/                     # Documentation
├── package.json              # Single package config
├── tsconfig.json             # TypeScript config
├── README.md
└── AGENTS.md                 # Architecture docs
```

## 🛠️ Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Test Locally

```bash
# Build first
npm run build

# Test CLIs
node dist/cli/serper.js --help
node dist/cli/ntfy.js --help

# Link for global testing
npm link
cc-serper --help
cc-ntfy --help

# Unlink when done
npm unlink -g @tan-yong-sheng/cc-devkits
```

### Clean

```bash
npm run clean
```

## 🚀 Publishing

### Automated Publishing via GitHub Actions

Create and push a version tag:

```bash
git tag v2.0.0
git push origin v2.0.0
```

This triggers the workflow to publish to npmjs.com.

### Manual Publishing

```bash
# Build
npm run build

# Login to npm
npm login

# Publish
npm publish --access public
```

## 🔄 CI/CD

GitHub Actions workflows:
- **Publish** - Runs on version tags (build, test, publish to npmjs.com)

Monitor: https://github.com/tan-yong-sheng/cc-devkits/actions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Build and test: `npm run build`
5. Submit pull request

## Adding New Features

To add a new feature:

1. **Create library code** in `src/<feature>/`
   - `index.ts` - Main exports
   - `types.ts` - TypeScript types

2. **Add CLI** in `src/cli/<feature>.ts`

3. **Update package.json**
   - Add to `bin` field
   - Add to `exports` field

4. **Build and test**
   ```bash
   npm run build
   node dist/cli/<feature>.js --help
   ```
