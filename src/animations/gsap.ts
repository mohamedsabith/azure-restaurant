'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * GSAP is the motion system for timelines and scroll storytelling
 * (intro, hero, reveals, parallax, 3D scroll coupling). Component-state
 * transitions (menus, dialogs, filters, page curtain) use Framer Motion.
 */
let registered = false;

export function ensureGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    gsap.defaults({ ease: 'expo.out', duration: 1.1 });
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  return { gsap, ScrollTrigger, SplitText };
}

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
