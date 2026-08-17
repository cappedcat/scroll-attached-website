---
name: scroll-attached-website
description: >-
  Build a premium scroll-driven product landing page whose hero is a canvas that
  scrubs through AI-generated video frames as the user scrolls — the product
  appears to assemble, orbit, and deconstruct/transform under scroll control, on
  a pure-black cinematic background, with fade-in Features/Specs/CTA sections
  below. Use this whenever the user wants a "scroll animation" hero, a
  scrollytelling or scroll-scrubbing product page, an Apple-style / luxury-watch
  style scroll reveal, a product that "explodes" or "transforms" or "rotates" as
  you scroll, a frame-by-frame scroll video effect, or a cinematic product
  landing page — even if they don't say "canvas" or "frames". Runs the full
  pipeline: generates three Higgsfield assets (base image → transformed reference
  → start/end-frame hero video), extracts frames, and scaffolds a Next.js site.
  The reusable heart is the scroll frame-scrubbing engine; the product, brand
  colour, and copy are inputs.
---

# Scroll-scrub product landing page

This skill builds one specific, high-craft thing: a landing page where the hero
is a **full-screen canvas that scrubs through video frames tied to scroll
position**, so the product assembles / orbits / deconstructs as the visitor
scrolls, floating in a pure-black void. Below the hero, Features, Specs, and a
closing CTA fade in on scroll.

You give it a **product** (and optionally a brand colour, tone, or real specs);
it runs the whole pipeline end-to-end. The scroll engine is fixed and reusable —
what changes per build is the product in the frames and the copy in one config file.

## What you need from the user

Just the product. If they haven't said, ask briefly for: the product (and any
signature material/finish), a brand accent colour if they have one, and whether
they want you to invent plausible specs/copy or use real ones they'll provide.
Then proceed — don't over-interview. If they gave a product already, start.

Requires: the Higgsfield MCP tools (image/video generation), `ffmpeg`/`ffprobe`
on PATH, and Node for Next.js.

## The pipeline (run in order)

Work inside a fresh project directory, e.g. `<product-slug>/`.

### 1 · Generate the three assets — see `references/higgsfield-assets.md`
Read that file and follow it. In short: Asset 1 = base "assembled" product image
(pure black bg); Asset 2 = the "transformed" end state (exploded / cross-section /
ingredients — pick what fits the product), referencing Asset 1; Asset 3 = a
`seedance_2_0` video using Asset 1 as `start_image` and Asset 2 as `end_image`,
10s / 1080p / silent. Poll `job_display` until the video completes (it takes
**10–15 min** — that's normal), then download it as `hero.mp4`.

Look at each asset as it lands (Read the image) before moving on — a weak Asset 2
means a weak scrub.

### 2 · Extract frames — use the bundled script
```bash
scripts/extract_frames.sh <path/to/hero.mp4> <project-root>
```
It probes the video, extracts JPEGs at 24fps/1920px, copies frames + `hero.mp4`
into `public/`, and prints **`FRAME_COUNT`**. Note that number.

### 3 · Scaffold from the template
Copy `assets/template/` into the project root. That is a complete Next.js 15 /
React 19 / framer-motion / TypeScript app whose only per-product surface is
`app/site.config.ts`. Its layout:
```
app/
  site.config.ts      ← the ONLY content file you rewrite
  layout.tsx          ← fonts (swap the two next/font imports to rebrand)
  page.tsx            ← section order
  globals.css
  components/
    ScrollHero.tsx    ← the scroll engine — DO NOT rewrite
    icons.tsx         ← line icons keyed by name for Features
    FeaturesSection.tsx  SpecsSection.tsx  ClosingCTA.tsx
```

### 4 · Fill in `app/site.config.ts` — see `references/customize-and-verify.md`
Set `frameCount` to the number from step 2 (**required** — wrong value breaks the
scrub). Then write the product's real copy: hero label/name/tagline/CTA, the
accent colour, 3–6 features, 8–10 accurate specs, and the closing CTA. **No lorem
ipsum** — write like the brand. Follow the design tokens; keep the background pure
black.

### 5 · Run and verify — see `references/customize-and-verify.md`
`npm install && npm run dev` via the Browser-pane preview tools (add the server to
the **workspace-root** `.claude/launch.json`). Then verify the scrub.

> **Critical gotcha:** the screenshot tool captures **black** for the hero at any
> *scrolled* position — the sticky canvas is a GPU layer the screenshot pipeline
> can't grab off-top. This is a capture artifact, not a bug. **Verify by reading
> canvas pixels** (`getImageData`) at progress 0 / 0.5 / 1.0, not by screenshot.
> The reference file has the exact snippet. Don't "fix" working code because a
> scrolled screenshot looks black.

## The non-negotiables (what makes it feel premium)

These are baked into the template — preserve them:
- Pure `#000` background everywhere; the assets are black so frames blend seamlessly.
- Canvas + preloaded JPEG frames for the scrub — **never** a `<video>` element.
- A `requestAnimationFrame` loop reading `getBoundingClientRect` — **never** a
  scroll-event listener (events lag and stutter the scrub).
- No navbar, footer, or cookie banner. Sections fade in with `useInView`.
- Real copy, accurate specs, one brand accent colour, responsive (grid → single
  column under 768px), nothing dimmer than `#888` text on black.

## Reference files
- `references/higgsfield-assets.md` — the 3-asset generation chain, prompt
  formulas per product type, model IDs, polling.
- `references/customize-and-verify.md` — editing `site.config.ts`, fonts, the
  screenshot-black gotcha + the pixel-sampling verification snippet, deploy notes.
- `scripts/extract_frames.sh` — frame extraction (prints `FRAME_COUNT`).
- `assets/template/` — the full Next.js scaffold to copy.
