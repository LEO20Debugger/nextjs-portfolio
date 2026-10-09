"use client";
import { siteConfig } from "@/config/site-config";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { onEffect } from "@/utils/effects";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { DANCE_FRAMES, NEOFETCH_LOGO } from "./terminal-art";

type Tone = "out" | "cmd" | "muted" | "accent" | "err";
type Line = { text: string; tone?: Tone };

const TONE: Record<Tone, string> = {
  out: "text-neutral-200",
  cmd: "text-emerald-400",
  muted: "text-neutral-500",
  accent: "text-sky-400",
  err: "text-rose-400",
};

const PROMPT = "leo@portfolio:~$";

const projects = siteConfig.items.filter((item) => item.type === "project");

const BANNER: Line[] = [
  { text: `${siteConfig.creator} — ${siteConfig.title}`, tone: "accent" },
  { text: `Type 'help' for commands. Esc or 'exit' to close.`, tone: "muted" },
  { text: "" },
];

const Terminal = () => {
  const reduceMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [input, setInput] = useState("");
  const [frame, setFrame] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Shell history, walked with the arrow keys like a real prompt.
  const history = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);

  const push = useCallback(
    (next: Line[]) => setLines((prev) => [...prev, ...next]),
    []
  );

  /* ---------------------------------------------------------------- open/close */

  useEffect(() => onEffect("terminal", (d) => setOpen(d.active)), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      // Backtick toggles, but never while the caret is in the prompt itself —
      // otherwise you couldn't type a backtick into a command.
      if ((event.key === "`" || event.key === "~") && !typing) {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the newest output in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, frame, open]);

  /* ------------------------------------------------------------------ the dance */

  const playDance = useCallback(() => {
    if (reduceMotion) {
      push([
        { text: DANCE_FRAMES[0], tone: "accent" },
        { text: "you just got rolled by a stick figure.", tone: "out" },
        { text: "" },
      ]);
      return;
    }

    setBusy(true);
    let i = 0;
    const id = setInterval(() => {
      setFrame(DANCE_FRAMES[i % DANCE_FRAMES.length]);
      i++;
      if (i > 26) {
        clearInterval(id);
        setFrame(null);
        setBusy(false);
        push([
          { text: DANCE_FRAMES[0], tone: "accent" },
          { text: "you just got rolled by a stick figure.", tone: "out" },
          { text: "(no network calls were made in the making of this prank)", tone: "muted" },
          { text: "" },
        ]);
      }
    }, 130);
  }, [push, reduceMotion]);

  /* ----------------------------------------------------------------- the commands */

  const run = useCallback(
    (raw: string) => {
      const entry = raw.trim();
      push([{ text: `${PROMPT} ${entry}`, tone: "cmd" }]);
      if (!entry) return;

      history.current.unshift(entry);
      historyIndex.current = -1;

      const [cmd, ...rest] = entry.split(/\s+/);
      const arg = rest.join(" ").toLowerCase();

      switch (cmd.toLowerCase()) {
        case "help":
          push([
            { text: "Available commands", tone: "accent" },
            { text: "  whoami          who I am" },
            { text: "  ls projects     list my projects" },
            { text: "  open <name>     open a project in a new tab" },
            { text: "  cat resume      download my CV" },
            { text: "  neofetch        system readout" },
            { text: "  clear           clear the screen" },
            { text: "  exit            close the terminal" },
            { text: "" },
            { text: "Try: curl ascii.live/rick", tone: "muted" },
            { text: "" },
          ]);
          break;

        case "whoami":
          push([
            { text: siteConfig.creator, tone: "accent" },
            { text: siteConfig.title },
            { text: siteConfig.bio, tone: "muted" },
            { text: "" },
            { text: `location : ${siteConfig.location}` },
            { text: `email    : ${siteConfig.email}` },
            { text: "" },
          ]);
          break;

        case "ls":
          if (arg && arg !== "projects") {
            push([{ text: `ls: no such directory: ${arg}`, tone: "err" }, { text: "" }]);
            break;
          }
          push([
            ...projects.map<Line>((p) => ({
              text: `  ${p.title.padEnd(20)} ${p.description ?? ""}`,
            })),
            { text: "" },
            { text: "open <name> to visit one", tone: "muted" },
            { text: "" },
          ]);
          break;

        case "open": {
          if (!arg) {
            push([{ text: "usage: open <project>", tone: "err" }, { text: "" }]);
            break;
          }
          const match = projects.find((p) => p.title.toLowerCase() === arg);
          if (!match) {
            push([
              { text: `open: not found: ${arg}`, tone: "err" },
              { text: "run 'ls projects' to see the list", tone: "muted" },
              { text: "" },
            ]);
            break;
          }
          const href = match.websiteLink ?? match.buttonLink;
          if (!href) {
            push([{ text: `open: no link for ${match.title}`, tone: "err" }, { text: "" }]);
            break;
          }
          // Called straight from the Enter keypress, so popup blockers allow it.
          window.open(href, "_blank", "noopener,noreferrer");
          push([{ text: `opening ${href} ...`, tone: "accent" }, { text: "" }]);
          break;
        }

        case "cat":
          if (arg === "resume" || arg === "cv") {
            const a = document.createElement("a");
            a.href = siteConfig.resumeUrl;
            a.download = "";
            a.rel = "noopener";
            a.click();
            push([{ text: "downloading resume.pdf ...", tone: "accent" }, { text: "" }]);
          } else {
            push([{ text: `cat: ${arg || "?"}: No such file`, tone: "err" }, { text: "" }]);
          }
          break;

        case "neofetch": {
          const info = [
            `${siteConfig.creator}`,
            "-----------------------------",
            `Role     : ${siteConfig.title}`,
            `Stack    : NestJS · Node · TypeScript`,
            `Data     : Postgres · MongoDB · Redis`,
            `Infra    : Docker · AWS`,
            `Shell    : zsh`,
            `Location : ${siteConfig.location}`,
            `Contact  : ${siteConfig.email}`,
          ];
          const rows = Math.max(NEOFETCH_LOGO.length, info.length);
          push([
            ...Array.from({ length: rows }, (_, i) => ({
              text: `${(NEOFETCH_LOGO[i] ?? " ".repeat(15))}  ${info[i] ?? ""}`,
              tone: (i === 0 ? "accent" : "out") as Tone,
            })),
            { text: "" },
          ]);
          break;
        }

        case "curl":
          if (arg.includes("ascii.live/rick") || arg.includes("rick")) {
            playDance();
          } else if (!arg) {
            push([{ text: "usage: curl <url>", tone: "err" }, { text: "" }]);
          } else {
            push([
              { text: `curl: (6) Could not resolve host: ${arg}`, tone: "err" },
              { text: "" },
            ]);
          }
          break;

        case "clear":
          setLines([]);
          break;

        case "exit":
          setOpen(false);
          break;

        default:
          push([
            { text: `command not found: ${cmd}`, tone: "err" },
            { text: "type 'help' for the list", tone: "muted" },
            { text: "" },
          ]);
      }
    },
    [playDance, push]
  );

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    run(input);
    setInput("");
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.min(historyIndex.current + 1, history.current.length - 1);
      if (next >= 0) {
        historyIndex.current = next;
        setInput(history.current[next]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = historyIndex.current - 1;
      historyIndex.current = next;
      setInput(next >= 0 ? history.current[next] : "");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{
            duration: reduceMotion ? 0 : 0.32,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-x-0 bottom-0 z-[60] px-0 sm:px-4"
          role="dialog"
          aria-label="Interactive terminal"
        >
          <div
            onClick={() => inputRef.current?.focus()}
            className="mx-auto max-w-3xl overflow-hidden rounded-t-xl border border-neutral-700/80 bg-[#0c0c11] shadow-2xl"
          >
            {/* Title bar. The red light is a real close button; the other two
                are decoration, as they are in most terminal emulators. */}
            <div className="flex items-center gap-2 border-b border-neutral-800 bg-[#15151c] px-4 py-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                aria-label="Close terminal"
                title="Close"
                className="h-3 w-3 rounded-full bg-[#ff5f57] transition-transform hover:scale-125"
              />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-xs text-neutral-400">
                {PROMPT.replace("$", "")}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="ml-auto rounded px-2 py-0.5 font-mono text-xs text-neutral-500 transition-colors hover:text-neutral-200"
              >
                esc
              </button>
            </div>

            <div
              ref={scrollRef}
              className="h-[48vh] overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-[1.55] sm:text-[13px]"
            >
              {lines.map((line, i) => (
                <pre
                  key={i}
                  className={`whitespace-pre-wrap break-words ${TONE[line.tone ?? "out"]}`}
                >
                  {line.text}
                </pre>
              ))}

              {frame && (
                <pre className="whitespace-pre text-emerald-400">{frame}</pre>
              )}

              {!busy && (
                <form onSubmit={onSubmit} className="flex items-center gap-2">
                  <span className="shrink-0 text-emerald-400">{PROMPT}</span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="off"
                    aria-label="Terminal input"
                    /* The global :focus-visible ring would draw a boxed outline
                       around the prompt; the caret is the focus cue here. */
                    className="min-w-0 flex-1 bg-transparent text-neutral-100 caret-emerald-400 outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </form>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Terminal;
