'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Component, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ensureGsap } from '@/animations/gsap';
import { cn } from '@/lib/utils';
import { useClientSnapshot } from '@/hooks/useClientSnapshot';
import { detectQuality, type QualitySettings } from './capabilities';

let cachedQuality: QualitySettings | null = null;
const readQuality = () => (cachedQuality ??= detectQuality());
import type { PointerState } from './components/WineGlass';

// Three.js, R3F and drei live in their own chunk, fetched only near the viewport.
const InstallationCanvas = dynamic(() => import('./InstallationCanvas'), { ssr: false });

const POSTER = '/images/installation/installation-1600.webp';
export const INSTALLATION_DESCRIPTION =
  'Rendering of a crystal glass of white wine on a dark oak table, with the candle-lit dining room softly out of focus behind it.';

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: unknown) {
    console.warn('[three] scene failed, showing static image', error);
    this.props.onError();
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

declare global {
  interface Window {
    __AZURE_INSTALLATION__?: { tier: string; state: string };
  }
}

type StageState = 'poster' | 'loading' | 'live' | 'fallback';

/**
 * Progressive 3D: the static rendering is the baseline (also the text
 * alternative and the reduced-motion / low-end / no-WebGL experience). The
 * live scene loads only when the section approaches the viewport and only on
 * capable devices, renders only while visible, and falls back to the static
 * image on context loss, sustained low frame rate, or any runtime error.
 */
export function InstallationStage({ className, sizes }: { className?: string; sizes: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const pointer = useRef<PointerState>({ x: 0, y: 0 });
  const quality = useClientSnapshot<QualitySettings | null>(readQuality, null);
  const [state, setState] = useState<StageState>('poster');
  const [active, setActive] = useState(false);

  // Expose the decision for diagnostics and E2E tests.
  useEffect(() => {
    if (quality) window.__AZURE_INSTALLATION__ = { tier: quality.tier, state };
  }, [quality, state]);

  // Load when near, render only while visible.
  useEffect(() => {
    const el = frame.current;
    if (!el || !quality || quality.tier === 'static') return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState((s) => (s === 'poster' ? 'loading' : s));
          near.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    const visible = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)), {
      rootMargin: '80px 0px',
    });
    near.observe(el);
    visible.observe(el);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, [quality]);

  // GSAP ScrollTrigger drives the camera's slow drift around the glass as the section scrolls past.
  useEffect(() => {
    const el = frame.current;
    if (!el || !quality || quality.tier === 'static') return;
    const { ScrollTrigger } = ensureGsap();
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });
    return () => trigger.kill();
  }, [quality]);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
    };
  }

  const showCanvas = quality && quality.tier !== 'static' && (state === 'loading' || state === 'live');

  return (
    <div
      ref={frame}
      role="img"
      aria-label={INSTALLATION_DESCRIPTION}
      data-installation-state={state}
      data-installation-tier={quality?.tier ?? 'pending'}
      onPointerMove={onPointerMove}
      onPointerLeave={() => (pointer.current = { x: 0, y: 0 })}
      className={cn('relative overflow-hidden bg-forest', className)}
    >
      <Image
        src={POSTER}
        alt=""
        fill
        sizes={sizes}
        className={cn(
          'object-cover transition-opacity duration-1000 ease-(--ease-out-quart)',
          state === 'live' ? 'opacity-0' : 'opacity-100',
        )}
      />
      {showCanvas && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-(--ease-out-quart)',
            state === 'live' ? 'opacity-100' : 'opacity-0',
          )}
        >
          <SceneBoundary onError={() => setState('fallback')}>
            <InstallationCanvas
              quality={quality}
              active={active || quality.capture}
              progress={progress}
              pointer={pointer}
              onReady={() => setState('live')}
              onFailure={() => setState('fallback')}
            />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
