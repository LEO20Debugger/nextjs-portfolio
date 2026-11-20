/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        primary: "#6178F1",
        youtube: "#FF0000",
        twitter: "#1DA1F2",
        discord: "#5865F2",
        github: "#181717",
      },
      fontFamily: {
        sans: ["var(--font-sfpro)"],
      },
      backgroundImage: {
        "light-pattern": "url('/light-pattern.svg')",
        "dark-pattern": "url('/dark-pattern.svg')",
      },
      backgroundSize: {
        auto: "auto",
        cover: "cover",
        contain: "contain",
        verySmall: "0.5rem",
        3: "3rem",
        2: "2rem",
        1: "1rem",
      },
      boxShadow: {
        grid: "0px 2px 8px 0px rgba(0, 0, 0, 0.08), 0px 8px 24px 0px rgba(0, 0, 0, 0.06)",
        "grid-hover":
          "0px 4px 12px 0px rgba(0, 0, 0, 0.10), 0px 16px 40px 0px rgba(0, 0, 0, 0.10)",
      },
      keyframes: {
        // The bars of the equalizer on the Music card. Each one is given its
        // own duration and delay at the call site, so three bars sharing one
        // keyframe never pulse in lockstep.
        eq: {
          "0%, 100%": { transform: "scaleY(0.28)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        eq: "eq 800ms ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};
