"use client";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Overlays the (already circular) avatar so the photo itself becomes the iris.
 * Deliberately unlabelled — no character or series name anywhere in the UI.
 */

type LidStage = "shut" | "open" | "blink";

/** Vertical aperture of the lid, as a scaleY factor. */
const LID_APERTURE: Record<LidStage, number> = {
  shut: 0,
  open: 1,
  blink: 0.12,
};

/**
 * A tear of blood welling under the iris and running to the jaw. Two trails of
 * different lengths and timings — a single centred drip reads as a mistake.
 */
const BloodTear = ({ durationMs }: { durationMs: number }) => {
  const seconds = durationMs / 1000;

  return (
    // viewBox runs to 180 while the avatar occupies 0–100: the tear starts at
    // the lower lid and escapes the circle, running onto the page below.
    // h-[180%] so one viewBox unit still equals one avatar unit: at h-full the
    // 180-tall box would be squashed into the circle and the tear would never
    // leave it.
    <svg
      viewBox="0 0 100 180"
      className="absolute left-0 top-0 h-[180%] w-full overflow-visible"
    >
      {[
        { d: "M50,74 C52,96 53.5,124 51,164", width: 3.4, delay: 0.16 },
        { d: "M43,78 C42,94 41.5,108 42.5,124", width: 2, delay: 0.3 },
      ].map((trail, i) => (
        <motion.path
          key={i}
          d={trail.d}
          fill="none"
          stroke="#6d0410"
          strokeWidth={trail.width}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 0.95, 0.95, 0] }}
          transition={{
            duration: seconds,
            times: [0, trail.delay, trail.delay + 0.3, 1],
            ease: "easeOut",
          }}
        />
      ))}

      {/* The bead at the head of the main trail. */}
      <motion.circle
        r="3.8"
        cx="51"
        fill="#8a0714"
        initial={{ opacity: 0, cy: 74 }}
        animate={{ opacity: [0, 1, 1, 0], cy: [74, 76, 164, 164] }}
        transition={{ duration: seconds, times: [0, 0.16, 0.5, 0.66], ease: "easeIn" }}
      />
    </svg>
  );
};

/**
 * One comma-shaped tomoe: a round head plus a tapering tail. Drawn as two
 * filled shapes in the same colour so they read as a single comma — far more
 * robust than trying to describe the whole silhouette in one path.
 */
const Tomoe = ({ angle, radius }: { angle: number; radius: number }) => (
  <g transform={`rotate(${angle}) translate(0 -${radius})`} fill="#0b0b0b">
    <circle cx="0" cy="0" r="4.6" />
    <path d="M3.1,-3.4 C8.4,-7.5 13.6,-5.1 12.3,0.7 C11.4,4.7 8.5,7.3 5.3,8.3 C8.5,4.7 9.1,0.5 6.6,-1.9 C5.6,-2.8 4.3,-3.3 3.1,-3.4 Z" />
  </g>
);

/**
 * Only the geometry — no iris fill. The red tinting happens in sibling layers
 * *underneath* this SVG, so the pupil and tomoe stay genuinely black instead of
 * being lifted to dark red by the pulse blending over them.
 */
const SharinganEye = ({ spin }: { spin: boolean }) => (
  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
    <circle cx="50" cy="50" r="47" fill="none" stroke="#2b0409" strokeWidth="5" />

    <motion.g
      style={{ originX: "50px", originY: "50px" }}
      animate={spin ? { rotate: 360 } : { rotate: 0 }}
      transition={
        spin ? { duration: 3.2, ease: "linear", repeat: Infinity } : undefined
      }
    >
      <g transform="translate(50 50)">
        <Tomoe angle={0} radius={27} />
        <Tomoe angle={120} radius={27} />
        <Tomoe angle={240} radius={27} />
      </g>
    </motion.g>

    <circle cx="50" cy="50" r="11" fill="#0b0b0b" />
    <circle cx="46" cy="45" r="3.2" fill="#ffffff" opacity={0.3} />
  </svg>
);

type Props = {
  active: boolean;
  /** True while the user is holding, drawn as a filling ring. */
  holding: boolean;
  holdDuration: number;
  /** Must match the caller's dismiss timer — the lids close on its last frame. */
  durationMs: number;
};

const Sharingan = ({ active, holding, holdDuration, durationMs }: Props) => {
  const reduceMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState<LidStage>("shut");

  // Four state changes across the whole reveal — the lid animation itself is
  // handled by the compositor, not by re-rendering.
  useEffect(() => {
    if (!active) {
      setStage("shut");
      return;
    }
    const blinkAt = durationMs * 0.5;
    const timers = [
      setTimeout(() => setStage("open"), 60),
      setTimeout(() => setStage("blink"), blinkAt),
      setTimeout(() => setStage("open"), blinkAt + 220),
      setTimeout(() => setStage("shut"), durationMs - 430),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active, durationMs]);


  return (
    <>
      {/* Charge ring — pure CSS transition, so holding costs no re-renders. */}
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className="pointer-events-none absolute -inset-1 z-20 -rotate-90"
        style={{ opacity: holding ? 1 : 0, transition: "opacity 150ms ease-out" }}
      >
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="#e11d48"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          style={{
            strokeDashoffset: holding ? 0 : 1,
            transition: holding
              ? `stroke-dashoffset ${holdDuration}ms linear`
              : "none",
          }}
        />
      </svg>

      <AnimatePresence>
        {active && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-full"
          >
            {/* No mix-blend-mode anywhere in here: this wrapper animates
                opacity, which creates a stacking context and isolates blending
                from the photo below. The photo is tinted by a CSS filter on the
                <img> itself (see LeftPanel); these are plain alpha layers. */}

            {/* The eyelid.
                NOT clip-path: framer-motion 10 animates clip-path exactly once
                and then ignores later changes — verified by instrumenting the
                stage machine, which cycled correctly while the aperture stayed
                pinned at 50%. scaleY is a transform, so it re-animates every
                time, and the vertical squash is how a real eye opens anyway. */}
            <motion.div
              className="absolute inset-0 origin-center"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: reduceMotion ? 1 : LID_APERTURE[stage] }}
              transition={{
                duration: reduceMotion ? 0 : stage === "blink" ? 0.1 : 0.4,
                ease: "easeOut",
              }}
            >
            {/* 1. Iris depth — darkens toward the limbus. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(255,60,60,0.30) 0%, rgba(150,8,20,0.45) 62%, rgba(60,3,8,0.75) 100%)",
              }}
            />
            {/* 2. The pulse, breathing beneath the geometry. */}
            {!reduceMotion && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(255,70,70,0.55) 0%, rgba(200,15,30,0.25) 60%, rgba(0,0,0,0) 100%)",
                }}
                animate={{ opacity: [0.2, 0.75, 0.2] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {/* 3. Crisp black geometry on top of all the tinting. */}
            <SharinganEye spin={!reduceMotion} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blood tear. Deliberately a sibling of the clipped iris wrapper: inside
          it, the rounded-full clip would shear the tear off at the avatar's
          edge instead of letting it run down onto the page. */}
      <AnimatePresence>
        {active && !reduceMotion && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-0 z-[15]"
          >
            <BloodTear durationMs={durationMs} /></motion.div>
        )}
      </AnimatePresence>

      {/* Glow bleeding past the avatar. Sits outside the clipped circle, which
          is why the button itself must not be overflow-hidden. */}
      <AnimatePresence>
        {active && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            animate={
              reduceMotion
                ? { opacity: 0.7 }
                : { opacity: [0.45, 1, 0.45], scale: [1, 1.06, 1] }
            }
            exit={{ opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.3, repeat: Infinity, ease: "easeInOut" }
            }
            className="pointer-events-none absolute inset-0 -z-10 rounded-full"
            style={{
              boxShadow:
                "0 0 28px 10px rgba(225,29,48,0.55), 0 0 70px 26px rgba(190,10,25,0.32)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sharingan;
