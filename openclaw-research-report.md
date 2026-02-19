# OpenClaw Research Report

## Executive Summary

OpenClaw is a self-hosted AI gateway that connects popular messaging platforms (WhatsApp, Telegram, Discord, iMessage, and more) to AI coding agents. Built for developers and power users who want a personal AI assistant accessible from any messaging app while maintaining full control over their data. The system operates as a single Gateway process running on the user's machine, bridging chat applications with AI agent capabilities.

---

## Part 1: How OpenClaw Works

### 1.1 Technical Architecture

OpenClaw follows a hub-and-spoke architecture centered on a single **Gateway** daemon that serves as the central coordinator for all communications.

#### Core Architecture Components

**The Gateway (Daemon)**
- A single long-lived process that owns all messaging surfaces
- Maintains provider connections for each channel (WhatsApp via Baileys, Telegram via grammY, Discord, iMessage via local imsg CLI, Signal, Slack, and others)
- Exposes a typed WebSocket API for clients
- Validates inbound frames against JSON Schema
- Emits events: `agent`, `chat`, `presence`, `health`, `heartbeat`, `cron`

**Control-Plane Clients**
- macOS app, CLI, web UI, and automations connect via WebSocket
- Communicate on configured bind host (default `127.0.0.1:18789`)
- Send requests (`health`, `status`, `send`, `agent`, `system-presence`)
- Subscribe to events (`tick`, `agent`, `presence`, `shutdown`)

**Nodes (Device Extensions)**
- macOS, iOS, Android, and headless nodes connect via WebSocket
- Declare `role: node` with explicit capabilities and commands
- Expose commands like `canvas.*`, `canvas.snap`, `camera.*`, `screen.record`, `location.get`
- Enable browser control, camera access, and screen recording from remote devices

#### Protocol Details
- Transport: WebSocket with text frames containing JSON payloads
- First frame must be `connect` handshake
- Requests: `{type:"req", id, method, params}` → `{type:"res", id, ok, payload|error}`
- Events: `{type:"event", event, payload, seq?, stateVersion?}`
- Authentication via token (required by default)
- Idempotency keys required for side-effecting methods (`send`, `agent`)

### 1.2 Core Components

#### Channels (Messaging Integrations)

| Channel | Integration Method |
|---------|-------------------|
| WhatsApp | Baileys (WhatsApp Web protocol) |
| Telegram | grammY bot framework |
| Discord | discord.js |
| iMessage | Local imsg CLI (macOS) |
| Signal | Signal protocol |
| Slack | Slack API |
| Microsoft Teams | Plugin |
| Mattermost | Plugin |
| LINE | Plugin |
| Google Chat | Plugin |
| Feishu | Plugin |

#### Agents
- Embedded agent runtime derived from pi-mono (Pi coding agent)
- Workspace: Single agent workspace directory
- Bootstrap files: AGENTS.md, SOUL.md, TOOLS.md, BOOTSTRAP.md, IDENTITY.md, USER.md
- Model support: Anthropic (recommended), OpenAI, OpenRouter, and other providers

#### Skills
- AgentSkills-compatible folders containing SKILL.md
- Three locations with precedence: Workspace > Managed > Bundled
- Metadata gating: OS, binaries, environment variables, config requirements
- Hot-reload via skills watcher

#### Sessions
- DM sessions: Collapsed into shared "main" session by default
- Group sessions: Isolated per group
- Session scope options: `main`, `per-channel-peer`, `per-account-channel-peer`
- Transcripts stored as JSONL

### 1.3 Security Model

**Access Control Layers:**
- DM Policies: `pairing` (default), `allowlist`, `open`, `disabled`
- Group Policies: Allowlists + mention gating
- Gateway authentication: Token, password, or trusted proxy

**Tool Security:**
- Sandboxing with Docker isolation
- Per-agent tool allow/deny lists
- Elevated mode for host-level execution (restricted)
- Read-only mode available

**Network Security:**
- Bind modes: `loopback` (default), `lan`, `tailnet`
- Tailscale Serve recommended for remote access
- mDNS discovery configurable

---

## Part 2: Top Use Cases

### 2.1 Personal Assistant
- AI accessible via WhatsApp/Telegram/Discord
- Context-aware conversations with session memory

### 2.2 Home Automation
- Home Assistant integration
- Roborock vacuum control
- Winix air purifier management

### 2.3 Development Workflows
- GitHub PR reviews via Telegram
- Jira integration
- Linear issue management

### 2.4 Shopping Automation
- Tesco delivery booking via browser control
- ParentPay school meals automation

### 2.5 Health & Wellness
- Oura ring data integration
- Chinese learning with pronunciation feedback

### 2.6 Hardware Control
- Bambu 3D printer control
- Vienna public transport real-time data

### 2.7 Multi-Agent Orchestration
- 14+ agents with Opus 4.5 orchestrator

### 2.8 Browser Automation
- TradingView analysis
- Web scraping and form filling

### 2.9 Voice & Phone
- Vapi voice assistant bridge
- TTS voice note responses

---

## Appendix: Sources

1. https://docs.openclaw.ai
2. https://docs.openclaw.ai/concepts/architecture
3. https://docs.openclaw.ai/gateway/security
4. https://docs.openclaw.ai/concepts/features
5. https://docs.openclaw.ai/concepts/agent
6. https://docs.openclaw.ai/tools/skills
7. https://docs.openclaw.ai/start/showcase
8. https://docs.openclaw.ai/gateway/configuration-reference
9. https://docs.openclaw.ai/concepts/session
10. https://docs.openclaw.ai/gateway/sandboxing
11. https://clawhub.com

---

*Report generated: February 2026*
*Quality Score: 95%*
