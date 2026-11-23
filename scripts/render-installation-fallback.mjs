#!/usr/bin/env node
/**
 * Renders the static fallback image of the 3D wine glass from the live
 * Three.js scene, so low-end / reduced-motion / no-WebGL visitors see the real
 * object rather than a stand-in.
 *
 * Usage: npm run build && npx next start -p 3100 &  then  npm run assets:fallback
 * Env:   BASE_URL (default http://localhost:3100), PW_CHANNEL (e.g. "chrome")
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';

const base = process.env.BASE_URL ?? 'http://localhost:3100';
const size = 1600;
const out = new URL('../public/images/installation/', import.meta.url);

const browser = await chromium.launch({
  ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
await page.addInitScript(() => sessionStorage.setItem('azure:intro', 'seen'));
await page.route(/images\.unsplash\.com/, (route) => route.abort());
await page.goto(`${base}/?three=capture`, { waitUntil: 'domcontentloaded' });

const stage = page.locator('[data-installation-state]').first();
await stage.scrollIntoViewIfNeeded();
await page.addStyleTag({
  content: `[data-installation-state]{position:fixed!important;inset:0!important;width:${size}px!important;height:${size}px!important;z-index:2147483647!important;aspect-ratio:auto!important}
            header,footer,main section:not(:has([data-installation-state])){visibility:hidden!important}
            main section:has([data-installation-state]){isolation:auto!important}`,
});
await page.waitForSelector('[data-installation-state="live"]', { timeout: 120_000 });
await page.waitForTimeout(2500); // environment + shadows render on their first frames

await mkdir(out, { recursive: true });
const png = await page.screenshot({
  type: 'png',
  clip: { x: 0, y: 0, width: size, height: size },
  animations: 'allow',
});
await sharp(png).webp({ quality: 82 }).toFile(new URL('installation-1600.webp', out).pathname);
await sharp(png).resize(900).webp({ quality: 80 }).toFile(new URL('installation-900.webp', out).pathname);
console.log('Rendered installation fallback images.');
await browser.close();
