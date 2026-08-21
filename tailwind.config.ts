import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0F0F14",
          elevated: "#16161E",
          hover: "#1E1E2A",
        },
        surface: {
          DEFAULT: "#1A1A24",
          light: "#22222E",
        },
        primary: {
          DEFAULT: "#6C5CE7",
          hover: "#7C6EF0",
          muted: "rgba(108, 92, 231, 0.12)",
          strong: "#5A4BD6",
        },
        xp: {
          DEFAULT: "#FDCB6E",
          glow: "rgba(253, 203, 110, 0.25)",
        },
        streak: {
          DEFAULT: "#FF6B6B",
          muted: "rgba(255, 107, 107, 0.12)",
        },
        success: {
          DEFAULT: "#00B894",
          muted: "rgba(0, 184, 148, 0.12)",
        },
        border: {
          DEFAULT: "#2A2A3A",
          strong: "#3A3A4E",
        },
        text: {
          DEFAULT: "#F0F0F5",
          secondary: "#A0A0B8",
          dim: "#6A6A80",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
        md: "0 4px 12px rgba(0, 0, 0, 0.4)",
        lg: "0 8px 24px rgba(0, 0, 0, 0.5)",
        "glow-primary": "0 0 20px rgba(108, 92, 231, 0.2)",
        "glow-xp": "0 0 20px rgba(253, 203, 110, 0.25)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "xp-gain": "xpGain 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "skeleton-pulse": "skeletonPulse 1.5s ease-in-out infinite",
        "streak-pulse": "streakPulse 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        xpGain: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.3)", color: "#FDCB6E" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        skeletonPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        streakPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
