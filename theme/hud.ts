export const hudColors = {
  backgroundPrimary: "#000000",
  backgroundSecondary: "#090909",
  surface: "rgba(0, 255, 135, 0.04)",
  surfaceStrong: "rgba(0, 255, 135, 0.08)",
  border: "rgba(0, 255, 135, 0.12)",
  borderStrong: "rgba(0, 255, 135, 0.22)",
  accent: "#00FF87",
  accentHot: "#39FF14",
  textPrimary: "#FFFFFF",
  textHighlight: "#00FF87",
  textMuted: "#4A7A5A",
  textDim: "rgba(74, 122, 90, 0.75)",
  flash: "rgba(0, 255, 135, 0.2)",
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
