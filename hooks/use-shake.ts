"use client";
import { useEffect, useRef } from "react";

/**
 * Fires when the device is shaken.
 *
 * iOS 13+ gates motion sensors behind DeviceMotionEvent.requestPermission(),
 * which only works inside a user gesture — so this hook never prompts on its
 * own. Call `requestMotionPermission()` from a real interaction (we hang it off
 * the avatar hold) and shake becomes available from then on. Android and
 * desktop need no permission and just work.
 */
export function useShake(onShake: () => void, threshold = 22, cooldown = 2500) {
  const lastFired = useRef(0);
  const last = useRef<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) return;

    const handler = (event: DeviceMotionEvent) => {
      const a = event.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;

      const prev = last.current;
      last.current = { x: a.x, y: a.y, z: a.z };
      if (!prev) return;

      // Sum of per-axis change: a real shake spikes far above normal handling.
      const delta =
        Math.abs(a.x - prev.x) + Math.abs(a.y - prev.y) + Math.abs(a.z - prev.z);

      const now = Date.now();
      if (delta > threshold && now - lastFired.current > cooldown) {
        lastFired.current = now;
        onShake();
      }
    };

    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, [onShake, threshold, cooldown]);
}

/** Safe to call anywhere; resolves false where no permission gate exists. */
export async function requestMotionPermission() {
  const DME = (globalThis as any).DeviceMotionEvent;
  if (typeof DME?.requestPermission !== "function") return false;
  try {
    return (await DME.requestPermission()) === "granted";
  } catch {
    return false;
  }
}
