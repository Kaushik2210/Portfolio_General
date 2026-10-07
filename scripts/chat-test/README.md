# Chatbot test harness

Tests the AI assistant end to end without a real API key, against a mock of the Anthropic
streaming API that can also simulate auth failures, rate limits, server errors and refusals.

```bash
# 1. the mock model API (writes the last request it saw to last-call.json)
node scripts/chat-test/mock-anthropic.mjs last-call.json &

# 2. the site, pointed at the mock
npm run build
ANTHROPIC_API_KEY=test ANTHROPIC_BASE_URL=http://localhost:4011 npx next start -p 3481 &

# 3. the checks (27): streaming, grounding, TODO_VERIFY scrubbing, caching, fit-check
#    fencing, injection, validation, upstream errors, refusal, rate limiting
node scripts/chat-test/api.mjs http://localhost:3481
```

Without `ANTHROPIC_API_KEY` the site runs in its offline mode (canned answers built from the
data files); `GET /api/chat` reports `{"available": false}`.
