"use client";

import type { NowPlaying as Track } from "@/app/api/now-playing/route";
import { Headphones, Music } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * What Leo is listening to.
 *
 * Polls this site's own `/api/now-playing`, never Spotify directly — the
 * credentials live on the server and the browser only ever sees a title, an
 * artist and a cover URL.
 *
 * The route caches for 30s, so polling faster than that would only ask this
 * server the same question more often. A hidden tab stops asking entirely and
 * catches up the moment it comes back.
 */
const POLL_MS = 45_000;

/**
 * Bars that bounce while something is actually playing.
 *
 * Only shown when Spotify reports `is_playing`, which is a real distinction
 * rather than decoration: a paused track still comes back with a title, so
 * the bars are the only thing separating "on right now" from "stopped
 * halfway through this an hour ago".
 *
 * The heights differ as well as the timings, so with animation turned off it
 * still reads as an equalizer rather than three identical ticks.
 */
const BARS = [
  { height: "55%", duration: 760, delay: 0 },
  { height: "100%", duration: 880, delay: 140 },
  { height: "72%", duration: 700, delay: 280 },
];

const Equalizer = () => (
  <span
    aria-hidden
    className="flex h-3.5 shrink-0 items-end gap-[2px] @lg:h-4"
  >
    {BARS.map((bar, i) => (
      <span
        key={i}
        className="w-[3px] origin-bottom rounded-[1px] bg-primary motion-safe:animate-eq"
        style={{
          height: bar.height,
          animationDuration: `${bar.duration}ms`,
          animationDelay: `${bar.delay}ms`,
        }}
      />
    ))}
  </span>
);

const NowPlaying = () => {
  const [track, setTrack] = useState<Track | null>(null);
  /** Distinguishes "haven't asked yet" from "asked, nothing playing". */
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/now-playing", { signal, cache: "no-store" });
      if (!res.ok) return;
      setTrack((await res.json()) as Track);
    } catch {
      // Aborted, offline, or the route is having a bad day. Keep whatever was
      // on screen rather than blanking the card.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);

    let timer: ReturnType<typeof setInterval>;
    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => load(), POLL_MS);
    };
    const onVisibility = () => {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        // Straight away, not in 45 seconds: coming back to the tab is exactly
        // when the card is most likely to be stale.
        load();
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const label = (
    /* The pill sits across the card's top edge. `GridItem` is `relative`, so
       this positions against the card itself rather than its padding box, and
       its background matches the card's so it cuts the border cleanly. */
    <span className="absolute -top-5 left-6 z-10 rounded-full border border-neutral-200 bg-white px-3 py-0.5 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
      Music
    </span>
  );

  if (!loaded) {
    return (
      <>
        {label}
        <div className="flex h-full items-center gap-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3.5 w-2/5 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-2.5 w-1/4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>
      </>
    );
  }

  if (!track?.title) {
    return (
      <>
        {label}
        <div className="flex h-full items-center gap-3">
          {/* A bare glyph where the cover would be, rather than an empty
              frame: a blank square reads as a picture that failed to load. */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center text-neutral-300 @lg:h-14 @lg:w-14 dark:text-neutral-700">
            <Music className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-neutral-500 @lg:text-base dark:text-neutral-400">
              Nothing right now
            </div>
            <div className="truncate text-xs text-neutral-400 @lg:text-sm dark:text-neutral-600">
              I&apos;m not currently listening to any music
            </div>
          </div>
        </div>
      </>
    );
  }

  const body = (
    <div className="flex h-full items-center gap-3">
      {track.albumArt ? (
        // A plain img rather than next/image: this is a 48px thumbnail from a
        // CDN host that would otherwise need a `remotePatterns` entry, and the
        // tech stack already reaches for simpleicons the same way.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.albumArt}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-lg object-cover shadow-sm @lg:h-14 @lg:w-14"
        />
      ) : (
        <div className="h-12 w-12 shrink-0 rounded-lg bg-neutral-100 @lg:h-14 @lg:w-14 dark:bg-neutral-800" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {track.isPlaying && <Equalizer />}
          <div className="truncate text-sm font-semibold @lg:text-base">
            {track.title}
          </div>
        </div>
        {track.artist && (
          <div className="truncate text-xs text-neutral-500 @lg:text-sm">
            {track.artist}
          </div>
        )}
      </div>

      {/* Not a nested link — the whole card is already the anchor, so this is
          styled content inside it. An <a> in an <a> is invalid markup and
          browsers resolve it by breaking one of them.

          It only appears once there is somewhere to send you, and only on a
          card wide enough to carry it. */}
      {track.url && (
        <span className="hidden shrink-0 items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 transition-colors duration-200 group-hover:border-neutral-300 group-hover:text-neutral-900 @md:inline-flex dark:border-neutral-800 dark:group-hover:border-neutral-600 dark:group-hover:text-white">
          <Headphones
            size={14}
            className="transition-transform duration-200 group-hover:scale-110"
          />
          Listen with Leo
        </span>
      )}
    </div>
  );

  if (!track.url) {
    return (
      <>
        {label}
        {body}
      </>
    );
  }

  return (
    <>
      {label}
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${track.title}${
          track.artist ? ` by ${track.artist}` : ""
        } on Spotify`}
        className="block h-full"
      >
        {body}
      </a>
    </>
  );
};

export default NowPlaying;
