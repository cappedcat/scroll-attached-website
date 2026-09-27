# Worked example: modeling the Steam Machine

A concrete case study of the Blender approach in `blender-render.md`, pulled
from a real build that shipped (`render/steam_machine.py`). Read this when the
abstract steps aren't enough to start typing — it shows the actual reasoning
behind each decision, not just what the code does. Adapt the specifics to
whatever product you're building; the *structure* is what transfers.

## Why primitives, not an imported/sculpted mesh

The Steam Machine is a boxy aluminum-and-plastic PC — cubes, cylinders, and
bevels *are* its design language, so primitives aren't a compromise here,
they're the correct tool. A rounder or more organic product (a shoe, a
bottle) would lean harder on bevels, subdivision, and maybe a lathe/screw
modifier instead of stacked boxes — but the underlying method (procedural,
parametric, driven by real numbers) still applies. Don't reach for
primitives out of laziness on a product whose whole identity is a curved
surface; reach for them when they're honestly what the product is made of.

## Ground the scale in real numbers

The product's real dimensions (156 × 162.4 × 152 mm) came from the spec
sheet, not a guess, and became the scene's literal unit scale:

```python
# Real dims 156 W x 162.4 D x 152 H mm -> 1 unit = 100 mm. Front faces -Y.
W, D, H, t = 1.56, 1.624, 1.52, 0.045
```

`t` (0.045 = 4.5 mm) is the shell wall thickness — thin enough to read as a
metal panel, not a solid block. Every part's position and size is then an
expression in terms of `W`/`D`/`H`/`t`, so resizing the product later is a
four-number edit, not a re-model. **Get the real dimensions before writing
any geometry.** A model built from vibes-only proportions looks like a toy;
a model built from the datasheet looks like the product.

## A small, deliberate material palette

Fifteen materials total, each with a `mat(name, color, rough, metal, emit,
strength)` one-liner, covering exactly the surface families the product
actually has — not one material per object:

```python
SHELL = mat("Shell", (0.012, 0.012, 0.014), 0.5)          # matte chassis
LED   = mat("LED", (0.9, 0.95, 1.0), 0.3, emit=(0.9,0.95,1.0), strength=12)
GOLD  = mat("Gold", (0.9, 0.7, 0.3), 0.25, 1.0)            # SSD contacts
COPPER= mat("Copper", (0.85, 0.45, 0.25), 0.25, 1.0)       # heat pipes
ALU   = mat("Alu", (0.7, 0.7, 0.72), 0.3, 1.0)             # heatsink fins
```

Note the shell color is `(0.012, 0.012, 0.014)`, **not** `(0, 0, 0)`. Pure
black has no headroom for the renderer's lighting to describe form — every
edge and bevel disappears into the same flat black as the page background.
A near-black with the faintest blue tint gives the key/rim lights something
to catch, so the shell reads as a dark *object*, not a silhouette cutout.

## The helper-function pattern (copy this shape)

Every part is built through four small helpers, which is what keeps a
90-object scene from turning into 90 slightly-different copy-pasted blocks:

```python
def mat(name, color, rough=0.5, metal=0.0, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m

def finish(o, m, parent, bevel=0.0):
    if bevel:
        bv = o.modifiers.new("Bevel", "BEVEL")
        bv.width, bv.segments, bv.harden_normals = bevel, 4, True
        o.data.shade_smooth()
    o.data.materials.append(m)
    if parent:
        # Re-parent while preserving world position: bpy doesn't do this for
        # you on a plain `.parent = x` assignment, only on the parent_set()
        # operator with keep_transform=True. Doing it by hand here means the
        # box()/cyl() call sites never have to think about it.
        wl = o.location.copy()
        o.parent = parent
        o.location = wl - parent.location
    return o

def box(name, size, loc, m, bevel=0.0, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name, o.scale = name, size
    # location=False here is deliberate — see the transform_apply gotcha
    # in blender-render.md. Getting this wrong silently doubles offsets later.
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o, m, parent, bevel)

def cyl(name, r, depth, loc, m, rot=(0,0,0), parent=None, verts=32, caps="NGON"):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth,
                                         location=loc, rotation=rot, end_fill_type=caps)
    o = bpy.context.object
    o.name = name
    o.data.shade_smooth()
    return finish(o, m, parent)
```

A whole part — the front I/O strip, say — is then a handful of one-line
`box()`/`cyl()` calls building small details *onto* a parent object, which
is what makes 90 objects still readable six months later:

```python
io = box("FrontIO", (W - 2*t, t, SH - 0.012), (0, -D/2 + t/2 + 0.02, -H/2 + SH/2), PSU, 0.006)
for i in range(2):
    box("USB", (0.12, 0.012, 0.055), (-0.62 + i*0.3, fy, -H/2 + SH/2 + 0.005), DARKCHIP, 0.004, parent=io)
box("MicroSD", (0.1, 0.012, 0.012), (-0.1, fy, -H/2 + SH/2 - 0.01), DARKCHIP, parent=io)
cyl("StatusLED", 0.008, 0.012, (0.46, fy, -H/2 + SH/2), LED, face, io, verts=16)
```

## Repetition via an array modifier helper

Anything that repeats on a fixed pitch (heatsink fins, chokes, vents, gold
SSD fingers) is one object plus:

```python
def arr(o, count, offset):
    a = o.modifiers.new("Array", "ARRAY")
    a.count, a.use_relative_offset, a.use_constant_offset = count, False, True
    a.constant_offset_displace = offset   # NOT constant_offset_displacement
    return o

arr(box("Fin", (0.72, 0.012, 0.42), (-0.2, -0.57, -0.2), ALU, parent=sink), 39, (0, 0.03, 0))
```

39 fins from one line, instead of 39 nearly-identical `box()` calls.

## One parts list, one explode loop — not per-part keyframe code

Every explodable object is appended to a single list as it's built:

```python
parts, anchors = [], []  # (object, exploded offset, start frame, end frame)
SHELL_T, CORE_T = (70, 170), (90, 190)   # two timing bands: outer shell, then internals

top = box("Top", (W, D, t), (0, 0, H/2 - t/2), SHELL, 0.012)
parts.append((top, (0, 0, 1.25), *SHELL_T))
...
board = box("Board", (W - 0.2, D - 0.2, 0.02), (0, 0, bz), PCB, 0.005)
parts.append((board, (0, 0, -0.35), *CORE_T))
```

Then **one loop** keyframes all of them identically:

```python
for o, off, f0, f1 in parts:
    base = tuple(o.location)
    o.keyframe_insert("location", frame=f0)
    o.location = tuple(b + d for b, d in zip(base, off))
    o.keyframe_insert("location", frame=f1)
```

This is the single biggest thing worth copying: it's impossible to forget to
keyframe a part, or to give two parts an inconsistent easing, because there's
only one place explode animation happens at all. Per-part copy-pasted
keyframe blocks are exactly how a 20-part scene ends up with three parts that
don't move and one that jumps instead of eases.

**The offsets follow the part's real mechanical direction**, read off the
part itself, not a generic "explode outward from center" radial formula: the
top panel lifts straight up `(0, 0, 1.25)`, the two side panels slide along
X in opposite directions `(±1.45, 0, 0)`, the front/back panels slide along
Y `(-0.95, -1.1, 0.15)` / `(0, 1.25, 0)`. A part that would never be removed
that way in reality (a screw sliding sideways off a flat panel) reads as
arbitrary even if the timing is perfect.

**The two timing bands are the whole "sequence, not a pop" trick.** Shell
parts (`SHELL_T = (70, 170)`) start and finish before most internals
(`CORE_T = (90, 190)`) are done moving, so the shell visibly clears out of
the way before the internals follow — with small per-part nudges off the
band edges (`SHELL_T[0] + 6`, `CORE_T[0] - 8`, …) so parts within a band
don't all move in perfect lockstep either. Two named constants, not twenty
hand-picked frame numbers, is what makes the grouping intent visible and
easy to retune later.

## Hotspot anchors: track a point, not the object

For an interactive exploded view, an empty object is placed at the visually
correct pin location for each clickable part (rarely the mesh's own origin,
which is often buried inside the geometry) and parented to it:

```python
def anchor(name, loc, parent):
    o = bpy.data.objects.new(name, None)
    sc.collection.objects.link(o)
    o.parent = parent
    o.location = (loc[0]-parent.location.x, loc[1]-parent.location.y, loc[2]-parent.location.z)
    anchors.append(o)

anchor("fan", (fc[0], 0, fc[2] + 0.06), fan)   # top of the hub, not the fan's origin
```

Every frame, each anchor's screen position is recorded via
`world_to_camera_view` and dumped to `hotspots.json` (see `blender-render.md`
for the loop). The frontend then just places a `<button>` at
`hotspots[part][frame]` — no runtime 3D math, no object-detection pass.

## The camera rig: one empty carries the camera *and* the lights

```python
bpy.ops.object.empty_add(location=(0, 0, -0.15))
rig = bpy.context.object
cam.parent = rig
light("Key", (-3,-4,3.5), 220, 3)      # low energy — a matte-black shell washes out fast
light("RimL", (-4,3,1.5), 1400, 1.5, (0.8,0.9,1.0))   # much hotter — separates dark shell from black void
light("RimR", (4,2.5,2), 1400, 1.5, (0.8,0.9,1.0))
light("Top", (0,0,5), 160, 2)
light("Fill", (4,-3,0.5), 40, 3)
```

Both camera and lights are children of the same `rig` empty, so the whole
studio setup orbits together — the lighting stays consistent at every camera
angle instead of the product sliding through fixed light hotspots as it
turns. `RimL`/`RimR` run **6–8× hotter** than `Key`: on a dark product, the
rim lights are what separates the silhouette from the black background;
without them the product just disappears into the void from most angles.

The camera swings across three keyframes, chosen for what they mean, not
picked at random:

```python
for f, deg in [(1, 36), (110, -14), (240, 30)]:
    rig.rotation_euler.z = math.radians(deg)
    rig.keyframe_insert("rotation_euler", frame=f)
for f, dist, elev in [(1, 5.2, 22), (70, 5.6, 22), (195, 9.0, 16), (240, 9.2, 16)]:
    cam_at(dist, elev)
    cam.keyframe_insert("location", frame=f)
```

Frame 1 opens on the product's recognizable three-quarter view (this is what
a visitor sees *before* they've scrolled at all — get this angle right
before anything else). The camera then sweeps and pulls back (`dist` grows
from 5.2 to 9.2) as parts explode outward, so the wider frame at the end has
room for the spread-out parts without any clipping the frame edge.

## Takeaway

None of this is Steam-Machine-specific except the numbers. For a new
product: get its real dimensions, decide whether primitives or a more
organic modeling approach honestly fits its shape, build a small material
palette for its actual surface families (not one-off per part), use the
`box()`/`cyl()`/`finish()`/`arr()` helper shape so repeated details stay
one-liners, put every explodable part in one list with an offset that
follows its real mechanical direction, keyframe them all from one loop with
two or three named timing bands, and rig the camera and lights on one empty
so relighting during the orbit is automatic.
