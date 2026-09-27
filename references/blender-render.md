# Rendering the hero frames in Blender

The scroll effect is only as good as the footage behind it. Default to building
this yourself with a **procedural Blender script**, rendered headless — not an
AI image/video generator. You get exact control over geometry, camera timing,
and the explode/assemble choreography, and it's fully reproducible: re-run the
script and get the same frames, tweak one number and re-render just that part.

This works agent-agnostically: it's one `.py` file executed by the `blender`
CLI, so it doesn't depend on which coding agent or MCP tools happen to be
available in the session.

## Requirements

- `blender` on PATH, capable of running **headless** (`blender -b`). If a
  Blender MCP server is connected, its `execute_blender_code` tool talks to a
  live GUI instance and generally can't run in background mode — don't rely on
  it for this; write a standalone script and invoke the CLI directly instead.
- `ffmpeg`/`ffprobe` on PATH (frame → video isn't needed here since we render
  JPEGs directly, but `extract_frames.sh` still expects the frames it produces).

**Read `references/worked-example.md` before writing a line of this** — it
walks a real script that shipped (the Steam Machine build) with the actual
reasoning behind every number, not just the shape of the steps below. Prose
alone under-specifies this task; the worked example is what turns "build a
procedural product" into something you can actually type with confidence.

## The shape of the script

One Python file, e.g. `render/<product>.py`, that:

1. **Builds the product procedurally** from primitives (cubes, cylinders, tori)
   with the `bpy` API — bevels for edge highlights, a `Principled BSDF`
   material per part (look shader nodes up by `node.type`, never by name — node
   names localize on non-English Blender UIs). Keep real-world proportions (1
   Blender unit = 100mm is a convenient default) so parts explode by plausible
   distances.
2. **Names every part as a separate object** and appends every explodable one
   to a single `parts` list of `(object, explode_offset, start_frame,
   end_frame)` tuples as it's built — then keyframes **all of them from one
   shared loop**, not per-part keyframe code. That's what prevents a part
   getting forgotten or animated inconsistently. Group the timing into two or
   three named frame-range constants (e.g. `SHELL_T = (70, 170)`, `CORE_T =
   (90, 190)`) so shell pieces clear out before internals follow — a shared
   window with named bands, not twenty hand-picked numbers.
3. **Rigs the camera on an empty.** Parent the camera (and lights) to an empty,
   keyframe the empty's `rotation_euler` for an orbit and the camera's
   distance/elevation for a push-in, and use `TRACK_TO` constraints so the
   camera always faces the product regardless of rig rotation. Open on the
   angle that reads the product most recognizably before any exploding starts.
4. **Lights with a handful of AREA lights** (key, rim ×2, top, fill) — tune
   energies down from any "sensible" starting value. A near-black product
   material under default-strength studio lights reads as flat grey, not
   black-blending-into-void; darken the material and/or drop light energy until
   the shell actually reads black against the `#000` page background.
5. **Renders each frame as JPEG** (`scene.render.image_settings.file_format =
   'JPEG'`, quality ~90) to `<out>/frame_%04d.jpg`, looping `frame_set()` over
   the full range. Use EEVEE (or `EEVEE_NEXT` — read the current
   `scene.render.engine` value rather than assuming which your Blender version
   ships, and switch inside `try/except TypeError` since valid identifiers vary
   by version).

Run it with:
```bash
blender -b -P render/<product>.py -- <out_dir> [resolution_pct] [frame_subset]
```
Accept a resolution-percent and an optional comma-separated frame list from
`sys.argv` after the `--`, so you can render a handful of test frames at low
res while iterating on the model/lighting before committing to a full-length
render at full resolution — a full 240-frame 1080-class render is slow enough
that you don't want to discover a lighting mistake on frame 200.

## Gotchas worth knowing up front

- `bpy.ops.object.transform_apply(scale=True)` also bakes `location` by
  default unless you pass `location=False`. Skipping that flag silently
  doubles every child object's offset the next time you read
  `matrix_world.translation` to compute a local location from a world
  position — it looks like a parenting bug but isn't.
- `ArrayModifier`'s Python attribute is `constant_offset_displace`, not
  `constant_offset_displacement` (easy to get wrong from memory).
- If you need interactive hotspots pinned to moving parts (e.g. an exploded
  view visitors can click through), add per-frame screen-space tracking: after
  `frame_set(f)`, call `bpy_extras.object_utils.world_to_camera_view(scene,
  cam, obj.matrix_world.translation)` for a tracking empty parented to each
  part, and dump `{part_id: [[x, y], ...]}` (one `[x, 1-y]` pair per frame) to
  `public/hotspots.json`. The frontend then just reads that file to position
  buttons over the canvas — no separate object-detection step needed.

## If the result looks wrong

- Product reads grey instead of black → lights too bright and/or material base
  color too light; drop both.
- Parts explode in a way that looks arbitrary → the explode offsets should
  follow each part's own mechanical axis (a fan lifts straight up, a side
  panel slides sideways), not a generic "everything flies outward" radial
  pattern.
- Camera opens on an unrecognizable angle → the orbit's *first* keyframe is
  what visitors see before any scroll — make sure it's the product's most
  identifiable three-quarter view, not wherever the rig happened to start.
- **Building from a real product?** Get a reference photo before modeling
  anything, and check the model against it at each stage — a plausible-looking
  invented detail (a logo, a vent, a port placement) that isn't actually there
  is a correctness bug, not a style choice.

## After rendering

Copy the rendered `frame_%04d.jpg` sequence into `public/frames/` (matching
what `ScrollHero.tsx` expects via `framePath()`), and set `site.frameCount` in
`site.config.ts` to the frame count you rendered. See
`references/customize-and-verify.md` for the rest of the wiring and
verification steps.
