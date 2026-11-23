'use client';

import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion as tokens } from '@/theme/tokens';

type Phase = 'idle' | 'cover' | 'covered' | 'reveal';

interface TransitionApi {
  navigate: (href: string) => void;
  phase: Phase;
}

const TransitionContext = createContext<TransitionApi | null>(null);

export function usePageTransition(): TransitionApi {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('usePageTransition must be used inside <TransitionProvider>');
  return ctx;
}

/**
 * Page transitions in the opening's language: a forest-green curtain opens from
 * a slit across the middle, AZURE rises letter by letter over a growing
 * hairline, the App Router navigates underneath, then the name lifts away and
 * the curtain rises off the new page. About 1.3s in all; skipped entirely with reduced motion, modifier-clicks, same-page
 * hash links and browser back/forward (which keep native behaviour).
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const pendingHref = useRef<string | null>(null);
  const fallbackTimer = useRef<number | undefined>(undefined);
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    // The new route has rendered under the curtain: lift it.
    setSeenPath(pathname);
    if (phase === 'covered') setPhase('reveal');
  }
  const lastPath = useRef(pathname);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      const samePage = url.pathname === window.location.pathname;
      if (samePage || reduced || phase !== 'idle') {
        router.push(href as Route);
        return;
      }
      pendingHref.current = href;
      setPhase('cover');
    },
    [phase, reduced, router],
  );

  const onCovered = useCallback(() => {
    const href = pendingHref.current;
    pendingHref.current = null;
    setPhase('covered');
    if (href) router.push(href as Route);
    // If navigation stalls (network), never leave the curtain down.
    fallbackTimer.current = window.setTimeout(() => setPhase('reveal'), 2500);
  }, [router]);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    window.clearTimeout(fallbackTimer.current);
    // Move focus to the new page for keyboard and screen-reader users.
    window.requestAnimationFrame(() => {
      const main = document.getElementById('main-content');
      main?.focus({ preventScroll: true });
    });
  }, [pathname]);

  useEffect(() => () => window.clearTimeout(fallbackTimer.current), []);

  const api = useMemo(() => ({ navigate, phase }), [navigate, phase]);

  return (
    <MotionConfig reducedMotion="user" transition={{ ease: tokens.easeOutExpo, duration: 0.6 }}>
      <TransitionContext.Provider value={api}>
        {children}
        <AnimatePresence>
          {phase !== 'idle' && (
            <motion.div
              key="curtain"
              aria-hidden
              className="fixed inset-0 z-[90] flex items-center justify-center bg-forest text-white"
              initial={{ clipPath: 'inset(50% 0% 50% 0%)' }}
              animate={
                phase === 'reveal' ? { clipPath: 'inset(0% 0% 100% 0%)' } : { clipPath: 'inset(0% 0% 0% 0%)' }
              }
              transition={{ duration: phase === 'reveal' ? 0.75 : 0.55, ease: tokens.easeInOutQuart }}
              onAnimationComplete={() => {
                if (phase === 'cover') onCovered();
                else if (phase === 'reveal') setPhase('idle');
              }}
            >
              <span className="flex flex-col items-center">
                <span
                  className="flex overflow-hidden pb-[0.08em] font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-none tracking-[0.16em]"
                  style={{ marginRight: '-0.16em' }}
                >
                  {'AZURE'.split('').map((letter, index) => (
                    <motion.span
                      key={index}
                      className="inline-block"
                      initial={{ y: '115%' }}
                      animate={{ y: phase === 'reveal' ? '-115%' : '0%' }}
                      transition={{
                        duration: phase === 'reveal' ? 0.45 : 0.7,
                        delay: phase === 'reveal' ? index * 0.025 : 0.12 + index * 0.045,
                        ease: tokens.easeOutExpo,
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
                <motion.span
                  className="mt-5 block h-px w-28 origin-left bg-parchment/70"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: phase === 'reveal' ? 0 : 1, originX: phase === 'reveal' ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: tokens.easeInOutQuart }}
                />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </TransitionContext.Provider>
    </MotionConfig>
  );
}
