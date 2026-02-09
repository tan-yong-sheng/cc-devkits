#!/bin/bash
# Test all Claude Code ntfy hooks (Bash version)

echo "🧪 Testing Claude Code ntfy Hooks (Bash version)"
echo ""

# Set environment (use existing ntfy config)
export NTFY_BASE_URL="${NTFY_BASE_URL:-https://ntfy.sh}"
export NTFY_TOPIC="${NTFY_TOPIC:-openclaw}"

HOOK_SCRIPT="$HOME/.claude/hooks/notify-bash/notify_hook.sh"

if [ ! -f "$HOOK_SCRIPT" ]; then
  echo "❌ Error: Hook script not found at $HOOK_SCRIPT"
  exit 1
fi

echo "📍 Using ntfy server: $NTFY_BASE_URL"
echo "📍 Using topic: $NTFY_TOPIC"
echo ""

# Test 1: Task Complete
echo "1️⃣ Testing 'Task Complete' hook..."
bash "$HOOK_SCRIPT" \
  --priority high \
  --emoji white_check_mark \
  --title "Claude Code - Task Complete" \
  --message "Task is completed" 2>&1 | grep -E "\[ntfy\]|Error"

if [ $? -eq 0 ]; then
  echo "✅ Test 1 passed"
else
  echo "❌ Test 1 failed"
fi
echo ""
sleep 2

# Test 2: Permission Needed
echo "2️⃣ Testing 'Permission Needed' hook..."
bash "$HOOK_SCRIPT" \
  --priority high \
  --emoji shark \
  --title "Claude Code - Permission needed" \
  --message "Permission is needed to proceed with next step" 2>&1 | grep -E "\[ntfy\]|Error"

if [ $? -eq 0 ]; then
  echo "✅ Test 2 passed"
else
  echo "❌ Test 2 failed"
fi
echo ""
sleep 2

# Test 3: Plan Ready
echo "3️⃣ Testing 'Plan Ready' hook..."
bash "$HOOK_SCRIPT" \
  --priority high \
  --emoji clipboard \
  --title "Claude Code - Plan Ready" \
  --message "Plan is ready for review" 2>&1 | grep -E "\[ntfy\]|Error"

if [ $? -eq 0 ]; then
  echo "✅ Test 3 passed"
else
  echo "❌ Test 3 failed"
fi
echo ""
sleep 2

# Test 4: Input Needed
echo "4️⃣ Testing 'Input Needed' hook..."
bash "$HOOK_SCRIPT" \
  --priority high \
  --emoji question \
  --title "Claude Code - Input Needed" \
  --message "Claude Code asks you question and needs your input" 2>&1 | grep -E "\[ntfy\]|Error"

if [ $? -eq 0 ]; then
  echo "✅ Test 4 passed"
else
  echo "❌ Test 4 failed"
fi
echo ""

echo "🎉 All tests complete!"
echo ""
echo "📱 Check your ntfy app for 4 notifications:"
echo "  ✅ Task Complete"
echo "  🦈 Permission needed"
echo "  📋 Plan Ready"
echo "  ❓ Input Needed"
