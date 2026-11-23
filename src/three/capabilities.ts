'use client';

export type QualityTier = 'high' | 'medium' | 'static';

export interface QualitySettings {
  tier: QualityTier;
  dpr: [number, number];
  /** Refraction samples and buffer size for the crystal glass. */
  samples: number;
  resolution: number;
  /** Mirror-like reflection of the glass in the lacquered table (extra render pass). */
  reflector: boolean;
  antialias: boolean;
  envResolution: number;
  /** Fixed pose, no idle motion — used to render the static fallback image. */
  capture: boolean;
}

type Override = 'on' | 'off' | 'capture' | null;

function override(): Override {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('three');
  return value === 'on' || value === 'off' || value === 'capture' ? value : null;
}

/**
 * WebGL support check. `failIfMajorPerformanceCaveat` rejects software
 * rasterisers (e.g. SwiftShader on machines without a usable GPU), which would
 * render transmission at a few frames per second.
 */
export function webglStatus(): 'gpu' | 'software' | 'none' {
  try {
    const canvas = document.createElement('canvas');
    const strict = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    if (strict) {
      strict.getExtension('WEBGL_lose_context')?.loseContext();
      return 'gpu';
    }
    const relaxed = document.createElement('canvas').getContext('webgl2');
    if (relaxed) {
      relaxed.getExtension('WEBGL_lose_context')?.loseContext();
      return 'software';
    }
    return 'none';
  } catch {
    return 'none';
  }
}

interface NavigatorHints {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

export function detectQuality(): QualitySettings {
  const mode = override();
  const high: QualitySettings = {
    tier: 'high',
    dpr: [1, 2],
    samples: 8,
    resolution: 1024,
    reflector: true,
    antialias: true,
    envResolution: 256,
    capture: false,
  };
  const medium: QualitySettings = {
    tier: 'medium',
    dpr: [1, 1.5],
    samples: 6,
    resolution: 512,
    reflector: false,
    antialias: false,
    envResolution: 128,
    capture: false,
  };
  const off: QualitySettings = { ...medium, tier: 'static' };

  if (mode === 'off') return off;
  const gl = webglStatus();
  if (gl === 'none') return off;
  if (mode === 'capture') return { ...high, dpr: [2, 2], capture: true };
  if (mode === 'on') return gl === 'gpu' ? high : medium;

  if (gl === 'software') return off;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return off;

  const nav = navigator as Navigator & NavigatorHints;
  if (nav.connection?.saveData) return off;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  if (cores <= 2 || memory < 2) return off;

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 768;
  // Phones only get the live scene when they are clearly capable: otherwise the
  // ~1 MB Three.js chunk and transmission rendering cost more than they add.
  if (coarse && narrow && (cores < 6 || memory < 4)) return off;
  if (coarse || narrow || cores <= 4 || memory <= 4) return medium;
  return high;
}
