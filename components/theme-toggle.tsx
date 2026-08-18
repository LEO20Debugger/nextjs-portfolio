"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes can't know the resolved theme until after hydration; render a
  // fixed-size placeholder first so the footer doesn't shift when it settles.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={
        mounted
          ? `Switch to ${isDark ? "light" : "dark"} theme`
          : "Toggle theme"
      }
      className="relative inline-flex h-4 w-4 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
      onClick={() => setTheme(isDark ? "light" : "dark")}
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
