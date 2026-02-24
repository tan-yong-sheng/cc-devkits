# cc-devkits Plugin Architecture

This document defines the architecture for **cc-devkits as a Claude Code plugin** with platform-agnostic script execution.

## Overview

cc-devkits provides:
- Serper-based web search and web scraping skill support
- ntfy-based Claude Code hook notifications
- Cross-platform execution for macOS, Linux, and Windows

## Plugin-First Architecture

This repository is treated as a Claude Code plugin system.

### Key Principle

All operational behavior is driven by:
- plugin metadata (`plugin.json`, `.claude-plugin/plugin.json`)
- hooks (`hooks/hooks.json`)
- skills (`skills/**/SKILL.md` + `skills/**/scripts/*`)

Installation medium is not part of architecture guidance in this document.

## Directory Structure

```text
cc-devkits/
├── hooks/
│   ├── hooks.json                  # Hook definitions
│   └── README.md
│
├── skills/
│   └── serper/
│       ├── SKILL.md                # Skill behavior and usage
│       ├── .env.example            # Required env vars for skill runtime
│       └── scripts/
│           └── run-serper.js       # Cross-platform script runner
│
├── src/
│   ├── hooks/ntfy/notify.ts        # Hook source implementation
│   ├── serper/                     # Serper library source
│   ├── ntfy/                       # ntfy library source
│   ├── lib/                        # Shared utilities
│   └── cli/                        # Internal CLI entrypoints
│
├── .claude-plugin/
│   ├── plugin.json                 # Plugin metadata for marketplace/plugin tooling
│   └── README.md
│
├── plugin.json                     # Root plugin descriptor
└── AGENTS.md
```

## Platform-Agnostic Proposal

Use the following model for all current and future skills/hooks.

### 1) Use Node.js scripts for runtime behavior

- Prefer Node scripts for hooks and skill automation.
- Avoid OS-specific shell-only workflows for core logic.

### 2) Resolve paths via plugin root and Node path utilities

- Primary resolution: `CLAUDE_PLUGIN_ROOT`
- Fallback: relative path from current workspace
- Build paths with `path.join(...)`, never hardcoded separators.

### 3) Keep script execution OS-safe

- Prefer `spawnSync`/`spawn` with argument arrays over shell command strings.
- Avoid command construction that requires shell interpolation.

### 4) Add explicit platform detection where needed

- `process.platform === 'win32'` for Windows logic
- `process.platform === 'darwin'` for macOS logic
- `process.platform === 'linux'` for Linux logic

Use these only when behavior truly differs.

### 5) Handle command existence checks by OS

- Windows: `where`
- Unix-like: `which`

Wrap this in a helper for reuse.

### 6) Use environment loading with deterministic precedence

For skill runtime configuration:
1. `process.env`
2. `.claude/skills/<skill>/.env`
3. `.claude/.env`
4. project `.env`
5. `~/.claude/.env`

## Serper Skill Runtime Contract

`skills/serper/scripts/run-serper.js` is the single runtime entrypoint and should:

- load and validate Serper credentials
- rotate keys when multiple keys are configured
- detect platform safely
- resolve executable paths safely
- run search/scrape actions with structured error handling

## Hooks Contract

`hooks/hooks.json` should execute scripts using plugin-root-resolved paths and Node.

Rules:
- no hardcoded absolute machine paths
- no OS-specific path separators in static strings
- no shell-only assumptions

## Migration Guidance for Existing Files

When updating existing hooks/skills:

1. Replace absolute script paths with plugin-root-relative resolution.
2. Move script logic into Node files under `skills/<name>/scripts` or `scripts/hooks`.
3. Remove platform-specific shell branching from hook command strings.
4. Keep behavior in one script entrypoint per feature where practical.

## Definition of Done (Platform-Agnostic)

A skill/hook change is complete when:

- it runs on macOS, Linux, and Windows without path edits
- no hardcoded user/machine absolute paths remain
- script execution uses safe process APIs
- docs reference plugin-root path strategy
- runtime env precedence is documented and implemented
