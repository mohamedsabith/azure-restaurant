# Engineering decisions

Decisions taken while building AZURE, with the evidence behind them. Versions checked against the npm registry on 22–23 November 2026.

## Framework and language

- **Next.js 16.4.6 (App Router, Turbopack), React 19.3.1.** Every page is statically generated; dynamic work is limited to two Route Handlers, one Server Action and the Markdown proxy. The project follows the version-matched docs shipped in `node_modules/next/dist/docs/`.
- **TypeScript 6.0.3, not 7.0.** TS 7 (the native port) is outside `typescript-eslint`'s supported range (`>=4.8.4 <6.1.0`).
- **ESLint 10.** ESLint 9 is end-of-life; Next's bundled docs confirm `eslint-config-next` 16.4 supports ESLint 10. Some bundled plugins don't list ESLint 10 as a peer yet, so npm prints peer warnings — expected and documented by Next.
- **React Compiler-era hook rules are enforced.** No `setState` inside effects: client-only values use `useSyncExternalStore` (`useClientSnapshot`), route and action changes adjust state during render, and async results are only written from callbacks.

## Motion: GSAP **and** Framer Motion (owner decision)

The two libraries have separate jobs so they never animate the same element:

| GSAP                                            | Framer Motion                                        |
| ----------------------------------------------- | ---------------------------------------------------- |
| Opening sequence timeline, hero entrance        | Page-transition curtain                              |
| Scroll reveals, image masks, SplitText headings | Mobile menu, dialogs, lightbox                       |
| Parallax and scroll-linked type (ScrollTrigger) | Menu filter layout transitions, active-nav indicator |
| 3D scroll coupling                              | Tooltips, popovers, confirmation state               |

Performance note: one-shot reveals use a single `IntersectionObserver` instead of a ScrollTrigger per element, and SplitText runs only when a heading approaches the viewport. This cut mobile Total Blocking Time on Home from ~680 ms to ~250 ms (Lighthouse, 4× CPU throttle).

Accessibility note: reveals animate `opacity`, never `visibility`. An E2E test caught that GSAP's `autoAlpha` removed not-yet-revealed content from the accessibility tree.

**Lenis smooth scrolling was not added.** It would hijack native scrolling for no measurable UX gain, and the brief forbids scroll hijacking.

## Floating UI instead of Popper

The brief named React Popper / Popper.js. Evidence: `react-popper@2.3.0` (2022) declares peer support only for React 16–18, and `@popperjs/core` was last published in May 2023. Popper's authors maintain **Floating UI** as its successor, so `@floating-ui/react` handles the tooltip, the date-picker popover and every dialog (focus trap, dismissal, scroll lock, focus return, ARIA roles).

## Proxy usage

`src/proxy.ts` does exactly one thing: content negotiation (`Accept: text/markdown` → Markdown rendition) on the four page paths. Redirects, security headers and preview `noindex` stay static in `next.config.ts` so normal requests incur no proxy work.

## Rendering, caching, revalidation

- Pages, OG images, `robots.txt`, `sitemap.xml`, `llms*.txt`, `menu.json` and `*.md` are static (`○` in the build output).
- `/api/availability` is dynamic with `Cache-Control: no-store` (availability depends on the current time).
- Content is compiled from typed modules. When a CMS is introduced, move the getters behind `'use cache'` + `cacheTag('menu')` and add a signed webhook that calls `revalidateTag`.
- Authentication: the site has no accounts or admin area, so no auth layer was added. The Server Action and Route Handlers are public by design and protected by validation, origin checks and rate limits.

## Images

Unsplash photos go through a global custom `next/image` loader that asks Unsplash's imgix CDN for each `srcset` width with `auto=format` (AVIF/WebP). This keeps hosting free-tier image-optimisation quotas at zero and follows Unsplash's hot-linking guideline.

## 3D

- A crystal glass of white wine rather than an abstract sculpture or 3D food. The client found the earlier abstract glass sculpture unrelated to a restaurant; a wine glass belongs on the table, ties to the wine pairing, and is the kind of object real-time refraction renders convincingly (3D food rarely looks appetising). The glass is a lathe from a measured profile; the studio lighting is built from Lightformers rendered once into the environment map, so no HDR file is downloaded.
- The wine is kept out of the crystal's refraction buffers and drawn over the bowl, with the crystal's reflections redrawn on top in the band the wine fills. Seen through the transmission buffer, the translucent wine lost its blending and looked milky; this ordering is cheaper and keeps it clear and golden.
- Quality tiers: `high` (desktop), `medium` (tablets / capable phones: fewer refraction samples, no mirror table, DPR ≤ 1.5, no MSAA), `static` (no WebGL, software rasteriser, reduced motion, Save-Data, low memory/cores, modest phones).
- Rendering stops when off-screen (`frameloop="never"`), `PerformanceMonitor` lowers DPR and falls back to the still image on sustained low FPS, and WebGL context loss or any runtime error swaps in the still image. GPU resources are disposed on unmount.
- `?three=on|off|capture` overrides the tier for testing and for rendering the fallback.

## Zod in the browser

Zod 4 probes `new Function` to decide whether to JIT parsers. Under a CSP without `'unsafe-eval'` the probe is reported as a violation (Lighthouse Best Practices dropped to 96). `z.config({ jitless: true })` removes the probe.
