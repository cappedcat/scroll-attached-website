# Generating the three Higgsfield assets

The scroll effect is only as good as the video behind it. You are producing
**three assets in a strict chain**, each referencing the last, all on a **pure
black background** so they blend seamlessly into the page's black void.

The generation tools are Higgsfield MCP tools. Load them first with ToolSearch:

```
select:mcp__<higgsfield-server>__generate_image,mcp__<higgsfield-server>__generate_video,mcp__<higgsfield-server>__job_display,mcp__<higgsfield-server>__balance
```

(The server id looks like `468b...`; find it in the deferred-tool list. `balance`
lets you check credits first — a 10s 1080p video is the expensive step.)

**Passing references between steps:** when a later asset references an earlier
one, pass the earlier generation's **job id** as `medias[].value` — NOT its URL.
Every generation result includes an `id`; that id is the handle.

---

## Asset 1 — the base "assembled" hero image

The product in its whole, finished, campaign-ready state. This becomes the
video's **first frame**, so it must be beautiful on its own.

- **Model:** `nano_banana_pro` (clinical, high-resolution stills, great with a
  later reference chain).
- **aspect_ratio:** `16:9` (the hero canvas is landscape).

**Prompt formula:**
> A studio-grade product photograph of **[PRODUCT + defining materials/finish]**,
> shown at **[flattering angle that reveals its signature detail]**. Pure black
> background with zero ambient light bleed, no reflections, no surface shadows.
> The product is fully assembled/intact. Shot as if for a high-end print
> campaign — clinical precision, no stylization.

The "pure black background, no reflections, no shadows" clause is load-bearing —
it's what lets the frames melt into the page. Keep it in every asset.

---

## Asset 2 — the "transformed" end state (references Asset 1)

The same product in its revealed / deconstructed / alternate state — this is the
video's **last frame**, the payoff of the scroll. Pick the transformation that
tells the product's story:

- watch / camera / engine / gadget → **exploded view** (components floating apart
  along their mechanical axis)
- sneaker / bag / chair → **cross-section or disassembly** (layers, cushioning, sole)
- perfume / spirit / skincare → **ingredients / raw materials floating** around the bottle
- car → **exploded chassis / powertrain**
- food / drink → **deconstructed components** suspended

- **Model:** `nano_banana_pro`, **aspect_ratio:** `16:9`.
- **medias:** `[{ role: "image", value: "<Asset 1 job id>" }]`

**Prompt formula (exploded-view example):**
> Using the provided reference image: deconstruct the product into a precise
> exploded-view diagram. Each component floats apart from its assembled position
> along its natural axis, with uniform spacing. The arrangement feels deliberate
> and symmetrical, like a technical illustration or a luxury brand's campaign
> visual. Pure black background. All parts retain their original finish and
> material texture. No labels, no lines, no graphic overlays.

Look at the result before continuing — Asset 2 defines where every part lands at
scroll-end, so it needs to read clearly.

---

## Asset 3 — the hero video (references Assets 1 and 2)

One continuous shot that morphs from assembled → transformed. Because we pin the
start and end frames, the model interpolates a believable motion between them.

- **Model:** `seedance_2_0` — the key capability is that it accepts **both**
  `start_image` and `end_image`, which is exactly the assembled→transformed
  interpolation we want. (Most image-to-video models only take a start frame.)
- **medias:**
  `[{ role: "start_image", value: "<Asset 1 id>" }, { role: "end_image", value: "<Asset 2 id>" }]`
- **duration:** `10` — 10s at 24fps ≈ 240 frames, a long, luxurious scrub.
- **resolution:** `1080p`, **mode:** `std` (1080p/4k require std), **aspect_ratio:** `16:9`.
- **generate_audio:** `false` — we only need pictures.

**Prompt formula:**
> **[PRODUCT]** floats in a pure black void, fully assembled, no environment, no
> ground plane, no ambient reflections. The camera begins at **[angle]** and
> slowly orbits **[direction]** in a smooth, uninterrupted arc. Approximately
> halfway through, the product begins a seamless **[transformation — e.g.
> mechanical deconstruction]**: each component separates along its natural axis
> with deliberate, weighted momentum. Parts float outward in perfect radial
> symmetry as if gravity were selectively reversed. The movement is slow,
> cinematic, and precise — never chaotic. By the end, all parts are suspended in a
> balanced **[exploded]** arrangement, still against the black void.

"Slow, cinematic, weighted, never chaotic" matters: a frantic transform scrubs
badly. You want stately motion that reads at any scroll speed.

---

## Polling for completion

`generate_video` returns immediately with a job `id` and `status: "pending"`.
Poll `job_display(id)` until `status: "completed"`, then read
`results.rawUrl` for the `.mp4`. **A 1080p / 10s Seedance render typically takes
10–15 minutes** — don't assume failure early. Poll on a relaxed cadence (a
background `sleep` between checks) rather than hammering the API. The filename in
the URL is not predictable, so rely on `job_display`, not URL-guessing.

Download the finished video to the project as `hero.mp4`, then hand it to
`scripts/extract_frames.sh`.

## If an asset comes back wrong

- Not pure black / has a floor or reflections → re-run, strengthen the "pure
  black void, no ground plane, no reflections" clause.
- Transform too fast or messy in the video → add "slow, weighted, evenly spaced,
  the first half is pure orbit with no deconstruction."
- Parts drift off-frame at the end → in Asset 2, ask for "compact, symmetrical
  spacing that stays within frame."
