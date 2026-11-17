"use client";

import { isMuted, onMuteChange, setMuted } from "@/utils/bird-sound";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Mutes the birds. Nothing else on the page makes a sound, so the label says
 * so outright rather than implying the whole site has audio.
 */
export function SoundToggle() {
  // Stored state can't be read until after hydration; render the placeholder
  // at a fixed size first so the footer doesn't shift when it settles.
  const [mounted, setMounted] = useState(false);
  const [off, setOff] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOff(isMuted());
    return onMuteChange(setOff);
  }, []);

  return (
    <button
      type="button"
      aria-label={off ? "Unmute bird sounds" : "Mute bird sounds"}
      aria-pressed={off}
      title={off ? "Birds muted" : "Mute birds"}
      className="relative inline-flex h-4 w-4 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
      onClick={() => setMuted(!off)}
    >
      {mounted && (
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={off ? "off" : "on"}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="inline-flex"
          >
            {off ? <VolumeX size="16" /> : <Volume2 size="16" />}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
