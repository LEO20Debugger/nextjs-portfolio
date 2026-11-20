/**
 * One-time helper: turns a Spotify app's credentials into a refresh token.
 *
 * Run it once, locally. It reads the client id and secret from `.env.local`
 * and writes the refresh token back into the same file, so no secret ever
 * has to go on a command line — a secret typed at a prompt ends up in the
 * shell's saved history, which on Windows is a file on disk that outlives
 * the terminal.
 *
 *   node scripts/spotify-refresh-token.mjs
 *
 * Before running, in the Spotify dashboard for your app, add this exact
 * redirect URI and save:
 *
 *   http://127.0.0.1:8888/callback
 *
 * Spotify rejects `localhost` for new apps; it wants the loopback IP.
 *
 * No dependencies: Node's own http and fs modules, and fetch.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
/**
 * The narrowest pair that covers the card: what is playing now, and — for
 * the hours when nothing is — what played last.
 */
const SCOPES = "user-read-currently-playing user-read-recently-played";

const ENV_FILE = ".env.local";
const NEWLINES = /\r?\n/;

/** Reads one KEY=value out of the env file, tolerating spaces and quotes. */
function fromEnvFile(key) {
  if (!existsSync(ENV_FILE)) return undefined;
  const line = readFileSync(ENV_FILE, "utf8")
    .split(NEWLINES)
    .find((l) => l.trim().startsWith(key) && l.includes("="));
  if (!line) return undefined;
  const value = line
    .slice(line.indexOf("=") + 1)
    .trim()
    .replace(/^["']|["']$/g, "");
  return value || undefined;
}

/** Writes the token into the env file, replacing the key if already there. */
function saveToken(token) {
  const line = `SPOTIFY_REFRESH_TOKEN=${token}`;
  if (!existsSync(ENV_FILE)) {
    writeFileSync(ENV_FILE, `${line}\n`, "utf8");
    return;
  }
  const text = readFileSync(ENV_FILE, "utf8");
  const lines = text.split(NEWLINES);
  const at = lines.findIndex((l) =>
    l.trim().startsWith("SPOTIFY_REFRESH_TOKEN")
  );
  if (at === -1) {
    lines.push(line);
  } else {
    lines[at] = line;
  }
  writeFileSync(ENV_FILE, lines.join("\n"), "utf8");
}

// Arguments still win, for anyone who would rather not keep a file around.
const [argId, argSecret] = process.argv.slice(2);
const clientId = argId ?? fromEnvFile("SPOTIFY_CLIENT_ID");
const clientSecret = argSecret ?? fromEnvFile("SPOTIFY_CLIENT_SECRET");

if (!clientId || !clientSecret) {
  console.error(
    `\n  No credentials found.\n\n` +
      `  Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in ${ENV_FILE},\n` +
      `  then run this again with no arguments.\n\n` +
      `  Both come from your app at https://developer.spotify.com/dashboard\n`
  );
  process.exit(1);
}

const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
  });

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

/** Trades the one-time code for the token pair. */
async function exchange(code) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      `${res.status} ${json.error ?? ""} ${json.error_description ?? ""}`.trim()
    );
  }
  return json;
}

const page = (title, detail) =>
  `<!doctype html><meta charset="utf-8"><title>${title}</title>` +
  `<body style="font:16px/1.6 system-ui;margin:4rem auto;max-width:34rem;padding:0 1rem">` +
  `<h1 style="font-size:1.25rem">${title}</h1><p>${detail}</p></body>`;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }

  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");

  if (error || !code) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end(page("Authorisation failed", error ?? "No code came back."));
    console.error(`\n  Spotify said: ${error ?? "no code returned"}\n`);
    server.close();
    process.exitCode = 1;
    return;
  }

  try {
    const token = await exchange(code);
    saveToken(token.refresh_token);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(page("Done", `Saved to ${ENV_FILE}. You can close this tab.`));

    // The token is deliberately not printed. It went straight into the file,
    // and a secret echoed to a terminal is one paste away from somewhere it
    // should not be.
    console.log(
      `\n  Saved SPOTIFY_REFRESH_TOKEN to ${ENV_FILE} ` +
        `(${token.refresh_token.length} chars).\n`
    );
    console.log(`  Next:  npm run dev   — the Music card should fill in.\n`);
    console.log(
      `  For Vercel, copy all three values out of ${ENV_FILE} into the\n` +
        `  project's environment variables, then redeploy.\n`
    );
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(page("Token exchange failed", String(e.message)));
    console.error(`\n  Token exchange failed: ${e.message}\n`);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(
    `\n  1. Make sure this redirect URI is saved on your Spotify app:\n` +
      `       ${REDIRECT_URI}\n\n` +
      `  2. Open this URL and approve:\n\n` +
      `       ${authUrl}\n\n` +
      `  Waiting for the redirect...\n`
  );
});
