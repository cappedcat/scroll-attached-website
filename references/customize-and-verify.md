# Customizing the site & verifying the scrub

## What to edit (and what never to touch)

Everything product-specific lives in **`app/site.config.ts`**. That is the one
file whose *content* you rewrite per product. Concretely:

1. `frameCount` — **the required edit.** Set it to what `extract_frames.sh`
   printed. Wrong value = scrub freezes or ends early.
2. `meta` — page `<title>` / description.
3. `tokens.accent` (+ `accentHover`, and recolour `borderSubtle` to match) — the
   single brand colour. Everything else in `tokens` keeps contrast legible on
   black; leave it unless you have a reason.
4. `hero`, `features`, `specs`, `cta` — real, specific copy. **No lorem ipsum,
   ever** — write like the product's actual brand. Specs must be accurate.
5. Feature `icon` keys map to `components/icons.tsx`. Reuse those keys, or add a
   new 24×24 stroke icon there and reference it.

**Fonts:** swap the two `next/font/google` imports in `app/layout.tsx`. Keep the
CSS-variable names `--font-display` and `--font-body` — the components read those,
so a font change is a two-line edit. `display` is the editorial headline face;
`body` needs weights 300–500.

**Do NOT rewrite `ScrollHero.tsx`.** The canvas + requestAnimationFrame +
`getBoundingClientRect` engine is the whole point of the skill and is already
correct. Touch it only to change section *ordering* in `page.tsx`, never the loop.

The hard rules that keep the effect intact: pure `#000` background everywhere; no
navbar, footer, or cookie banner; canvas + JPEG frames (never a `<video>` element
for the scrub); no scroll-event listener (the rAF loop only); grid stacks to one
column under 768px (the `minmax(300px, 1fr)` already does this); no text dimmer
than `#888` on black.

## Running it

The frames are large, so first run installs then serves:

```bash
cd <project-root> && npm install && npm run dev
```

Prefer the Browser-pane preview tools over raw `next dev` in a shell. Add an entry
to the workspace-root `.claude/launch.json` (that's where `preview_start` reads
from — a `launch.json` inside the project subfolder is ignored) and
`preview_start({ name })`. Pick an unused port.

## Verifying the scrub — READ THIS, it saves you a confused hour

**The gotcha:** the browser screenshot tool returns a **black frame** when it
captures the hero at any *scrolled* position. The sticky canvas gets promoted to
its own GPU compositor layer, and the screenshot pipeline can't grab that layer
at a scroll offset. This is a *capture* artifact — the page is fine, the canvas
really has the frame drawn. If you trust the screenshot you'll think the scrub is
broken and start "fixing" working code. Don't.

**Verify by reading canvas pixels instead.** After scrolling to a position with
JS, sample the canvas backing store — that is ground truth for what's actually
drawn:

```js
// scroll to a given progress (0..1) through the hero, then sample a horizontal strip
(() => {
  const outer = document.querySelectorAll('main > div')[0];
  window.scrollTo(0, (outer.offsetHeight - window.innerHeight) * 0.5); // 0.5 = middle
  return new Promise(r => setTimeout(() => {
    const c = document.querySelector('canvas'); const ctx = c.getContext('2d');
    const s = [];
    for (let x = 0; x < c.width; x += Math.floor(c.width / 10)) {
      const p = ctx.getImageData(x, c.height / 2, 1, 1).data; s.push([p[0], p[1], p[2]]);
    }
    r(JSON.stringify({ scrollY: window.scrollY, nonBlack: s.filter(p => p[0]+p[1]+p[2] > 40).length, strip: s }));
  }, 250));
})()
```

A healthy mid-scroll sample shows several **non-black** pixels (the product's
colours). Check three positions:
- progress `0.0` → the assembled product (this one *does* screenshot fine at the top),
- progress `~0.5` → mid-transformation,
- progress `1.0` → the fully transformed end state.

Also confirm the engine settled (no flicker): monkey-patch `fillRect`/`drawImage`
for ~400ms while the page is static and check both counts are **0** — the loop
should not redraw when scroll isn't moving.

Sanity checks that *do* work normally: the top-of-page screenshot (frame 0 +
overlay copy), `/frames/frame_0001.jpg` returning 200, and the console/server
logs being error-free.

## Deploying (optional)

It's a standard Next.js app — `vercel --prod` works. The frames add weight
(~30–40 MB for 240 frames); that's expected and fine for Vercel. If you want a
lighter deploy, drop to `fps=20` in the extract step or shorten the video.
