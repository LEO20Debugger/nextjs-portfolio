"use client";
import { useEffect, useState } from "react";

/**
 * Subscribes to a media query. Always returns `false` on the server and on the
 * first client render so markup matches and hydration stays quiet — callers
 * should treat `false` as "not yet known" and degrade to the safe branch.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True only for devices with a real hovering cursor — excludes touch. */
export const useHasHover = () =>
  useMediaQuery("(hover: hover) and (pointer: fine)");

export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");
