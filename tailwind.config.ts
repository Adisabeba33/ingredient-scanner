import type { Config } from "tailwindcss";

/**
 * Trimmed palette mirroring ingredients.help's "Soft Scientific Workspace" so
 * the capture tool feels like part of the same product family.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F6F0",
        surface: "#FFFFFF",
        surfaceSoft: "#F2F5ED",
        ink: "#20251F",
        muted: "#555D54",
        faint: "#81877F",
        line: "#E3E4DD",
        lineStrong: "#D4D8CF",
        sage: {
          50: "#F2F7EF",
          100: "#DDE9D8",
          200: "#CBD9C5",
          400: "#8AA385",
          500: "#4E7849",
          600: "#3E6A3B",
          700: "#365A36",
        },
        amber: {
          DEFAULT: "#D99A42",
          soft: "#F7EBD8",
        },
        risk: {
          high: "#B85042",
          elevated: "#D87C5A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        input: "18px",
        card: "24px",
        large: "30px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(30,40,30,0.03), 0 10px 30px rgba(30,40,30,0.05)",
        button: "0 8px 20px rgba(65,105,61,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
