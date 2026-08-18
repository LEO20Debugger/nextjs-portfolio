"use client";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const CARD_W = 320;
const CARD_H = 180;
const MARGIN = 16;
const CURSOR_GAP = 24;

/**
 * Places the card beside the cursor, flipping to its left when there isn't
 * room on the right, then clamps into the viewport so a project near an edge
 * never pushes the preview off-screen.
 */
function place(cx: number, cy: number) {
  const flip = cx > window.innerWidth - CARD_W - CURSOR_GAP - MARGIN;
  const rawX = flip ? cx - CARD_W - CURSOR_GAP : cx + CURSOR_GAP;
  const rawY = cy - CARD_H / 2;

  return {
    x: Math.min(Math.max(rawX, MARGIN), window.innerWidth - CARD_W - MARGIN),
    y: Math.min(Math.max(rawY, MARGIN), window.innerHeight - CARD_H - MARGIN),
  };
}

type Props = {
  image: StaticImageData;
  title: string;
  active: boolean;
  /** Cursor position captured on pointerenter, so the card appears in place. */
  origin: { x: number; y: number } | null;
};

const ProjectPreview = ({ image, title, active, origin }: Props) => {
  const reduceMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  // Defer the image until the browser is idle: keeps it off the critical path
  // but loads it long before anyone can hover, so there's no first-hover flash.
  const [ready, setReady] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 30, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 320, damping: 30, mass: 0.6 });

  // Lag between the raw pointer and the trailing card reads as horizontal
  // tilt — this is what makes the card feel physical rather than glued on.
  const rotate = useTransform(
    [x, springX] as any,
    ([targetX, currentX]: number[]) =>
      Math.max(-7, Math.min(7, (targetX - currentX) * 0.12))
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;

    if (ric) {
      const handle = ric(() => setReady(true), { timeout: 3000 });
      return () => (window as any).cancelIdleCallback?.(handle);
    }

    const handle = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(handle);
  }, []);

  // Jump (don't animate) to the entry point, so the card fades in where the
  // cursor already is instead of swooping across from the last hovered card.
  useEffect(() => {
    if (!active || !origin) return;
    const { x: px, y: py } = place(origin.x, origin.y);
    x.set(px);
    y.set(py);
    springX.set(px);
    springY.set(py);
  }, [active, origin, x, y, springX, springY]);

  useEffect(() => {
    if (!active) return;

    const onMove = (e: PointerEvent) => {
      const { x: px, y: py } = place(e.clientX, e.clientY);
      x.set(px);
      y.set(py);
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [active, x, y]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      aria-hidden
      style={{
        x: reduceMotion ? x : springX,
        y: reduceMotion ? y : springY,
        rotate: reduceMotion ? 0 : rotate,
        width: CARD_W,
        height: CARD_H,
      }}
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        scale: active ? 1 : 0.92,
      }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
      className="fixed left-0 top-0 z-50 overflow-hidden pointer-events-none rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
    >
      {ready && (
        <Image
          src={image}
          alt=""
          width={CARD_W}
          height={CARD_H}
          sizes={`${CARD_W}px`}
          placeholder="blur"
          className="h-full w-full object-cover object-top"
        />
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-xs font-medium text-white">
        {title}
      </span>
    </motion.div>,
    document.body
  );
};

export default ProjectPreview;
