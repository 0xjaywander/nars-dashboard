#!/bin/bash
# Daily journal update script
# Creates a new journal entry at 9AM HKT daily
# Triggers main agent to fill in the journal

cd /home/nars/.openclaw/workspace

# Get today's date
TODAY=$(date +%Y-%m-%d)
TIME_UTC=$(date +%H:%M UTC)

# Check if we already have an entry for today
if grep -q "\"date\": \"$TODAY\"" journal.json; then
    echo "Journal entry for $TODAY already exists"
    exit 0
fi

# Create a placeholder entry with minimal structure
node -e "
const fs = require('fs');
const journal = JSON.parse(fs.readFileSync('journal.json', 'utf8'));

// Check if today's date already exists
const todayExists = journal.entries.some(e => e.date === '$TODAY');
if (todayExists) {
    console.log('Entry for $TODAY already exists');
    process.exit(0);
}

// Create empty entry - main agent will fill this in
const newEntry = {
    date: '$TODAY',
    time: '$TIME_UTC',
    whatIDid: [],
    keyLearnings: [],
    collaborationImprovements: {
        whatICanDoBetter: [],
        whatBrianCanDoBetter: []
    },
    howImFeeling: ''
};

// Add to beginning of entries
journal.entries.unshift(newEntry);
journal.lastUpdated = new Date().toISOString();

fs.writeFileSync('journal.json', JSON.stringify(journal, null, 2));
console.log('Journal placeholder created for $TODAY');
"

# Trigger main agent to fill in the journal
openclaw gateway run --session main --system-event "Fill in today's journal entry ($TODAY). Complete the whatIDid, keyLearnings, collaborationImprovements, and howImFeeling sections based on your recent activities and reflections."
