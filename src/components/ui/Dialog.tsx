'use client';

import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode, RefObject } from 'react';
import { cn } from '@/lib/utils';
import { motion as tokens } from '@/theme/tokens';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
  /** `sheet` = centred panel; `fullscreen` = edge to edge (mobile menu, lightbox). */
  variant?: 'sheet' | 'fullscreen';
  className?: string;
  overlayClassName?: string;
  initialFocus?: number | RefObject<HTMLElement | null>;
}

/**
 * Accessible modal built on Floating UI (focus trap, Escape, outside press,
 * scroll lock, focus return, role="dialog") with Framer Motion enter/exit.
 */
export function Dialog({
  open,
  onOpenChange,
  labelledBy,
  describedBy,
  children,
  variant = 'sheet',
  className,
  overlayClassName,
  initialFocus,
}: DialogProps) {
  const { refs, context } = useFloating({ open, onOpenChange });
  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' });
  const role = useRole(context, { role: 'dialog' });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  return (
    <FloatingPortal>
      <AnimatePresence>
        {open && (
          <FloatingOverlay
            data-lenis-prevent
            lockScroll
            className={cn(
              'z-[80] grid',
              variant === 'sheet' ? 'place-items-center bg-moss/55 p-3 backdrop-blur-[2px] md:p-8' : '',
              overlayClassName,
            )}
          >
            <motion.div
              className="contents"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <FloatingFocusManager context={context} initialFocus={initialFocus} returnFocus modal>
                <motion.div
                  // eslint-disable-next-line react-hooks/refs -- Floating UI callback ref (stable setter)
                  ref={refs.setFloating}
                  aria-modal="true"
                  {...getFloatingProps({ 'aria-labelledby': labelledBy, 'aria-describedby': describedBy })}
                  className={cn(
                    variant === 'sheet'
                      ? 'relative max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto bg-white shadow-float md:max-h-[calc(100dvh-4rem)]'
                      : 'fixed inset-0 overflow-y-auto',
                    className,
                  )}
                  initial={variant === 'sheet' ? { opacity: 0, y: 28, scale: 0.985 } : { opacity: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={variant === 'sheet' ? { opacity: 0, y: 16, scale: 0.99 } : { opacity: 0 }}
                  transition={{ duration: 0.5, ease: tokens.easeOutExpo }}
                >
                  {children}
                </motion.div>
              </FloatingFocusManager>
            </motion.div>
          </FloatingOverlay>
        )}
      </AnimatePresence>
    </FloatingPortal>
  );
}
