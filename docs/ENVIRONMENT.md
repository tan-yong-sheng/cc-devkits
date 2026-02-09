# Environment Variables

Configure these environment variables in your `~/.bashrc`, `~/.zshrc`, or `.env` file.

```bash
# Serper API (get from https://serper.dev)
export SERPER_API_KEY="your-api-key"

# OR use multiple keys for round-robin rotation
export SERPER_API_KEYS="key1;key2;key3"

# ntfy Configuration
export NTFY_BASE_URL="https://ntfy.sh"
export NTFY_TOPIC="your-topic"
export NTFY_API_KEY="your-api-key"  # optional

# AI Vision (if using Google provider)
export GEMINI_API_KEY="your-gemini-api-key"
```
