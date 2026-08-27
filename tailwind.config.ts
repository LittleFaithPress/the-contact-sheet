import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sampled directly from The Loupe newsletter artifact (pixel-picked,
        // not eyeballed) -- a near-black, barely-blue ground with a muted,
        // desaturated sage-gray accent. Previous values here were too blue
        // in the darks and too saturated/bright in the "sage" green.
        navy: {
          950: "#0a0d12", // page background
          900: "#10151c", // card / row background
          800: "#161c22", // hover state on a row
          700: "#2b322f", // borders, dividers -- deliberately low-contrast
          600: "#3a423e", // input borders -- a touch more visible
          500: "#4d564f",
        },
        sage: {
          400: "#a7b3a2", // eyebrow text, pill labels, section badges
          500: "#7c8c76", // solid fills: primary buttons, active pill
          600: "#64725f", // hover state for solid sage fills
          700: "#4c584a",
        },
        cream: "#f2efe6",
        ink: "#0a0d12",
        paper: "#0a0d12",
        accent: "#7c8c76",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
