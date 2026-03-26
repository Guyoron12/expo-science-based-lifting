export const theme = {
  colors: {
    background: {
      primary: "#0B0F14",
      secondary: "#121821",
      card: "#161D26",
    },
    text: {
      primary: "#E6EDF3",
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
    border: "rgba(154, 164, 178, 0.18)",
    disabled: {
      bg: "#1E2632",
      text: "#6B7280",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
  },
  radius: {
    md: 12,
    lg: 16,
  },
  typography: {
    display: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "700" as const,
    },
    title: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "700" as const,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "400" as const,
    },
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "600" as const,
    },
    metric: {
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
} as const;

export type AppTheme = typeof theme;
