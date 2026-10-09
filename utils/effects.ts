/**
 * Typed event bus for full-screen easter-egg effects (e.g. Chidori on device
 * shake, or opening the terminal from the footer chip).
 */
export type EffectName = "chidori" | "terminal";

export type EffectDetail = {
  active: boolean;
};

const key = (name: EffectName) => `leo:${name}`;

export function emitEffect(name: EffectName, active: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<EffectDetail>(key(name), { detail: { active } })
  );
}

/** Returns an unsubscribe function, so it drops straight into a useEffect. */
export function onEffect(
  name: EffectName,
  callback: (detail: EffectDetail) => void
) {
  const handler = (event: Event) =>
    callback((event as CustomEvent<EffectDetail>).detail);

  window.addEventListener(key(name), handler);
  return () => window.removeEventListener(key(name), handler);
}
