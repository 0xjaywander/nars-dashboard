# Cathrynlavery - OpenClaw Tip: Use LaunchAgents Instead of Cron

**Source:** https://x.com/cathrynlavery/status/2024247142571741656
**Date:** 2026-02-18
**Author:** @cathrynlavery

## Summary

OpenClaw tip: Use macOS LaunchAgents instead of cron jobs for better reliability on Mac.

## Key Points

1. **Cron vs LaunchAgent:** Cron is third-party; LaunchAgent is built into macOS
2. **More reliable:** LaunchAgents run natively without external schedulers

## Types of LaunchAgent Triggers

- **WatchPaths** — fires when a file or folder changes
- **StartInterval** — runs on a fixed time interval
- **StartCalendarInterval** — runs at a specific time of day
- **RunAtLoad** — runs once at login

## Use Case Example

Want work auto-synced to GitHub every day?
- A LaunchAgent watches your folder and pushes changes automatically
- When you save or every hour
- No cron, no OpenClaw needed
- Just your Mac handling it natively

## Prompt

> List all my current cron jobs and LaunchAgents, then tell me which cron jobs could be replaced by a native macOS LaunchAgent instead. For each one that can be migrated, explain what type of LaunchAgent trigger to use.

## Engagement

- Likes: 417
- Retweets: 20
- Bookmarks: 883
- Views: 28,046
