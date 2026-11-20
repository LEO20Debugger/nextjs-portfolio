"use client";
import PerchBird from "@/components/perch-bird";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { useCallback, useRef } from "react";

const variants = cva(
  // `group` drives the spotlight, `isolate` contains it: the highlight sits on
  // a negative z-index so it paints over the card's background but under its
  // text, and without a stacking context of its own it would fall through to
  // the page behind the card instead.
  "group isolate shadow-grid rounded-3xl bg-white dark:bg-neutral-900 flex flex-col justify-center @container border border-neutral-100 dark:border-neutral-800",
  {
    variants: {
      size: {
        "1x2": "md:col-span-3 col-span-6 row-span-2 md:p-8 p-4",
        // Project cards — one media layout on every device now, so the row
        // span no longer forks on whether the pointer can hover.
        //
        // At 2xl they drop to a third of the grid so three sit per row, and
        // the padding stays tight: on a 328px card every extra pixel of it
        // comes straight out of the screenshot.
        "2x1": "md:col-span-6 col-span-full 2xl:col-span-4 row-span-3 p-4",
        "2x2": "md:col-span-6 col-span-full row-span-2 md:p-8 p-4",
        "2x4":
          "md:col-span-6 col-span-full row-span-4 relative overflow-hidden",
        // Taller on phones: nine tech chips in a two-row-high card is far too
        // dense, so they spend the whole time shoving each other around.
        "4x2":
          "col-span-full row-span-3 md:row-span-2 relative overflow-hidden",
      },
    },
    defaultVariants: {
      size: "1x2",
    },
  }
);

/**
 * Drives the entry reveal, triggered per-card as it scrolls into view rather
 * than all at once on mount. On mobile nearly every card starts below the
 * fold, so a mount-triggered stagger would finish off-screen and you'd scroll
 * down to an already-settled page.
 *
 * `custom` is the card's index; the small modulo delay keeps a stagger for
 * cards that enter together without penalising ones deep down the page.
 */
export const gridItemMotion = {
  hidden: { scale: 0.2, y: 120, opacity: 0 },
  show: (index: number = 0) => ({
    scale: 1,
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 330,
      damping: 35,
      delay: (index % 3) * 0.05,
    },
  }),
};

/** Shared so the grid and the trailing CTA reveal on the same terms. */
export const gridItemViewport = { once: true, amount: 0.15 } as const;

export type GridItemProps = {
  children: React.ReactNode;
  /** Position in the grid, used to stagger cards that enter together. */
  index?: number;
  /** How many birds perch on this card's top edge. */
  birds?: number;
} & VariantProps<typeof variants>;

const GridItem = ({ size, children, index = 0, birds = 0 }: GridItemProps) => {
  const reduceMotion = usePrefersReducedMotion();
  const spotlightRef = useRef<HTMLDivElement>(null);

  // The highlight's centre is written straight to the node's style. Putting
  // pointer coordinates through React state would re-render the card — and
  // its bird layer — on every mouse move.
  const handleMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const node = spotlightRef.current;
    if (!node) return;
    const r = e.currentTarget.getBoundingClientRect();
    // Percentages, not pixels: the card is scaled while hovered, and a ratio
    // of the (scaled) box still lands on the right spot inside it.
    node.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    node.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  return (
    <motion.div
      variants={gridItemMotion}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={gridItemViewport}
      whileHover={{ y: -4, scale: 1.012 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      onPointerMove={reduceMotion ? undefined : handleMove}
      className={cn(
        variants({
          size,
          className:
            "relative transition-[background-color,box-shadow,border-color] duration-200 ease-out hover:bg-neutral-50 hover:shadow-grid-hover hover:border-neutral-200 dark:hover:bg-neutral-800 dark:hover:border-neutral-700",
        })
      )}
    >
      {!reduceMotion && (
        <div
          ref={spotlightRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(97, 120, 241, 0.16), transparent 72%)",
          }}
        />
      )}
      {birds > 0 && <PerchBird count={birds} />}
      {children}
    </motion.div>
  );
};

export default GridItem;
