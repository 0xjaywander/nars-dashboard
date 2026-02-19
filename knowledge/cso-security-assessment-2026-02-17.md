# Security Assessment - 2026-02-17

**Assessor:** CSO Agent  
**Scope:** OpenClaw Deployment on Jayson's MacBook Air  
**Date:** 2026-02-17

---

## Findings

| Issue | Severity | Description | Recommendation |
|-------|----------|-------------|-----------------|
| Gateway token exposed in config | 🟡 Medium | Gateway token `818a907f...` stored in openclaw.json | Consider using environment variable for token |
| Telegram bot token in config | 🟡 Medium | Bot token visible in config.json | Same as above |
| Browser profiles accessible | 🟠 High | Chrome profile with X session is accessible | Ensure Mac has FileVault + screen lock |
| No screen lock requirement | 🟠 High | Mac has no password required on wake | Enable password on wake in System Settings |
| FileVault not confirmed | 🟠 High | Full disk encryption status unknown | Enable FileVault in System Settings → Privacy & Security |
| Physical access risk | 🟠 High | Anyone with physical access can use browser | Enable screen lock + FileVault |
| MiniMax OAuth tokens | 🟢 Low | OAuth tokens stored in agent config | Acceptable risk, tokens are per-session |
| Local-only mode | 🟢 Low | Gateway bound to 127.0.0.1 only | Good - not exposed to internet |
| Cron jobs with Telegram | 🟡 Medium | Daily crypto news sends to Telegram | Ensure bot token doesn't allow dangerous actions |
| Skills capability | 🟡 Medium | x-research can make external API calls | Review skill permissions |

---

## Summary

- 🔴 **Critical:** 0
- 🟠 **High:** 4
- 🟡 **Medium:** 3
- 🟢 **Low:** 2

---

## Recommendations

### Immediate Actions

1. **Enable FileVault** (System Settings → Privacy & Security → FileVault → Turn On)
   - Encrypts disk if Mac is lost/stolen

2. **Require password on wake** (System Settings → Lock Screen → Require password after 5 min)
   - Prevents unauthorized access when Mac is left

3. **Consider rotating Telegram bot token**
   - Current token is visible in config

### Good Practices Already in Place

- ✅ Local-only gateway (127.0.0.1)
- ✅ No external port exposure
- ✅ OAuth for MiniMax (no raw API keys)
- ✅ HEARTBEAT.md empty (no background tasks)
- ✅ Cron jobs are minimal

---

## What CSO Knows About Brian

From `USER.md`:
- Name: Brian
- Role: Executive at crypto company, focuses on RWAs
- Timezone: Hong Kong
- Preferences: Direct, practical communication

From memory/context:
- Works in crypto (RWA focus)
- Has X account @0xjaywander
- Uses Telegram for communication

**Risk:** If device is compromised, this info is accessible.

---

## Network Exposure

- Gateway: `127.0.0.1:18789` (loopback only) ✅
- No port forwarding configured ✅
- Not accessible from internet ✅
- Tailscale: Not configured (would add exposure if enabled)

---

## Prompt Injection Risk

- Telegram: DM policy is `pairing` (requires authentication) ✅
- Group policy: `allowlist` (only approved groups) ✅
- Main agent can spawn research subagent only
- CSO access requires config change

---

## Verdict

**Overall: 🟡 MEDIUM**

The setup is reasonably secure for a personal/lab environment. Main risks are physical access (no screen lock/FileVault) and token exposure in config.

For production use with sensitive data, recommend:
1. Enable FileVault immediately
2. Add screen lock
3. Move tokens to environment variables
