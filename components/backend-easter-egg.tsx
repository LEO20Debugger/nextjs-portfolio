"use client";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { useEffect, useRef, useState } from "react";

const BACKEND_PHRASES = [
  "SELECT * FROM users;",
  "git push origin main",
  "npm run build",
  "docker-compose up",
  "200 OK",
  "404 Not Found",
  "500 Internal Server Error",
  "curl -X POST /api/v1",
  "JWT verified ✓",
  "Cache hit 🎯",
  "Cache miss 💀",
  "Deploying to prod...",
  "yarn install",
  "pg_dump backup.sql",
  "redis-cli PING → PONG",
  "npm audit fix",
  "git stash pop",
  "sudo !!",
  "rm -rf node_modules",
  "it works on my machine 🤷",
  "undefined is not a function",
  "// TODO: fix later",
  "console.log('here')",
  "merge conflict 😭",
  "LGTM 🚀",
  "rate limit exceeded",
  "connection timeout",
  "env vars missing",
  "works in staging...",
  "kubectl apply -f .",
];

interface Particle {
  id: number;
  text: string;
  x: number;
  y: number;
  opacity: number;
  speed: number;
  fontSize: number;
  color: string;
}

const COLORS = [
  "#6178F1",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#a78bfa",
];

let idCounter = 0;

export default function BackendEasterEgg({ trigger }: { trigger: number }) {
  // One burst is one React render. The float itself is driven by writing
  // styles straight to the nodes, so the loop never re-renders the tree.
  const [particles, setParticles] = useState<Particle[]>([]);
  const animRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (trigger === 0) return;

    const newParticles: Particle[] = Array.from({ length: 14 }, () => ({
      id: idCounter++,
      text: BACKEND_PHRASES[Math.floor(Math.random() * BACKEND_PHRASES.length)],
      x: Math.random() * 80 + 10, // 10–90% of screen width
      y: 90 + Math.random() * 10, // start near bottom
      opacity: 1,
      speed: 0.3 + Math.random() * 0.5,
      fontSize: 11 + Math.floor(Math.random() * 8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    particlesRef.current = [...particlesRef.current, ...newParticles];
    setParticles([...particlesRef.current]);

    // Reduced motion: show the burst, then clear it — no drift, no rAF.
    if (reduceMotion) {
      const timeout = setTimeout(() => {
        particlesRef.current = [];
        setParticles([]);
      }, 2200);
      return () => clearTimeout(timeout);
    }

    function animate() {
      let alive = 0;

      for (const p of particlesRef.current) {
        p.y -= p.speed;
        p.opacity -= 0.004;

        // Liveness is decided by opacity alone. The first frame can run before
        // React has committed the new nodes, so keying this off `node` would
        // report zero alive and wipe the burst before it ever rendered.
        if (p.opacity > 0) alive++;

        const node = nodeRefs.current.get(p.id);
        if (!node) continue;

        node.style.top = `${p.y}%`;
        node.style.opacity = String(Math.max(0, p.opacity));
      }

      if (alive > 0) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Single render to unmount the burst once everything has faded.
        particlesRef.current = [];
        setParticles([]);
      }
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [trigger, reduceMotion]);

  if (particles.length === 0) return null;

  return (
    <div aria-hidden className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          ref={(el) => {
            if (el) nodeRefs.current.set(p.id, el);
            else nodeRefs.current.delete(p.id);
          }}
          className="absolute font-mono whitespace-nowrap select-none will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            fontSize: `${p.fontSize}px`,
            color: p.color,
            textShadow: `0 0 8px ${p.color}`,
            transform: "translateX(-50%)",
          }}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
}
