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

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  // next-themes can't know the resolved theme until after hydration; render a
  // fixed-size placeholder first so the footer doesn't shift when it settles.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  /**
   * The new theme is revealed by a circle growing out of the button rather
   * than appearing all at once, which is the one place on the page where a
   * showy transition earns itself: it shows where the change came from.
   *
   * Falls back to a plain switch without View Transitions (Firefox, older
   * Safari) and whenever reduced motion is asked for.
   */
  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark";
    const doc = document as ViewTransitionDocument;

    if (reduceMotion || typeof doc.startViewTransition !== "function") {
      setTheme(next);
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
      flushSync(() => {
        // next-themes applies the class from an effect, which `flushSync`
        // does not reach — so set it here as well. The provider lands on the
        // same value a moment later, making this a no-op rather than a fight.
        document.documentElement.classList.toggle("dark", next === "dark");
        setTheme(next);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 450,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
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
