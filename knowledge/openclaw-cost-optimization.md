# How to Reduce OpenClaw Model Costs by up to 90%

**Source:** Kevin Simback (X article)  
**URL:** https://x.com/KSimback/status/2023362295166873743

---

## The Problem

OpenClaw by default burns money because:
- Everything goes to your primary model (e.g., Opus 4.6)
- Heartbeats, sub-agent tasks, simple lookups all use expensive models
- Context accumulation: sessions grow to 200K+ tokens
- System prompt re-injection: SOUL.md, AGENTS.md, MEMORY.md (3,000–14,000 tokens) sent every call
- Heartbeat overhead: 48 full-context calls/day at 30-min intervals
- Cron jobs: 96 triggers/day at 15-min intervals = $10-20/day on Opus alone

---

## Model Pricing Comparison

**Anthropic:**
- Opus 4.6: $5/$25 per M tokens (input/output)
- Sonnet 3.5: $3/$15 per M
- Haiku: $0.25/$1.25 per M

**OpenAI:**
- GPT-4.5: $75/$150 per M
- GPT-4o: $2.50/$10 per M
- GPT-4o-mini: $0.15/$0.60 per M

**Best value:**
- Gemini 2.5 Flash: $0.15/$0.60 per M
- Kimi K2.5 / MiniMax M2.5: Very cheap, competitive quality

---

## Solution 1: Intelligent Routing

Match model capability to task complexity:

| Task Type | Recommended Model |
|-----------|------------------|
| Routine (email, schedule, reminders) | Haiku / Gemini Flash |
| Coding | GPT-4o-mini / CodeX |
| Complex (planning, strategy) | Opus / Sonnet |
| Simple queries | DeepSeek / Flash |

**Simple routing skill example:**
```python
rules = {
  r'code|debug|script': 'openai/gpt-4o-mini',
  r'email|schedule|remind': 'anthropic/haiku',
  r'plan|strategy|brainstorm': 'anthropic/opus',
  'default': 'google/gemini-flash-1.5'
}
```

---

## Solution 2: OpenRouter

Use OpenRouter's built-in router (300+ models, 1 API):
- Free account with credits
- Automatic prompt analysis for routing
- Hands-off setup

---

## Solution 3: ClawRouter (Recommended)

OpenClaw-native smart routing tool:
- Analyzes queries locally using lightweight classifier
- Routes based on complexity tiers:
  - Simple → cheap models ($0.27-0.60/M)
  - Medium → mid-tier
  - Complex → Sonnet-level
  - Heavy reasoning → Opus/Kimi
- Profiles: Auto, Eco (max savings), Premium, Free
- GitHub: 2.4k stars in 11 days

---

## Solution 4: Prompt Caching

Underused but powerful:
- Cache SOUL.md, AGENTS.md, MEMORY.md across calls
- Only pay full price once, then 90% cheaper
- Anthropic: 5-min standard, 55-min with extended retention
- Set heartbeat to 55 min = warm cache = 90% off
- Combined with Haiku routing: heartbeats cost ~$0.50/month instead of $100+

---

## Solution 5: Local Models (Ollama)

Zero marginal cost after hardware:
- Best for: consistent load, privacy, high-volume simple tasks
- Not for: frontier capabilities, bursty workloads
- Qwen 3 32B: runs 40+ tokens/sec on single 4090, competitive with Sonnet 3.5

---

## Bottom Line

1. Route intelligently — don't use Opus for calendar lookups
2. Cache aggressively — use prompt caching
3. Use local models for simple tasks
4. Consider ClawRouter for OpenClaw-native solution

**Potential savings: 80-90% while improving quality on what matters.**
