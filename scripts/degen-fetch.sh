#!/bin/bash
# Degen Daily - Fetch tweets using x-tweet-fetcher + Camofox
# Saves posts to memory/degen-posts.json

SCRIPT_DIR="$HOME/x-tweet-fetcher"
OUTPUT_FILE="$HOME/.openclaw/workspace/memory/degen-posts.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Accounts to check (high-quality degen/crypto accounts)
ACCOUNTS=("rektmando" "AltcoinBuzz" "CryptoWhale" "unusual_whales" "TheAlphaSpy")

echo "[" > "$OUTPUT_FILE"
first=true

for account in "${ACCOUNTS[@]}"; do
    echo "Fetching @${account}..."
    # Fetch user timeline via Camofox + x-tweet-fetcher
    result=$(cd "$SCRIPT_DIR" && python3 scripts/fetch_tweet.py --user "$account" --limit 3 --text-only 2>/dev/null)
    
    if [ -n "$result" ]; then
        # Parse tweets and save as JSON
        echo "$result" | python3 -c "
import sys, json, re

input_text = sys.stdin.read()
# Simple parsing of text output
lines = input_text.split('\n')
tweets = []
current_tweet = {}

for line in lines:
    if '] ' in line and '(' in line:
        # New tweet indicator like [1] Name (@handle) · time
        if current_tweet:
            tweets.append(current_tweet)
        match = re.search(r'\[(\d+)\]\s+(.+?)\s+\((@.+?)\)\s+·\s+(\S+)', line)
        if match:
            current_tweet = {
                'timestamp': '${TIMESTAMP}',
                'account': match.group(2).strip(),
                'handle': match.group(3),
                'time_ago': match.group(4),
                'content': '',
                'engagement': ''
            }
    elif '❤' in line or '💬' in line or '👁' in line:
        # Engagement line
        current_tweet['engagement'] = line.strip()
    elif line.strip() and not line.startswith('[') and current_tweet:
        # Content line
        current_tweet['content'] += line.strip() + ' '

if current_tweet:
    tweets.append(current_tweet)

for i, t in enumerate(tweets):
    if i > 0:
        print(',')
    print(json.dumps(t), end='')
" >> "$OUTPUT_FILE" 2>/dev/null
    fi
    sleep 2
done

echo "]" >> "$OUTPUT_FILE"
echo "Saved to $OUTPUT_FILE"
