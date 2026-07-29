# Video reels — drop the 3 files here

The homepage social section plays these **from our own server**. No TikTok embed
script, no third-party JS, **no cookies**.

## What to add

| File | What it is |
|---|---|
| `reel-1.mp4` | first reel |
| `reel-2.mp4` | second reel |
| `reel-3.mp4` | third reel |
| `reel-1.jpg` `reel-2.jpg` `reel-3.jpg` | *(optional)* poster frame shown before play |

Wired in `app/page.tsx` (`reels`) → `components/social-feed.tsx` →
`components/video-reels.tsx`. To add a 4th, add one more entry to `reels`.

## Getting the files

From the TikTok app on the account that owns them: open the video →
**Share → Save video**. That gives a clean `.mp4` with no watermark issues and
no scraping.

## Recommended encode

Keeps them sharp on retina while staying small enough to start instantly:

```
ffmpeg -i input.mp4 -vf "scale=-2:1280" -c:v libx264 -profile:v high -crf 23 \
  -preset slow -movflags +faststart -c:a aac -b:a 128k reel-1.mp4
```

- `-movflags +faststart` matters — it moves the index to the front so the video
  starts playing before it has fully downloaded.
- Poster frame: `ffmpeg -i reel-1.mp4 -ss 00:00:01 -vframes 1 -q:v 2 reel-1.jpg`

## Until the files are here

Each card degrades gracefully to a "watch on TikTok" link — nothing looks broken.
