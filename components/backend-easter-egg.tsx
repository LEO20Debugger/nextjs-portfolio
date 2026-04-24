"use client";
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
  const [particles, setParticles] = useState<Particle[]>([]);
  const animRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    // Spawn a burst of phrases
    const newParticles: Particle[] = Array.from({ length: 14 }, () => ({
      id: idCounter++,
      text: BACKEND_PHRASES[Math.floor(Math.random() * BACKEND_PHRASES.length)],
      x: Math.random() * 80 + 10, // 10–90% of screen width
      y: 90 + Math.random() * 10,  // start near bottom
      opacity: 1,
      speed: 0.3 + Math.random() * 0.5,
      fontSize: 11 + Math.floor(Math.random() * 8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    particlesRef.current = [...particlesRef.current, ...newParticles];
    setParticles([...particlesRef.current]);

    function animate() {
      particlesRef.current = particlesRef.current
        .map((p) => ({ ...p, y: p.y - p.speed, opacity: p.opacity - 0.004 }))
        .filter((p) => p.opacity > 0);

      setParticles([...particlesRef.current]);

      if (particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(animate);
      }
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute font-mono whitespace-nowrap select-none"
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
