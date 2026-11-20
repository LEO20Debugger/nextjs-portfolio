/**
 * Bird chirps, synthesised rather than shipped.
 *
 * A passerine chirp is essentially a very short, very fast frequency sweep in
 * the 2–5kHz band, so a couple of oscillators and an envelope get surprisingly
 * close — and cost nothing to download. Each bird gets its own pitch from a
 * seed, so a flock doesn't sound like one bird played five times.
 *
 * Nothing here runs until a bird is actually clicked: browsers refuse to start
 * audio before a user gesture, and that click is the gesture.
 */

const STORAGE_KEY = "leo:birds-muted";

let ctx: AudioContext | null = null;
let muted = false;
let read = false;
const listeners = new Set<(muted: boolean) => void>();

/** Deferred so the module stays safe to import on the server. */
function readStored() {
  if (read || typeof window === "undefined") return;
  read = true;
  try {
    muted = window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Private mode and friends — just stay unmuted.
  }
}

export function isMuted() {
  readStored();
  return muted;
}

export function setMuted(next: boolean) {
  readStored();
  muted = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // Not worth failing a click over.
  }
  listeners.forEach((fn) => fn(next));
}

/** Subscribe to mute changes; returns an unsubscribe, for use in an effect. */
export function onMuteChange(fn: (muted: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  // Safari and Chrome park the context until a gesture resumes it.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * One swept tone. Real chirps rise then fall across a few tens of a
 * millisecond, which is what stops this sounding like a beep.
 */
function voice(
  c: AudioContext,
  at: number,
  from: number,
  peak: number,
  to: number,
  dur: number,
  level: number
) {
  const osc = c.createOscillator();
  const band = c.createBiquadFilter();
  const gain = c.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(peak, at + dur * 0.3);
  osc.frequency.exponentialRampToValueAtTime(to, at + dur);

  // Narrow the body of the tone so it reads as "small bird", not "synth".
  band.type = "bandpass";
  band.frequency.value = peak;
  band.Q.value = 1.4;

  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.007);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);

  osc.connect(band);
  band.connect(gain);
  gain.connect(c.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

let primed = false;

/**
 * Opens the audio context on the first user gesture anywhere on the page.
 *
 * Browsers refuse to start audio outside a gesture, and moving a mouse onto
 * something is not one. Without this the birds could only ever be heard from
 * a tap: on a mouse the hover that scatters them always lands before the
 * click, so the flock was gone, silently, before any gesture arrived.
 *
 * Once the context is open it stays open, and later chirps can come from
 * anything — including a hover.
 */
export function primeAudio() {
  if (typeof window === "undefined" || primed) return;
  primed = true;
  const open = () => {
    audio();
    window.removeEventListener("pointerdown", open);
    window.removeEventListener("keydown", open);
  };
  window.addEventListener("pointerdown", open);
  window.addEventListener("keydown", open);
}

/**
 * An alarm call: two or three quick chirps, the way a small bird sounds when
 * something has just startled it off a perch.
 *
 * `seed` (0–1) fixes the bird's pitch, so the same bird always sounds the same.
 */
export function chirp(seed = Math.random()) {
  if (isMuted()) return;
  const c = audio();
  if (!c) return;

  // Each bird sits a little above or below the others.
  const tune = 0.86 + seed * 0.3;
  const notes = seed > 0.5 ? 3 : 2;
  let at = c.currentTime + 0.01;

  for (let i = 0; i < notes; i++) {
    // Later notes in a burst sit slightly higher and shorten.
    const rise = 1 + i * 0.06;
    const dur = 0.075 - i * 0.012;
    const level = 0.07 - i * 0.012;
    voice(c, at, 2500 * tune * rise, 4300 * tune * rise, 3100 * tune * rise, dur, level);
    // A quieter partial an octave up gives it some air.
    voice(
      c,
      at,
      5000 * tune * rise,
      8200 * tune * rise,
      6000 * tune * rise,
      dur * 0.8,
      level * 0.3
    );
    at += dur + 0.045 + seed * 0.03;
  }
}
