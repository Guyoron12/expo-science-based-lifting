import { fonts } from "./fonts";
import { hudColors, hudTypography } from "./hud";

export { interFontSources } from "./fonts";
export { hudColors, hudTypography } from "./hud";

export const theme = {
  colors: {
    background: {
      primary: "#0B1220",
      secondary: "#121821",
      card: "#161D26",
    },
    text: {
      primary: "#E6EEF8",
      secondary: "#9AA4B2",
      muted: "#6B7280",
    },
    accent: "#3B82F6",
    semantic: {
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
      info: "#3B82F6",
    },
    border: "rgba(255, 255, 255, 0.176)",
    disabled: {
      bg: "#1E2632",
      text: "#6B7280",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    base: 10,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
  },
  radius: {
    sm: 6,
    xs: 8,
    md: 12,
    lg: 16,
  },
  fonts,
  typography: {
    display: {
      fontFamily: fonts.bold,
      fontSize: 28,
      lineHeight: 30,
      fontWeight: "700" as const,
    },
    title: {
      fontFamily: fonts.semiBold,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "600" as const,
    },
    body: {
      fontFamily: fonts.regular,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "400" as const,
    },
    label: {
      fontFamily: fonts.semiBold,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600" as const,
    },
    metric: {
      fontFamily: fonts.bold,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "700" as const,
    },
  },
  shadow: {
    card: {
      shadowColor: "#000000",
      shadowOpacity: 0.22,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 4,
    },
  },
  hud: {
    colors: hudColors,
    typography: hudTypography,
  },
} as const;

export type AppTheme = typeof theme;
