"use client";

import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

/** The page's two ground colours, matching `globals.css`. */
const PAGE_BG = { dark: "#0a0a0a", light: "#ffffff" };

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  // next-themes can't know the resolved theme until after hydration; render a
  // fixed-size placeholder first so the footer doesn't shift when it settles.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  /**
   * Applies the theme. next-themes sets the class from an effect, which
   * `flushSync` does not reach, so it is set here too — the provider lands on
   * the same value a moment later, making that a no-op rather than a fight.
   */
  const apply = (next: "dark" | "light") => {
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
  };

  /**
   * Three ways in, softest first:
   *
   *  - View Transitions: the new theme opens as a circle out of the button,
   *    so the change has a visible origin.
   *  - Anywhere else (Firefox, older Safari): a veil of the outgoing page
   *    colour fades off the top. Done by hand rather than with a CSS
   *    transition, because the provider's `disableTransitionOnChange` would
   *    switch a transition off at exactly the wrong moment.
   *  - Reduced motion: straight swap.
   */
  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark";
    const doc = document as ViewTransitionDocument;

    if (reduceMotion) {
      apply(next);
      return;
    }

    if (typeof doc.startViewTransition !== "function") {
      const veil = document.createElement("div");
      veil.style.cssText = `position:fixed;inset:0;z-index:9999;pointer-events:none;background:${
        isDark ? PAGE_BG.dark : PAGE_BG.light
      }`;
      document.body.appendChild(veil);
      apply(next);
      veil
        .animate({ opacity: [1, 0] }, { duration: 380, easing: "ease-out" })
        .addEventListener("finish", () => veil.remove());
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    // Radius that still covers the furthest corner from the button.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      flushSync(() => apply(next));
    });

    transition.ready.then(() => {
      const root = document.documentElement;
      const options = {
        duration: 620,
        // Quint ease-out: quick to commit, long and soft to settle.
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      } as const;

      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        options
      );
      // Takes the hard edge off the leading rim of the circle: without it the
      // boundary between the two themes is a razor line sweeping the page.
      root.animate({ opacity: [0, 1] }, { ...options, duration: 220 });
    });
  };

  return (
    <button
      type="button"
      aria-label={
        mounted
          ? `Switch to ${isDark ? "light" : "dark"} theme`
          : "Toggle theme"
      }
      className="relative inline-flex h-4 w-4 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
      onClick={toggle}
    >
      {mounted && (
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="inline-flex"
          >
            {isDark ? <Moon size="16" /> : <Sun size="16" />}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
