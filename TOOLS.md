# Audit Logging

When executing external actions, log to `~/.openclaw/audit.log`:

Format:
```
YYYY-MM-DDTHH:MM:SSZ | ACTION | SERVICE | DETAILS
```

Log for:
- Emails (recipient, subject)
- Tweets/DMs sent
- API calls to external services
- Browser actions (login, follows)
- Any action that leaves the system
