import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        black: "#0b0908",
        panel: "#161310",
        panel2: "#1e1a15",
        gold: "#c9a227",
        goldLight: "#e8cf7a",
        goldDim: "#8a6d1a",
        cream: "#f3ecd9",
        muted: "#a89f8c",
        line: "rgba(201,162,39,0.28)"
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
