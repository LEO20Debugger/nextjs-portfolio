"use client";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { useEffect, useRef, useState } from "react";

const TECH = [
  { name: "NestJS",  color: "#E0234E", slug: "nestjs" },
  { name: "Node.js", color: "#339933", slug: "nodedotjs" },
  { name: "MySQL",   color: "#4479A1", slug: "mysql" },
  { name: "MongoDB", color: "#47A248", slug: "mongodb" },
  { name: "Drizzle", color: "#C5F74F", slug: "drizzle" },
  { name: "Docker",  color: "#2496ED", slug: "docker" },
  { name: "Redis",   color: "#DC382D", slug: "redis" },
];

const TECH_CUSTOM: { name: string; color: string; svg: React.ReactNode }[] = [
  {
    name: "AWS",
    color: "#FF9900",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.063-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.025-.527.27-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.385.607zm1.094-1.246c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z"/>
      </svg>
    ),
  },
  {
    name: "C#",
    color: "#512BD4",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM9.445 16.318a4.362 4.362 0 0 1-1.776-.366 4.395 4.395 0 0 1-1.445-.998 4.7 4.7 0 0 1-.966-1.5 4.87 4.87 0 0 1-.353-1.854c0-.67.118-1.293.353-1.866a4.7 4.7 0 0 1 .966-1.5 4.395 4.395 0 0 1 1.445-.998 4.362 4.362 0 0 1 1.776-.366c.69 0 1.337.14 1.94.42.604.28 1.12.67 1.548 1.17l-1.228 1.17a2.627 2.627 0 0 0-.924-.756 2.56 2.56 0 0 0-1.14-.258c-.41 0-.793.08-1.148.24a2.795 2.795 0 0 0-.912.654 3.02 3.02 0 0 0-.6.984 3.44 3.44 0 0 0-.216 1.218c0 .44.072.85.216 1.23.144.38.348.71.6.99.252.28.556.5.912.66.356.16.738.24 1.148.24.432 0 .822-.088 1.17-.264.348-.176.648-.42.9-.732l1.248 1.14a4.2 4.2 0 0 1-1.548 1.17 4.7 4.7 0 0 1-1.932.39zm7.314-.24h-1.08v-1.08h-1.08v1.08h-1.08v-1.08h-1.08v-1.08h1.08v-1.08h-1.08v-1.08h1.08v-1.08h1.08v1.08h1.08v-1.08h1.08v1.08h1.08v1.08h-1.08v1.08h1.08v1.08h-1.08zm-1.08-2.16h-1.08v1.08h1.08zm0-2.16h-1.08v1.08h1.08z"/>
      </svg>
    ),
  },
];

const ALL_TECH: { name: string; color: string; slug?: string; svg?: React.ReactNode }[] = [
  ...TECH.map((t) => ({ ...t, svg: undefined })),
  ...TECH_CUSTOM.map((t) => ({ ...t, slug: undefined })),
];

const SIZE = 56;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function TechStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ballsRef = useRef<Ball[]>([]);
  const animRef = useRef<number>();
  const reduceMotion = usePrefersReducedMotion();
  // Chips are rendered once and then moved by writing transforms straight to
  // the DOM — React is deliberately kept out of the animation loop. This single
  // flag is the only state the loop ever touches.
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // offsetWidth/Height report the LAYOUT box, unaffected by the card's
    // reveal transform. getBoundingClientRect would return the scaled box
    // (scale 0.2 mid-reveal) and cram every chip into a tiny region.
    const { offsetWidth: width, offsetHeight: height } = container;

    ballsRef.current = ALL_TECH.map((_, i) => {
      if (reduceMotion) {
        // Static motionless grid — still shows every technology.
        const cols = Math.max(1, Math.floor(width / (SIZE + 24)));
        const col = i % cols;
        const row = Math.floor(i / cols);
        const gapX = width / cols;
        return {
          x: gapX * col + gapX / 2,
          y: Math.min(height - SIZE / 2, SIZE / 2 + row * (SIZE + 28)),
          vx: 0,
          vy: 0,
        };
      }
      // The card is a wide, short strip, so seed one evenly spaced row with
      // vertical jitter. Pure random placement bunches chips into one corner
      // and leaves half the card empty.
      const lane = width / ALL_TECH.length;
      return {
        x: lane * (i + 0.5),
        y: SIZE / 2 + Math.random() * Math.max(1, height - SIZE),
        vx: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4),
        vy: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4),
      };
    });

    const paint = () => {
      for (let i = 0; i < ballsRef.current.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const b = ballsRef.current[i];
        el.style.transform = `translate3d(${b.x - SIZE / 2}px, ${b.y - SIZE / 2}px, 0)`;
      }
    };

    paint();
    setPlaced(true);

    if (reduceMotion) return;

    const tick = () => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;

      for (const b of ballsRef.current) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x - SIZE / 2 <= 0) { b.x = SIZE / 2; b.vx = Math.abs(b.vx); }
        if (b.x + SIZE / 2 >= w) { b.x = w - SIZE / 2; b.vx = -Math.abs(b.vx); }
        if (b.y - SIZE / 2 <= 0) { b.y = SIZE / 2; b.vy = Math.abs(b.vy); }
        if (b.y + SIZE / 2 >= h) { b.y = h - SIZE / 2; b.vy = -Math.abs(b.vy); }
      }

      // Keep chips from stacking on top of each other: push any overlapping
      // pair apart along their centre line and exchange the normal velocity.
      const balls = ballsRef.current;
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const c = balls[j];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const minDist = SIZE * 0.92;
          if (dist >= minDist) continue;

          const nx = dx / dist;
          const ny = dy / dist;
          const push = (minDist - dist) / 2;
          a.x -= nx * push;
          a.y -= ny * push;
          c.x += nx * push;
          c.y += ny * push;

          const rel = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (rel < 0) {
            a.vx += rel * nx;
            a.vy += rel * ny;
            c.vx -= rel * nx;
            c.vy -= rel * ny;
          }
        }
      }

      paint();
      animRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (animRef.current == null) animRef.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (animRef.current != null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = undefined;
      }
    };

    // Don't burn frames while the tab is in the background.
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion]);

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2 shrink-0">
        Tech Stack
      </p>
      <div ref={containerRef} className="relative flex-1 w-full overflow-hidden rounded-2xl">
        {ALL_TECH.map((tech, i) => (
          <div
            key={tech.name}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 flex flex-col items-center gap-1 select-none will-change-transform"
            style={{
              width: SIZE,
              height: SIZE + 18,
              opacity: placed ? 1 : 0,
              transition: "opacity 250ms ease-out",
            }}
          >
            <div
              className="w-full flex items-center justify-center rounded-2xl shadow-grid border border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              style={{ width: SIZE, height: SIZE, color: tech.color }}
            >
              {tech.svg ? (
                <div className="w-7 h-7">{tech.svg}</div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://cdn.simpleicons.org/${tech.slug}/${tech.color.replace("#", "")}`}
                  alt={tech.name}
                  width={28}
                  height={28}
                  loading="lazy"
                  style={{ width: 28, height: 28 }}
                />
              )}
            </div>
            <span className="text-[9px] font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
              {tech.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
