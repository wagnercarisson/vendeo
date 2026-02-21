import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  extend: {
    colors: {
      vendeo: {
        green: "#16A34A",
        greenLight: "#22C55E",
        blue: "#2563EB",
        bg: "#F8FAFC",
        border: "#E2E8F0",
        text: "#0F172A",
        muted: "#64748B",
      },
    },
  },
},
  plugins: [],
} satisfies Config;
