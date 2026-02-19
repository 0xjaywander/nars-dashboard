# OpenClaw Home AI Assistant Guide - Ryan Gentry

**Source:** @RyanTheGentry (Ryan Gentry)  
**URL:** https://x.com/ryanthegentry/status/2023865679875604875  
**Date:** February 18, 2026

## Summary

A comprehensive guide on building a reliable, cost-effective home AI assistant using OpenClaw on a Mac Mini.

## Key Points

### Cost Management
- Running an always-on AI assistant can hit $30-50/day if unchecked
- Default to expensive models + heartbeat checks + monitoring = burning API credits
- Use Claude Sonnet via OpenRouter ($3/$15 per million tokens)
- For stable systems, consider MiniMax M2.5 ($0.30/$1.20 per million) after 2 weeks
- Expected cost: $10-20/month for morning brief + ~20 messages/day

### Reliability Issues
- Assistant seems to run but messages don't get through
- Telegram polling can silently stop
- macOS puts background processes to sleep
- Keep-alive scripts may not actually keep anything alive

### Solution Stack
- **OpenClaw** - AI agent runtime, handles model, tools, cron jobs
- **BlueBubbles** - macOS app that exposes iMessage via webhooks
- **icalPal** - Calendar access using EventKit (sees all synced Google calendars)
- **OpenRouter** - API provider

### Why iMessage Over Telegram
- Telegram bots use long-polling that can silently stop
- iMessage via BlueBubbles writes to local database - no external polling
- When it breaks, it breaks obviously

### Setup Requirements
1. Mac Mini (M-series, 16GB RAM recommended)
2. OpenClaw (`npm install -g openclaw@latest`)
3. BlueBubbles app
4. icalPal (`sudo gem install icalPal`)
5. OpenRouter API key
6. Family iMessage group chat

### Critical Setup Steps
1. **Node.js:** Must be 22+ (`brew install node@22`)
2. **Full Disk Access:** Required for cron jobs - add node binary to Privacy & Security
3. **BlueBubbles Webhook:** Must configure manually or messages won't forward
4. **Keep-alive:** Two-part - pokes Messages.app AND pings BlueBubbles every 2 minutes

### Reliability Fixes
- Messages.app goes idle after ~15 minutes
- Use `tell application "Messages" to count of chats` (not `activate`)
- BlueBubbles also goes idle - add curl ping to keep-alive
- Calendar bug: parse `sctime` field, never rely on text labels

### Testing Before Production
1. Send message from phone - should respond in 30 seconds
2. Wait 15+ minutes with no interaction, send another - should still respond
3. Run morning brief manually and inspect output
4. Trigger cron job manually and verify arrival

### Common OpenClaw CLI Issues
- `openclaw auth set` doesn't work - keys go in config file
- `openclaw logs --tail` doesn't exist - use `--follow` or `--limit N`

## Quotes

> "The goal isn't an impressive demo — it's a system that's still running and still delivering value in 6 months."

> "Start with one feature (the morning calendar brief), get it bulletproof, then expand."

> "Reliability and cost discipline are the foundation; features come later."

> "Don't start with the cheap model. Get everything working with something proven first. Two unknowns at once (new infrastructure + untested model) is how projects die in week one."
