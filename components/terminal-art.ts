/**
 * Original ASCII art for the terminal easter egg.
 *
 * Hand-drawn here rather than fetched from ascii.live: that endpoint sends no
 * Access-Control-Allow-Origin header, so a browser can't read it at all without
 * proxying it through our own server — and proxying would mean rebroadcasting
 * someone else's copyrighted animation from this domain, plus a third-party
 * dependency that breaks silently. These frames are ours and never go stale.
 */

/** A little figure throwing shapes. Frames cycle to make it dance. */
export const DANCE_FRAMES: string[] = [
  String.raw`
       ___
      [^_^]
   ~   \|/   ~
        |
       / \
   ============
  `,
  String.raw`
       ___
      [-_-]
  ~   _/|\_   ~
        |
       /|
   ============
  `,
  String.raw`
       ___
      [o_o]
   ~    \|    ~
        |\
       / \
   ============
  `,
  String.raw`
       ___
      [^o^]
   ~   \|/   ~
        |
        |\
   ============
  `,
  String.raw`
       ___
      [-_-]
  ~    |/     ~
       /|
       / \
   ============
  `,
  String.raw`
       ___
      [O_O]
   ~  \ | /  ~
        |
       /_\
   ============
  `,
];

/** Shown in `neofetch`, beside the system readout. */
export const NEOFETCH_LOGO: string[] = [
  "    .-----.    ",
  "   /  ^ ^  \\   ",
  "  |  (o o)  |  ",
  "   \\   -   /   ",
  "    '-----'    ",
  "   __/   \\__   ",
  "  |_|  _  |_|  ",
  "     |_|_|     ",
];
