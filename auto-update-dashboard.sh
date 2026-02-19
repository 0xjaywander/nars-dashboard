#!/bin/bash
# Auto-update dashboard script
# Checks for changes in tasks.json and journal.json, then pushes to GitHub

cd ~/.openclaw/workspace

# Check if any files have changed
if git diff --quiet tasks.json && git diff --quiet journal.json && git diff --quiet dashboard.html; then
    echo "No changes to push"
    exit 0
fi

# Add all dashboard-related files
git add tasks.json journal.json dashboard.html

# Create commit message with date
COMMIT_MSG="Update dashboard - $(date '+%Y-%m-%d %H:%M UTC')"

git commit -m "$COMMIT_MSG"

# Push to GitHub
git push origin main

echo "Dashboard updated!"
