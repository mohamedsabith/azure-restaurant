'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { creditUrl, images } from '@/content/images';

/** Unsplash attribution for every photograph used on the site. */
export function CreditsDialog() {
  const [open, setOpen] = useState(false);
  const byPhotographer = new Map<string, { href: string; alt: string }[]>();
  for (const asset of Object.values(images)) {
    const list = byPhotographer.get(asset.credit.name) ?? [];
    list.push({ href: creditUrl(asset), alt: asset.alt });
    byPhotographer.set(asset.credit.name, list);
  }
  const photographers = [...byPhotographer.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="link-draw pb-0.5 text-taupe hover:text-forest"
      >
        Photography credits
      </button>
      <Dialog open={open} onOpenChange={setOpen} labelledBy="credits-title" className="max-w-3xl">
        <div className="p-6 md:p-10">
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <p className="mb-3 eyebrow text-bronze">Credits</p>
              <h2 id="credits-title" className="text-h3">
                Photography
              </h2>
              <p className="mt-3 max-w-prose text-small text-ink/85">
                Stand-in photographs used under the Unsplash License for this demonstration. A live restaurant
                would replace them with its own commissioned photography.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="-mt-2 -mr-2 inline-flex size-12 shrink-0 items-center justify-center text-moss"
              aria-label="Close credits"
            >
              <Icon name="close" className="size-6" />
            </button>
          </div>
          <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {photographers.map(([name, photos]) => (
              <li key={name} className="border-t border-moss/10 pt-4">
                <p className="font-semibold text-moss">{name}</p>
                <ul className="mt-1 space-y-1">
                  {photos.map((photo) => (
                    <li key={photo.href}>
                      <a
                        href={photo.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw text-caption text-ink/85 hover:text-bronze"
                      >
                        {photo.alt}
                        <span className="sr-only"> (opens Unsplash in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </Dialog>
    </>
  );
}
