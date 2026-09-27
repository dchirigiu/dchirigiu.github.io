# danielchirigiu.dev — Portfolio

Plain HTML/CSS/JS portfolio of Daniel Chirigiu. No frameworks, no build step,
no external dependencies. Deploys to GitHub Pages from `main` / (root).

## Pages

| File            | Purpose                                        |
| --------------- | ---------------------------------------------- |
| `index.html`    | Hero, featured-projects slider, stats, footer  |
| `jarvis.html`   | JARVIS case study (video, architecture, perf)  |
| `research.html` | CNN + DFT research summaries with paper links  |
| `about.html`    | Bio, headshot, currently/beyond code           |
| `contact.html`  | Direct contact links + copy-to-clipboard email |

## Deployment

1. Push `main` to `github.com/dchirigiu/dchirigiu.github.io`.
2. GitHub Pages serves from root; `CNAME` pins `danielchirigiu.dev`.
3. DNS: apex + `www` → GitHub Pages (see your DNS provider). HTTPS is
   automatic once Pages sees the domain.
4. After asset changes, the service worker (`sw.js`) refreshes on next
   visit; bump `CACHE_NAME` if you need to force it.

## Performance

- Initial load (gzipped, per page): 13–20 KB. Budget: <500 KB.
- Lighthouse (simulated mobile Fast 3G): 100/100/100/100 on all pages.
- LCP 0.9–1.1 s (budget <1.5 s), CLS 0, TBT 0 ms.
- System fonts only; all imagery below the fold is lazy WebP;
  the demo video is network-only (never cached, never preloaded).

## Real-asset swap guide

Placeholders live at the paths below — drop real files in and delete the
placeholders. No markup changes are needed (except multi-size `srcset`,
if you generate 2x variants).

| Asset                     | Path                                        | Format / size          |
| ------------------------- | ------------------------------------------- | ---------------------- |
| JARVIS demo video         | `assets/video/jarvis-demo.mp4`              | MP4 H.264, ≤1080p, 45–60s |
| Video poster              | `assets/images/jarvis-poster.webp`          | WebP 1280×720, <50 KB  |
| JARVIS screenshots (3)    | `assets/images/jarvis-screenshot-{1,2,3}.webp` | WebP 1440×900 max   |
| Slider thumbnails         | `assets/images/{jarvis,cnn,dft}-thumb.webp` | WebP 800×450           |
| Research figures          | `assets/images/{cnn,dft}-figure.webp`       | WebP ~1200×900         |
| Headshot                  | `assets/images/headshot.webp`               | WebP 480×480 square    |
| Social preview            | `assets/images/og-image.png`                | PNG 1200×630           |
| Paper PDFs                | `assets/papers/cnn-paper.pdf`, `assets/papers/dft-paper.pdf` | PDF |
| Bowtie mark               | `assets/icons/bowtie.svg` (+ inline copies in HTML) | SVG            |

GitHub repo links on the research page currently point to
`github.com/danielchirigiu` — replace with the exact repo URLs when public.
