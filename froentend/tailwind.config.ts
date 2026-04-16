import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-error": "#ffffff",
        "inverse-primary": "#c5c0ff",
        "on-secondary-fixed": "#002117",
        "surface-variant": "#e5e2df",
        "on-tertiary-container": "#d2cdff",
        "tertiary": "#403b76",
        "surface-bright": "#fcf9f5",
        "surface-container": "#f0edea",
        "surface": "#fcf9f5",
        "inverse-surface": "#30302e",
        "on-primary": "#ffffff",
        "tertiary-fixed": "#e4dfff",
        "error-container": "#ffdad6",
        "tertiary-container": "#58538f",
        "primary-fixed": "#e3dfff",
        "primary": "#3b309e",
        "inverse-on-surface": "#f3f0ed",
        "background": "#fcf9f5",
        "secondary-fixed": "#8af7cf",
        "on-secondary-fixed-variant": "#00513d",
        "on-primary-fixed": "#140067",
        "surface-container-high": "#eae8e4",
        "on-secondary": "#ffffff",
        "on-tertiary": "#ffffff",
        "outline-variant": "#c8c4d5",
        "secondary-fixed-dim": "#6edab4",
        "secondary": "#006c52",
        "on-primary-container": "#d1ccff",
        "on-surface": "#1b1c1a",
        "primary-container": "#534ab7",
        "surface-container-highest": "#e5e2df",
        "on-tertiary-fixed": "#18114c",
        "on-tertiary-fixed-variant": "#443f7a",
        "surface-container-low": "#f6f3f0",
        "on-error-container": "#93000a",
        "on-secondary-container": "#007257",
        "outline": "#787584",
        "tertiary-fixed-dim": "#c6c0ff",
        "error": "#ba1a1a",
        "secondary-container": "#8af7cf",
        "surface-container-lowest": "#ffffff",
        "on-surface-variant": "#474553",
        "surface-dim": "#dcdad6",
        "surface-tint": "#584fbc",
        "on-background": "#1b1c1a",
        "on-primary-fixed-variant": "#3f35a3",
        "primary-fixed-dim": "#c5c0ff",
        "teal-accent": "#0F6E56"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["var(--font-plus-jakarta)", "sans-serif"],
        "body": ["var(--font-be-vietnam)", "sans-serif"],
        "label": ["var(--font-be-vietnam)", "sans-serif"]
      },
      animation: {
        "subtle-pulse": "subtle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-up": "fadeUp 0.6s ease-out forwards",
      },
      keyframes: {
        "subtle-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(0.98)" },
        },
        "fadeUp": {
          "from": { opacity: "0", transform: "translateY(20px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
