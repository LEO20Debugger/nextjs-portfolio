"use client";
import BackendEasterEgg from "@/components/backend-easter-egg";
import PerchBird from "@/components/perch-bird";
import { siteConfig } from "@/config/site-config";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { FileText, Mail, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import Footer from "./footer";

/**
 * The rail used to appear fully formed while the grid beside it sprang in,
 * which on desktop — where both are above the fold — read as the left half
 * having failed to load. It now introduces itself top to bottom.
 */
const heroStagger = {
  hidden: {},
  show: { transition: { delayChildren: 0.05, staggerChildren: 0.07 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 30 },
  },
};

/** How far the portrait leans towards the cursor, in degrees. */
const TILT = 12;

const LeftPanel = () => {
  const [clickCount, setClickCount] = useState(0);
  const [trigger, setTrigger] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  const tiltX = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });

  const handleAvatarMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (reduceMotion) return;
      const r = e.currentTarget.getBoundingClientRect();
      // -0.5 … 0.5 from the centre of the portrait.
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tiltY.set(nx * TILT * 2);
      tiltX.set(-ny * TILT * 2);
    },
    [reduceMotion, tiltX, tiltY]
  );

  const handleAvatarLeave = useCallback(() => {
    tiltX.set(0);
    tiltY.set(0);
  }, [tiltX, tiltY]);

  const handleAvatarClick = () => {
    const next = clickCount + 1;
    setClickCount(next);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setClickCount(0), 2000);

    if (next >= 5) {
      setTrigger((t) => t + 1);
      setClickCount(0);
    }
  };

  return (
    <div
      key="left-panel"
      className="flex flex-col py-6 xl:max-w-md xl:py-10 xl:h-screen xl:sticky xl:top-0 shrink-0"
    >
      <BackendEasterEgg trigger={trigger} />
      {/* Top Container. On desktop the panel is a full-height sticky rail, so
          this takes the slack and centres itself in it — left at its natural
          height the hero sat in the top half with ~400px of dead column under
          it. `min-h-0` keeps it shrinking rather than overflowing the rail on
          short laptop screens. */}
      <motion.div
        variants={heroStagger}
        initial={reduceMotion ? "show" : "hidden"}
        animate="show"
        className="xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:justify-center"
      >
        <motion.button
          variants={heroItem}
          type="button"
          onClick={handleAvatarClick}
          onPointerMove={handleAvatarMove}
          onPointerLeave={handleAvatarLeave}
          aria-label={`Portrait of ${siteConfig.creator}.`}
          className="group relative cursor-pointer select-none w-fit rounded-full block ring-offset-4 ring-offset-white dark:ring-offset-neutral-950 transition-shadow hover:shadow-grid-hover"
          style={{ perspective: 600 }}
          title={clickCount >= 2 ? `${5 - clickCount} more...` : undefined}
        >
          {/* The lean lives on a wrapper rather than on the portrait itself:
              the image already owns a CSS `transform` for the press and hover
              scale, and two transforms on one element overwrite each other. */}
          <motion.div
            style={{ rotateX: tiltX, rotateY: tiltY }}
            className="rounded-full"
          >
            <Image
              priority
              loading="eager"
              alt={siteConfig.creator}
              placeholder="blur"
              src="/Leonard.jpeg"
              width={120}
              height={120}
              blurDataURL="/Leonard.jpeg"
              draggable={false}
              className={`h-[120px] w-[120px] rounded-full pointer-events-none select-none transition-transform duration-150 ease-out ${
                clickCount > 0
                  ? "scale-95"
                  : "scale-100 group-hover:scale-[1.03]"
              }`}
            />
          </motion.div>
        </motion.button>

        {/* Text Container */}
        <div className="mt-6">
          <motion.div
            variants={heroItem}
            className="text-xl font-medium text-primary"
          >
            {siteConfig.title}
          </motion.div>
          {/* One line at every width. On phones `clamp` sizes the name to
              the viewport; the desktop rail is a fixed 448px, which is what
              sets the 2.375rem. 2.5rem fits the 20 characters to the pixel,
              with nothing left over if a fallback font ever stands in. */}
          <motion.h1
            variants={heroItem}
            className="mt-2 text-[clamp(1.15rem,5.5vw,2.25rem)] font-bold whitespace-nowrap tracking-tight xl:text-[2.375rem] xl:leading-[1.1]"
          >
            {siteConfig.creator}
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="text-2xl font-light text-neutral-500"
          >
            {siteConfig.bio}
          </motion.p>
        </div>
        {/* Buttons Container */}
        <motion.div
          variants={heroItem}
          className="relative mt-6 flex flex-col gap-2.5"
        >
          {/* They perch along the top of the CV button and bolt if you reach
              for it. */}
          <PerchBird count={5} />
          <a
            href={siteConfig.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="group flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 active:translate-y-0 rounded-lg shadow-sm transition-all duration-200 ease-out"
          >
            <FileText
              size="16"
              className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
            />
            Download CV
          </a>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`${siteConfig.locationLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 transition-all duration-200 ease-out"
            >
              <MapPin size="13" />
              {siteConfig.location}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 transition-all duration-200 ease-out"
            >
              <Mail size="13" />
              Mail
            </a>
            <a
              href="https://wa.me/2349036538954"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 transition-all duration-200 ease-out"
            >
              <MessageCircle size="13" />
              WhatsApp
            </a>
          </div>
        </motion.div>
      </motion.div>
      {/* Footer — anchored to the foot of the rail on desktop. */}
      <div className="hidden mt-6 shrink-0 xl:flex">
        <Footer />
      </div>
    </div>
  );
};

export default LeftPanel;
