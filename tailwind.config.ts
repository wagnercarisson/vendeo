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
          dark: "#0B2E22",
        },
      },
      boxShadow: {
        premium: "0 10px 40px -10px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.04)",
        soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.05)",
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)",
      },
    },
},
  plugins: [],
} satisfies Config;
