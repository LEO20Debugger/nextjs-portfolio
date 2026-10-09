"use client";
import { emitEffect } from "@/utils/effects";
import { ThemeToggle } from "./theme-toggle";

const Footer = () => {
  return (
    <div className="flex items-center justify-center w-full pt-6 border-t border-neutral-100 dark:border-neutral-800">
      <div className="container flex items-center justify-between">
        <div className="text-xs text-neutral-500">
          Built by Leonard Chibueze Oba | ©{new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-3">
          {/* The backtick shortcut is keyboard-only, so there has to be a
              clickable way in as well — and it doubles as the hint that the
              shortcut exists at all. */}
          <button
            type="button"
            onClick={() => emitEffect("terminal", true)}
            aria-label="Open terminal"
            title="Open terminal"
            className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1 font-mono text-xs text-neutral-500 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-300 hover:text-neutral-900 hover:shadow-sm active:translate-y-0 dark:border-neutral-800 dark:hover:border-neutral-600 dark:hover:text-white"
          >
            <span className="text-emerald-500">{">_"}</span>
            terminal
            <kbd className="ml-0.5 hidden rounded border border-neutral-300 px-1 text-[10px] leading-[1.4] text-neutral-400 sm:inline dark:border-neutral-700 dark:text-neutral-500">
              `
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Footer;
