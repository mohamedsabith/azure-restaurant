'use client';

import { useSyncExternalStore } from 'react';

const subscribeNever = () => () => {};

/**
 * Read a browser-only value without a hydration mismatch or a setState-in-effect:
 * the server snapshot is used while hydrating, then React re-renders with the
 * client value. `getSnapshot` must return a primitive or a cached object.
 */
export function useClientSnapshot<T>(getSnapshot: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribeNever, getSnapshot, () => serverValue);
}
