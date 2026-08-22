"use client";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { useShake } from "@/hooks/use-shake";
import { emitEffect, onEffect } from "@/utils/effects";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

/** Jagged bolt paths across a 1000x1000 viewBox, generated once at module load. */
function makeBolt(seed: number) {
  let value = seed;
  const random = () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };

  const startX = 100 + random() * 800;
  let x = startX;
  let y = 0;
  const points = [`${x},${y}`];

  while (y < 1000) {
    y += 60 + random() * 90;
    x += (random() - 0.5) * 260;
    points.push(`${Math.max(0, Math.min(1000, x))},${Math.min(1000, y)}`);
  }
  return points.join(" ");
}

const BOLTS = [makeBolt(7), makeBolt(23), makeBolt(91), makeBolt(150)];

const EffectsOverlay = () => {
  const reduceMotion = usePrefersReducedMotion();
  const [sharingan, setSharingan] = useState(false);
  const [chidori, setChidori] = useState(false);

  useEffect(() => onEffect("sharingan", (d) => setSharingan(d.active)), []);

  const fireChidori = useCallback(() => {
    setChidori(true);
    emitEffect("chidori", true);
    setTimeout(() => {
      setChidori(false);
      emitEffect("chidori", false);
    }, 1600);
  }, []);

  useEffect(() => onEffect("chidori", (d) => d.active && setChidori(true)), []);
  useShake(fireChidori);

  return (
    <>
      {/* Red atmosphere — vignette only, so the centre of the page stays legible. */}
      <AnimatePresence>
        {sharingan && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-40"
            style={{
              // A bloom local to the avatar plus a true edge vignette — the
              // centre of the page stays clear so text never goes pink.
              background:
                "radial-gradient(circle at 7% 11%, rgba(220,25,40,0.30) 0%, rgba(150,8,20,0.12) 22%, rgba(0,0,0,0) 46%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 42%, rgba(110,0,12,0.34) 100%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Chidori */}
      <AnimatePresence>
        {chidori && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none fixed inset-0 z-40"
          >
            <motion.div
              className="absolute inset-0 bg-sky-100"
              initial={{ opacity: 0 }}
              animate={
                reduceMotion ? { opacity: 0.12 } : { opacity: [0, 0.55, 0, 0.3, 0] }
              }
              transition={{ duration: reduceMotion ? 0 : 0.9, times: [0, 0.08, 0.2, 0.3, 1] }}
            />
            <svg
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              {BOLTS.map((points, i) => (
                <motion.polyline
                  key={i}
                  points={points}
                  fill="none"
                  stroke="#bae6fd"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 0 6px #38bdf8)" }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={
                    reduceMotion
                      ? { pathLength: 1, opacity: 0.7 }
                      : { pathLength: [0, 1, 1], opacity: [0, 1, 0] }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 1.1,
                    delay: reduceMotion ? 0 : i * 0.08,
                    ease: "easeOut",
                  }}
                />
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EffectsOverlay;
