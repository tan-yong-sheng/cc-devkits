# Development Guide

This document provides information about the project structure and how to contribute to `cc-devkits`.

## 📂 Project Structure

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

## 🛠️ Development

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

See [INSTALLATION.md](./INSTALLATION.md) for installation instructions and [PUBLISHING.md](../PUBLISHING.md) for manual publishing details.

## 🚀 CI/CD

GitHub Actions workflows:
- **CI** - Runs on every push/PR (build, test, verify)
- **Publish** - Runs on version tags (build, test, publish to GitHub Packages)

Monitor: https://github.com/tan-yong-sheng/cc-devkits/actions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Build and test: `npm run build:all`
5. Submit pull request
