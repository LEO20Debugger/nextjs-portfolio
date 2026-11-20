import { NextResponse } from "next/server";

/**
 * What Leo is listening to, for the Music card.
 *
 * This has to be a server route rather than a fetch from the browser: the
 * client secret and the refresh token are what give access to the account,
 * and neither can ever reach the page. The browser only ever sees the four
 * fields below.
 *
 * `force-dynamic` is load-bearing. Without it Next treats a route handler
 * with no request-specific input as static, runs it once at build time, and
 * serves whatever was playing when the site was deployed — forever.
 */
export const dynamic = "force-dynamic";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";

export type NowPlaying = {
  /** True only while a track is actually playing, not paused or stale. */
  isPlaying: boolean;
  title?: string;
  artist?: string;
  albumArt?: string;
  url?: string;
};

const SILENT: NowPlaying = { isPlaying: false };

/**
 * One Spotify call per window, however many people are on the page.
 *
 * Polling per visitor would multiply straight through to Spotify and earn a
 * 429 on a good day for the site. Module scope persists between requests on a
 * warm serverless instance; a cold start just means one extra call, and the
 * worst case is still only one call per instance per window.
 */
const CACHE_MS = 30_000;
let cache: { at: number; body: NowPlaying } | null = null;

type SpotifyArtist = { name?: string };
type SpotifyImage = { url?: string };
type SpotifyItem = {
  name?: string;
  artists?: SpotifyArtist[];
  album?: { images?: SpotifyImage[] };
  external_urls?: { spotify?: string };
  show?: { name?: string };
  images?: SpotifyImage[];
};

/**
 * Trades the long-lived refresh token for an access token, which Spotify
 * expires after an hour.
 */
async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string | null> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

/** Picks a thumbnail-sized cover. Spotify orders these largest first. */
const cover = (images: SpotifyImage[] | undefined) =>
  images?.[1]?.url ?? images?.[0]?.url;

/** Podcast episodes carry a show instead of artists, and art of their own. */
const shape = (item: SpotifyItem, isPlaying: boolean): NowPlaying => ({
  isPlaying,
  title: item.name,
  artist:
    item.artists?.map((a) => a.name).filter(Boolean).join(", ") ||
    item.show?.name,
  albumArt: cover(item.album?.images ?? item.images),
  url: item.external_urls?.spotify,
});

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json(cache.body);
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  // Not configured yet, or configured wrongly. The card treats this exactly
  // like silence rather than showing the visitor an error.
  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(SILENT);
  }

  let body = SILENT;

  try {
    const token = await getAccessToken(clientId, clientSecret, refreshToken);
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };

      const live = await fetch(NOW_PLAYING_URL, {
        headers,
        cache: "no-store",
      });

      // 204 with an empty body is Spotify's "nothing is playing", and 202 is
      // "the device is waking up". Calling .json() on either throws, which is
      // the usual way this endpoint breaks in production.
      if (live.status === 200) {
        const json = (await live.json()) as {
          is_playing?: boolean;
          item?: SpotifyItem | null;
        };
        if (json.item) body = shape(json.item, Boolean(json.is_playing));
      }

      // Deliberately no fall back to the last thing played. An earlier
      // version did, which meant the card almost never showed its empty
      // state and "Leo is listening to" could be a track he finished hours
      // ago. Silence is the honest answer and the card says so.
    }
  } catch {
    // Spotify down, token revoked, network gone: the card shows nothing and
    // the page carries on. There is no failure here worth surfacing.
    body = SILENT;
  }

  cache = { at: Date.now(), body };
  return NextResponse.json(body);
}
