#!/bin/bash
# Daily Crypto X Research - Telegram Delivery

export X_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAAHLe7QEAAAAAkYhb1gXnSpIV4%2FdgkOFd6Abd3%2B0%3DekjPHXceQvi3IJBXBOSC5yEpfHx0MzYJKnGq0PhSI4CHth9HQI"

cd /home/nars/.openclaw/workspace/skills/x-research

DATE=$(date +"%A, %B %d, %Y")

echo "🔍 Running X crypto research..."

# Run search
OUTPUT=$(bun run x-search.ts search "#crypto #bitcoin #ethereum #defi" --quality --sort likes --limit 10 2>/dev/null)

# Extract tweets with their content
echo "$OUTPUT" | awk '
/^[0-9]+\. @/ {
    user=$0
    getline line
    if (line ~ /^🚀|^Wowzers|^\$|^📈/) {
        tweet=line
        # Clean up
        gsub(/\$/, "#", tweet)
        tweet=substr(tweet, 1, 180)
        printf "• %s\n", tweet
    }
}' | head -10 > /home/nars/.openclaw/workspace/crypto-tweets.txt

# Build telegram message
TELEGRAM="📊 *Crypto X Research - ${DATE}*\n\n"

while IFS= read -r line; do
  TELEGRAM+="$line\n"
done < /home/nars/.openclaw/workspace/crypto-tweets.txt

TELEGRAM+="\n_Generated via X API • $(date +%H:%M)_"

# Save
echo -e "$TELEGRAM" > /home/nars/.openclaw/workspace/crypto-x-research.md

echo "✅ Done!"
cat /home/nars/.openclaw/workspace/crypto-x-research.md
