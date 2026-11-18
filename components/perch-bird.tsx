"use client";

import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { chirp } from "@/utils/bird-sound";
import { useEffect, useRef } from "react";

/**
 * A little flock that lives on the top edge of its parent.
 *
 * Drop it inside any `position: relative` element and birds gather on that
 * element's top edge over the course of a visit — one at a time, with the wait
 * growing after each arrival. Once perched they shuffle, hop, preen, glance
 * about and now and then take a loop out and come back.
 *
 * Touch or hover the parent and the whole flock bolts off the side of the
 * screen, and the arrival schedule starts over from the top.
 *
 * One rAF loop drives every bird and writes transforms straight to the DOM,
 * so no amount of flapping costs a React render.
 */

/* ----------------------------------------------------------------- tuning */

const VB_W = 24; // viewBox units
const VB_H = 20;
const FOOT_VB = 18.5; // y of the feet inside the viewBox
const EDGE = 16; // how close a bird may get to either end of the perch
const APART = 26; // how much room birds like to keep between each other

/** No perch holds more than this many birds, whatever it asks for. */
const MAX_BIRDS = 5;

/**
 * Seconds after the clock starts that each bird turns up. A perch begins
 * empty and fills one bird at a time, the wait stretching after each arrival.
 * Past the end of the list the gap keeps growing by `TRAILING_GAP` a bird.
 * Scaring the flock off restarts this schedule from the beginning.
 *
 * The scout lands inside the first 40s so an arriving visitor has something to
 * notice; everything after that is slow enough to stay a thing you catch
 * rather than a thing that performs at you.
 */
const ARRIVALS = [40, 120, 480, 780, 1140];
const TRAILING_GAP = 360;

/**
 * Perches take turns rather than filling in lockstep. Each one is handed a
 * slot as it mounts and keeps to its own band of the scout's window, so the
 * page's first two birds land a good gap apart yet both still inside it.
 * Later arrivals just get pushed back by `PERCH_STAGGER` a slot.
 */
const STAGGER_SLOTS = 2;
const PERCH_STAGGER = 25; // seconds
let perchTally = 0;

/* ------------------------------------------------------------------ maths */

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];
const easeOut = (p: number) => 1 - (1 - p) * (1 - p);

/** When bird `i` of the perch in `slot` should drop in, in ms. */
const arrivalDelay = (i: number, slot: number) => {
  const secs =
    i < ARRIVALS.length
      ? ARRIVALS[i]
      : ARRIVALS[ARRIVALS.length - 1] + (i - ARRIVALS.length + 1) * TRAILING_GAP;
  const turn = slot % STAGGER_SLOTS;

  if (i === 0) {
    // The scout's slot is a deadline, not an average, so its window is only
    // ever carved up backwards from it — every perch's first bird still lands
    // inside ARRIVALS[0], just in a different part of it from its neighbour.
    const band = 0.5 / STAGGER_SLOTS;
    const lo = 0.5 + band * turn;
    // Leave a gap at the top of each band, so neighbouring perches can't both
    // land on the boundary between them and arrive together anyway.
    return secs * 1000 * rand(lo, lo + band - 0.06);
  }
  return (secs + turn * PERCH_STAGGER) * 1000 * rand(0.85, 1.15);
};

/**
 * One wingbeat, as a fraction of its cycle. The downstroke is the fast,
 * powered half and throws the wing wide; the upstroke is slower and folds it
 * in, which is what keeps a flap from reading as a windscreen wiper.
 */
const flapAt = (phase: number) => {
  const p = ((phase % 1) + 1) % 1;
  if (p < 0.42) {
    const d = p / 0.42;
    return {
      angle: -58 + 95 * easeOut(d),
      ext: 1 + 0.38 * Math.sin(Math.PI * d),
    };
  }
  const u = (p - 0.42) / 0.58;
  return { angle: 37 - 95 * u * u, ext: 1 - 0.24 * Math.sin(Math.PI * u) };
};

type Mode =
  /** Not here yet — waiting for its slot in the arrival schedule. */
  | "unborn"
  | "idle"
  | "preen"
  | "hop"
  | "fly"
  | "flee"
  | "away"
  | "arrive";

type Bird = {
  el: HTMLElement;
  /** Position in the flock, which sets its place in the arrival schedule. */
  index: number;
  svg: SVGSVGElement;
  legs: SVGGElement;
  shin: SVGGElement;
  upper: SVGGElement;
  head: SVGGElement;
  eye: SVGGElement;
  wing: SVGGElement;
  farWing: SVGGElement;
  tail: SVGGElement;
  mode: Mode;
  started: number;
  dur: number;
  x: number;
  fromX: number;
  toX: number;
  arc: number;
  bulge: number;
  out: number; // which way it bolts when scared
  facing: number;
  nextAt: number;
  fleeAt: number;
  /** When it drops in: its first arrival, or its return after a scare. */
  returnAt: number;
  blinkAt: number;
  blinkUntil: number;
  /** Running wingbeat phase, so beats stay smooth across mode changes. */
  flap: number;
  /** Running flap-glide cycle, which gives flight its bounding shape. */
  bound: number;
  /** Decays after a landing: the tail-pump every small bird does. */
  pump: number;
  /** A glance to one side, held briefly. */
  glance: number;
  glanceUntil: number;
};

export default function PerchBird({
  /** How many birds may gather here, capped at five. */
  count = 1,
  /** Sprite width in px — the rest of the bird scales with it. */
  size = 28,
  /** Scatter the flock when the pointer touches or enters the parent. */
  skittish = true,
}: {
  count?: number;
  size?: number;
  skittish?: boolean;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const flockSize = clamp(Math.round(count), 0, MAX_BIRDS);

  const layerRef = useRef<HTMLSpanElement>(null);
  const scatter = useRef<() => void>(() => {});
  // Claimed on the first effect run rather than during render, so a double
  // invoke in StrictMode doesn't burn two slots on one perch.
  const slot = useRef(-1);

  const foot = (FOOT_VB * size) / VB_W;
  const height = (VB_H * size) / VB_W;

  useEffect(() => {
    if (reduceMotion) return;

    if (slot.current < 0) slot.current = perchTally++;
    const turn = slot.current;

    const layer = layerRef.current;
    if (!layer) return;

    const sprites = Array.from(
      layer.querySelectorAll<HTMLElement>("[data-bird]")
    );
    if (!sprites.length) return;

    const part = <T extends Element>(el: HTMLElement, name: string) =>
      el.querySelector(`[data-part="${name}"]`) as unknown as T;

    const flock: Bird[] = sprites.map((el, index) => ({
      el,
      index,
      svg: part<SVGSVGElement>(el, "svg"),
      legs: part<SVGGElement>(el, "legs"),
      shin: part<SVGGElement>(el, "shin"),
      upper: part<SVGGElement>(el, "upper"),
      head: part<SVGGElement>(el, "head"),
      eye: part<SVGGElement>(el, "eye"),
      wing: part<SVGGElement>(el, "wing"),
      farWing: part<SVGGElement>(el, "far-wing"),
      tail: part<SVGGElement>(el, "tail"),
      mode: "unborn",
      started: 0,
      dur: 0,
      x: 0,
      fromX: 0,
      toX: 0,
      arc: 0,
      bulge: 0,
      out: pick([-1, 1]),
      facing: pick([-1, 1]),
      nextAt: 0,
      fleeAt: 0,
      returnAt: 0,
      blinkAt: 0,
      blinkUntil: 0,
      flap: Math.random(),
      bound: Math.random(),
      pump: 0,
      glance: 0,
      glanceUntil: 0,
    }));

    let W = 0;
    let placed = false;

    /* ------------------------------------------------------------ measuring */

    const measure = () => {
      const w = layer.clientWidth;
      if (w === W) return;
      const prev = W;
      W = w;
      if (w <= 0) return;

      if (!placed) {
        // Nobody is here yet — spread out their notional spots so the first
        // arrivals aim at different parts of the perch, and start the clock.
        const lo = EDGE;
        const hi = Math.max(EDGE, w - EDGE);
        const step = (hi - lo) / (flock.length + 1);
        const now = performance.now();
        flock.forEach((b, i) => {
          b.x = clamp(lo + step * (i + 1) + rand(-step / 3, step / 3), lo, hi);
          b.returnAt = now + arrivalDelay(i, turn);
        });
        placed = true;
      } else if (prev > 0) {
        // Keep everyone where they were proportionally when the line resizes.
        flock.forEach((b) => {
          b.x = clamp((b.x / prev) * w, EDGE, Math.max(EDGE, w - EDGE));
        });
      }
    };

    const ro = new ResizeObserver(measure);
    ro.observe(layer);
    measure();

    /* ------------------------------------------------------------- choosing */

    /**
     * Where a bird will end up — its target while it is in the air, otherwise
     * where it stands. Two birds heading for the same gap would otherwise both
     * think it was empty and land on top of each other.
     */
    const restingX = (b: Bird) =>
      b.mode === "hop" || b.mode === "fly" || b.mode === "arrive" ? b.toX : b.x;

    /** Birds that have yet to show up, or have fled, aren't in anyone's way. */
    const here = (b: Bird) => b.mode !== "away" && b.mode !== "unborn";

    /** A spot on the perch that isn't already spoken for, if one can be found. */
    const freeSpot = (self: Bird) => {
      const lo = EDGE;
      const hi = Math.max(EDGE, W - EDGE);
      for (let i = 0; i < 8; i++) {
        const x = rand(lo, hi);
        const crowded = flock.some(
          (o) => o !== self && here(o) && Math.abs(restingX(o) - x) < APART
        );
        if (!crowded) return x;
      }
      return rand(lo, hi);
    };

    const startHop = (b: Bird, t: number) => {
      const lo = EDGE;
      const hi = Math.max(EDGE, W - EDGE);
      let dir = b.facing;
      const dist = rand(11, 30);
      let to = b.x + dir * dist;
      // Turn around at the ends, and also rather than barge into a neighbour.
      const blocked = (v: number) =>
        v < lo ||
        v > hi ||
        flock.some(
          (o) => o !== b && here(o) && Math.abs(restingX(o) - v) < APART * 0.7
        );
      if (blocked(to)) {
        dir = -dir;
        b.facing = dir;
        to = b.x + dir * dist;
      }
      if (blocked(to)) {
        // Boxed in on both sides — just shuffle in place.
        b.nextAt = t + rand(500, 1600);
        return;
      }
      b.fromX = b.x;
      b.toX = clamp(to, lo, hi);
      b.mode = "hop";
      b.started = t;
      b.dur = rand(420, 560);
    };

    const startPreen = (b: Bird, t: number) => {
      b.mode = "preen";
      b.started = t;
      b.dur = rand(1400, 2600);
    };

    const startFly = (b: Bird, t: number) => {
      b.fromX = b.x;
      b.toX = freeSpot(b);
      b.arc = rand(55, 120);
      b.bulge = pick([-1, 1]) * rand(W * 0.25 + 30, W * 0.5 + 70);
      b.mode = "fly";
      b.started = t;
      b.dur = rand(1900, 3000);
    };

    const startFlee = (b: Bird, t: number) => {
      b.fromX = b.x;
      b.out = pick([-1, 1]);
      b.arc = rand(120, 230);
      b.mode = "flee";
      b.started = t;
      b.dur = rand(900, 1300);
      // Being startled resets the whole schedule: the flock gathers again
      // from scratch rather than drifting back a moment later.
      b.returnAt = t + arrivalDelay(b.index, turn);
    };

    const startArrive = (b: Bird, t: number) => {
      b.toX = freeSpot(b);
      b.out = pick([-1, 1]);
      b.fromX = b.toX + b.out * (W * 0.5 + 260);
      b.arc = rand(130, 220);
      b.mode = "arrive";
      b.started = t;
      b.dur = rand(1100, 1600);
      b.el.style.opacity = "1";
    };

    /* ----------------------------------------------------- flight paths ---
     * Each airborne mode is a parametric path in px relative to the perch
     * line, so the body angle can be read straight off its own velocity.
     */

    const pathAt = (b: Bird, p: number): { x: number; y: number } => {
      if (b.mode === "fly") {
        return {
          x: b.fromX + (b.toX - b.fromX) * p + b.bulge * Math.sin(Math.PI * p),
          y: -b.arc * Math.sin(Math.PI * p) - 7 * Math.sin(Math.PI * p * 2),
        };
      }
      if (b.mode === "flee") {
        return {
          x: b.fromX + b.out * (W * 0.6 + 320) * Math.pow(p, 1.35),
          y: -b.arc * Math.pow(p, 0.7),
        };
      }
      // arrive — swoop down out of the sky and brake onto the perch
      const ease = 1 - Math.pow(1 - p, 2.1);
      return {
        x: b.fromX + (b.toX - b.fromX) * ease,
        y: -b.arc * Math.pow(1 - p, 1.35),
      };
    };

    /* -------------------------------------------------------------- scatter */

    let cooldown = 0;
    scatter.current = () => {
      const t = performance.now();
      if (W <= 0 || t < cooldown) return;
      cooldown = t + 1200;
      let any = false;
      flock.forEach((b) => {
        // Only birds actually sitting there can be startled.
        if (!here(b) || b.mode === "flee" || b.mode === "arrive") return;
        // Staggered, so they peel off one after another rather than as a block.
        b.fleeAt = t + rand(0, 220);
        any = true;
      });
      if (!any) cooldown = 0;
    };

    /* ----------------------------------------------------------------- loop */

    let raf = 0;
    let last = 0;
    let prev = 0;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      // Skip entirely when the perch is hidden (the mobile/desktop footer twin).
      if (W <= 0) return;
      // Throttle to ~60fps on high-refresh displays; they are 28px birds.
      if (t - last < 14) return;
      const dt = clamp(t - (prev || t), 0, 50);
      last = t;
      prev = t;

      for (const b of flock) {
        if (!b.nextAt) b.nextAt = t + rand(500, 2400);
        if (!b.blinkAt) b.blinkAt = t + rand(1200, 4000);

        // A scare interrupts whatever it was doing.
        if (
          b.fleeAt &&
          t >= b.fleeAt &&
          (b.mode === "idle" ||
            b.mode === "preen" ||
            b.mode === "hop" ||
            b.mode === "fly")
        ) {
          b.fleeAt = 0;
          startFlee(b, t);
        }

        // --- what the body is doing this frame -------------------------- //
        let px = b.x;
        let py = 0; // whole bird, used when airborne
        let dip = 0; // body only, feet stay planted
        let rot = 0;
        let zoom = 1;
        let tuck = 0; // 0 standing, 1 legs folded away
        let wingA = 0;
        let wingE = 1;
        let farA: number | null = null; // the far wing only shows in flight
        let farE = 1;
        let headR = 0;
        let headX = 0;
        let headY = 0;
        let tailR = 0;
        let breath = 0;

        // Waiting to turn up for the first time, or to come back after a scare.
        if (b.mode === "away" || b.mode === "unborn") {
          if (t >= b.returnAt) startArrive(b, t);
          else continue; // not on the perch yet: nothing to draw
        }

        if (b.mode === "idle") {
          if (t >= b.nextAt) {
            const roll = Math.random();
            if (roll < 0.08) startFly(b, t);
            else if (roll < 0.26) startPreen(b, t);
            else if (roll < 0.38) {
              b.facing *= -1;
              b.nextAt = t + rand(700, 2200);
            } else startHop(b, t);
          }
          // A quick glance to one side, held, then back — birds rarely stare.
          if (t > b.glanceUntil && Math.random() < 0.006) {
            b.glance = rand(-13, 13);
            b.glanceUntil = t + rand(400, 1400);
          }
          if (t > b.glanceUntil) b.glance *= 0.9;

          dip = Math.sin(t / 820 + b.x) * 0.1;
          rot = Math.sin(t / 1450 + b.x) * 1.2;
          breath = Math.sin(t / 900 + b.x) * 0.14;
          wingA = Math.sin(t / 1100 + b.x) * 2.5;
          headR = b.glance + Math.sin(t / 640 + b.x) * 1.6;
          headY = Math.sin(t / 640 + b.x) * 0.1;
          tailR = Math.sin(t / 1180 + b.x) * 2.2;
        }

        if (b.mode === "preen") {
          const p = clamp((t - b.started) / b.dur, 0, 1);
          // Reach back into the wing, rummage, then come up again.
          const reach = Math.sin(Math.PI * clamp(p * 1.15, 0, 1));
          const rummage = Math.sin(t / 95) * reach;
          headR = -58 * reach + rummage * 7;
          headX = -1.5 * reach;
          headY = 2.6 * reach + rummage * 0.25;
          dip = 0.5 * reach;
          wingA = -5 * reach + rummage * 2.5;
          tailR = 5 * reach;
          breath = Math.sin(t / 900) * 0.14;
          if (p >= 1) {
            b.mode = "idle";
            b.nextAt = t + rand(400, 1800);
          }
        }

        if (b.mode === "hop") {
          const p = clamp((t - b.started) / b.dur, 0, 1);
          if (p < 0.17) {
            // Crouch: load up the legs before the spring.
            const c = easeOut(p / 0.17);
            px = b.fromX;
            dip = 1.5 * c;
            wingA = -8 * c;
            headX = -0.5 * c;
            tailR = -7 * c;
          } else if (p < 0.88) {
            const a = (p - 0.17) / 0.71;
            const lift = Math.sin(Math.PI * a);
            px = b.fromX + (b.toX - b.fromX) * a;
            py = -13 * lift;
            dip = 1.5 * (1 - easeOut(clamp(a * 3, 0, 1)));
            tuck = lift;
            // One beat of the wings for balance, not for lift.
            b.flap += dt / 150;
            const f = flapAt(b.flap);
            wingA = f.angle * lift;
            wingE = 1 + (f.ext - 1) * lift;
            // The head leads the body out, then holds level.
            headX = 0.9 * Math.sin(Math.PI * clamp(a * 1.6, 0, 1));
            // The rotation lands in screen space, so mirror it when facing left.
            rot = -8 * lift * b.facing;
            tailR = 13 * lift;
          } else {
            // Touchdown: absorb it in the legs, then pump the tail.
            const s = (p - 0.88) / 0.12;
            px = b.toX;
            dip = 1.1 * Math.sin(Math.PI * s);
            wingA = -14 * (1 - s);
            tailR = 10 * (1 - s);
          }
          if (p >= 1) {
            b.x = b.toX;
            b.mode = "idle";
            b.pump = 1;
            b.nextAt = t + rand(380, 2400);
          }
        }

        if (b.mode === "fly" || b.mode === "flee" || b.mode === "arrive") {
          const p = clamp((t - b.started) / b.dur, 0, 1);
          const at = pathAt(b, p);
          const next = pathAt(b, Math.min(1, p + 0.012));
          const vx = next.x - at.x;
          const vy = next.y - at.y;
          px = at.x;
          py = at.y;
          b.facing = vx >= 0 ? 1 : -1;
          rot =
            b.facing *
            clamp((Math.atan2(vy, Math.abs(vx)) * 180) / Math.PI, -32, 32);

          // Legs drop for take-off and landing, tucked away in between.
          const edge = b.mode === "flee" ? 0.18 : 0.12;
          const air =
            p < edge
              ? p / edge
              : b.mode !== "flee" && p > 1 - edge
              ? (1 - p) / edge
              : 1;
          tuck = clamp(air, 0, 1);

          // Flap-glide: small birds beat hard, then close up and coast, which
          // is what gives their flight that bounding, dipping line.
          const burst = b.mode === "flee" ? p < 0.5 : p < 0.25 || p > 0.8;
          b.bound += dt / 980;
          const coasting = !burst && ((b.bound % 1) > 0.62);
          if (coasting) {
            wingA = -8;
            wingE = 1.32;
          } else {
            b.flap += dt / (burst ? 95 : 130);
            const f = flapAt(b.flap);
            wingA = f.angle;
            wingE = f.ext;
          }
          // The far wing trails the near one by a hair, which reads as depth.
          const far = coasting
            ? { angle: -8, ext: 1.32 }
            : flapAt(b.flap - 0.06);
          farA = far.angle * 0.92;
          farE = far.ext;
          // Rise on the downstroke, sink while coasting.
          py += coasting ? 4 : -3 * Math.sin(Math.PI * ((b.flap % 1) * 2));
          // The head stays locked on where it is going.
          headR = -rot * 0.55;
          tailR = 6 * Math.sin(b.flap * Math.PI * 2) + (coasting ? -6 : 0);

          if (b.mode === "arrive" && p > 0.82) {
            // Flare: pitch up, throw the wings wide, reach for the perch.
            const fl = (p - 0.82) / 0.18;
            rot = rot * (1 - fl) + 15 * b.facing * fl;
            wingA = wingA * (1 - fl) - 40 * fl;
            wingE = wingE * (1 - fl) + 1.45 * fl;
            farA = (farA ?? 0) * (1 - fl) - 34 * fl;
            farE = farE * (1 - fl) + 1.4 * fl;
            tailR = tailR * (1 - fl) + 26 * fl;
          }

          if (b.mode === "flee") {
            zoom = 1 - 0.18 * p;
            b.el.style.opacity = String(clamp((1 - p) / 0.4, 0, 1));
          } else if (b.mode === "arrive") {
            zoom = 0.86 + 0.14 * p;
            b.el.style.opacity = String(clamp(p / 0.18, 0, 1));
          } else {
            zoom = 1 + 0.1 * Math.sin(Math.PI * p);
          }

          if (p >= 1) {
            if (b.mode === "flee") {
              b.mode = "away";
              b.el.style.opacity = "0";
            } else {
              b.x = b.toX;
              b.mode = "idle";
              b.pump = 1;
              b.nextAt = t + rand(500, 2000);
            }
          }
        }

        // --- the touches that apply whatever it is doing ------------------ //

        // The tail-pump that follows any landing, decaying away.
        if (b.pump > 0.001) {
          tailR += 16 * b.pump * Math.sin(b.pump * 26);
          dip += 0.5 * b.pump * Math.sin(b.pump * 26);
          b.pump = Math.max(0, b.pump - dt / 620);
        }

        // Birds hold their heads remarkably still while the body moves, so the
        // head takes back most of whatever the body just did.
        headR -= rot * 0.8;

        if (t >= b.blinkAt) {
          b.blinkUntil = t + 95;
          b.blinkAt = t + rand(1800, 6000);
        }
        const eye = t < b.blinkUntil ? 0.06 : 1;

        // --- write it out ------------------------------------------------- //

        b.el.style.transform = `translate3d(${px - size / 2}px, ${
          -foot + py
        }px, 0)`;
        b.svg.style.transform = `rotate(${rot.toFixed(
          2
        )}deg) scaleX(${b.facing}) scale(${zoom.toFixed(3)})`;

        const stand = (1 - tuck) * (1 - dip * 0.22);
        b.legs.setAttribute(
          "transform",
          `translate(0 14.4) scale(1 ${stand.toFixed(3)}) translate(0 -14.4)`
        );
        // The shin folds a little more than the thigh as the bird sinks.
        b.shin.setAttribute(
          "transform",
          `translate(0 ${(dip * 0.3).toFixed(3)})`
        );
        b.upper.setAttribute(
          "transform",
          `translate(0 ${(breath + dip - tuck * 1.7).toFixed(3)})`
        );
        b.head.setAttribute(
          "transform",
          `translate(${headX.toFixed(2)} ${headY.toFixed(
            2
          )}) rotate(${headR.toFixed(2)} 15.4 6.6)`
        );
        b.wing.setAttribute(
          "transform",
          `rotate(${wingA.toFixed(2)} 14.2 8.6) translate(14.2 8.6) scale(${wingE.toFixed(
            3
          )} 1) translate(-14.2 -8.6)`
        );
        // Hidden outright while perched: the svg is overflow-visible, so
        // shoving it off the viewBox would leave it floating above the bird.
        if (farA === null) {
          b.farWing.style.visibility = "hidden";
        } else {
          b.farWing.style.visibility = "visible";
          b.farWing.setAttribute(
            "transform",
            `rotate(${farA.toFixed(
              2
            )} 14.2 8.6) translate(14.2 8.6) scale(${farE.toFixed(
              3
            )} 1) translate(-14.2 -8.6)`
          );
        }
        b.tail.setAttribute("transform", `rotate(${tailR.toFixed(2)} 8.8 12)`);
        b.eye.setAttribute(
          "transform",
          `translate(17.8 5.9) scale(1 ${eye}) translate(-17.8 -5.9)`
        );
      }
    };

    raf = requestAnimationFrame(frame);

    const parent = layer.parentElement;
    const spook = () => scatter.current();
    if (skittish && parent) {
      // pointerenter covers the mouse; pointerdown covers a tap, where there
      // is no hover to notice in the first place.
      parent.addEventListener("pointerenter", spook);
      parent.addEventListener("pointerdown", spook);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (skittish && parent) {
        parent.removeEventListener("pointerenter", spook);
        parent.removeEventListener("pointerdown", spook);
      }
    };
  }, [flockSize, size, skittish, reduceMotion, foot]);

  return (
    <span
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 block h-0"
    >
      {Array.from({ length: flockSize }).map((_, i) => (
        <span
          key={i}
          data-bird=""
          onClick={() => {
            // The click is both the alarm and the gesture that lets the
            // browser start audio at all.
            chirp(((i + 1) * 0.37) % 1);
            scatter.current();
          }}
          className="pointer-events-auto absolute left-0 top-0 block cursor-pointer"
          style={{
            width: size,
            height,
            // Hidden until it flies in, so nothing flashes at x=0.
            opacity: reduceMotion ? 1 : 0,
            transform: reduceMotion
              ? `translate3d(${size * (0.8 + i * 1.9)}px, ${-foot}px, 0)`
              : undefined,
            willChange: "transform",
          }}
        >
          <svg
            data-part="svg"
            width={size}
            height={height}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="block overflow-visible text-blue-500"
            style={{ transformOrigin: `50% ${foot}px`, willChange: "transform" }}
          >
            {/* The far wing, behind everything, only out during flight. It is
                the near wing again, nudged back and dimmed for depth. */}
            <g data-part="far-wing" style={{ visibility: "hidden" }}>
              <g transform="translate(-0.4 -2) scale(0.94)" opacity="0.75">
                <path
                  className="fill-blue-800"
                  d="M14.2 8.6c-2.4-0.5-4.9 0.7-6.4 2.6 2.1 0.9 4.9 0.2 6.4-2.6Z"
                />
                <path
                  className="fill-blue-900"
                  d="M13.1 9.9c-2 1.3-3.9 2.7-5.1 3.9 2.1-0.3 4.4-1.6 5.9-3.3ZM11.5 10.5c-1.8 1.2-3.5 2.5-4.6 3.6 1.9-0.3 4-1.5 5.4-3.1Z"
                />
              </g>
            </g>

            {/* Legs, drawn behind the body so they fold up out of sight. */}
            <g data-part="legs" className="stroke-amber-600" fill="none">
              <g data-part="shin">
                <path
                  d="M11.1 14.2 10.5 16.3 10.9 18.4M13.3 14.1 13.9 16.2 13.4 18.4"
                  strokeWidth={0.62}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Three toes forward, one back, on each foot. */}
                <path
                  d="M10.9 18.45 12.3 18.3M10.9 18.45 12.2 18.75M10.9 18.45 11.9 18.1M10.9 18.45 9.8 18.7M13.4 18.45 14.8 18.3M13.4 18.45 14.7 18.75M13.4 18.45 14.4 18.1M13.4 18.45 12.3 18.7"
                  strokeWidth={0.46}
                  strokeLinecap="round"
                />
              </g>
            </g>

            <g data-part="upper">
              {/* Tail: three fanned feathers, rooted under the rump so they
                  read as growing out of the bird rather than bolted on. */}
              <g data-part="tail">
                <path className="fill-blue-700" d="M9.2 10.9 2.6 12.6 3.0 13.6 9.2 12.3Z" />
                <path className="fill-blue-800" d="M9.2 11.6 2.0 13.9 2.6 14.9 9.2 13.1Z" />
                <path className="fill-blue-700" d="M9.2 12.3 2.8 15.2 3.5 16.0 9.2 13.8Z" />
              </g>

              {/* Body: breast, belly, rump and back in one silhouette. */}
              <path
                d="M16.8 7.4c1.6 1.1 2.2 3.3 1.3 5.1-0.9 1.9-3.3 3.1-6 3-2.8-0.1-5.1-1.5-5.6-3.5-0.5-2.1 1-4.5 3.4-5.8 2-1.1 4.6-1.3 6.9 1.2Z"
                fill="currentColor"
              />
              {/* Paler underside, so it isn't one flat blue blob. */}
              <path
                className="fill-blue-300"
                d="M17.9 11.2c-0.2 2.1-2.6 4-5.7 4-2.3 0-4.4-0.9-5.4-2.4 1.6 1.4 3.7 2 5.6 1.8 2.6-0.2 4.7-1.7 5.5-3.4Z"
              />
              {/* Folded wing: coverts, then primaries laid over the flank. */}
              <g data-part="wing">
                <path
                  className="fill-blue-600"
                  d="M14.2 8.6c-2.4-0.5-4.9 0.7-6.4 2.6 2.1 0.9 4.9 0.2 6.4-2.6Z"
                />
                <path
                  className="fill-blue-700"
                  d="M13.1 9.9c-2 1.3-3.9 2.7-5.1 3.9 2.1-0.3 4.4-1.6 5.9-3.3ZM11.5 10.5c-1.8 1.2-3.5 2.5-4.6 3.6 1.9-0.3 4-1.5 5.4-3.1Z"
                />
              </g>

              {/* Head, beak and eye — the group the stabilisation acts on. */}
              <g data-part="head">
                <path
                  fill="currentColor"
                  d="M15.1 9.3c-1.4-0.9-2.2-2.3-2.1-3.8 0.1-2 2-3.5 4.2-3.4 2.1 0.1 3.8 1.7 3.7 3.7-0.1 1.6-1.2 2.9-2.8 3.4Z"
                />
                {/* Darker cap. */}
                <path
                  className="fill-blue-700"
                  d="M13 5.4c0.2-1.9 2-3.3 4.2-3.2 1.7 0.1 3.1 1.1 3.5 2.5-1.1-0.9-2.6-1.4-4.2-1.2-1.4 0.2-2.6 0.9-3.5 1.9Z"
                />
                {/* Pale throat. */}
                <path
                  className="fill-blue-300"
                  d="M15.2 9.3c-0.8-0.5-1.4-1.2-1.7-2 1 0.6 2.2 0.9 3.4 0.8-0.4 0.5-1 0.9-1.7 1.2Z"
                />
                {/* Conical beak with a slight curve to the culmen. */}
                <path
                  className="fill-amber-400"
                  d="M20.4 4.9c0.9 0.2 1.9 0.6 2.5 1.2-0.7 0.6-1.7 0.9-2.6 1Z"
                />
                <path
                  className="fill-amber-500"
                  d="M20.3 6.1c0.9-0.1 1.9-0.4 2.6-1-0.6 0.6-1.6 0.9-2.5 1Z"
                />
                <g data-part="eye">
                  <circle
                    cx="17.8"
                    cy="5.9"
                    r="0.92"
                    className="fill-blue-950"
                  />
                  <circle
                    cx="18.1"
                    cy="5.6"
                    r="0.26"
                    className="fill-white"
                  />
                </g>
              </g>
            </g>
          </svg>
        </span>
      ))}
    </span>
  );
}
