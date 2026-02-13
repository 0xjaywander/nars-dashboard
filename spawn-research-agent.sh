#!/bin/bash
# Research Agent Spawner
# Usage: ./spawn-research-agent.sh "<task>"

TASK="${1:-}"
DRAFT_NUM="${2:-1}"
OUTPUT_FILE="/home/nars/.openclaw/workspace/memory/research/draft-${DRAFT_NUM}.md"

if [ -z "$TASK" ]; then
    echo "Usage: ./spawn-research-agent.sh \"<task description>\" [draft_number]"
    exit 1
fi

echo "Spawning research agent..."
echo "Task: $TASK"
echo "Draft: $DRAFT_NUM"

# The main agent will use sessions_spawn to create the research session
# This script is documentation of the protocol

echo ""
echo "=== Research Agent Protocol ==="
echo ""
echo "1. MAIN AGENT classifies task → 'This is research-heavy'"
echo "2. MAIN AGENT spawns research session with:"
echo "   - Agent ID: research"
echo "   - Task: $TASK"
echo "   - Model: MiniMax-M2.5 (preferred) → fallback to M2.1-lightning if failed"
echo "3. RESEARCH AGENT conducts research"
echo "4. RESEARCH AGENT saves to $OUTPUT_FILE"
echo "5. MAIN AGENT evaluates quality (MANDATORY)"
echo "   - Read quality-criteria.md"
echo "   - Score: ≥75% = share, <75% = feedback"
echo "   - Track iteration count"
echo "6. If score <75%: send feedback → research agent → new draft → re-evaluate"
echo "7. If score ≥75%: share with Brian"
echo "   - Append: iteration count + feedback history to output"
echo "   - Push to dashboard"
echo "   - Send TG summary (iteration count + quality score)"
echo ""
echo "Quality Criteria:"
echo "- Completeness checklist passed"
echo "- Sources cited"
echo "- Actionable insights included"
echo "- Structure standards met"
