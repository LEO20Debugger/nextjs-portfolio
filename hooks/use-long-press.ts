"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Press-and-hold detection that works with a mouse or a thumb.
 *
 * `holding` flips twice per gesture rather than ticking every frame — the
 * charge ring is animated by a CSS transition of the same duration, so the
 * progress indicator costs no renders at all.
 */
export function useLongPress(onLongPress: () => void, duration = 1000) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set when the hold completes, so the click that follows pointerup doesn't
  // also register with whatever click handler the element already has.
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }, []);

  useEffect(() => clear, [clear]);

  const start = useCallback(
    (event: React.PointerEvent) => {
      // Ignore right/middle click, and don't start a second timer on re-entry.
      if (event.button !== 0 || timer.current) return;
      firedRef.current = false;
      setHolding(true);
      timer.current = setTimeout(() => {
        firedRef.current = true;
        clear();
        onLongPress();
      }, duration);
    },
    [clear, duration, onLongPress]
  );

  return {
    holding,
    /** True if the last gesture completed a hold — use it to swallow the click. */
    consumeFired: () => {
      const fired = firedRef.current;
      firedRef.current = false;
      return fired;
    },
    handlers: {
      onPointerDown: start,
      onPointerUp: clear,
      onPointerLeave: clear,
      onPointerCancel: clear,
    },
  };
}
