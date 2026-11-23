import { describe, expect, it, vi } from 'vitest';
import { resolveEnv } from '@/lib/env/schema';
import { buildContentSecurityPolicy, buildSecurityHeaders } from '@/lib/security/headers';
import { createMemoryRateLimiter, createUpstashRateLimiter } from '@/lib/security/rate-limit';

describe('rate limiting', () => {
  it('allows the limit, blocks the next request, then resets with the window', async () => {
    let t = 1_000;
    const limiter = createMemoryRateLimiter({ limit: 2, windowMs: 1_000, prefix: 't' }, () => t);
    expect((await limiter.limit('a')).success).toBe(true);
    expect((await limiter.limit('a')).success).toBe(true);
    expect((await limiter.limit('a')).success).toBe(false);
    expect((await limiter.limit('b')).success).toBe(true); // keys are independent
    t += 1_001;
    expect((await limiter.limit('a')).success).toBe(true);
  });

  it('uses the Upstash REST pipeline and falls back to memory when it fails', async () => {
    const ok = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ result: 3 }, { result: 1 }])));
    const upstash = createUpstashRateLimiter(
      { url: 'https://redis.example', token: 'x'.repeat(24), limit: 2, windowMs: 60_000, prefix: 'u' },
      undefined,
      ok,
    );
    const result = await upstash.limit('k');
    expect(ok).toHaveBeenCalledWith(
      'https://redis.example/pipeline',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.success).toBe(false);

    const down = vi.fn().mockRejectedValue(new Error('offline'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const resilient = createUpstashRateLimiter(
      { url: 'https://redis.example', token: 'x'.repeat(24), limit: 2, windowMs: 60_000, prefix: 'u2' },
      undefined,
      down,
    );
    expect((await resilient.limit('k')).success).toBe(true);
    expect(warn).toHaveBeenCalled();
  });
});

describe('environment', () => {
  it('falls back to platform URLs and localhost', () => {
    expect(resolveEnv({}).siteUrl).toBe('http://localhost:3000');
    expect(resolveEnv({ VERCEL_PROJECT_PRODUCTION_URL: 'azure.vercel.app' }).siteUrl).toBe(
      'https://azure.vercel.app',
    );
    expect(resolveEnv({ NEXT_PUBLIC_SITE_URL: 'https://azure.example/' }).siteUrl).toBe(
      'https://azure.example',
    );
  });

  it('does not index preview deployments unless forced', () => {
    expect(resolveEnv({ VERCEL_ENV: 'preview' }).indexable).toBe(false);
    expect(resolveEnv({ CONTEXT: 'deploy-preview' }).indexable).toBe(false);
    expect(resolveEnv({ VERCEL_ENV: 'production' }).indexable).toBe(true);
    expect(resolveEnv({ VERCEL_ENV: 'preview', SITE_INDEXING: 'on' }).indexable).toBe(true);
  });

  it('treats empty strings as unset and rejects half-configured integrations', () => {
    expect(resolveEnv({ NEXT_PUBLIC_SITE_URL: '' }).siteUrl).toBe('http://localhost:3000');
    expect(() => resolveEnv({ UPSTASH_REDIS_REST_URL: 'https://redis.example' })).toThrow(
      /must be set together/,
    );
    expect(() => resolveEnv({ RESERVATION_WEBHOOK_URL: 'https://hooks.example/booking' })).toThrow(
      /RESERVATION_WEBHOOK_SECRET/,
    );
    expect(() => resolveEnv({ NEXT_PUBLIC_SITE_URL: 'ftp://nope' })).toThrow();
  });
});

describe('security headers', () => {
  const base = { isDev: false, httpsOrigin: true, indexable: true, mapOrigin: null };

  it('locks down the policy in production', () => {
    const csp = buildContentSecurityPolicy(base);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('allows only the configured map origin to be framed', () => {
    expect(buildContentSecurityPolicy({ ...base, mapOrigin: 'https://www.openstreetmap.org' })).toContain(
      'frame-src https://www.openstreetmap.org',
    );
  });

  it('adds HSTS on HTTPS and noindex on previews', () => {
    const keys = (h: { key: string }[]) => h.map((x) => x.key);
    expect(keys(buildSecurityHeaders(base))).toContain('Strict-Transport-Security');
    expect(keys(buildSecurityHeaders({ ...base, indexable: false }))).toContain('X-Robots-Tag');
    expect(keys(buildSecurityHeaders({ ...base, httpsOrigin: false }))).not.toContain(
      'Strict-Transport-Security',
    );
  });
});
