# Strategy — Scroll-Driven Frame Sequence

## Problem

299 frames × 1 HTTP request per frame = **299 requests** on production load.

Browsers limit concurrent connections per origin (~6). Frames queue in batches of 6. With connection overhead (DNS + TCP + TLS), 299/6 ≈ 50 serial rounds of requests — each taking 100–300ms. Total queue time can exceed 10 seconds before all frames are available.

Scrolling during this period hits cache misses. The engine falls back to the nearest cached frame, causing visible stutter.

## Solution: Single Binary Bundle

All 299 WebP frames are concatenated into one binary file with an embedded index. **One HTTP request loads every frame.**

### Binary Format (`frames.bundle`)

```
Offset  Size  Field
0       4     Magic: 0x50534246 ("FBSP" — Frame Bundle Single Picture)
4       4     Frame count (Uint32 LE)
8       4     Index byte size (Uint32 LE = count × 8)
12      8×N   Index entries: [fileOffset:Uint32LE, size:Uint32LE]
12+8×N  var   Frame data
```

- Index entries use **absolute byte offsets** into the file (no relocation needed).
- Client reads the header, iterates index entries, slices the ArrayBuffer at `[offset, offset+size]`, creates a `Blob({type: 'image/webp'})`, then `URL.createObjectURL(blob)` as the `<img>` source.
- Blob URL is revoked (`URL.revokeObjectURL`) immediately after the image decodes — the decoded Image retains the pixel data.

### Build Step

```
node scripts/bundle-frames.mjs
```

Outputs:
- `public/bundles/desktop/frames.bundle` — 26.5 MB
- `public/bundles/mobile/frames.bundle` — 9.7 MB

## Why Not

| Approach | Rejected Because |
|---|---|
| **Video element** | Requested frame-perfect seeking without keyframe interpolation; also user preference against video |
| **Sprite sheets** | 299 frames at 1920×1080 would require impractically large composite images (e.g. 9600×5400 per 25-frame sheet) with worse total compression |
| **Reduce frame count** | Sacrifices animation smoothness; 150 frames at 30 fps loses half the motion detail |
| **HTTP/2 push/preload** | Doesn't eliminate the 299-request queue; only reduces connection overhead |

## FrameManager Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      FrameManager                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  attach(canvas)                                             │
│    ├─ loadBundle() ─► fetch frames.bundle ─► ArrayBuffer    │
│    ├─ loop() ───────► requestAnimationFrame (60fps)         │
│    └─ loadInitial() ─► load frames 0–11 from bundle         │
│                                                             │
│  tick() on every RAF:                                       │
│    ├─ Lerp currentIndex toward targetIndex (factor 0.12)    │
│    ├─ schedulePreload(desiredIdx)                           │
│    │   └─ add frames ahead/behind to loadQueue               │
│    │   └─ drainQueue() — concurrency-limited (6/3)          │
│    └─ cache hit? → draw(desiredIdx)                         │
│        └─ cache miss? → _nearestCached() → draw nearest    │
│            (never freezes canvas)                           │
│                                                             │
│  loadOne(index):                                            │
│    ├─ slice ArrayBuffer → Blob → ObjectURL                  │
│    ├─ new Image() ← src = ObjectURL                         │
│    ├─ await onload + img.decode()                           │
│    ├─ URL.revokeObjectURL()                                 │
│    ├─ cache.set(index, { image, time })                     │
│    └─ if frame is near current position → draw immediately  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Cache & Memory

| Resource | Size | Notes |
|---|---|---|
| ArrayBuffer (desktop) | 26.5 MB | Held for lifetime of FrameManager |
| Per decoded frame (1920×1080) | ~3–4 MB | YUV 4:2:0 internal format |
| Max cache (desktop) | 45 frames | ~158 MB decoded |
| Max cache (mobile) | 18 frames | ~25 MB decoded |
| **Total peak (desktop)** | **~185 MB** | Buffer + decoded cache |

Eviction uses LRU with a **buffer zone protection** (±15 frames around rendered and current position) to prevent thrashing during scroll.

## Perceived Performance

1. **Page load**: Single 26.5 MB download starts immediately. All frame data arrives in one stream.
2. **Bundle parse**: ~0.1 ms to read 299 index entries from ArrayBuffer.
3. **Initial frames**: First 12 frames create blob URLs and decode in parallel (6 at a time). Frame 0 (first visible frame) is typically decoded within 50 ms of bundle fetch completion.
4. **Scrolling**: Frames are decoded from local memory (ArrayBuffer → Blob → Image). Zero network latency per frame. Decode is the only bottleneck (~10–20 ms per WebP frame on modern hardware).
5. **Cache warm**: After ~3 seconds of idle time, all 299 frames are decoded and cached. Scrolling after this point is indistinguishable from a local video playback.

## GSAP ScrollTrigger Integration

```
ScrollTrigger.create({
  trigger: container,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: (self) => {
    window.__frameManager.setProgress(self.progress);
  },
});
```

- `setProgress(t)` maps `t ∈ [0, 1]` to `targetIndex = t × 298`.
- RAF loop lerps `currentIndex` toward `targetIndex` at factor 0.12.
- Text overlays use a separate GSAP timeline with `scrub: true` and percentage-based durations.
- React re-renders are minimized — only the frame loading progress bar triggers React state.

## Mobile Strategy

- `FrameBusesWebP/mobile/`: 960×540 WebP frames (9.7 MB total)
- Mobile overrides in `MOBILE_OVERRIDES`: cache 18, concurrency 3, preload 8/5
- Lenis `touchMultiplier: 1.2` + `syncTouch: true` for responsive touch scrolling
- Detection: `hover: none` + `pointer: coarse` media query + viewport width check

## Production Checklist

- [x] WebP frames converted from original PNG (98–99% reduction)
- [x] Frames bundled into single `frames.bundle` (1 HTTP request)
- [x] Immutable cache headers (`/bundles/*`, `/FrameBusesWebP/*`)
- [x] FrameManager: bundle loading, LRU cache, directional preloading, nearest-frame fallback
- [x] Canvas: `alpha: false`, `desynchronized: true`
- [x] GSAP ScrollTrigger drives both frame progress and text overlays
- [x] Lenis smooth scroll with mobile tuning
- [x] `prefers-reduced-motion` support
- [ ] Vercel deployment configured
