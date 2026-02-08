# Claude Code ntfy Hooks - Bash Version

## 📊 Overview

Pure bash implementation of Claude Code ntfy hooks. No Node.js dependencies - just bash and curl!

**Advantages:**
- ✅ No Node.js required
- ✅ Pure bash (portable)
- ✅ Faster startup
- ✅ Simpler dependencies (just curl)
- ✅ Easy to debug

---

## 📁 Files

### Hook Script (2.9KB)
**Path:** `~/.claude/hooks/notify-bash/notify_hook.sh`

**Dependencies:** bash, curl (built-in on most systems)

**Features:**
- Sends notifications to ntfy.sh
- Supports emojis, priority, tags, click actions
- Uses NTFY_API_KEY for authentication
- Configurable timeout
- Proper error handling

---

### Settings File (1.5KB)
**Path:** `~/.config/claude/settings.json`

**All hooks use bash commands:**
```bash
bash ~/.claude/hooks/notify-bash/notify_hook.sh [options]
```

---

## 🎯 Configured Hooks

### 1. Stop Event - Task Complete
```json
{
  "type": "command",
  "command": "bash ~/.claude/hooks/notify-bash/notify_hook.sh --priority high --emoji white_check_mark --title \"Claude Code - Task Complete\" --message \"Task is completed\"",
  "timeout": 30
}
```

### 2. Notification Event - Permission Needed
```json
{
  "matcher": "permission_prompt",
  "hooks": [
    {
      "type": "command",
      "command": "bash ~/.claude/hooks/notify-bash/notify_hook.sh --priority high --emoji shark --title \"Claude Code - Permission needed\" --message \"Permission is needed to proceed with next step\"",
      "timeout": 30
    }
  ]
}
```

### 3. PreToolUse Event - Plan Ready
```json
{
  "matcher": "ExitPlanMode",
  "hooks": [
    {
      "type": "command",
      "command": "bash ~/.claude/hooks/notify-bash/notify_hook.sh --priority high --emoji clipboard --title \"Claude Code - Plan Ready\" --message \"Plan is ready for review\""
    }
  ]
}
```

### 4. PreToolUse Event - Input Needed
```json
{
  "matcher": "AskUserQuestion",
  "hooks": [
    {
      "type": "command",
      "command": "bash ~/.claude/hooks/notify-bash/notify_hook.sh --priority high --emoji question --title \"Claude Code - Input Needed\" --message \"Claude Code asks you question and needs your input\""
    }
  ]
}
```

---

## 📖 Usage

### Command Line

```bash
bash ~/.claude/hooks/notify-bash/notify_hook.sh \
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

### Run All Tests

```bash
bash ~/.claude/hooks/notify-bash/test_hooks.sh
```

**Expected output:**
```
🧪 Testing Claude Code ntfy Hooks (Bash version)

📍 Using ntfy server: https://ntfy.tanyongsheng.site
📍 Using topic: openclaw

1️⃣ Testing 'Task Complete' hook...
[ntfy] Notification sent successfully (200)
✅ Test 1 passed

2️⃣ Testing 'Permission Needed' hook...
[ntfy] Notification sent successfully (200)
✅ Test 2 passed

3️⃣ Testing 'Plan Ready' hook...
[ntfy] Notification sent successfully (200)
✅ Test 3 passed

4️⃣ Testing 'Input Needed' hook...
[ntfy] Notification sent successfully (200)
✅ Test 4 passed

🎉 All tests complete!
```

### Test Individual Notification

```bash
bash ~/.claude/hooks/notify-bash/notify_hook.sh \
  --title "Test" \
  --message "This is a test" \
  --priority high \
  --emoji tada
```

---

## 🔍 Script Implementation Details

### How It Works

1. **Parse arguments** using bash `case` statement
2. **Validate** required parameters (title, message)
3. **Build curl headers** array with all options
4. **Send HTTP POST** to ntfy.sh using curl
5. **Check response** HTTP status code
6. **Exit** with 0 (success) or 1 (failure)

### Key Features

**Robust argument parsing:**
```bash
while [[ $# -gt 0 ]]; do
  case $1 in
    --title) TITLE="$2"; shift 2 ;;
    --message) MESSAGE="$2"; shift 2 ;;
    --priority) PRIORITY="$2"; shift 2 ;;
    ...
  esac
done
```

**Header building:**
```bash
HEADERS=()
HEADERS+=("-H" "Title: $TITLE")
HEADERS+=("-H" "Priority: $PRIORITY")

if [ -n "$EMOJI" ]; then
  HEADERS+=("-H" "Tags: $EMOJI")
fi
```

**Curl request:**
```bash
curl -s -w "\n%{http_code}" \
  --max-time "$TIMEOUT" \
  "${HEADERS[@]}" \
  -d "$MESSAGE" \
  "$NTFY_URL/$NTFY_TOPIC"
```

**Response validation:**
```bash
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "[ntfy] Notification sent successfully ($HTTP_CODE)" >&2
  exit 0
else
  echo "[ntfy] Error: HTTP $HTTP_CODE" >&2
  exit 1
fi
```

---

## 📋 Complete Settings File

**Location:** `~/.config/claude/settings.json`

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/notify-bash/notify_hook.sh --priority high --emoji white_check_mark --title \"Claude Code - Task Complete\" --message \"Task is completed\"",
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
            "command": "bash ~/.claude/hooks/notify-bash/notify_hook.sh --priority high --emoji shark --title \"Claude Code - Permission needed\" --message \"Permission is needed to proceed with next step\"",
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
            "command": "bash ~/.claude/hooks/notify-bash/notify_hook.sh --priority high --emoji clipboard --title \"Claude Code - Plan Ready\" --message \"Plan is ready for review\""
          }
        ]
      },
      {
        "matcher": "AskUserQuestion",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/notify-bash/notify_hook.sh --priority high --emoji question --title \"Claude Code - Input Needed\" --message \"Claude Code asks you question and needs your input\""
          }
        ]
      }
    ]
  },
  "enabledPlugins": {
    "everything-claude-code@everything-claude-code": true
  }
}
```

---

## 🎨 Examples

### Basic Notification

```bash
bash ~/.claude/hooks/notify-bash/notify_hook.sh \
  --title "Hello" \
  --message "World"
```

### With Emoji and Priority

```bash
bash ~/.claude/hooks/notify-bash/notify_hook.sh \
  --title "Build Complete" \
  --message "Your build finished successfully" \
  --priority high \
  --emoji tada
```

### With Click Action

```bash
bash ~/.claude/hooks/notify-bash/notify_hook.sh \
  --title "Pull Request" \
  --message "New PR #123 opened" \
  --emoji bell \
  --click "https://github.com/user/repo/pull/123"
```

### With Tags

```bash
bash ~/.claude/hooks/notify-bash/notify_hook.sh \
  --title "Deployment" \
  --message "Production deployed" \
  --tags "deploy,production" \
  --emoji rocket
```

### With Attachment

```bash
bash ~/.claude/hooks/notify-bash/notify_hook.sh \
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
bash ~/.claude/hooks/notify-bash/notify_hook.sh \
  --title "Test" \
  --message "Test"
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

### Debug Mode

**Run with verbose output:**
```bash
bash -x ~/.claude/hooks/notify-bash/notify_hook.sh \
  --title "Test" \
  --message "Test" 2>&1
```

---

## ✅ Advantages vs JavaScript Version

| Feature | Bash ✅ | JavaScript ❌ |
|---------|---------|---------------|
| Dependencies | curl only | Node.js required |
| Startup time | Instant | ~100ms Node.js startup |
| Size | 2.9KB | 4KB |
| Debugging | `bash -x` | Need Node.js debugger |
| Portability | Works everywhere | Needs Node.js installed |
| Simplicity | Pure bash | Async/promises complexity |

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
- Hook script: `~/.claude/hooks/notify-bash/notify_hook.sh`
- Settings: `~/.config/claude/settings.json`
- Test script: `~/.claude/hooks/notify-bash/test_hooks.sh`

---

**Created:** 2026-02-01  
**Version:** Bash (pure shell)  
**Status:** ✅ Production ready  
**Test Status:** ✅ All 4 hooks passing
