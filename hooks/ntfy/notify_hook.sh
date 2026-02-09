#!/bin/bash
# Claude Code ntfy Hook - Enhanced with stdin support
# Sends notifications via ntfy.sh when Claude Code events occur
#
# This hook reads Claude Code's stdin (JSON with session info) to extract:
#   - cwd: The current working directory (project path)
#   - session_id: The session identifier
#   - model: The Claude model being used
#
# Usage:
#   notify_hook.sh --title "Title" --message "Message" [options]
#
# Options:
#   --title <string>      Notification title (required)
#   --message <string>    Notification message (required)
#   --priority <string>   Priority: min, low, default, high, max, urgent (default: default)
#   --emoji <string>      Emoji name (e.g., white_check_mark, shark, clipboard)
#   --tags <string>       Comma-separated tags (e.g., "warning,skull")
#   --click <url>         URL to open when notification is clicked
#   --attach <url>        Attachment URL
#   --timeout <number>    Request timeout in seconds (default: 10)
#   --include-cwd        Include project path (cwd) in message (default: auto-detect)
#   --no-cwd             Don't include project path

set -e

# Configuration from environment
NTFY_URL="${NTFY_BASE_URL:-${NTFY_URL:-https://ntfy.sh}}"
NTFY_TOPIC="${NTFY_TOPIC:-openclaw}"
NTFY_TOKEN="${NTFY_API_KEY:-${NTFY_TOKEN:-}}"

# Default values
PRIORITY="default"
EMOJI=""
TAGS=""
CLICK=""
ATTACH=""
TIMEOUT=10
TITLE=""
MESSAGE=""
INCLUDE_CWD="auto"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --title)
      TITLE="$2"
      shift 2
      ;;
    --message)
      MESSAGE="$2"
      shift 2
      ;;
    --priority)
      PRIORITY="$2"
      shift 2
      ;;
    --emoji)
      EMOJI="$2"
      shift 2
      ;;
    --tags)
      TAGS="$2"
      shift 2
      ;;
    --click)
      CLICK="$2"
      shift 2
      ;;
    --attach)
      ATTACH="$2"
      shift 2
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    --include-cwd)
      INCLUDE_CWD="yes"
      shift
      ;;
    --no-cwd)
      INCLUDE_CWD="no"
      shift
      ;;
    *)
      echo "Error: Unknown option $1" >&2
      exit 1
      ;;
  esac
done

# Read stdin to get Claude Code hook input (JSON)
STDIN_DATA=""
if [ -t 0 ]; then
  # stdin is a TTY - running interactively, not from Claude Code hook
  STDIN_DATA=""
else
  # stdin is piped - read the JSON from Claude Code
  STDIN_DATA=$(cat)
fi

# Extract project path (cwd) from Claude Code's stdin JSON
PROJECT_PATH=""
SESSION_ID=""
MODEL_NAME=""

if [ -n "$STDIN_DATA" ]; then
  # Try to parse JSON (requires jq or python)
  if command -v jq &> /dev/null; then
    PROJECT_PATH=$(echo "$STDIN_DATA" | jq -r '.cwd // empty' 2>/dev/null || true)
    SESSION_ID=$(echo "$STDIN_DATA" | jq -r '.session_id // empty' 2>/dev/null || true)
    MODEL_NAME=$(echo "$STDIN_DATA" | jq -r '.model // empty' 2>/dev/null || true)
  elif command -v python3 &> /dev/null; then
    PROJECT_PATH=$(python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('cwd',''))" 2>/dev/null || true)
    SESSION_ID=$(python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('session_id',''))" 2>/dev/null || true)
    MODEL_NAME=$(python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('model',''))" 2>/dev/null || true)
  fi
fi

# Determine whether to include cwd based on INCLUDE_CWD setting
SHOULD_INCLUDE_CWD="no"
case "$INCLUDE_CWD" in
  yes) SHOULD_INCLUDE_CWD="yes" ;;
  no)  SHOULD_INCLUDE_CWD="no" ;;
  auto)
    # Auto: include cwd if we got it from stdin and it's not the home directory
    if [ -n "$PROJECT_PATH" ] && [ "$PROJECT_PATH" != "$HOME" ]; then
      SHOULD_INCLUDE_CWD="yes"
    fi
    ;;
esac

# Build enhanced message with project info
ENHANCED_MESSAGE="$MESSAGE"
if [ "$SHOULD_INCLUDE_CWD" = "yes" ]; then
  # Format project path nicely
  PROJECT_NAME=$(basename "$PROJECT_PATH" 2>/dev/null || echo "$PROJECT_PATH")

  # Add project info to message
  if [ -n "$PROJECT_PATH" ]; then
    ENHANCED_MESSAGE="${MESSAGE}

📁 Project: ${PROJECT_NAME}
📂 Path: ${PROJECT_PATH}"

    # Add session ID if available (full)
    if [ -n "$SESSION_ID" ]; then
      ENHANCED_MESSAGE="${ENHANCED_MESSAGE}
🔑 Session: ${SESSION_ID}"
    fi

    # Add model if available
    if [ -n "$MODEL_NAME" ]; then
      ENHANCED_MESSAGE="${ENHANCED_MESSAGE}
🤖 Model: ${MODEL_NAME}"
    fi
  fi
fi

# Validate required parameters
if [ -z "$TITLE" ] || [ -z "$MESSAGE" ]; then
  echo "Error: --title and --message are required" >&2
  exit 1
fi

# Deduplication: prevent sending same message within cooldown period
COOLDOWN_SECONDS=12

check_dedupe() {
    local title="$1"
    local message="$2"
    local state_dir="/tmp/.ntfy_hook_dedupe"
    mkdir -p "$state_dir"

    local key="$(echo "$title:$message" | md5sum | cut -d' ' -f1)"
    local last_file="$state_dir/$key"
    local now=$(date +%s)

    if [ -f "$last_file" ]; then
        local last_time=$(cat "$last_file")
        local elapsed=$((now - last_time))
        if [ $elapsed -lt $COOLDOWN_SECONDS ]; then
            echo "[ntfy] Skipped duplicate notification (${elapsed}s ago, cooldown: ${COOLDOWN_SECONDS}s)" >&2
            exit 0
        fi
    fi

    echo "$now" > "$last_file"
}

# Run deduplication check with actual title and original message (not enhanced)
check_dedupe "$TITLE" "$MESSAGE"

# Build curl headers
HEADERS=()
HEADERS+=("-H" "Title: $TITLE")
HEADERS+=("-H" "Priority: $PRIORITY")

# Add emoji to tags
if [ -n "$EMOJI" ]; then
  if [ -n "$TAGS" ]; then
    HEADERS+=("-H" "Tags: $TAGS,$EMOJI")
  else
    HEADERS+=("-H" "Tags: $EMOJI")
  fi
elif [ -n "$TAGS" ]; then
  HEADERS+=("-H" "Tags: $TAGS")
fi

# Add click action
if [ -n "$CLICK" ]; then
  HEADERS+=("-H" "Click: $CLICK")
fi

# Add attachment
if [ -n "$ATTACH" ]; then
  HEADERS+=("-H" "Attach: $ATTACH")
fi

# Add authentication if token is set
if [ -n "$NTFY_TOKEN" ]; then
  HEADERS+=("-H" "Authorization: Bearer $NTFY_TOKEN")
fi

# Send notification with ENHANCED_MESSAGE (includes project path if available)
RESPONSE=$(curl -s -w "\n%{http_code}" \
  --max-time "$TIMEOUT" \
  "${HEADERS[@]}" \
  -d "$ENHANCED_MESSAGE" \
  "$NTFY_URL/$NTFY_TOPIC" 2>&1)

# Extract HTTP status code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Check response
if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "[ntfy] Notification sent successfully ($HTTP_CODE)" >&2
  exit 0
else
  echo "[ntfy] Error: HTTP $HTTP_CODE: $BODY" >&2
  exit 1
fi
