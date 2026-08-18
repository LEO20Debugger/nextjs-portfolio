"use client";
import { cn } from "@/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

const variants = cva(
  "shadow-grid rounded-3xl bg-white dark:bg-neutral-900 flex flex-col justify-center @container border border-neutral-100 dark:border-neutral-800",
  {
    variants: {
      size: {
        "1x2": "md:col-span-1 col-span-2 row-span-2 md:p-8 p-4",
        // Project cards. Taller on touch devices, where the card carries a
        // visible preview thumbnail — gated on the same hover query as the
        // thumbnail itself so the two can never disagree about the layout.
        "2x1":
          "md:col-span-2 col-span-full row-span-3 [@media(hover:hover)_and_(pointer:fine)]:row-span-1 py-4 md:px-8 px-4",
        "2x2": "md:col-span-2 col-span-full row-span-2 md:p-8 p-4",
        "2x4":
          "md:col-span-2 col-span-full row-span-4 relative overflow-hidden",
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
} & VariantProps<typeof variants>;

const GridItem = ({ size, children, index = 0 }: GridItemProps) => {
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
      className={cn(
        variants({
          size,
          className:
            "transition-[background-color,box-shadow,border-color] duration-200 ease-out hover:bg-neutral-50 hover:shadow-grid-hover hover:border-neutral-200 dark:hover:bg-neutral-800 dark:hover:border-neutral-700",
        })
      )}
    >
      {children}
    </motion.div>
  );
};

export default GridItem;
