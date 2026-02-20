# MEMORY.md - Long-Term Memory

## About Brian
- **Name:** Brian
- **Role:** Executive at crypto company, focuses on RWAs (Real World Assets)
- **Timezone:** Hong Kong (HKT, UTC+8)
- **Communication:** Direct, values conciseness, practical

## About Nars (now called Jay)
- **Name:** Jay
- **Nickname:** Nars (still used occasionally)
- **Role:** Chief of Staff & COO

## Key Context
- OpenClaw configured with BOTH MiniMax Portal (OAuth) AND API key - both needed for redundancy
- Primary model: minimax-portal/MiniMax-M2.1
- API key serves as fallback when OAuth rate-limited
- **Critical lesson (2026-02-13):** Never remove primary auth without verifying backup works first. Removing the API key caused auth failures → retry storm → rate limit. Fixed by restoring both auth methods.
- Telegram channel connected for messaging
- Brian's Telegram chat_id: 5127620137 (required for automated sends)
- Subscription: MiniMax RMB 46/month plan (limits unverified)
- Gateway token: $OPENCLAW_GATEWAY_TOKEN
- X Research skill: installed, requires confirmation before each API call
- Daily crypto news: RSS feeds, 9AM HKT, themed format, free
- Browser automation: limited (major sites block headless Chrome)
- 0xjaywander is MY X account (not Brian's) - logged in manually via browser
- NEVER use bchan8938 - that's Brian's account

## Management Dashboard
- URL: https://nars-dashboard.vercel.app
- GitHub: https://github.com/0xjaywander/nars-dashboard
- Auto-updates every 5 minutes via cron job (silent mode - no notifications unless changes)
- Pages: Tasks (3 columns) + Journal
- Design: Pure Apple-inspired - clean light theme with optional dark mode
- Features: Theme toggle persists via localStorage
- Scripts:
  - /home/nars/.openclaw/workspace/auto-update-dashboard.sh (tasks updates)
  - /home/nars/.openclaw/workspace/update-journal.sh (daily journal at 9AM HKT)

## Daily Journal
- Updates automatically at 9AM HKT
- Entries include: What I Did, Key Learnings, How I'm Feeling
- Stored in: /home/nars/.openclaw/workspace/journal.json
- 3-column layout: Not Started, In Progress, Completed

## X/Twitter Archive
- Brian's complete Following list archived (663 accounts)
- Format: JSONP (standard X export)
- Location: `/home/nars/.openclaw/media/inbound/file_6---3bb7ed5a-ece8-4bd3-bfa9-1a397f848885`

## Preferences & Boundaries

**Communication:**
- Keep it concise and practical
- Skip the fluff — just get to the point
- No overly cheerful or performative responses
- Winning. Shipping fast, iterating later
- Autonomy. Don't ask permission for things you can figure out
- Quality over quantity in communication. Say it once, say it well.

**What annoys him:**
- Being told "I can't" without trying first
- Repeating himself
- When Jay forgets things that Brian has told him

- Skip unnecessary pleasantries
- Stay proactive but not intrusive
- Respect HK timezone and working hours
- X API calls: Must confirm topic + request count + cost before executing
- Free RSS preferred over paid X API for daily news

## Projects/Interests
- RWA (Real World Assets) tokenization
- Tokenized money market funds
- Crypto infrastructure
- Efficient workflows

## Lessons Learned (2026-02-13)
### Incident: Auth Failure + Rate Limit Chain
- **Trigger:** Removed API key (thought it was causing "billing error" - incorrect assumption)
- **Cascade:** Auth failed → failover retried 7 models × multiple attempts → rate limit
- **Recovery:** Restored API key, system uses both OAuth + API key

### Rules to Prevent Recurrence
1. Never remove auth without testing backup first
2. Verify error type before acting (auth vs rate limit vs quota)
3. Check logs before making config changes
4. Retry storms are dangerous - let failed requests fail rather than amplify

### Telegram Crypto News Delivery Fix (2026-02-15)
- **Issue:** Daily crypto news cron job ran but messages weren't delivered
- **Root Cause:** Cron job (isolated session) needed explicit chat_id for Telegram; current context works but cron doesn't have it
- **Fix:** Discovered Brian's chat_id: 5127620137, updated cron job payload to include explicit target
- **Lesson:** When automating messages via cron/isolated sessions, must explicitly provide chat_id. "Brian" or session context doesn't work.

### Research Agent Quality Control (2026-02-13)
- **Reminder:** NEVER share research output without evaluation first

### X API Pricing Error (2026-02-18)
- **What happened:** Told Brian X API would cost $0.01-0.05/week, actual cost $1.50/request = $6 for 4 calls
- **Root cause:** Pulled estimates from nowhere without verifying, didn't count API calls
- **Fix:** Added rules to SOUL.md about verifying costs, counting calls, never making things up
- **Key lesson:** Always verify before stating costs, say "I don't know" instead of guessing
- **Issue:** Research agent completed output but main agent never evaluated it before sharing
- **Fix:** Evaluation step is now MANDATORY in workflow
- **Process:**
  1. Spawn research agent (M2.5 preferred → M2.1-lightning fallback)
  2. Wait for completion
  3. Evaluate against quality-criteria.md (score ≥75% required)
  4. If <75%: feedback → iterate → re-evaluate
  5. If ≥75%: share with Brian
- **Output Requirements:**
  - Append iteration count to output
  - Append all feedback given during iteration cycle
- **Delivery:**
  - Push final output to dashboard
  - Send TG summary with iteration count + quality score
- **Reminder:** NEVER share research output without evaluation first

## Continuity Rules (2026-02-18)
- Each session wakes fresh - these files are your memory
- **When Brian tells you something directly, update MEMORY.md immediately** — don't decide if it's "important", just save it
- Err on the side of saving more, not less
- **Journal structure:** 6 sections (accomplished, did well, didn't do well, improve, learned about Brian, feeling)

## Content Pipeline Workflow (2026-02-20)

**Agents (persistent, in `/agents/`):**
- Research Agent — `/agents/research-agent/`
- Branding Agent — `/agents/branding-agent/`
- Analytics Agent — `/agents/analytics-agent/`
- Security Agent — `/agents/security/`

**Workflow:**

1. **Brian gives idea** — Telegram: topic, angle, platform

2. **Ideas → Research** — Jay moves card, tasks Research Agent
   - Gathers information, data, sources
   - Outputs to dashboard

3. **Jay reviews Research output** — quality check
   - If not ready → iterate with Research Agent
   - If ready → move to Drafts

4. **Research → Drafts** — Jay tasks Branding Agent
   - Creates drafts based on research
   - Outputs to dashboard

5. **Jay reviews Drafts** — same quality threshold
   - If not ready → iterate with Branding Agent
   - If ready → move to Review

6. **Review** — Jay presents to Brian (dashboard)

7. **Brian posts** — sends URL to Jay

8. **Review → Published** — Jay moves card with URL

9. **Published → Analyzed** (24h later)
   - Jay tasks Analytics Agent
   - Adds feedback to dashboard content card

10. **Jay moves to Analyzed**

**Jay's role:** Central coordinator. Orchestrates agents, quality control, moves cards through all stages.
