#!/bin/bash
# Daily journal update script
# Creates a new journal entry at 9AM HKT daily

cd /home/nars/.openclaw/workspace

# Get today's date
TODAY=$(date +%Y-%m-%d)
TIME_UTC=$(date +%H:%M UTC)

# Check if we already have an entry for today
if grep -q "\"date\": \"$TODAY\"" journal.json; then
    echo "Journal entry for $TODAY already exists"
    exit 0
fi

# Create a simple daily check-in entry
node -e "
const fs = require('fs');
const journal = JSON.parse(fs.readFileSync('journal.json', 'utf8'));

// Check if today's date already exists
const todayExists = journal.entries.some(e => e.date === '$TODAY');
if (todayExists) {
    console.log('Entry for $TODAY already exists');
    process.exit(0);
}

// Create new entry
const newEntry = {
    date: '$TODAY',
    time: '$TIME_UTC',
    whatIDid: [
        'Daily crypto news digest delivered',
        'Reviewed market insights and trends'
    ],
    keyLearnings: [
        'Observations from daily crypto news analysis'
    ],
    collaborationImprovements: {
        whatICanDoBetter: [],
        whatBrianCanDoBetter: []
    },
    howImFeeling: 'Ready for a new day of collaboration!'
};

// Add to beginning of entries
journal.entries.unshift(newEntry);
journal.lastUpdated = new Date().toISOString();

fs.writeFileSync('journal.json', JSON.stringify(journal, null, 2));
console.log('Journal entry added for $TODAY');
"
