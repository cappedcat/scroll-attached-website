# scroll-attached-website

A Claude Code skill that builds a premium **scroll-driven product landing page** — a
full-screen canvas hero that scrubs through AI-generated video frames as the visitor
scrolls, so the product assembles / orbits / deconstructs on a pure-black background,
with fade-in Features, Specs, and CTA sections below.

It runs the full pipeline: generates the hero assets (image → transformed reference →
start/end-frame video), extracts frames, and scaffolds a Next.js site. The scroll
engine is fixed and reusable; the product, brand colour, and copy are inputs.

See [`SKILL.md`](./SKILL.md) for the full instructions.

## Install

```bash
git clone https://github.com/artem-techman/scroll-attached-website ~/.claude/skills/scroll-attached-website
```

**Requires:** the Higgsfield MCP (image/video generation), `ffmpeg`/`ffprobe` on PATH, and Node for Next.js.

Listed on [skillsaggregator.com](https://skillsaggregator.com).
