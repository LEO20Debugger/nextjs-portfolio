"use client";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Overlays the (already circular) avatar so the photo itself becomes the iris.
 * Deliberately unlabelled — no character or series name anywhere in the UI.
 */

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
  /** 0–1 charge while the user is holding, drawn as a filling ring. */
  holding: boolean;
  holdDuration: number;
};

const Sharingan = ({ active, holding, holdDuration }: Props) => {
  const reduceMotion = usePrefersReducedMotion();

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
            initial={{ opacity: 0, scale: 1.35 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-full"
          >
            {/* No mix-blend-mode anywhere in here: this wrapper animates
                opacity, which creates a stacking context and isolates blending
                from the photo below. The photo is tinted by a CSS filter on the
                <img> itself (see LeftPanel); these are plain alpha layers. */}

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
