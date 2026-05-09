import { fonts } from "./fonts";
import { hudColors, hudMotion, hudShadow, hudTypography } from "./hud";

export { interFontSources } from "./fonts";
export { hudColors, hudMotion, hudShadow, hudTypography } from "./hud";

export const theme = {
  colors: {
    background: {
      primary: hudColors.backgroundPrimary,
      secondary: hudColors.backgroundSecondary,
      card: hudColors.surface,
    },
    text: {
      primary: hudColors.textPrimary,
      secondary: hudColors.textSecondary,
      muted: hudColors.textMuted,
    },
    accent: hudColors.accent,
    semantic: {
      success: hudColors.accentSecondary,
      warning: "#F59E0B",
      danger: hudColors.danger,
      info: hudColors.accentSoft,
    },
    border: hudColors.border,
    disabled: {
      bg: hudColors.backgroundTertiary,
      text: hudColors.textMuted,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    base: 12,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
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
      ...hudShadow.card,
    },
  },
  hud: {
    colors: hudColors,
    motion: hudMotion,
    shadow: hudShadow,
    typography: hudTypography,
  },
} as const;

export type AppTheme = typeof theme;
