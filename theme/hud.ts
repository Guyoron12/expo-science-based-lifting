export const hudColors = {
  black: "#000000",
  backgroundPrimary: "#000000",
  backgroundSecondary: "#0A0A0A",
  backgroundTertiary: "#111111",
  backgroundTint: "#031407",
  surface: "rgba(17, 17, 17, 0.92)",
  surfaceRaised: "rgba(10, 10, 10, 0.98)",
  surfaceGlass: "rgba(17, 17, 17, 0.82)",
  surfaceGreen: "rgba(57, 255, 20, 0.06)",
  surfaceGreenStrong: "rgba(57, 255, 20, 0.12)",
  border: "rgba(255, 255, 255, 0.08)",
  borderGreen: "rgba(57, 255, 20, 0.24)",
  borderGreenStrong: "rgba(57, 255, 20, 0.42)",
  accent: "#39FF14",
  accentSecondary: "#00C853",
  accentSoft: "#64DD17",
  accentGlow: "rgba(57, 255, 20, 0.42)",
  accentGlowSoft: "rgba(57, 255, 20, 0.18)",
  textPrimary: "#FFFFFF",
  textSecondary: "#A5A5A5",
  textMuted: "#707070",
  textDim: "rgba(165, 165, 165, 0.68)",
  textInverse: "#020600",
  danger: "#FF4D4D",
  flash: "rgba(57, 255, 20, 0.16)",
  scanline: "rgba(57, 255, 20, 0.06)",
  grain: "rgba(255, 255, 255, 0.08)",
  shine: "rgba(255, 255, 255, 0.22)",
} as const;

export const hudTypography = {
  headingTight: {
    letterSpacing: -0.32,
    textTransform: "uppercase",
  },
  labelWide: {
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  mono: {
    fontVariant: ["tabular-nums"],
  },
};

export const hudMotion = {
  fast: 140,
  normal: 260,
  slow: 1200,
  pressScale: 1.03,
  revealStagger: 45,
} as const;

export const hudShadow = {
  card: {
    shadowColor: hudColors.accent,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  glow: {
    shadowColor: hudColors.accent,
    shadowOpacity: 0.34,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
} as const;
