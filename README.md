# AZURE — contemporary fine dining

A production-grade Next.js website for **AZURE**, a fictional forty-six-seat fine-dining restaurant on a harbour. Four pages (Home, Menu, Our Story, Reservations & Visit), a real-time Three.js wine glass, GSAP + Framer Motion motion design, a demonstration booking flow backed by a Server Action, and first-class support for search engines and AI agents.

> AZURE is a demonstration. Address, phone and social accounts are deliberately "to be confirmed", testimonials are labelled samples, and bookings are not real. See `docs/DELIVERY-REPORT.md` for what was built and verified.

## Quick start

```bash
nvm use            # Node 22 (>= 20.9 supported)
npm ci
npm run dev        # http://localhost:3000
```

Production build: `npm run build && npm start`.

## Scripts

| Script                    | What it does                                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `dev` / `build` / `start` | Next.js (Turbopack)                                                                                                               |
| `lint` / `lint:fix`       | ESLint 10 flat config (`eslint-config-next` core-web-vitals + TypeScript + jsx-a11y + Prettier)                                   |
| `format` / `format:check` | Prettier with Tailwind class sorting                                                                                              |
| `typecheck`               | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`)                                                                               |
| `test`                    | Vitest unit + component tests                                                                                                     |
| `test:e2e`                | Playwright E2E, accessibility (axe) and responsive suites against a production build (`PW_CHANNEL=chrome` to use a system Chrome) |
| `audit:deps`              | `npm audit` for production dependencies (high and above)                                                                          |
| `analyze`                 | Turbopack bundle analyzer (`next experimental-analyze`)                                                                           |
| `assets:fallback`         | Re-render the static image of the 3D wine glass from the live scene                                                               |
| `check`                   | lint + format + types + unit tests + build                                                                                        |

Git hooks (Husky): **pre-commit** runs lint-staged (ESLint + Prettier on staged files), **commit-msg** enforces [Conventional Commits](https://www.conventionalcommits.org) via commitlint, **pre-push** runs the type check. Hooks install on `npm ci` inside a Git repository.

## Stack

| Concern     | Choice                                                                        | Why                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework   | Next.js 16.4 App Router, React 19.3, TypeScript 6 (strict)                    | Static generation for every page, Server Actions, Route Handlers, `proxy.ts`                                                                |
| Styling     | Tailwind CSS 4 (CSS-first `@theme` tokens)                                    | Tokens live in `src/app/globals.css`, mirrored in `src/theme/tokens.ts`                                                                     |
| Motion      | GSAP 3.15 (timelines, ScrollTrigger, SplitText) + Framer Motion (`motion` 14) | GSAP for the intro, hero and scroll storytelling; Framer Motion for component state (page curtain, menus, dialogs, filter layout, tooltips) |
| Floating UI | `@floating-ui/react`                                                          | The maintained successor to Popper.js by the same authors (`react-popper` supports React ≤ 18 only; `@popperjs/core` last released 2023)    |
| 3D          | three 0.187, @react-three/fiber 9, drei 10                                    | Lazy-loaded, adaptive, paused off-screen, with a rendered still fallback                                                                    |
| Validation  | Zod 4 (jitless)                                                               | One schema for the client form and the Server Action                                                                                        |
| Tests       | Vitest + Testing Library, Playwright + axe-core                               |                                                                                                                                             |

Full rationale: `docs/DECISIONS.md`.

## Project structure

```
src/
  app/                 routes, metadata files, route handlers, proxy-free static pages
    api/availability   GET  — validated, rate-limited slot lookup
    api/vitals         POST — Core Web Vitals field data (same-origin only)
    robots.txt, llms.txt, llms-full.txt, menu.json, *.md   — machine-readable endpoints
  proxy.ts             Accept: text/markdown → Markdown rendition (AI agents)
  animations/          GSAP setup and the declarative MotionScope
  components/          ui, navigation, footer, forms, menu, gallery, motion, seo, analytics
  content/             single source of truth: site, images, menu, pages, seo
  lib/                 env, security, reservations, ai (crawlers/llms/markdown), seo, images
  sections/            page sections (home, menu, shared)
  three/               R3F scene, quality tiers, progressive stage
tests/unit, tests/e2e  Vitest and Playwright suites
docs/                  delivery report, assets, decisions, security
```

## Content

Everything a restaurant would edit lives in `src/content/`: brand and contact details (`site.ts`), opening hours (also drive availability and JSON-LD), the menu with dietary labels and allergens (`menu.ts`), page copy and FAQ (`pages.ts`), page metadata (`seo.ts`) and the photography manifest (`images.ts`). Replace placeholders there — never in components.

## Environment

Validated with Zod at build time (`src/lib/env/schema.ts`); a misconfigured deployment fails the build with a readable message. See `.env.example`.

| Variable                              | Required                         | Purpose                                                                                                          |
| ------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                | No                               | Canonical origin. Falls back to the Vercel/Netlify production URL, then localhost                                |
| `SITE_INDEXING`                       | No                               | `auto` (default) indexes production only; previews get `noindex` headers and a blocking robots.txt               |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN`   | No                               | Shared rate limiting across serverless instances (Upstash free tier). Without them limits are per instance       |
| `RESERVATION_WEBHOOK_URL` / `_SECRET` | No                               | Forward booking requests (HMAC-SHA256 signed) to a real system. Without them the form runs in labelled demo mode |
| `NEXT_PUBLIC_MAP_EMBED_URL`           | No                               | Real map embed on the Reservations page (replaces the drawn harbour map); its origin is added to CSP `frame-src` |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`  | Multi-instance self-hosting only | Stable Server Actions key                                                                                        |

## Deploying on a free tier

The site is static except two small Route Handlers, the reservation Server Action and the Markdown proxy, so it fits comfortably in free tiers.

- **Netlify Free (used for this project)**: Add new project → Import an existing project → GitHub, pick the repository and deploy. No `netlify.toml` and no environment variables are needed. Netlify's Next.js adapter is applied automatically, Node 22 comes from `.nvmrc`, and the site reads Netlify's `URL` and `CONTEXT` for its canonical address and the preview `noindex`. Each production deploy costs 15 of the 300 monthly credits, while Deploy Previews are free, so work on branches and merge to `main` when ready. Set `SITE_INDEXING=off` to keep the demo out of search engines.
- **Vercel Hobby**: import the repository; no configuration needed. Hobby is restricted to non-commercial, personal use.
- **Cloudflare Workers**: possible through the OpenNext adapter (`@opennextjs/cloudflare`), but first check its support for Node.js middleware (`src/proxy.ts`) and the free plan's 3 MiB Worker limit.
- Set `NEXT_PUBLIC_SITE_URL` only if the canonical domain differs from the platform's primary domain. Optionally add Upstash credentials for global rate limits.
- GitHub Actions (`.github/workflows/ci.yml`) gates every push and PR on lint, format, types, unit tests, a production build, E2E + accessibility tests, a Lighthouse budget and a dependency audit; CodeQL handles security scanning.

## Search and AI discoverability

- Server-rendered HTML for all content (the full menu and FAQ are in the HTML, not behind JavaScript).
- Per-page titles, descriptions, canonical URLs, Open Graph/Twitter cards and generated OG images.
- JSON-LD: `Restaurant`, `WebSite`, `Menu` (sections, priced items, diets), `FAQPage`, `BreadcrumbList` — with no invented address, phone, ratings or awards.
- `robots.txt` with an explicit, documented group per crawler purpose — search, AI answer engines, user-triggered AI fetchers and AI training (all allowed for public pages by owner decision; `/api/` always private) — plus a `Content-Signal` line and the sitemap.
- `llms.txt` and `llms-full.txt` (llmstxt.org convention), `menu.json`, and a Markdown rendition of every page at `/<page>.md` or by sending `Accept: text/markdown` to the page URL (advertised with `Link: rel="alternate"` headers).
- Clean URLs, 308 redirects for legacy paths, real 404 status codes, `noindex` on previews.
