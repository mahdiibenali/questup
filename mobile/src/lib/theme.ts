export const API_URL = "http://localhost:3000";

export const colors = {
  primary: "#6C5CE7",
  primaryHover: "#7C6EF0",
  primaryMuted: "rgba(108, 92, 231, 0.12)",
  primaryStrong: "#5A4BD6",

  xp: "#FDCB6E",
  xpGlow: "rgba(253, 203, 110, 0.25)",
  streak: "#FF6B6B",
  streakMuted: "rgba(255, 107, 107, 0.12)",
  success: "#00B894",
  successMuted: "rgba(0, 184, 148, 0.12)",

  bg: "#0F0F14",
  bgElevated: "#16161E",
  bgHover: "#1E1E2A",
  surface: "#1A1A24",
  surfaceLight: "#22222E",

  border: "#2A2A3A",
  borderStrong: "#3A3A4E",

  text: "#F0F0F5",
  textSecondary: "#A0A0B8",
  textDim: "#6A6A80",

  white: "#FFFFFF",
  black: "#000000",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  bodyMedium: { fontSize: 16, fontWeight: "500" as const },
  sm: { fontSize: 14, fontWeight: "400" as const },
  xs: { fontSize: 12, fontWeight: "400" as const },
  mono: { fontSize: 14, fontWeight: "500" as const, fontFamily: "Courier" },
};
