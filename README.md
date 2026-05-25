# SSP Travels — Premium Bus Travel Experience

A cinematic scrollytelling website for SSP Travels featuring a scroll-driven 3D frame sequence animation — built with Next.js 14, optimized for 60fps on desktop and mobile.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Animation:** GSAP ScrollTrigger + Lenis smooth scroll
- **Rendering:** HTML5 Canvas (`desynchronized`, hardware-accelerated)
- **Frame Format:** WebP (desktop: 1920×1080, mobile: 960×540)
- **Styling:** Tailwind CSS

## Performance Architecture

### Frame Sequence Engine (`lib/FrameManager.js`)

299 WebP frames are rendered to a full-viewport canvas, synchronized to scroll position via GSAP ScrollTrigger. The engine uses:

| Optimization | Detail |
|---|---|
| **Canvas context** | `alpha: false`, `desynchronized: true`, `willReadFrequently: false` |
| **Render loop** | `requestAnimationFrame` with lerp interpolation (factor 0.12) |
| **Frame cache** | LRU Map — max 45 frames (desktop) / 18 (mobile) |
| **Preloading** | Directional — 20 ahead / 10 behind (desktop) |
| **Concurrency** | 6 parallel loads (desktop) / 3 (mobile) |
| **Fallback** | Nearest cached frame displayed on cache miss — zero freezing |
| **Decoding** | `img.decode()` off main thread |
| **Resize** | Debounced via `cancelAnimationFrame` + RAF |

### Frame Conversion

Original PNG frames (3840×2160, ~1.32 GB total) were converted to WebP:

```
node scripts/convert-frames.mjs
```

| Variant | Resolution | Size | Reduction |
|---|---|---|---|
| PNG (original) | 3840×2160 | 1,322 MB | — |
| WebP Desktop | 1920×1080 | 26.5 MB | **98%** |
| WebP Mobile | 960×540 | 9.7 MB | **99.3%** |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── components/
│   ├── BusSequence.jsx       # Canvas renderer with FrameManager
│   ├── SmoothScroll.jsx      # Lenis smooth scroll wrapper
│   └── StandardHomepage.jsx  # Booking & content section
├── page.js                   # GSAP ScrollTrigger orchestration
├── layout.js
└── globals.css
lib/
└── FrameManager.js           # Core rendering engine
public/
└── FrameBusesWebP/
    ├── desktop/              # 299 WebP frames @ 1920×1080
    └── mobile/               # 299 WebP frames @ 960×540
scripts/
└── convert-frames.mjs        # PNG → WebP batch converter
```

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Import `Jayakrishnasai/SSP-Travels` — Vercel auto-detects Next.js. Future pushes to `main` trigger automatic deployments.

### Cache Headers

WebP frames are served with `Cache-Control: public, max-age=31536000, immutable` for instant repeat-visit loading.
