# Research Agent Infrastructure

## Overview
Two-agent system for high-quality research output:
- **Main Agent** - Task classification, quality control, communication
- **Research Agent** - Deep research, data gathering, iteration

## Quick Start

### 1. Receive Task from Brian
Example: "Map out the RWA ecosystem and identify which market opportunity is the most attractive"

### 2. Classify Task
Is this research-heavy? Yes → Spawn research agent

### 3. Spawn Research Agent
```javascript
await sessions_spawn({
  agentId: 'research',
  task: 'Map out the RWA ecosystem...',
  model: 'minimax-portal/MiniMax-M2.1'
});
```

### 4. Research Agent Workflow
1. Break task into sub-topics
2. Conduct research (web search, browser)
3. Structure findings
4. Self-evaluate against quality criteria
5. Output draft

### 5. Main Agent Evaluation
- Review draft against quality criteria
- Score: ≥75% = ready, <75% = feedback + iterate

### 6. Share with Brian
- Present final output
- Ask for feedback
- Archive if approved

## Files

```
memory/research/
├── quality-criteria.md    # Evaluation standards
├── template.md           # Output format
├── draft-1.md           # Research drafts
├── draft-2.md
└── final.md
```

## Quality Threshold
**75% minimum** to share with Brian

## Commands

```bash
# View research memory
cat memory/research/draft-*.md

# Check quality criteria
cat memory/research/quality-criteria.md

# View template
cat memory/research/template.md
```
