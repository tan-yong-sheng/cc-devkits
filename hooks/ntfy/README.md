# Claude Code ntfy Hooks - TypeScript Version

## 📊 Overview

TypeScript implementation of Claude Code ntfy hooks. Built with Node.js and compiled to JavaScript.

**Features:**
- ✅ TypeScript for type safety
- ✅ Reads Claude Code context from stdin (cwd, session_id, model)
- ✅ Supports emojis, priority, tags, click actions
- ✅ Uses NTFY_API_KEY for authentication
- ✅ Configurable timeout
- ✅ Deduplication support (12-second cooldown)
- ✅ Proper error handling

---

## 📁 Files

### Hook Script
**Source:** `src/hooks/ntfy/notify.ts`
**Compiled:** `dist/hooks/ntfy/notify.js`

**Dependencies:** Node.js 18+, npm

**Features:**
- Sends notifications to ntfy.sh
- Reads Claude Code session context from stdin
- Supports emojis, priority, tags, click actions
- Deduplication prevents duplicate notifications
- Uses NTFY_API_KEY for authentication

---

## 🎯 Configured Hooks

### 1. SessionStart - Session Started
```json
{
  "type": "command",
  "command": "node dist/hooks/ntfy/notify.js --priority default --emoji rocket --title \"Claude Code - Session Started\" --message \"New Claude Code session has been started\"",
  "timeout": 30
}
```

### 2. Stop - Task Complete
```json
{
  "type": "command",
  "command": "node dist/hooks/ntfy/notify.js --priority high --emoji white_check_mark --title \"Claude Code - Task Complete\" --message \"Task is completed\"",
  "timeout": 30
}
```

### 3. Notification - Permission Needed
```json
{
  "matcher": "permission_prompt",
  "hooks": [
    {
      "type": "command",
      "command": "node dist/hooks/ntfy/notify.js --priority high --emoji shark --title \"Claude Code - Permission needed\" --message \"Permission is needed to proceed with next step\"",
      "timeout": 30
    }
  ]
}
```

### 4. PreToolUse - Plan Ready
```json
{
  "matcher": "ExitPlanMode",
  "hooks": [
    {
      "type": "command",
      "command": "node dist/hooks/ntfy/notify.js --priority high --emoji clipboard --title \"Claude Code - Plan Ready\" --message \"Plan is ready for review\""
    }
  ]
}
```

### 5. PreToolUse - Input Needed
```json
{
  "matcher": "AskUserQuestion",
  "hooks": [
    {
      "type": "command",
      "command": "node dist/hooks/ntfy/notify.js --priority high --emoji question --title \"Claude Code - Input Needed\" --message \"Claude Code asks you question and needs your input\""
    }
  ]
}
```

---

## 📖 Usage

### Build

```bash
npm install
npm run build
```

### Command Line

```bash
node dist/hooks/ntfy/notify.js \
  --title "Title" \
  --message "Message" \
  [options]
```

### Options

| Option | Required | Description | Example |
|--------|----------|-------------|---------|
| `--title <string>` | ✅ Yes | Notification title | `--title "Build Complete"` |
| `--message <string>` | ✅ Yes | Notification message | `--message "Your build is ready"` |
| `--priority <string>` | No | Priority level (min/low/default/high/max/urgent) | `--priority high` |
| `--emoji <string>` | No | Emoji name | `--emoji white_check_mark` |
| `--tags <string>` | No | Comma-separated tags | `--tags "build,success"` |
| `--click <url>` | No | URL to open on click | `--click "https://example.com"` |
| `--attach <url>` | No | Attachment URL | `--attach "https://example.com/file.pdf"` |
| `--timeout <number>` | No | Request timeout in seconds (default: 10) | `--timeout 30` |
| `--include-cwd` | No | Include project path in message | `--include-cwd` |
| `--no-cwd` | No | Don't include project path | `--no-cwd` |

---

## 🔧 Environment Variables

The script uses these environment variables:

```bash
# Primary (recommended)
NTFY_BASE_URL="https://ntfy.tanyongsheng.site"
NTFY_TOPIC="openclaw"
NTFY_API_KEY="<NTFY_API_KEY>"

# Fallback (alternative names)
NTFY_URL="https://ntfy.tanyongsheng.site"  # Falls back to NTFY_BASE_URL
NTFY_TOKEN="..."                            # Falls back to NTFY_API_KEY
```

**Priority order:**
1. `NTFY_BASE_URL` → falls back to → `NTFY_URL`
2. `NTFY_API_KEY` → falls back to → `NTFY_TOKEN`

---

## 🧪 Testing

### Build First

```bash
npm run build
```

### Test Individual Notification

```bash
node dist/hooks/ntfy/notify.js \
  --title "Test" \
  --message "This is a test" \
  --priority high \
  --emoji tada
```

### Test with Project Context

```bash
echo '{"cwd":"/home/user/myproject","session_id":"abc123","model":"claude-opus"}' | \
  node dist/hooks/ntfy/notify.js \
  --title "Test with Context" \
  --message "Testing context" \
  --include-cwd
```

---

## 📋 Complete Settings File

**Location:** `~/.config/claude/settings.json`

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/cc-devkits/dist/hooks/ntfy/notify.js --priority default --emoji rocket --title \"Claude Code - Session Started\" --message \"New Claude Code session has been started\"",
            "timeout": 30
          }
        ]
      }
    ],
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
    ],
    "Notification": [
      {
        "matcher": "permission_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/cc-devkits/dist/hooks/ntfy/notify.js --priority high --emoji shark --title \"Claude Code - Permission needed\" --message \"Permission is needed to proceed with next step\"",
            "timeout": 30
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "ExitPlanMode",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/cc-devkits/dist/hooks/ntfy/notify.js --priority high --emoji clipboard --title \"Claude Code - Plan Ready\" --message \"Plan is ready for review\""
          }
        ]
      },
      {
        "matcher": "AskUserQuestion",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/cc-devkits/dist/hooks/ntfy/notify.js --priority high --emoji question --title \"Claude Code - Input Needed\" --message \"Claude Code asks you question and needs your input\""
          }
        ]
      }
    ]
  }
}
```

---

## 🎨 Examples

### Basic Notification

```bash
node dist/hooks/ntfy/notify.js \
  --title "Hello" \
  --message "World"
```

### With Emoji and Priority

```bash
node dist/hooks/ntfy/notify.js \
  --title "Build Complete" \
  --message "Your build finished successfully" \
  --priority high \
  --emoji tada
```

### With Click Action

```bash
node dist/hooks/ntfy/notify.js \
  --title "Pull Request" \
  --message "New PR #123 opened" \
  --emoji bell \
  --click "https://github.com/user/repo/pull/123"
```

### With Tags

```bash
node dist/hooks/ntfy/notify.js \
  --title "Deployment" \
  --message "Production deployed" \
  --tags "deploy,production" \
  --emoji rocket
```

### With Attachment

```bash
node dist/hooks/ntfy/notify.js \
  --title "Report Ready" \
  --message "Monthly report generated" \
  --attach "https://example.com/report.pdf" \
  --emoji clipboard
```

---

## 🛠️ Troubleshooting

### Hook Not Firing

**Check settings.json syntax:**
```bash
cat ~/.config/claude/settings.json | jq .
```

**Test hook manually:**
```bash
node dist/hooks/ntfy/notify.js \
  --title "Test" \
  --message "Test"
```

### Build Errors

**Install dependencies:**
```bash
npm install
```

**Rebuild:**
```bash
npm run clean && npm run build
```

### Notification Not Received

**Check environment variables:**
```bash
echo $NTFY_BASE_URL
echo $NTFY_TOPIC
echo $NTFY_API_KEY
```

**Test curl directly:**
```bash
curl -H "Authorization: Bearer $NTFY_API_KEY" \
  -H "Title: Test" \
  -d "Test message" \
  https://ntfy.tanyongsheng.site/openclaw
```

---

## 🚀 Usage with Claude Code

Just run Claude Code normally:

```bash
# Interactive mode
claude

# Non-interactive mode
claude -c -p "create a REST API"
```

**Hooks will fire automatically:**
- Session Start → 🚀 Session Started
- Stop → ✅ Task Complete
- Permission prompt → 🦈 Permission needed
- Plan ready → 📋 Plan Ready
- Question → ❓ Input Needed

---

## 📚 References

**Official Docs:**
- https://code.claude.com/docs/en/hooks-guide
- https://code.claude.com/docs/en/hooks

**ntfy.sh Docs:**
- https://ntfy.sh/docs/publish/

**Files:**
- Source: `src/hooks/ntfy/notify.ts`
- Compiled: `dist/hooks/ntfy/notify.js`
- Hook config: `hooks/ntfy/hook.json`

---

**Created:** 2026-02-08
**Version:** TypeScript (Node.js)
**Status:** ✅ Production ready
