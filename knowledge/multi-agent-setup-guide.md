# Multi-Agent Team Setup Guide (from @sitinme X post)

**Source:** https://x.com/sitinme/status/2023749298190774346
**Date:** 2026-02-17
**Author:** @sitinme (sitin)

---

## Summary

A Chinese developer shares how they set up 8 AI employees using OpenClaw, each with a specific role. Total cost: ~$100/month.

---

## The 8 AI Employees

| Role | Name | Function |
|------|------|----------|
| Personal Assistant | 小O | 私人管家 |
| Overseas Research | 小海 | 出海研究 |
| Content | 小C | 内容运营 |
| Community | 小龙 | 创意探索+社区 |
| Team Management | 小团 | 团队管理 |
| iOS Dev | 小果 | iOS 开发 |
| Legal | 小法 | 法律顾问 |
| Tech Intel | 小黑 | 黑科技情报 |

---

## Key Learnings

### 1. Process Isolation
- 8 separate processes, fully isolated
- One crash doesn't affect others
- Total RAM: 3GB (on 64GB machine = 5% usage)

### 2. Multi-Model Strategy
- Claude (Opus) for deep thinking
- Codex for coding (free)
- Use aigocode.com as proxy for Chinese users

### 3. Model Failover
- Watchdog checks every 5 minutes
- Auto-switch to backup if main fails

### 4. Workflow Automation
- 03:00 Backup
- 10:00 Group push
- 22:00 Daily report
- Every 5 min: health check

### 5. Content Pipeline
- Search trends → Generate tweets/articles → Write to Notion → Human review → Distribute
- Reduced from 2 hours to 15 minutes

### 6. Memory System
- Two layers: Daily logs + Long-term memory
- Survives restarts

### 7. Cost Breakdown
- OpenClaw: $0
- Claude Max: $100/month
- Codex: $0
- Brave Search: $0
- Cloudflare R2: $0
- **Total: ~$100/month**

---

## Relevance to Our Setup

This validates our approach:
- ✅ We already have main + CSO + Research agents
- ✅ Cron jobs for scheduled tasks (like daily crypto news)
- ✅ Notion integration for output storage
- Potential improvements:
  - Add more specialized agents
  - Implement watchdog/failover for critical tasks
  - Build content pipeline workflow

---

*Saved by Nars*
