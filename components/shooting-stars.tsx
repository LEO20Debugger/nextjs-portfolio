"use client";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  len: number;
  speed: number;
  size: number;
  opacity: number;
  trail: number;
  angle: number;
  active: boolean;
  fade: number;
}

const NUM_STARS = 18;
const STATIC_STARS = 120;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createStar(width: number, height: number): Star {
  const angle = randomBetween(20, 45);
  return {
    x: randomBetween(0, width),
    y: randomBetween(0, height * 0.6),
    len: randomBetween(80, 220),
    speed: randomBetween(6, 16),
    size: randomBetween(1, 2.2),
    opacity: 1,
    trail: randomBetween(0.3, 0.7),
    angle,
    active: true,
    fade: 0,
  };
}

export default function ShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let stars: Star[] = [];

    const staticStars = Array.from({ length: STATIC_STARS }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.5 + 0.15,
    }));

    function isDark() {
      return document.documentElement.classList.contains("dark");
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function spawnStars() {
      if (!canvas) return;
      stars = Array.from({ length: NUM_STARS }, () =>
        createStar(canvas!.width, canvas!.height)
      );
      stars.forEach((s) => {
        const offset = randomBetween(0, s.len * 3);
        const rad = (s.angle * Math.PI) / 180;
        s.x += Math.cos(rad) * offset;
        s.y += Math.sin(rad) * offset;
      });
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dark = isDark();
      // In light mode use a soft indigo/slate, in dark mode use white
      const starColor = dark ? "255,255,255" : "99,102,241";

      // Static background stars
      staticStars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x * canvas!.width, s.y * canvas!.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor},${s.o})`;
        ctx.fill();
      });

      // Shooting stars
      stars.forEach((s) => {
        if (!s.active) return;
        const rad = (s.angle * Math.PI) / 180;
        const tailX = s.x - Math.cos(rad) * s.len;
        const tailY = s.y - Math.sin(rad) * s.len;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(${starColor},0)`);
        grad.addColorStop(1, `rgba(${starColor},${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.size;
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor},${s.opacity * 0.9})`;
        ctx.fill();

        // Move
        s.x += Math.cos(rad) * s.speed;
        s.y += Math.sin(rad) * s.speed;

        // Fade out
        s.fade += 0.012;
        s.opacity = Math.max(0, 1 - s.fade * s.fade);

        // Reset
        if (
          s.opacity <= 0 ||
          s.x > canvas!.width + 100 ||
          s.y > canvas!.height + 100
        ) {
          Object.assign(s, createStar(canvas!.width, canvas!.height));
          s.fade = randomBetween(-2, 0);
          s.opacity = 0;
        }
      });

      animId = requestAnimationFrame(draw);
    }

    function drawStaticOnly() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const starColor = isDark() ? "255,255,255" : "99,102,241";
      staticStars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x * canvas!.width, s.y * canvas!.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor},${s.o})`;
        ctx.fill();
      });
    }

    // Named so it can actually be removed — an inline arrow here would leak,
    // since removeEventListener needs the same function reference.
    function onResize() {
      resize();
      if (reduceMotion) {
        drawStaticOnly();
      } else {
        spawnStars();
      }
    }

    function stop() {
      cancelAnimationFrame(animId);
    }

    function onVisibility() {
      if (reduceMotion) return;
      if (document.hidden) stop();
      else animId = requestAnimationFrame(draw);
    }

    resize();

    if (reduceMotion) {
      // Keep the starfield, drop the motion.
      drawStaticOnly();
    } else {
      spawnStars();
      draw();
      document.addEventListener("visibilitychange", onVisibility);
    }

    window.addEventListener("resize", onResize);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}
