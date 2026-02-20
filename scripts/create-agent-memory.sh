#!/bin/bash
# Create daily memory file for agent

AGENT_NAME="$1"
MEMORY_DIR="$HOME/.openclaw/agents/$AGENT_NAME/memory"
TEMPLATE_FILE="$HOME/.openclaw/agents/$AGENT_NAME/DAILY_TEMPLATE.md"

if [ -z "$AGENT_NAME" ]; then
    echo "Usage: $0 <agent-name>"
    exit 1
fi

# Create memory directory if it doesn't exist
mkdir -p "$MEMORY_DIR"

# Get today's date
TODAY=$(date +%Y-%m-%d)
MEMORY_FILE="$MEMORY_DIR/${TODAY}.md"

# Check if file already exists
if [ -f "$MEMORY_FILE" ]; then
    echo "Memory file already exists: $MEMORY_FILE"
    exit 0
fi

# Copy template to new daily file
if [ -f "$TEMPLATE_FILE" ]; then
    sed "s/2026-02-19/$TODAY/g" "$TEMPLATE_FILE" > "$MEMORY_FILE"
    echo "Created: $MEMORY_FILE"
else
    echo "Template not found: $TEMPLATE_FILE"
    exit 1
fi
