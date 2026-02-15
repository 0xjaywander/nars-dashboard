#!/bin/bash
# Simple YouTube transcript fetcher
# Usage: ./summarize-video.sh <youtube-url>

URL="$1"

if [ -z "$URL" ]; then
    echo "Usage: $0 <youtube-url>"
    exit 1
fi

# Extract video ID
VIDEO_ID=$(echo "$URL" | grep -oP '(?:v=|/v/|youtu\.be/)[^&]+' | head -1 | sed 's/.*v=//' | sed 's/.*youtu\.be\///')

if [ -z "$VIDEO_ID" ]; then
    echo "Could not extract video ID"
    exit 1
fi

echo "Video ID: $VIDEO_ID"

# Try to get transcript using YouTube's caption API
curl -s "https://youtubetranscript.com/?v=$VIDEO_ID" 2>/dev/null | head -100
