/**
 * Tiny typed event bus for the full-screen easter-egg effects.
 *
 * The trigger (the avatar, inside LeftPanel) and the overlays that react to it
 * (the page vignette, the star canvas) are siblings under a *server* component,
 * so there's no shared client parent to hold state and no way to prop-drill.
 * A pair of window events is less machinery than introducing a client provider
 * around the whole page just to pass one boolean.
 */
export type EffectName = "sharingan" | "chidori";

export type EffectDetail = { active: boolean };

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
