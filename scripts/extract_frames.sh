#!/usr/bin/env bash
#
# extract_frames.sh — turn a hero video into scroll-scrub frames.
#
# Usage:
#   scripts/extract_frames.sh <path/to/hero.mp4> <path/to/project-root>
#
# It probes the video, extracts JPEG frames at 24fps / 1920px wide, copies them
# (and the video) into <project-root>/public/, and prints FRAME_COUNT — the one
# number you must paste into app/site.config.ts (frameCount).
#
# Why these choices:
#   fps=24        — dense enough for a smooth scrub, light enough to preload.
#   scale=1920:-1 — retina-crisp on the canvas without shipping 4K stills.
#   -q:v 3        — high JPEG quality; the black void must stay clean, no banding.
set -euo pipefail

VIDEO="${1:?Usage: extract_frames.sh <hero.mp4> <project-root>}"
ROOT="${2:?Usage: extract_frames.sh <hero.mp4> <project-root>}"

[ -f "$VIDEO" ] || { echo "ERROR: video not found: $VIDEO" >&2; exit 1; }
command -v ffmpeg  >/dev/null || { echo "ERROR: ffmpeg not installed"  >&2; exit 1; }
command -v ffprobe >/dev/null || { echo "ERROR: ffprobe not installed" >&2; exit 1; }

FRAMES_SRC="$ROOT/frames"
PUBLIC="$ROOT/public"
mkdir -p "$FRAMES_SRC" "$PUBLIC/frames"

echo "── Probing video ─────────────────────────────"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames,duration \
  -of default=noprint_wrappers=1 "$VIDEO"

echo "── Extracting frames ─────────────────────────"
# Clear any stale frames first (find avoids the zsh 'no matches found' abort on
# an empty directory that a bare  rm frames/*.jpg  would trigger).
find "$FRAMES_SRC" -maxdepth 1 -name 'frame_*.jpg' -delete
ffmpeg -loglevel error -i "$VIDEO" -vf "fps=24,scale=1920:-1" -q:v 3 \
  "$FRAMES_SRC/frame_%04d.jpg"

FRAME_COUNT=$(find "$FRAMES_SRC" -maxdepth 1 -name 'frame_*.jpg' | wc -l | tr -d ' ')
[ "$FRAME_COUNT" -gt 0 ] || { echo "ERROR: no frames were produced" >&2; exit 1; }

echo "── Copying into public/ ──────────────────────"
cp "$FRAMES_SRC"/frame_*.jpg "$PUBLIC/frames/"
cp "$VIDEO" "$PUBLIC/hero.mp4"

echo
echo "=============================================="
echo "  FRAME_COUNT=$FRAME_COUNT"
echo "  -> set  frameCount: $FRAME_COUNT  in app/site.config.ts"
echo "=============================================="
