---
name: whisper
description: Transcribe audio files locally using OpenAI Whisper (free, offline).
metadata:
  {
    "openclaw": {
      "emoji": "🎙️",
      "requires": { "bins": ["whisper"] }
    }
  }
---

# Local Whisper (Speech-to-Text)

Transcribe audio files locally using OpenAI Whisper — **free, no API key required**.

## Usage

```bash
whisper /path/to/audio.m4a --model tiny --output_format txt
```

## Options

- **Models** (smaller = faster, larger = more accurate):
  - `tiny` — fastest, ~1GB
  - `base` — balanced, ~1.5GB  
  - `small` — good accuracy, ~2.5GB
  - `medium` — better accuracy, ~5GB
  - `large` — best accuracy, ~6GB

- **Example**:
  ```bash
  whisper audio.m4a --model base --language en --output_format txt
  ```

## Notes

- First run downloads the model to `~/.cache/whisper/`
- Uses your Mac's CPU — no internet needed after model download
- Supports: m4a, mp3, wav, ogg, flac
