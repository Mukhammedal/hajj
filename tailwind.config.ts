import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
        panel: "hsl(var(--panel))",
        panelAlt: "hsl(var(--panel-alt))",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
      },
      boxShadow: {
        soft: "0 28px 60px rgba(6, 11, 19, 0.35)",
        glow: "0 0 0 1px rgba(232, 191, 94, 0.18), 0 0 80px rgba(31, 127, 108, 0.12)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        haze:
          "radial-gradient(circle at top left, rgba(232, 191, 94, 0.16), transparent 34%), radial-gradient(circle at bottom right, rgba(23, 131, 113, 0.18), transparent 32%)",
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease forwards",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(232, 191, 94, 0.18), 0 0 40px rgba(31, 127, 108, 0.12)" },
          "50%": { boxShadow: "0 0 0 1px rgba(232, 191, 94, 0.32), 0 0 80px rgba(31, 127, 108, 0.2)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
