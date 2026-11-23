'use client';

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  safePolygon,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Tooltip on Floating UI (Popper's maintained successor): positions with
 * flip/shift, opens on hover AND keyboard focus, closes on Escape, and is
 * exposed as role="tooltip" via aria-describedby. The trigger must convey
 * the same meaning on its own (visually hidden text) for touch users.
 */
export function Tooltip({ content, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top',
    middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, {
    move: false,
    delay: { open: 120, close: 60 },
    handleClose: safePolygon(),
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <>
      <span
        ref={refs.setReference}
        tabIndex={0}
        className={cn('inline-flex cursor-help rounded-xs', className)}
        {...getReferenceProps()}
      >
        {children}
      </span>
      <FloatingPortal>
        <AnimatePresence>
          {open && (
            // eslint-disable-next-line react-hooks/refs -- Floating UI callback ref
            <div ref={refs.setFloating} style={floatingStyles} className="z-[95]" {...getFloatingProps()}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.18 }}
                className="max-w-64 bg-moss px-3 py-2 text-caption text-white shadow-float"
              >
                {content}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
}
