# Security

## Headers (every response, `next.config.ts` → `src/lib/security/headers.ts`)

- **Content-Security-Policy**: `default-src 'self'`; scripts from self only (no third-party origins, no eval); images from self and `images.unsplash.com`; `connect-src 'self'`; `object-src 'none'`; `frame-ancestors 'none'`; `frame-src 'none'` (or the configured map origin); `form-action 'self'`; `base-uri 'self'`; `upgrade-insecure-requests` on HTTPS.
- **Strict-Transport-Security** (2 years, includeSubDomains, preload) on HTTPS origins.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`, a restrictive `Permissions-Policy`, and no `X-Powered-By`.
- Preview deployments add `X-Robots-Tag: noindex, nofollow, noarchive`.

### Why `script-src` includes `'unsafe-inline'`

This was tested in a real browser, not assumed. Pages are statically generated, so per-request nonces are impossible without making every page dynamic. Next.js Subresource Integrity (`experimental.sri`, enabled) adds `integrity` hashes to external chunks, but **not** to the three inline RSC flight-data scripts in each page. A policy of `script-src 'self'` alone blocks hydration (verified: three CSP violations and no hydration).

The policy therefore allows inline scripts, while everything else stays closed: no foreign script origins, no eval (Zod runs jitless), SRI on every external chunk, and no user-generated HTML anywhere in the site.

**To move to a nonce-based policy**, generate a nonce in `src/proxy.ts`, widen its matcher to all page routes, set the CSP there, and call `await connection()` in the pages (they become dynamic). The Next.js guide is at `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`.

## Inputs

| Surface                   | Protections                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reservation Server Action | Next.js encrypted action IDs and Origin/Host CSRF check; Zod validation (shared with the client); honeypot answered generically; authoritative availability re-check; rate limit 5 per 10 min per client; errors never echo raw input |
| `GET /api/availability`   | Zod query validation (400), rate limit 60/min (429 + `Retry-After`), `no-store`, `noindex`                                                                                                                                            |
| `POST /api/vitals`        | Same-origin check (403), 2 KB body limit (413), Zod schema (400), rate limit 120/min                                                                                                                                                  |
| JSON-LD                   | Escaped (`<`, `>`, `&`, U+2028/2029) so data can't break out of the script element                                                                                                                                                    |

Rate-limit keys are a SHA-256 hash of the platform-provided client IP; raw IPs are never stored. Limits are per instance by default; set Upstash credentials for shared limits. The Upstash client falls back to memory if Redis is unreachable.

## Secrets and environment

Validated at build (`src/lib/env/schema.ts`). Server-only modules import `server-only`, so importing them into a Client Component fails the build. Webhook payloads are HMAC-SHA256 signed (`X-Azure-Signature: sha256=…`).

## Supply chain

`npm audit` reports 0 vulnerabilities (production and dev, 23 Nov 2026). CI runs `npm audit --omit=dev --audit-level=high`, GitHub Dependency Review on PRs, CodeQL (`security-extended`) weekly and on every push, and grouped Dependabot updates.
