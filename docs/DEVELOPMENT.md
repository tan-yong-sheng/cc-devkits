# Development Guide

This document provides information about the project structure and how to contribute to `cc-devkits`.

## 📂 Project Structure

```
cc-devkits/
├── hooks/
│   └── hooks.json            # Hook configuration
│
├── scripts/
│   └── hooks/
│       └── notify_ntfy.js    # ntfy hook script (JavaScript)
│
├── skills/
│   └── serper/
│       ├── SKILL.md          # Skill documentation
│       ├── .env.example      # Environment template
│       └── scripts/
│           └── run-serper.js # Serper runtime (JavaScript)
│
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
│
├── docs/                     # Documentation
├── README.md
└── AGENTS.md                 # Architecture docs
```

## 🛠️ Development

This is a **pure JavaScript** plugin — no build step required.

### JavaScript Validation

```bash
# Check syntax
node --check scripts/hooks/notify_ntfy.js
node --check skills/serper/scripts/run-serper.js
```

### JSON Validation

```bash
# Validate configuration files
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json'))"
node -e "JSON.parse(require('fs').readFileSync('hooks/hooks.json'))"
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes (JavaScript)
4. Test locally
5. Submit pull request

## Adding New Features

To add a new skill:

1. **Create skill directory**: `skills/<name>/`
2. **Add SKILL.md**: Document usage and commands
3. **Add runtime script** (optional): `skills/<name>/scripts/run-<name>.js`
4. **Update plugin.json** if needed

Example:
```
skills/
└── my-feature/
    ├── SKILL.md
    ├── .env.example
    └── scripts/
        └── run-my-feature.js
```
